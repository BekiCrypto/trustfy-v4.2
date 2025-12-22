var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { createPublicClient, http } from "viem";
import { PrismaService } from "../prisma/prisma.service";
let IndexerService = class IndexerService {
    prisma;
    configService;
    constructor(prisma, configService) {
        this.prisma = prisma;
        this.configService = configService;
    }
    async getStatus() {
        const contractMap = this.parseChainRecord(this.configService.get("CONTRACT_ADDRESS"));
        const rpcMap = this.parseChainRecord(this.configService.get("RPC_URLS"));
        const confirmations = Number(this.configService.get("INDEXER_CONFIRMATIONS") ?? "6");
        const statuses = [];
        for (const [chainIdString, contractAddress] of Object.entries(contractMap)) {
            const chainId = Number(chainIdString);
            const rpcUrl = rpcMap[chainId];
            if (!rpcUrl)
                continue;
            const client = createPublicClient({
                transport: http(rpcUrl),
            });
            const headBlock = await client.getBlockNumber();
            const checkpoint = await this.prisma.indexerCheckpoint.findUnique({
                where: {
                    chainId_contractAddress: {
                        chainId,
                        contractAddress: contractAddress.toLowerCase(),
                    },
                },
            });
            const lastSynced = checkpoint ? Number(checkpoint.lastSyncedBlock) : 0;
            const lag = Math.max(0, Number(headBlock) - lastSynced - confirmations);
            statuses.push({
                chainId,
                contractAddress: contractAddress.toLowerCase(),
                lastSyncedBlock: lastSynced,
                lagBlocks: lag,
            });
        }
        return statuses;
    }
    parseChainRecord(value) {
        if (!value)
            return {};
        return value.split(",").reduce((acc, chunk) => {
            const [chainIdRaw, ...rest] = chunk.split(/[:=]/);
            const url = rest.join(":").trim();
            const chainId = Number(chainIdRaw?.trim());
            if (chainId && url) {
                acc[chainId] = url;
            }
            return acc;
        }, {});
    }
};
IndexerService = __decorate([
    Injectable(),
    __metadata("design:paramtypes", [PrismaService,
        ConfigService])
], IndexerService);
export { IndexerService };
//# sourceMappingURL=indexer.service.js.map