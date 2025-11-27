import { Injectable } from "@nestjs/common";
import { ReportsRepository } from "../reports.repository";
import { GenerateReportRequest } from "./generate-report.request";
import { GenerateReportResponse } from "./generate-report.response";

@Injectable()
export class GenerateReportHandler {
  constructor(private reportsRepository: ReportsRepository) {}

  async execute(
    request: GenerateReportRequest
  ): Promise<GenerateReportResponse> {
    console.log(
      `Generating ${request.reportType} report for user ${request.userId}`
    );

    if (request.reportType === "user_activity") {
      return this.generateUserActivityReport(request.userId);
    } else if (request.reportType === "daily_summary") {
      return this.generateDailySummaryReport();
    } else if (request.reportType === "user_engagement") {
      return this.generateUserEngagementReport();
    }

    console.log(`Unknown report type: ${request.reportType}`);
    return { error: "Unknown report type" };
  }

  async validateUserAccess(userId: number, resource: string): Promise<boolean> {
    const user = await this.reportsRepository.findUserById(userId);

    if (!user) return false;

    if (resource === "reports" && user.plan_type === "basic") {
      return false;
    } else if (resource === "analytics" && user.plan_type === "basic") {
      return false;
    } else if (resource === "admin" && user.plan_type !== "enterprise") {
      return false;
    }
    return true;
  }

  private async generateUserActivityReport(
    userId: number
  ): Promise<GenerateReportResponse> {
    try {
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
    } catch (err) {
      console.error("Database error:", err);
      return { error: "Database error occurred" };
    }
  }

  private async generateDailySummaryReport(): Promise<GenerateReportResponse> {
    try {
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
    } catch (err) {
      console.error("Database error:", err);
      return { error: "Database error occurred" };
    }
  }

  private async generateUserEngagementReport(): Promise<GenerateReportResponse> {
    try {
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
    } catch (err) {
      console.error("Database error:", err);
      return { error: "Database error occurred" };
    }
  }
}
