"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config({ path: "../.env" });
const client_1 = require("@prisma/client");
const config_1 = require("./config");
const indexer_service_1 = require("./indexer.service");
const prisma = new client_1.PrismaClient();
async function bootstrap() {
    const config = (0, config_1.loadWorkerConfig)();
    console.log("Config loaded:", JSON.stringify(config, null, 2));
    const worker = new indexer_service_1.IndexerWorker(prisma, config);
    await worker.run();
}
bootstrap().catch((error) => {
    console.error("Indexer worker failed", error);
    process.exit(1);
});
process.on("SIGINT", async () => {
    await prisma.$disconnect().catch(() => {
        /** best effort */
    });
    process.exit(0);
});
