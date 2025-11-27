import { Injectable } from "@nestjs/common";
import * as sqlite3 from "sqlite3";
import * as path from "path";
import { GetEventsResponse } from "./get-events.response";

@Injectable()
export class GetEventsHandler {
  private db: sqlite3.Database;

  constructor() {
    this.db = new sqlite3.Database(path.join(process.cwd(), "analytics.db"));
  }

  async execute(
    eventType: string,
    userId: string
  ): Promise<GetEventsResponse[]> {
    return new Promise((resolve, reject) => {
      const sql = `SELECT * FROM events WHERE event_type = ? AND user_id = ?`;
      this.db.all(
        sql,
        [eventType, userId],
        (err, rows: GetEventsResponse[]) => {
          if (err) reject(err);
          resolve(rows || []);
        }
      );
    });
  }
}
