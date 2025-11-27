import { Module } from "@nestjs/common";
import { ReportsController } from "./reports.controller";
import { CreateReportHandler } from "./create-report";
import { ExecuteReportHandler } from "./execute-report";
import { GenerateReportHandler } from "./generate-report";

@Module({
  controllers: [ReportsController],
  providers: [CreateReportHandler, ExecuteReportHandler, GenerateReportHandler],
})
export class ReportsModule {}
