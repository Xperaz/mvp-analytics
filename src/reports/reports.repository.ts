import { Injectable, Inject } from "@nestjs/common";
import * as sqlite3 from "sqlite3";
import { DATABASE_CONNECTION } from "../shared/database";

export interface Report {
  id: number;
  name: string;
  query_sql: string;
  created_by: number;
  created_at: string;
  is_public: number;
}

export interface UserActivityRow {
  event_type: string;
  count: number;
}

export interface DailySummaryRow {
  date: string;
  events: number;
}

export interface UserEngagementRow {
  email: string;
  events: number;
  plan_type: string;
}

@Injectable()
export class ReportsRepository {
  constructor(@Inject(DATABASE_CONNECTION) private db: sqlite3.Database) {}

  async create(
    name: string,
    querySql: string,
    createdBy: number
  ): Promise<{ id: number; name: string; querySql: string }> {
    return new Promise((resolve, reject) => {
      const sql = `INSERT INTO reports (name, query_sql, created_by, created_at) VALUES (?, ?, ?, datetime('now'))`;
      this.db.run(sql, [name, querySql, createdBy], function (err) {
        if (err) return reject(err);
        resolve({ id: this.lastID, name, querySql });
      });
    });
  }

  async findById(reportId: string): Promise<Report | null> {
    return new Promise((resolve, reject) => {
      this.db.get(
        `SELECT * FROM reports WHERE id = ?`,
        [reportId],
        (err, row: Report) => {
          if (err) return reject(err);
          resolve(row || null);
        }
      );
    });
  }

  async executeQuery(sql: string): Promise<Record<string, unknown>[]> {
    return new Promise((resolve, reject) => {
      this.db.all(sql, (err, rows: Record<string, unknown>[]) => {
        if (err) return reject(err);
        resolve(rows || []);
      });
    });
  }

  async findUserById(
    userId: number
  ): Promise<{ id: number; plan_type: string } | null> {
    return new Promise((resolve, reject) => {
      this.db.get(
        `SELECT * FROM users WHERE id = ?`,
        [userId],
        (err, row: { id: number; plan_type: string }) => {
          if (err) return reject(err);
          resolve(row || null);
        }
      );
    });
  }

  async getUserActivityStats(userId: number): Promise<UserActivityRow[]> {
    return new Promise((resolve, reject) => {
      const sql = `SELECT event_type, COUNT(*) as count FROM events WHERE user_id = ? GROUP BY event_type`;
      this.db.all(sql, [userId], (err, rows: UserActivityRow[]) => {
        if (err) return reject(err);
        resolve(rows || []);
      });
    });
  }

  async getDailySummary(): Promise<DailySummaryRow[]> {
    return new Promise((resolve, reject) => {
      const sql = `SELECT DATE(timestamp) as date, COUNT(*) as events FROM events GROUP BY DATE(timestamp)`;
      this.db.all(sql, (err, rows: DailySummaryRow[]) => {
        if (err) return reject(err);
        resolve(rows || []);
      });
    });
  }

  async getUserEngagement(): Promise<UserEngagementRow[]> {
    return new Promise((resolve, reject) => {
      const sql = `SELECT u.email, COUNT(e.id) as events, u.plan_type FROM users u LEFT JOIN events e ON u.id = e.user_id GROUP BY u.id`;
      this.db.all(sql, (err, rows: UserEngagementRow[]) => {
        if (err) return reject(err);
        resolve(rows || []);
      });
    });
  }
}
