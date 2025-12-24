import dotenv from "dotenv"
dotenv.config({ path: "../.env" })
import { PrismaClient } from "@prisma/client"
import { loadWorkerConfig } from "./config"
import { IndexerWorker } from "./indexer.service"

const prisma = new PrismaClient()

async function bootstrap() {
  const config = loadWorkerConfig()
  console.log("Config loaded:", JSON.stringify(config, null, 2))
  const worker = new IndexerWorker(prisma, config)
  await worker.run()
}

bootstrap().catch((error) => {
  console.error("Indexer worker failed", error)
  process.exit(1)
})

process.on("SIGINT", async () => {
  await prisma.$disconnect().catch(() => {
    /** best effort */
  })
  process.exit(0)
})
