import { Controller, Get, Post, Body, Param, UseGuards } from "@nestjs/common";
import { CreateReportHandler, CreateReportRequest } from "./create-report";
import { ExecuteReportHandler } from "./execute-report";
import {
  GenerateReportHandler,
  GenerateReportRequest,
} from "./generate-report";
import { UserAccessGuard, RequireAccess } from "../shared/guards";

@Controller("reports")
export class ReportsController {
  constructor(
    private createReportHandler: CreateReportHandler,
    private executeReportHandler: ExecuteReportHandler,
    private generateReportHandler: GenerateReportHandler
  ) {}

  @Post("")
  async createReport(@Body() body: CreateReportRequest) {
    return this.createReportHandler.execute(body);
  }

  @Get(":id/execute")
  async executeReport(@Param("id") id: string) {
    return this.executeReportHandler.execute(id);
  }

  @Post("generate")
  @UseGuards(UserAccessGuard)
  @RequireAccess("reports")
  async generateReport(@Body() body: GenerateReportRequest) {
    return this.generateReportHandler.execute(body);
  }
}
