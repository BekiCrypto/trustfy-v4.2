import { Module } from "@nestjs/common"
import { PrismaModule } from "../prisma/prisma.module"
import { ReferralsService } from "./referrals.service"
import { ReferralsController } from "./referrals.controller"

@Module({
  imports: [PrismaModule],
  providers: [ReferralsService],
  controllers: [ReferralsController],
  exports: [ReferralsService],
})
export class ReferralsModule {}

