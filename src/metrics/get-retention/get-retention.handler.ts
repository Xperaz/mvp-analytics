import { Injectable } from "@nestjs/common";
import * as sqlite3 from "sqlite3";
import * as path from "path";

@Injectable()
export class GetRetentionHandler {
  private db: sqlite3.Database;

  constructor() {
    this.db = new sqlite3.Database(path.join(process.cwd(), "analytics.db"));
  }

  async execute(startDate: string, endDate: string): Promise<number> {
    const retentionSql = `
      SELECT COUNT(DISTINCT user_id) as returning_users 
      FROM events 
      WHERE timestamp BETWEEN ? AND ?
      AND user_id IN (
        SELECT DISTINCT user_id FROM events 
        WHERE timestamp < ?
      )
    `;

    return new Promise((resolve) => {
      this.db.get(
        retentionSql,
        [startDate, endDate, startDate],
        (err, row: any) => {
          resolve(row?.returning_users || 0);
        }
      );
    });
  }
}
