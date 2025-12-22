import { IsOptional, IsObject } from "class-validator"

export class PaymentInstructionDto {
  @IsOptional()
  @IsObject()
  contentJson?: Record<string, unknown>
}
