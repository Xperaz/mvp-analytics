import * as sqlite3 from "sqlite3";
import * as path from "path";

// I disable naming convention rule, for clarity in this specific case
// eslint-disable-next-line @typescript-eslint/naming-convention
export const DATABASE_CONNECTION = "DATABASE_CONNECTION";

export const databaseProvider = {
  provide: DATABASE_CONNECTION,
  useFactory: (): sqlite3.Database => {
    const dbPath = path.join(process.cwd(), "analytics.db");
    const db = new sqlite3.Database(dbPath);

    // Enable foreign keys
    db.run("PRAGMA foreign_keys = ON");

    console.log(`Database connected: ${dbPath}`);
    return db;
  },
};
