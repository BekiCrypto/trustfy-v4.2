"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.IndexerService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const viem_1 = require("viem");
const prisma_service_1 = require("../prisma/prisma.service");
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
        const entries = Object.entries(contractMap);
        const statusList = await Promise.all(entries.map(async ([chainIdString, contractAddress]) => {
            const chainId = Number(chainIdString);
            const rpcUrl = rpcMap[chainId];
            if (!rpcUrl)
                return null;
            const checkpoint = await this.prisma.indexerCheckpoint.findUnique({
                where: {
                    chainId_contractAddress: {
                        chainId,
                        contractAddress: contractAddress.toLowerCase(),
                    },
                },
            });
            const lastSynced = checkpoint ? Number(checkpoint.lastSyncedBlock) : 0;
            try {
                const client = (0, viem_1.createPublicClient)({
                    transport: (0, viem_1.http)(rpcUrl, { timeout: 1500 }),
                });
                const headBlock = await Promise.race([
                    client.getBlockNumber(),
                    new Promise((_, reject) => setTimeout(() => reject(new Error("rpc timeout")), 2000)),
                ]);
                const lag = Math.max(0, Number(headBlock) - lastSynced - confirmations);
                return {
                    chainId,
                    contractAddress: contractAddress.toLowerCase(),
                    lastSyncedBlock: lastSynced,
                    lagBlocks: lag,
                };
            }
            catch {
                return {
                    chainId,
                    contractAddress: contractAddress.toLowerCase(),
                    lastSyncedBlock: lastSynced,
                    lagBlocks: -1,
                };
            }
        }));
        return statusList.filter((status) => Boolean(status));
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
exports.IndexerService = IndexerService;
exports.IndexerService = IndexerService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        config_1.ConfigService])
], IndexerService);
//# sourceMappingURL=indexer.service.js.map