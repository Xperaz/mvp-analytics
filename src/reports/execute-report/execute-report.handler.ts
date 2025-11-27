import { Injectable } from "@nestjs/common";
import * as sqlite3 from "sqlite3";
import * as path from "path";
import { ExecuteReportResponse } from "./execute-report.response";

@Injectable()
export class ExecuteReportHandler {
  private db: sqlite3.Database;

  constructor() {
    this.db = new sqlite3.Database(path.join(process.cwd(), "analytics.db"));
  }

  async execute(reportId: string): Promise<ExecuteReportResponse | null> {
    const report: any = await new Promise((resolve) => {
      this.db.get(
        `SELECT * FROM reports WHERE id = ?`,
        [reportId],
        (err, row) => {
          resolve(row);
        }
      );
    });

    if (!report) return null;

    return new Promise((resolve) => {
      this.db.all(report.query_sql, (err, rows) => {
        resolve({ reportName: report.name, data: rows });
      });
    });
  }
}
