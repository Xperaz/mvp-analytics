import { Injectable } from "@nestjs/common";
import * as sqlite3 from "sqlite3";
import * as path from "path";
import { GetDashboardResponse } from "./get-dashboard.response";

@Injectable()
export class GetDashboardHandler {
  private db: sqlite3.Database;

  constructor() {
    this.db = new sqlite3.Database(path.join(process.cwd(), "analytics.db"));
  }

  async execute(dateRange?: string): Promise<GetDashboardResponse> {
    const stats: GetDashboardResponse = {
      totalUsers: 0,
      totalEvents: 0,
      topEvents: [],
    };

    stats.totalUsers = await new Promise((resolve) => {
      this.db.get("SELECT COUNT(*) as count FROM users", (err, row: any) => {
        resolve(row?.count || 0);
      });
    });

    stats.totalEvents = await new Promise((resolve) => {
      this.db.get("SELECT COUNT(*) as count FROM events", (err, row: any) => {
        resolve(row?.count || 0);
      });
    });

    stats.topEvents = await new Promise((resolve) => {
      this.db.all(
        "SELECT event_type, COUNT(*) as count FROM events GROUP BY event_type ORDER BY count DESC LIMIT 5",
        (err, rows: any[]) => {
          resolve(rows || []);
        }
      );
    });

    return stats;
  }
}
