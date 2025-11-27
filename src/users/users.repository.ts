import { Injectable, Inject } from "@nestjs/common";
import * as sqlite3 from "sqlite3";
import { DATABASE_CONNECTION } from "../shared/database";
import { PlanType } from "../shared/types";

export interface User {
  id: number;
  email: string;
  plan_type: PlanType;
  created_at: string;
}

export interface UserWithEventCount extends User {
  event_count: number;
}

@Injectable()
export class UsersRepository {
  constructor(@Inject(DATABASE_CONNECTION) private db: sqlite3.Database) {}

  async create(
    email: string,
    planType: PlanType
  ): Promise<{ id: number; email: string; planType: PlanType }> {
    return new Promise((resolve) => {
      const sql = `INSERT INTO users (email, plan_type, created_at) VALUES (?, ?, datetime('now'))`;
      this.db.run(sql, [email, planType], function () {
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
      this.db.get(sql, [userId, eventType], (_err, row: { cnt: number }) => {
        resolve(row?.cnt || 0);
      });
    });
  }
}
