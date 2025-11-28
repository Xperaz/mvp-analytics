import { Module } from "@nestjs/common";
import { ReportsController } from "./reports.controller";
import { ReportsRepository } from "./reports.repository";
import { CreateReportHandler } from "./create-report";
import { ExecuteReportHandler } from "./execute-report";
import { GenerateReportHandler } from "./generate-report";
import { DatabaseModule } from "../shared/database/database.module";
import { UserAccessGuard } from "../shared/guards";

@Module({
  imports: [DatabaseModule],
  controllers: [ReportsController],
  providers: [
    ReportsRepository,
    CreateReportHandler,
    ExecuteReportHandler,
    GenerateReportHandler,
    UserAccessGuard,
  ],
  exports: [ReportsRepository],
})
export class ReportsModule {}
