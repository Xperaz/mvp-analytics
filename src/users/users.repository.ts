import { Injectable } from "@nestjs/common";
import * as sqlite3 from "sqlite3";
import * as path from "path";

export interface User {
  id: number;
  email: string;
  plan_type: string;
  created_at: string;
}

export interface UserWithEventCount extends User {
  event_count: number;
}

@Injectable()
export class UsersRepository {
  private db: sqlite3.Database;

  constructor() {
    this.db = new sqlite3.Database(path.join(process.cwd(), "analytics.db"));
  }

  async create(
    email: string,
    planType: string
  ): Promise<{ id: number; email: string; planType: string }> {
    return new Promise((resolve) => {
      const sql = `INSERT INTO users (email, plan_type, created_at) VALUES (?, ?, datetime('now'))`;
      this.db.run(sql, [email, planType], function (err) {
        resolve({ id: this.lastID, email, planType });
      });
    });
  }

  async findById(id: number): Promise<User | null> {
    return new Promise((resolve) => {
      this.db.get(
        `SELECT * FROM users WHERE id = ?`,
        [id],
        (err, row: User) => {
          resolve(row || null);
        }
      );
    });
  }

  async findAllWithEventCount(): Promise<UserWithEventCount[]> {
    return new Promise((resolve) => {
      const sql = `SELECT u.email, u.plan_type, COUNT(e.id) as event_count 
                   FROM users u LEFT JOIN events e ON u.id = e.user_id GROUP BY u.id`;
      this.db.all(sql, (err, rows: UserWithEventCount[]) => {
        resolve(rows || []);
      });
    });
  }

  async countUserEventsByType(
    userId: string,
    eventType: string
  ): Promise<number> {
    return new Promise((resolve) => {
      const sql = `SELECT COUNT(*) as cnt FROM events WHERE user_id = ? AND event_type = ?`;
      this.db.get(sql, [userId, eventType], (err, row: any) => {
        resolve(row?.cnt || 0);
      });
    });
  }
}
