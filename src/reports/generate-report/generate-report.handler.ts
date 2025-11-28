import {
  Injectable,
  BadRequestException,
  InternalServerErrorException,
} from "@nestjs/common";
import { ReportsRepository } from "../reports.repository";
import { GenerateReportRequest } from "./generate-report.request";
import { GenerateReportResponse } from "./generate-report.response";

@Injectable()
export class GenerateReportHandler {
  constructor(private reportsRepository: ReportsRepository) {}

  async execute(
    request: GenerateReportRequest
  ): Promise<GenerateReportResponse> {
    const startTime = Date.now();

    // Access control is now handled by UserAccessGuard
    // This handler focuses only on business logic

    let result: GenerateReportResponse;

    try {
      if (request.reportType === "user_activity") {
        result = await this.generateUserActivityReport(request.userId);
      } else if (request.reportType === "daily_summary") {
        result = await this.generateDailySummaryReport();
      } else if (request.reportType === "user_engagement") {
        result = await this.generateUserEngagementReport();
      } else {
        throw new BadRequestException(
          `Unknown report type: ${request.reportType}`
        );
      }
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      console.error("Failed to generate report:", error);
      throw new InternalServerErrorException("Failed to generate report");
    }

    const duration = Date.now() - startTime;

    return {
      ...result,
      metadata: {
        generatedAt: new Date().toISOString(),
        generationTimeMs: duration,
        requestedBy: request.userId,
        format: request.format || "json",
      },
    };
  }

  private async generateUserActivityReport(
    userId: number
  ): Promise<GenerateReportResponse> {
    const rows = await this.reportsRepository.getUserActivityStats(userId);

    const formatted = rows
      .map((r) => `${r.event_type}: ${r.count} events`)
      .join("\n");
    const htmlReport = `<html><body><h1>User Activity Report</h1><pre>${formatted}</pre></body></html>`;
    const csvData =
      "Event Type,Count\n" +
      rows.map((r) => `${r.event_type},${r.count}`).join("\n");

    return {
      type: "user_activity",
      data: rows,
      formatted,
      html: htmlReport,
      csv: csvData,
      timestamp: new Date().toISOString(),
    };
  }

  private async generateDailySummaryReport(): Promise<GenerateReportResponse> {
    const rows = await this.reportsRepository.getDailySummary();

    const formatted = rows
      .map((r) => `${r.date}: ${r.events} events`)
      .join("\n");
    const total = rows.reduce((sum, r) => sum + r.events, 0);
    const average = rows.length > 0 ? (total / rows.length).toFixed(2) : "0";

    return {
      type: "daily_summary",
      data: rows,
      formatted,
      summary: `Total: ${total} events, Average: ${average} events/day`,
      timestamp: new Date().toISOString(),
    };
  }

  private async generateUserEngagementReport(): Promise<GenerateReportResponse> {
    const rows = await this.reportsRepository.getUserEngagement();

    const formatted = rows
      .map((r) => `${r.email} (${r.plan_type}): ${r.events} events`)
      .join("\n");
    const highEngagement = rows.filter((r) => r.events > 10);
    const lowEngagement = rows.filter((r) => r.events <= 2);

    return {
      type: "user_engagement",
      data: rows,
      formatted,
      insights: {
        high_engagement_users: highEngagement.length,
        low_engagement_users: lowEngagement.length,
        total_users: rows.length,
      },
      timestamp: new Date().toISOString(),
    };
  }
}
