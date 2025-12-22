import { Injectable } from "@nestjs/common"
import { ConfigService } from "@nestjs/config"
import { createPublicClient, http } from "viem"
import { PrismaService } from "../prisma/prisma.service"

export interface IndexerStatus {
  chainId: number
  contractAddress: string
  lastSyncedBlock: number
  lagBlocks: number
}

@Injectable()
export class IndexerService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService
  ) {}

  async getStatus(): Promise<IndexerStatus[]> {
    const contractMap = this.parseChainRecord(
      this.configService.get<string>("CONTRACT_ADDRESS")
    )
    const rpcMap = this.parseChainRecord(this.configService.get<string>("RPC_URLS"))
    const confirmations = Number(
      this.configService.get<string>("INDEXER_CONFIRMATIONS") ?? "6"
    )

    const entries = Object.entries(contractMap)
    const statusList = await Promise.all(
      entries.map(async ([chainIdString, contractAddress]) => {
        const chainId = Number(chainIdString)
        const rpcUrl = rpcMap[chainId]
        if (!rpcUrl) return null

        const checkpoint = await this.prisma.indexerCheckpoint.findUnique({
          where: {
            chainId_contractAddress: {
              chainId,
              contractAddress: contractAddress.toLowerCase(),
            },
          },
        })
        const lastSynced = checkpoint ? Number(checkpoint.lastSyncedBlock) : 0

        try {
          const client = createPublicClient({
            transport: http(rpcUrl, { timeout: 1500 }),
          })
          const headBlock = await Promise.race([
            client.getBlockNumber(),
            new Promise<never>((_, reject) =>
              setTimeout(() => reject(new Error("rpc timeout")), 2000)
            ),
          ])
          const lag = Math.max(0, Number(headBlock) - lastSynced - confirmations)
          return {
            chainId,
            contractAddress: contractAddress.toLowerCase(),
            lastSyncedBlock: lastSynced,
            lagBlocks: lag,
          }
        } catch {
          return {
            chainId,
            contractAddress: contractAddress.toLowerCase(),
            lastSyncedBlock: lastSynced,
            lagBlocks: -1,
          }
        }
      })
    )

    return statusList.filter((status): status is IndexerStatus => Boolean(status))
  }

  private parseChainRecord(value?: string) {
    if (!value) return {} as Record<number, string>
    return value.split(",").reduce<Record<number, string>>((acc, chunk) => {
      const [chainIdRaw, ...rest] = chunk.split(/[:=]/)
      const url = rest.join(":").trim()
      const chainId = Number(chainIdRaw?.trim())
      if (chainId && url) {
        acc[chainId] = url
      }
      return acc
    }, {})
  }
}
