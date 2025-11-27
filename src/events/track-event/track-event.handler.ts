import { Injectable } from "@nestjs/common";
import * as sqlite3 from "sqlite3";
import * as path from "path";
import { TrackEventRequest } from "./track-event.request";
import { TrackEventResponse } from "./track-event.response";

@Injectable()
export class TrackEventHandler {
  private db: sqlite3.Database;

  constructor() {
    this.db = new sqlite3.Database(path.join(process.cwd(), "analytics.db"));
  }

  async execute(request: TrackEventRequest): Promise<TrackEventResponse> {
    return new Promise((resolve) => {
      const sql = `INSERT INTO events (user_id, event_type, event_data, timestamp, session_id) 
                   VALUES (?, ?, ?, datetime('now'), ?)`;
      this.db.run(
        sql,
        [
          request.userId,
          request.eventType,
          JSON.stringify(request.eventData),
          request.sessionId,
        ],
        function (err) {
          resolve({ id: this.lastID, eventType: request.eventType });
        }
      );
    });
  }
}
