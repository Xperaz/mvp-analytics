import {
  Injectable,
  NotFoundException,
  InternalServerErrorException,
} from "@nestjs/common";
import { ReportsRepository } from "../reports.repository";
import { ExecuteReportResponse } from "./execute-report.response";

@Injectable()
export class ExecuteReportHandler {
  constructor(private reportsRepository: ReportsRepository) {}

  async execute(reportId: string): Promise<ExecuteReportResponse> {
    try {
      const report = await this.reportsRepository.findById(reportId);

      if (!report) {
        throw new NotFoundException(`Report with ID ${reportId} not found`);
      }

      const data = await this.reportsRepository.executeQuery(report.query_sql);
      return { reportName: report.name, data };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      console.error("Failed to execute report:", error);
      throw new InternalServerErrorException("Failed to execute report");
    }
  }
}
