import { Injectable, Inject } from "@nestjs/common";
import * as sqlite3 from "sqlite3";
import { DATABASE_CONNECTION } from "../shared/database";

export interface Event {
  id: number;
  user_id: number;
  event_type: string;
  event_data: string;
  timestamp: string;
  session_id: string;
}

export interface CreateEventParams {
  userId: number;
  eventType: string;
  eventData: Record<string, unknown>;
  sessionId: string;
}

@Injectable()
export class EventsRepository {
  constructor(@Inject(DATABASE_CONNECTION) private db: sqlite3.Database) {}

  async create(
    params: CreateEventParams
  ): Promise<{ id: number; eventType: string }> {
    return new Promise((resolve, reject) => {
      const sql = `INSERT INTO events (user_id, event_type, event_data, timestamp, session_id) 
                   VALUES (?, ?, ?, datetime('now'), ?)`;
      this.db.run(
        sql,
        [
          params.userId,
          params.eventType,
          JSON.stringify(params.eventData),
          params.sessionId,
        ],
        function (err) {
          if (err) return reject(err);
          resolve({ id: this.lastID, eventType: params.eventType });
        }
      );
    });
  }

  async findByTypeAndUser(eventType: string, userId: string): Promise<Event[]> {
    return new Promise((resolve, reject) => {
      const sql = `SELECT * FROM events WHERE event_type = ? AND user_id = ?`;
      this.db.all(sql, [eventType, userId], (err, rows: Event[]) => {
        if (err) return reject(err);
        resolve(rows || []);
      });
    });
  }
}
