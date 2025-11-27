import { Injectable, Inject } from "@nestjs/common";
import * as sqlite3 from "sqlite3";
import { DATABASE_CONNECTION } from "../shared/database";

export interface TopEventRow {
  event_type: string;
  count: number;
}

export interface CountRow {
  count: number;
}

export interface UsersRow {
  users: number;
}

export interface AvgEventsRow {
  avg_events: number;
}

@Injectable()
export class MetricsRepository {
  constructor(@Inject(DATABASE_CONNECTION) private db: sqlite3.Database) {}

  async countUsers(): Promise<number> {
    return new Promise((resolve) => {
      this.db.get(
        "SELECT COUNT(*) as count FROM users",
        (err, row: CountRow) => {
          resolve(row?.count || 0);
        }
      );
    });
  }

  async countEvents(): Promise<number> {
    return new Promise((resolve) => {
      this.db.get(
        "SELECT COUNT(*) as count FROM events",
        (err, row: CountRow) => {
          resolve(row?.count || 0);
        }
      );
    });
  }

  async getTopEvents(limit: number = 5): Promise<TopEventRow[]> {
    return new Promise((resolve) => {
      this.db.all(
        `SELECT event_type, COUNT(*) as count FROM events GROUP BY event_type ORDER BY count DESC LIMIT ?`,
        [limit],
        (err, rows: TopEventRow[]) => {
          resolve(rows || []);
        }
      );
    });
  }

  async getRetentionAnalysis(
    startDate: string,
    endDate: string
  ): Promise<number> {
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
        (err, row: { returning_users: number }) => {
          resolve(row?.returning_users || 0);
        }
      );
    });
  }

  async getWeeklyActiveUsers(): Promise<number> {
    return new Promise((resolve) => {
      const sql = `SELECT COUNT(DISTINCT user_id) as users FROM events WHERE timestamp >= datetime('now', '-7 days')`;
      this.db.get(sql, (err, row: UsersRow) => {
        resolve(row?.users || 0);
      });
    });
  }

  async getMonthlyActiveUsers(): Promise<number> {
    return new Promise((resolve) => {
      const sql = `SELECT COUNT(DISTINCT user_id) as users FROM events WHERE timestamp >= datetime('now', '-30 days')`;
      this.db.get(sql, (err, row: UsersRow) => {
        resolve(row?.users || 0);
      });
    });
  }

  async getAverageEventsPerUser(): Promise<number> {
    return new Promise((resolve) => {
      const sql = `SELECT AVG(event_count) as avg_events FROM (SELECT user_id, COUNT(*) as event_count FROM events GROUP BY user_id)`;
      this.db.get(sql, (err, row: AvgEventsRow) => {
        resolve(row?.avg_events || 0);
      });
    });
  }

  async countEventsByType(eventType: string): Promise<number> {
    return new Promise((resolve) => {
      this.db.get(
        `SELECT COUNT(*) as count FROM events WHERE event_type = ?`,
        [eventType],
        (err, row: CountRow) => {
          resolve(row?.count || 0);
        }
      );
    });
  }
}
