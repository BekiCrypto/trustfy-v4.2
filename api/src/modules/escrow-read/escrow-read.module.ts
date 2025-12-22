import { Module } from "@nestjs/common"
import { EscrowReadController } from "./escrow-read.controller"
import { EscrowReadService } from "./escrow-read.service"

@Module({
  controllers: [EscrowReadController],
  providers: [EscrowReadService],
})
export class EscrowReadModule {}
