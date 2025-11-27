import { Injectable } from "@nestjs/common";
import { ReportsRepository } from "../reports.repository";
import { ExecuteReportResponse } from "./execute-report.response";

@Injectable()
export class ExecuteReportHandler {
  constructor(private reportsRepository: ReportsRepository) {}

  async execute(reportId: string): Promise<ExecuteReportResponse | null> {
    const report = await this.reportsRepository.findById(reportId);

    if (!report) return null;

    const data = await this.reportsRepository.executeQuery(report.query_sql);
    return { reportName: report.name, data };
  }
}
