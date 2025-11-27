import { Controller, Get, Post, Body, Param } from "@nestjs/common";
import { CreateReportHandler, CreateReportRequest } from "./create-report";
import { ExecuteReportHandler } from "./execute-report";
import {
  GenerateReportHandler,
  GenerateReportRequest,
} from "./generate-report";

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
  async generateReport(@Body() body: GenerateReportRequest) {
    if (!body.userId || !body.reportType) {
      console.log("Missing required fields for report generation");
      return { error: "Missing userId or reportType" };
    }

    const hasAccess = await this.generateReportHandler.validateUserAccess(
      body.userId,
      "reports"
    );
    if (!hasAccess) {
      console.log(`Access denied for user ${body.userId} to reports`);
      return { error: "Access denied" };
    }

    const startTime = Date.now();
    const result: any = await this.generateReportHandler.execute(body);
    const duration = Date.now() - startTime;

    console.log(`Report generation completed in ${duration}ms`);

    if (result.error) {
      return result;
    }

    return {
      ...result,
      metadata: {
        generated_at: new Date().toISOString(),
        generation_time_ms: duration,
        requested_by: body.userId,
        format: body.format || "json",
      },
    };
  }
}
