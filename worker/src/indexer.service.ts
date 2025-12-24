import {
  createPublicClient,
  decodeEventLog,
  decodeFunctionResult,
  encodeFunctionData,
  http,
  type Abi,
  type AbiEvent,
  type PublicClient,
} from "viem"
import { Prisma, PrismaClient } from "@prisma/client"
import escrowAbiJson from "../../shared/src/contracts/TrustfyEscrowV4_2_Amended_ABI.json"
import type { WorkerConfig } from "./config"

const ESCROW_STATUS: Record<number, string> = {
  0: "NONE",
  1: "CREATED",
  2: "TAKEN",
  3: "FUNDED",
  4: "PAYMENT_CONFIRMED",
  5: "DISPUTED",
  6: "RESOLVED",
  7: "CANCELLED",
}

const DISPUTE_OUTCOME: Record<number, string> = {
  0: "NONE",
  1: "BUYER_WINS",
  2: "SELLER_WINS",
}

const EVENT_STATE_MAP: Record<string, string> = {
  EscrowCreated: "CREATED",
  EscrowTaken: "TAKEN",
  EscrowFunded: "FUNDED",
  PaymentConfirmed: "PAYMENT_CONFIRMED",
  EscrowResolved: "RESOLVED",
  EscrowCancelled: "CANCELLED",
}

const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000"

type JsonValue =
  | string
  | number
  | boolean
  | null
  | { [key: string]: JsonValue }
  | JsonValue[]

const escrowAbi = (Array.isArray(escrowAbiJson)
  ? escrowAbiJson
  : (() => {
      const abiHash = (escrowAbiJson as { transactions?: { record?: { abi?: string } }[] })
        .transactions?.[0]?.record?.abi
      return abiHash
        ? (escrowAbiJson as { abis?: Record<string, Abi> }).abis?.[abiHash]
        : []
    })()) as Abi

interface EscrowStruct {
  status: number
  tokenKey: string
  amount: bigint
  feeAmount: bigint
  sellerBond: bigint
  buyerBond: bigint
  seller: string
  buyer: string
}

type RawLog = {
  blockNumber?: bigint | null
  logIndex?: number | null
  transactionHash?: `0x${string}` | null
  data: `0x${string}`
  topics: `0x${string}`[]
  eventName?: string
}

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

export class IndexerWorker {
  private readonly clients: Record<number, PublicClient>
  private readonly eventAbis = escrowAbi.filter((entry): entry is AbiEvent => entry.type === "event")
  private readonly blockTimestampCache = new Map<bigint, bigint>()

  constructor(private prisma: PrismaClient, private readonly config: WorkerConfig) {
    this.clients = {}
    for (const [chainId, rpcUrl] of Object.entries(config.rpcUrls)) {
      this.clients[Number(chainId)] = createPublicClient({
        transport: http(rpcUrl),
      })
    }
  }

  async run() {
    console.log("indexer worker starting")
    while (true) {
      for (const [chainIdString, contractAddress] of Object.entries(
        this.config.contractAddresses
      )) {
        const chainId = Number(chainIdString)
        const client = this.clients[chainId]
        if (!client) continue
        await this.syncChain(chainId, contractAddress, client).catch((error) => {
          console.error(`failed to sync chain ${chainId}`, error)
        })
      }
      await sleep(this.config.pollIntervalMs)
    }
  }

  private async syncChain(chainId: number, contractAddress: string, client: PublicClient) {
    const headBlock = await client.getBlockNumber()
    const safeToBlock = Math.max(0, Number(headBlock) - this.config.confirmations)
    const checkpoint = await this.prisma.indexerCheckpoint.findUnique({
      where: {
        chainId_contractAddress: {
          chainId,
          contractAddress: contractAddress.toLowerCase(),
        },
      },
    })

    const startBlock = this.config.startBlocks[chainId] ?? 0
    const lastSynced =
      checkpoint !== null ? Number(checkpoint.lastSyncedBlock) : startBlock - 1
    if (safeToBlock <= lastSynced) {
      return
    }

    let fromBlock = Math.max(startBlock, lastSynced + 1 - this.config.reorgSafetyBlocks)
    while (fromBlock <= safeToBlock) {
      const toBlock = Math.min(safeToBlock, fromBlock + this.config.chunkSize - 1)
      const logs = await client.getLogs({
        address: contractAddress as `0x${string}`,
        fromBlock: BigInt(fromBlock),
        toBlock: BigInt(toBlock),
      })
      await this.processLogs(chainId, contractAddress, logs, client)
      await this.updateCheckpoint(chainId, contractAddress, toBlock)
      fromBlock = toBlock + 1
    }
  }

