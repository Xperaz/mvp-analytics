import { Injectable } from "@nestjs/common";
import * as sqlite3 from "sqlite3";
import * as path from "path";

@Injectable()
export class CreateUserHandler {
  private db: sqlite3.Database;

  constructor() {
    this.db = new sqlite3.Database(path.join(process.cwd(), "analytics.db"));
  }

  async execute(
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
}
