import { Module } from "@nestjs/common"
import { ConfigModule } from "@nestjs/config"
import { IndexerController } from "./indexer.controller"
import { IndexerService } from "./indexer.service"

@Module({
  imports: [ConfigModule],
  controllers: [IndexerController],
  providers: [IndexerService],
  exports: [IndexerService],
})
export class IndexerModule {}
