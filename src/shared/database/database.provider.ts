import * as sqlite3 from "sqlite3";
import * as path from "path";

// I disable naming convention rule, for clarity in this specific case
// eslint-disable-next-line @typescript-eslint/naming-convention
export const DATABASE_CONNECTION = "DATABASE_CONNECTION";

export const databaseProvider = {
  provide: DATABASE_CONNECTION,
  useFactory: (): sqlite3.Database => {
    const dbPath = path.join(process.cwd(), "analytics.db");

    const db = new sqlite3.Database(dbPath, (err) => {
      if (err) {
        console.error(`Failed to connect to database: ${err.message}`);
        throw err;
      }
      console.log(`Database connected: ${dbPath}`);
    });

    // Enable foreign keys with
    db.run("PRAGMA foreign_keys = ON", (err) => {
      if (err) {
        console.error(`Failed to enable foreign keys: ${err.message}`);
      }
    });

    return db;
  },
};