  private async processLogs(
    chainId: number,
    contractAddress: string,
    logs: RawLog[],
    client: PublicClient
  ) {
    const sortedLogs = [...logs].sort((a, b) => {
      const blockA = Number(a.blockNumber ?? 0n)
      const blockB = Number(b.blockNumber ?? 0n)
      if (blockA === blockB) {
        const indexA = Number(a.logIndex ?? 0)
        const indexB = Number(b.logIndex ?? 0)
        return indexA - indexB
      }
      return blockA - blockB
    })
    for (const log of sortedLogs) {
      await this.handleLog(chainId, contractAddress, log, client)
    }
  }

  private async handleLog(
    chainId: number,
    contractAddress: string,
    log: {
      blockNumber?: bigint | null
      logIndex?: number | null
      transactionHash?: `0x${string}` | null
      data: `0x${string}`
      topics: `0x${string}`[]
      eventName?: string
    },
    client: PublicClient
  ) {
    const eventName = log.eventName
    if (!eventName) return
    const args = this.extractEventArgs(log)
    const escrowIdValue = args.escrowId
    const escrowIdHex =
      typeof escrowIdValue === "string"
        ? escrowIdValue
        : typeof escrowIdValue === "bigint"
        ? `0x${escrowIdValue.toString(16)}`
        : typeof escrowIdValue === "number"
        ? escrowIdValue.toString()
        : undefined
    if (!escrowIdHex) return
    const escrowIdBuffer = Buffer.from(escrowIdHex.replace(/^0x/, ""), "hex")

    const timestamp = await this.getBlockTimestamp(client, log.blockNumber ?? 0n)

    await this.prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      await tx.escrowTimeline.create({
        data: {
          escrowId: escrowIdBuffer,
          chainId,
          eventName,
          stateAfter: EVENT_STATE_MAP[eventName] ?? "NONE",
          txHash: log.transactionHash ?? "0x0",
          blockNumber: BigInt(log.blockNumber ?? 0n),
          logIndex: Number(log.logIndex ?? 0),
          timestamp: new Date(Number(timestamp) * 1000),
          payload: args as any,
        },
      })

      await this.syncEscrowRecord(tx, chainId, contractAddress, escrowIdBuffer, log, eventName)

      if (eventName === "EscrowReleased") {
        await this.processReferralCommission(tx, chainId, escrowIdBuffer)
        await this.updateUserStats(tx, escrowIdBuffer)
      }
    })

    if (eventName === "EscrowResolved") {
      await this.syncDisputeState(chainId, escrowIdBuffer, args)
      // If buyer wins (outcome 1) or seller wins (outcome 2), it is resolved.
      // If buyer wins, it counts as a successful trade for volume? 
      // If seller wins, it means trade cancelled/refunded?
      // For now let's just track EscrowReleased (happy path) for stats to be safe.
    }
  }

  private async updateUserStats(
    tx: Prisma.TransactionClient,
    escrowId: Buffer
  ) {
    try {
      const escrow = await tx.escrow.findUnique({ where: { escrowId } })
      if (!escrow) return

      const amount = new Prisma.Decimal(escrow.amount)

      // Update Seller
      if (escrow.seller && escrow.seller !== ZERO_ADDRESS) {
        await tx.user.update({
          where: { address: escrow.seller },
          data: {
            successfulTrades: { increment: 1 },
            totalVolume: { increment: amount }
          }
        })
      }

      // Update Buyer
      if (escrow.buyer && escrow.buyer !== ZERO_ADDRESS) {
        await tx.user.update({
          where: { address: escrow.buyer },
          data: {
            successfulTrades: { increment: 1 },
            totalVolume: { increment: amount }
          }
        })
      }
    } catch (error) {
      console.error("failed to update user stats", error)
    }
  }

  private async processReferralCommission(
    tx: Prisma.TransactionClient,
    chainId: number,
    escrowId: Buffer
  ) {
    try {
      const escrow = await tx.escrow.findUnique({ where: { escrowId } })
      if (!escrow || !escrow.feeAmount || escrow.feeAmount.lte(0)) return

      const feeAmount = escrow.feeAmount // Decimal

      // Get global config or default
      const config = await tx.referralConfig.findFirst()
      const rate = config?.commissionRate || new Prisma.Decimal(0.1) // Default 10%
      const commission = feeAmount.mul(rate)

      if (commission.lte(0)) return

      // Check Seller Referrer
      if (escrow.seller) {
        await this.distributeCommission(tx, escrow.seller, commission, feeAmount, rate, escrowId, "SELLER")
      }

      // Check Buyer Referrer
      if (escrow.buyer) {
        await this.distributeCommission(tx, escrow.buyer, commission, feeAmount, rate, escrowId, "BUYER")
      }

    } catch (error) {
      console.error("failed to process referral commission", error)
    }
  }

  private async distributeCommission(
    tx: Prisma.TransactionClient,
    userAddress: string,
    commissionAmount: Prisma.Decimal,
    feeAmount: Prisma.Decimal,
    rate: Prisma.Decimal,
    escrowId: Buffer,
    role: "BUYER" | "SELLER"
  ) {
    // Find referral record where user is the REFEREE
    const referral = await tx.referral.findFirst({
      where: { refereeAddress: userAddress.toLowerCase() }
    })

    if (!referral) return

    // Add to ledger
    await tx.commissionLedger.create({
      data: {
        referralId: referral.id,
        feeAmount: feeAmount,
        commissionRate: rate,
        commissionAmount: commissionAmount,
        feeType: `ESCROW_${role}_${escrowId.toString("hex")}`
      }
    })

    // Update Wallet
    await tx.referralWallet.upsert({
      where: { address: referral.referrerAddress },
      create: {
        address: referral.referrerAddress,
        balance: commissionAmount,
      },
      update: {
        balance: { increment: commissionAmount }
      }
    })

    // Mark as qualified if not already
    if (!referral.qualified) {
      await tx.referral.update({
        where: { id: referral.id },
        data: { qualified: true, qualifiedAt: new Date() }
      })
    }
  }

  private async syncEscrowRecord(
    tx: Prisma.TransactionClient,
    chainId: number,
    contractAddress: string,
    escrowId: Buffer,
    log: {
      blockNumber?: bigint | null
      logIndex?: number | null
      transactionHash?: `0x${string}` | null
    },
    eventName: string
  ) {
    try {
      const client = this.clients[chainId]
      if (!client) return
      const data = encodeFunctionData({
        abi: escrowAbi,
        functionName: "escrows",
        args: [`0x${escrowId.toString("hex")}`],
      })
      const callResult = await client.call({
        to: contractAddress as `0x${string}`,
        data,
      })
      const decoded = decodeFunctionResult({
        abi: escrowAbi,
        functionName: "escrows",
        data: callResult.data ?? "0x",
      })
      const contractState = decoded as EscrowStruct

      const normalizedStatus = ESCROW_STATUS[Number(contractState.status)] ?? "NONE"
      const existing = await tx.escrow.findUnique({ where: { escrowId } })
      const createdAtBlock = existing?.createdAtBlock ?? BigInt(log.blockNumber ?? 0n)
      const txHashCreate = existing?.txHashCreate ?? log.transactionHash ?? "0x0"

      await tx.escrow.upsert({
        where: { escrowId },
        create: {
          escrowId,
          chainId,
          contractAddress: contractAddress.toLowerCase(),
          tokenKey: (contractState.tokenKey as string).toLowerCase(),
          amount: (contractState.amount as bigint).toString(),
          feeAmount: (contractState.feeAmount as bigint).toString(),
          sellerBond: (contractState.sellerBond as bigint).toString(),
          buyerBond: (contractState.buyerBond as bigint).toString(),
          state: normalizedStatus,
          seller: (contractState.seller as string).toLowerCase(),
          buyer:
            (contractState.buyer as string).toLowerCase() === ZERO_ADDRESS
              ? null
              : (contractState.buyer as string).toLowerCase(),
          createdAtBlock,
          updatedAtBlock: BigInt(log.blockNumber ?? 0n),
          txHashCreate,
          txHashLast: log.transactionHash ?? "0x0",
        },
        update: {
          contractAddress: contractAddress.toLowerCase(),
          tokenKey: (contractState.tokenKey as string).toLowerCase(),
          amount: (contractState.amount as bigint).toString(),
          feeAmount: (contractState.feeAmount as bigint).toString(),
          sellerBond: (contractState.sellerBond as bigint).toString(),
          buyerBond: (contractState.buyerBond as bigint).toString(),
          state: normalizedStatus,
          seller: (contractState.seller as string).toLowerCase(),
          buyer:
            (contractState.buyer as string).toLowerCase() === ZERO_ADDRESS
              ? null
              : (contractState.buyer as string).toLowerCase(),
          updatedAtBlock: BigInt(log.blockNumber ?? 0n),
          txHashLast: log.transactionHash,
        },
      })
    } catch (error) {
      console.error("failed to sync escrow record", error)
    }
  }

  private async syncDisputeState(
    chainId: number,
    escrowId: Buffer,
    eventArgs: Record<string, unknown>
  ) {
    const outcomeIndex = Number(eventArgs.outcome ?? 0)
    const outcome = DISPUTE_OUTCOME[outcomeIndex] ?? "NONE"
    await this.prisma.dispute.upsert({
      where: { escrowId },
      create: {
        escrowId,
        openedBy: ZERO_ADDRESS,
        status: "RESOLVED",
        outcome,
      },
      update: {
        status: "RESOLVED",
        outcome,
      },
    })
  }

  private async updateCheckpoint(chainId: number, contractAddress: string, blockNumber: number) {
    await this.prisma.indexerCheckpoint.upsert({
      where: {
        chainId_contractAddress: {
          chainId,
          contractAddress: contractAddress.toLowerCase(),
        },
      },
      create: {
        chainId,
        contractAddress: contractAddress.toLowerCase(),
        lastSyncedBlock: BigInt(blockNumber),
      },
      update: {
        lastSyncedBlock: BigInt(blockNumber),
      },
    })
  }

  private extractEventArgs(log: RawLog) {
    const args = {} as Record<string, unknown>
    if (!log.eventName || !log.data) return args
    const eventAbi = this.eventAbis.find((entry) => entry.name === log.eventName)
    if (!eventAbi) return args
    const topics = log.topics as unknown as [`0x${string}`, ...(`0x${string}`)[]]
    const decoded = decodeEventLog({
      abi: [eventAbi] as Abi,
      data: log.data,
      topics,
    })
    const decodedArgs = decoded.args as Record<string, unknown> | undefined

    for (const [key, value] of Object.entries(decodedArgs ?? {})) {
      if (Number.isInteger(Number(key))) continue
      args[key] = this.normalizeValue(value)
    }
    return args
  }

  private normalizeValue(value: unknown): unknown {
    if (typeof value === "bigint") {
      return value.toString()
    }
    if (Array.isArray(value)) {
      return value.map((item) => this.normalizeValue(item))
    }
    if (typeof value === "object" && value !== null && "toHexString" in value) {
      try {
        const hex = (value as { toHexString: () => string }).toHexString()
        return hex
      } catch {
        return value
      }
    }
    return value
  }

  private async getBlockTimestamp(client: PublicClient, blockNumber: number | bigint | undefined) {
    if (blockNumber === undefined) {
      return 0n
    }
    const blockKey = BigInt(blockNumber)
    if (this.blockTimestampCache.has(blockKey)) {
      return this.blockTimestampCache.get(blockKey)!
    }
    const block = await client.getBlock({ blockNumber: blockKey })
    if (!block || block.timestamp === undefined) {
      return 0n
    }
    this.blockTimestampCache.set(blockKey, block.timestamp)
    return block.timestamp
  }
}
