import { Injectable } from "@nestjs/common";
import * as sqlite3 from "sqlite3";
import * as path from "path";
import { GetUserAnalyticsResponse } from "./get-user-analytics.response";

@Injectable()
export class GetUserAnalyticsHandler {
  private db: sqlite3.Database;

  constructor() {
    this.db = new sqlite3.Database(path.join(process.cwd(), "analytics.db"));
  }

  async execute(): Promise<GetUserAnalyticsResponse[]> {
    return new Promise((resolve) => {
      const sql = `SELECT u.email, u.plan_type, COUNT(e.id) as event_count 
                   FROM users u LEFT JOIN events e ON u.id = e.user_id GROUP BY u.id`;
      this.db.all(sql, (err, rows: GetUserAnalyticsResponse[]) => {
        resolve(rows || []);
      });
    });
  }
}
