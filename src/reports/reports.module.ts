import { Module } from "@nestjs/common";
import { ReportsController } from "./reports.controller";
import { ReportsRepository } from "./reports.repository";
import { CreateReportHandler } from "./create-report";
import { ExecuteReportHandler } from "./execute-report";
import { GenerateReportHandler } from "./generate-report";

@Module({
  controllers: [ReportsController],
  providers: [
    ReportsRepository,
    CreateReportHandler,
    ExecuteReportHandler,
    GenerateReportHandler,
  ],
  exports: [ReportsRepository],
})
export class ReportsModule {}
