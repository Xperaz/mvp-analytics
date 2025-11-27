import { Injectable } from "@nestjs/common";
import * as sqlite3 from "sqlite3";
import * as path from "path";
import { CalculateMetricsResponse } from "./calculate-metrics.response";

@Injectable()
export class CalculateMetricsHandler {
  private db: sqlite3.Database;

  constructor() {
    this.db = new sqlite3.Database(path.join(process.cwd(), "analytics.db"));
  }

  async execute(
    metricType: string,
    params: any
  ): Promise<CalculateMetricsResponse | null> {
    if (metricType === "retention") {
      return this.calculateRetention();
    } else if (metricType === "engagement") {
      return this.calculateEngagement();
    } else if (metricType === "conversion") {
      return this.calculateConversion();
    }
    return null;
  }

  private async calculateRetention(): Promise<CalculateMetricsResponse> {
    const sql = `SELECT COUNT(DISTINCT user_id) as users FROM events WHERE timestamp >= datetime('now', '-7 days')`;
    const weeklyUsers: any = await new Promise((resolve) => {
      this.db.get(sql, (err, row) => resolve(row));
    });
    const monthlyUsers: any = await new Promise((resolve) => {
      this.db.get(
        `SELECT COUNT(DISTINCT user_id) as users FROM events WHERE timestamp >= datetime('now', '-30 days')`,
        (err, row) => resolve(row)
      );
    });
    return {
      weekly: weeklyUsers.users,
      monthly: monthlyUsers.users,
      retention: ((weeklyUsers.users / monthlyUsers.users) * 100).toFixed(2),
    };
  }

  private async calculateEngagement(): Promise<CalculateMetricsResponse> {
    const sql = `SELECT AVG(event_count) as avg_events FROM (SELECT user_id, COUNT(*) as event_count FROM events GROUP BY user_id)`;
    const result: any = await new Promise((resolve) => {
      this.db.get(sql, (err, row) => resolve(row));
    });
    return { average_events_per_user: result.avg_events };
  }

  private async calculateConversion(): Promise<CalculateMetricsResponse> {
    const signups: any = await new Promise((resolve) => {
      this.db.get(
        `SELECT COUNT(*) as count FROM events WHERE event_type = 'signup'`,
        (err, row) => resolve(row)
      );
    });
    const pageViews: any = await new Promise((resolve) => {
      this.db.get(
        `SELECT COUNT(*) as count FROM events WHERE event_type = 'page_view'`,
        (err, row) => resolve(row)
      );
    });
    return {
      signups: signups.count,
      page_views: pageViews.count,
      conversion_rate: ((signups.count / pageViews.count) * 100).toFixed(2),
    };
  }
}
