import { Controller, Get } from "@nestjs/common"
import { IndexerService } from "./indexer.service"

@Controller("v1/indexer")
export class IndexerController {
  constructor(private readonly service: IndexerService) {}

  @Get("status")
  status() {
    return this.service.getStatus()
  }
}
