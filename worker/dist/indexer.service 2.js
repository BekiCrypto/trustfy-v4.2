import { createPublicClient, decodeEventLog, decodeFunctionResult, encodeFunctionData, http, } from "viem";
import escrowAbiRaw from "../../api/src/contracts/TrustfyEscrowV4_2_ABI.json";
const ESCROW_STATUS = {
    0: "NONE",
    1: "CREATED",
    2: "TAKEN",
    3: "FUNDED",
    4: "PAYMENT_CONFIRMED",
    5: "DISPUTED",
    6: "RESOLVED",
    7: "CANCELLED",
};
const DISPUTE_OUTCOME = {
    0: "NONE",
    1: "BUYER_WINS",
    2: "SELLER_WINS",
};
const EVENT_STATE_MAP = {
    EscrowCreated: "CREATED",
    EscrowTaken: "TAKEN",
    EscrowFunded: "FUNDED",
    PaymentConfirmed: "PAYMENT_CONFIRMED",
    EscrowResolved: "RESOLVED",
    EscrowCancelled: "CANCELLED",
};
const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";
const escrowAbi = escrowAbiRaw;
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
export class IndexerWorker {
    prisma;
    config;
    clients;
    eventAbis = escrowAbi.filter((entry) => entry.type === "event");
    blockTimestampCache = new Map();
    constructor(prisma, config) {
        this.prisma = prisma;
        this.config = config;
        this.clients = {};
        for (const [chainId, rpcUrl] of Object.entries(config.rpcUrls)) {
            this.clients[Number(chainId)] = createPublicClient({
                transport: http(rpcUrl),
            });
        }
    }
    async run() {
        console.log("indexer worker starting");
        while (true) {
            for (const [chainIdString, contractAddress] of Object.entries(this.config.contractAddresses)) {
                const chainId = Number(chainIdString);
                const client = this.clients[chainId];
                if (!client)
                    continue;
                await this.syncChain(chainId, contractAddress, client).catch((error) => {
                    console.error(`failed to sync chain ${chainId}`, error);
                });
            }
            await sleep(this.config.pollIntervalMs);
        }
    }
    async syncChain(chainId, contractAddress, client) {
        const headBlock = await client.getBlockNumber();
        const safeToBlock = Math.max(0, Number(headBlock) - this.config.confirmations);
        const checkpoint = await this.prisma.indexerCheckpoint.findUnique({
            where: {
                chainId_contractAddress: {
                    chainId,
                    contractAddress: contractAddress.toLowerCase(),
                },
            },
        });
        const startBlock = this.config.startBlocks[chainId] ?? 0;
        const lastSynced = checkpoint !== null ? Number(checkpoint.lastSyncedBlock) : startBlock - 1;
        if (safeToBlock <= lastSynced) {
            return;
        }
        let fromBlock = Math.max(startBlock, lastSynced + 1 - this.config.reorgSafetyBlocks);
        while (fromBlock <= safeToBlock) {
            const toBlock = Math.min(safeToBlock, fromBlock + this.config.chunkSize - 1);
            const logs = await client.getLogs({
                address: contractAddress,
                fromBlock: BigInt(fromBlock),
                toBlock: BigInt(toBlock),
            });
            await this.processLogs(chainId, contractAddress, logs, client);
            await this.updateCheckpoint(chainId, contractAddress, toBlock);
            fromBlock = toBlock + 1;
        }
    }
    async processLogs(chainId, contractAddress, logs, client) {
        const sortedLogs = [...logs].sort((a, b) => {
            const blockA = Number(a.blockNumber ?? 0n);
            const blockB = Number(b.blockNumber ?? 0n);
            if (blockA === blockB) {
                const indexA = Number(a.logIndex ?? 0);
                const indexB = Number(b.logIndex ?? 0);
                return indexA - indexB;
            }
            return blockA - blockB;
        });
        for (const log of sortedLogs) {
            await this.handleLog(chainId, contractAddress, log, client);
        }
    }
    async handleLog(chainId, contractAddress, log, client) {
        const eventName = log.eventName;
        if (!eventName)
            return;
        const args = this.extractEventArgs(log);
        const escrowIdValue = args.escrowId;
        const escrowIdHex = typeof escrowIdValue === "string"
            ? escrowIdValue
            : typeof escrowIdValue === "bigint"
                ? `0x${escrowIdValue.toString(16)}`
                : typeof escrowIdValue === "number"
                    ? escrowIdValue.toString()
                    : undefined;
        if (!escrowIdHex)
            return;
        const escrowIdBuffer = Buffer.from(escrowIdHex.replace(/^0x/, ""), "hex");
        const timestamp = await this.getBlockTimestamp(client, log.blockNumber ?? 0n);
        await this.prisma.$transaction(async (tx) => {
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
                    payload: args,
                },
            });
            await this.syncEscrowRecord(tx, chainId, contractAddress, escrowIdBuffer, log, eventName);
        });
        if (eventName === "EscrowResolved") {
            await this.syncDisputeState(chainId, escrowIdBuffer, args);
        }
    }
    async syncEscrowRecord(tx, chainId, contractAddress, escrowId, log, eventName) {
        try {
            const client = this.clients[chainId];
            if (!client)
                return;
            const data = encodeFunctionData({
                abi: escrowAbi,
                functionName: "escrows",
                args: [`0x${escrowId.toString("hex")}`],
            });
            const callResult = await client.call({
                to: contractAddress,
                data,
            });
            const decoded = decodeFunctionResult({
                abi: escrowAbi,
                functionName: "escrows",
                data: callResult.data ?? "0x",
            });
            const contractState = decoded;
            const normalizedStatus = ESCROW_STATUS[Number(contractState.status)] ?? "NONE";
            const existing = await tx.escrow.findUnique({ where: { escrowId } });
            const createdAtBlock = existing?.createdAtBlock ?? BigInt(log.blockNumber ?? 0n);
            const txHashCreate = existing?.txHashCreate ?? log.transactionHash ?? "0x0";
            await tx.escrow.upsert({
                where: { escrowId },
                create: {
                    escrowId,
                    chainId,
                    contractAddress: contractAddress.toLowerCase(),
                    tokenKey: contractState.tokenKey.toLowerCase(),
                    amount: contractState.amount.toString(),
                    feeAmount: contractState.feeAmount.toString(),
                    sellerBond: contractState.sellerBond.toString(),
                    buyerBond: contractState.buyerBond.toString(),
                    state: normalizedStatus,
                    seller: contractState.seller.toLowerCase(),
                    buyer: contractState.buyer.toLowerCase() === ZERO_ADDRESS
                        ? null
                        : contractState.buyer.toLowerCase(),
                    createdAtBlock,
                    updatedAtBlock: BigInt(log.blockNumber ?? 0n),
                    txHashCreate,
                    txHashLast: log.transactionHash ?? "0x0",
                },
                update: {
                    contractAddress: contractAddress.toLowerCase(),
                    tokenKey: contractState.tokenKey.toLowerCase(),
                    amount: contractState.amount.toString(),
                    feeAmount: contractState.feeAmount.toString(),
                    sellerBond: contractState.sellerBond.toString(),
                    buyerBond: contractState.buyerBond.toString(),
                    state: normalizedStatus,
                    seller: contractState.seller.toLowerCase(),
                    buyer: contractState.buyer.toLowerCase() === ZERO_ADDRESS
                        ? null
                        : contractState.buyer.toLowerCase(),
                    updatedAtBlock: BigInt(log.blockNumber ?? 0n),
                    txHashLast: log.transactionHash,
                },
            });
        }
        catch (error) {
            console.error("failed to sync escrow record", error);
        }
    }
    async syncDisputeState(chainId, escrowId, eventArgs) {
        const outcomeIndex = Number(eventArgs.outcome ?? 0);
        const outcome = DISPUTE_OUTCOME[outcomeIndex] ?? "NONE";
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
        });
    }
    async updateCheckpoint(chainId, contractAddress, blockNumber) {
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
        });
    }
    extractEventArgs(log) {
        const args = {};
        if (!log.eventName || !log.data)
            return args;
        const eventAbi = this.eventAbis.find((entry) => entry.name === log.eventName);
        if (!eventAbi)
            return args;
        const topics = log.topics;
        const decoded = decodeEventLog({
            abi: [eventAbi],
            data: log.data,
            topics,
        });
        const decodedArgs = decoded.args;
        for (const [key, value] of Object.entries(decodedArgs ?? {})) {
            if (Number.isInteger(Number(key)))
                continue;
            args[key] = this.normalizeValue(value);
        }
        return args;
    }
    normalizeValue(value) {
        if (typeof value === "bigint") {
            return value.toString();
        }
        if (Array.isArray(value)) {
            return value.map((item) => this.normalizeValue(item));
        }
        if (typeof value === "object" && value !== null && "toHexString" in value) {
            try {
                const hex = value.toHexString();
                return hex;
            }
            catch {
                return value;
            }
        }
        return value;
    }
    async getBlockTimestamp(client, blockNumber) {
        if (blockNumber === undefined) {
            return 0n;
        }
        const blockKey = BigInt(blockNumber);
        if (this.blockTimestampCache.has(blockKey)) {
            return this.blockTimestampCache.get(blockKey);
        }
        const block = await client.getBlock({ blockNumber: blockKey });
        if (!block || block.timestamp === undefined) {
            return 0n;
        }
        this.blockTimestampCache.set(blockKey, block.timestamp);
        return block.timestamp;
    }
}
