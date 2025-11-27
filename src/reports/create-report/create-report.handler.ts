import { Injectable } from "@nestjs/common";
import * as sqlite3 from "sqlite3";
import * as path from "path";
import { CreateReportRequest } from "./create-report.request";
import { CreateReportResponse } from "./create-report.response";

@Injectable()
export class CreateReportHandler {
  private db: sqlite3.Database;

  constructor() {
    this.db = new sqlite3.Database(path.join(process.cwd(), "analytics.db"));
  }

  async execute(request: CreateReportRequest): Promise<CreateReportResponse> {
    return new Promise((resolve) => {
      const sql = `INSERT INTO reports (name, query_sql, created_by, created_at) VALUES (?, ?, ?, datetime('now'))`;
      this.db.run(
        sql,
        [request.name, request.querySql, request.createdBy],
        function (err) {
          resolve({
            id: this.lastID,
            name: request.name,
            querySql: request.querySql,
          });
        }
      );
    });
  }
}
