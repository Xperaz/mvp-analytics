import { Injectable } from "@nestjs/common";
import * as sqlite3 from "sqlite3";
import * as path from "path";

@Injectable()
export class GetUserMetricsHandler {
  private db: sqlite3.Database;

  constructor() {
    this.db = new sqlite3.Database(path.join(process.cwd(), "analytics.db"));
  }

  async execute(userId: string, metricType: string): Promise<number> {
    return new Promise((resolve) => {
      const sql = `SELECT COUNT(*) as cnt FROM events WHERE user_id = ? AND event_type = ?`;
      this.db.get(sql, [userId, metricType], (err, row: any) => {
        resolve(row?.cnt || 0);
      });
    });
  }
}
