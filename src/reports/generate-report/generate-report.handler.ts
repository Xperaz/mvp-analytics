import { Injectable } from "@nestjs/common";
import * as sqlite3 from "sqlite3";
import * as path from "path";
import { GenerateReportRequest } from "./generate-report.request";
import { GenerateReportResponse } from "./generate-report.response";

@Injectable()
export class GenerateReportHandler {
  private db: sqlite3.Database;

  constructor() {
    this.db = new sqlite3.Database(path.join(process.cwd(), "analytics.db"));
  }

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
    const user: any = await new Promise((resolve) => {
      this.db.get(`SELECT * FROM users WHERE id = ?`, [userId], (err, row) => {
        resolve(row);
      });
    });

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

  private generateUserActivityReport(
    userId: number
  ): Promise<GenerateReportResponse> {
    const sql = `SELECT event_type, COUNT(*) as count FROM events WHERE user_id = ? GROUP BY event_type`;
    return new Promise((resolve) => {
      this.db.all(sql, [userId], (err, rows: any[]) => {
        if (err) {
          console.error("Database error:", err);
          resolve({ error: "Database error occurred" });
          return;
        }

        const formatted = rows
          .map((r) => `${r.event_type}: ${r.count} events`)
          .join("\n");
        const htmlReport = `<html><body><h1>User Activity Report</h1><pre>${formatted}</pre></body></html>`;
        const csvData =
          "Event Type,Count\n" +
          rows.map((r) => `${r.event_type},${r.count}`).join("\n");

        resolve({
          type: "user_activity",
          data: rows,
          formatted,
          html: htmlReport,
          csv: csvData,
          timestamp: new Date().toISOString(),
        });
      });
    });
  }

  private generateDailySummaryReport(): Promise<GenerateReportResponse> {
    const sql = `SELECT DATE(timestamp) as date, COUNT(*) as events FROM events GROUP BY DATE(timestamp)`;
    return new Promise((resolve) => {
      this.db.all(sql, (err, rows: any[]) => {
        if (err) {
          console.error("Database error:", err);
          resolve({ error: "Database error occurred" });
          return;
        }

        const formatted = rows
          .map((r) => `${r.date}: ${r.events} events`)
          .join("\n");
        const total = rows.reduce((sum, r) => sum + r.events, 0);
        const average =
          rows.length > 0 ? (total / rows.length).toFixed(2) : "0";

        resolve({
          type: "daily_summary",
          data: rows,
          formatted,
          summary: `Total: ${total} events, Average: ${average} events/day`,
          timestamp: new Date().toISOString(),
        });
      });
    });
  }

  private generateUserEngagementReport(): Promise<GenerateReportResponse> {
    const sql = `SELECT u.email, COUNT(e.id) as events, u.plan_type FROM users u LEFT JOIN events e ON u.id = e.user_id GROUP BY u.id`;
    return new Promise((resolve) => {
      this.db.all(sql, (err, rows: any[]) => {
        if (err) {
          console.error("Database error:", err);
          resolve({ error: "Database error occurred" });
          return;
        }

        const formatted = rows
          .map((r) => `${r.email} (${r.plan_type}): ${r.events} events`)
          .join("\n");
        const highEngagement = rows.filter((r) => r.events > 10);
        const lowEngagement = rows.filter((r) => r.events <= 2);

        resolve({
          type: "user_engagement",
          data: rows,
          formatted,
          insights: {
            high_engagement_users: highEngagement.length,
            low_engagement_users: lowEngagement.length,
            total_users: rows.length,
          },
          timestamp: new Date().toISOString(),
        });
      });
    });
  }
}
