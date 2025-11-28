# Refactoring Notes - MVP Analytics

## Architecture Refactoring

Refactored from monolithic architecture to **Vertical Slice Architecture (VSA)** with **Domain Repositories**.

## Project Structure: Before & After

### AFTER (Vertical Slice Architecture)

```
src/
├── users/
│   ├── users.repository.ts       # Domain repository
│   ├── users.module.ts
│   ├── users.controller.ts
│   ├── create-user/
│   │   ├── create-user.handler.ts
│   │   ├── create-user.request.ts
│   │   ├── create-user.response.ts
│   │   └── index.ts
│   ├── get-user-analytics/
│   └── get-user-metrics/
├── events/
│   ├── events.repository.ts
│   ├── track-event/
│   ├── get-events/
│   └── process-event/
├── reports/
│   ├── reports.repository.ts
│   ├── create-report/
│   ├── execute-report/
│   └── generate-report/
├── metrics/
│   ├── metrics.repository.ts
│   ├── get-dashboard/
│   ├── get-retention/
│   └── calculate-metrics/
└── shared/
    └── database/
```

## Issues Fixed

### 0. Naming Conventions

examples:

- get_user_metrics => getUserMetrics
- calculate_retention_rate => calculateRetentionRate
- SQL_QUERY => sqlQuery
- RETENTION_SQL => retentionSql

### 1. SQL Injection Vulnerabilities (Critical)

**Before:** String interpolation in SQL queries allowed SQL injection attacks.

```typescript
// VULNERABLE
db.get(`SELECT * FROM users WHERE id = ${id}`);
db.run(`INSERT INTO events (type, user_id) VALUES ('${type}', ${userId})`);
```

**After:** All queries now use parameterized queries with placeholders.

```typescript
// SAFE
db.get(`SELECT * FROM users WHERE id = ?`, [id]);
db.run(`INSERT INTO events (type, user_id) VALUES (?, ?)`, [type, userId]);
```

### 2. TypeScript `any` Types Removed

Extensive use of `any` type bypassing TypeScript's type safety.

### 3. Code Duplication in Database Access

**Before:** Same database query patterns repeated across multiple methods in the service.

**After:** Centralized database access in domain repositories:

### 7. Multiple Database Connections (Resource Waste)

**Before:** Each repository created its own database connection.

```
// UsersRepository
constructor() {
  this.db = new sqlite3.Database("analytics.db"); // Connection 1
}

// EventsRepository
constructor() {
  this.db = new sqlite3.Database("analytics.db"); // Connection 2
}

```

**Problems:**

- Resource waste (memory for each connection)
- SQLite connection limits
- Hard to mock for testing
- Configuration repeated in each file

**After:** Single shared database connection via dependency injection.

```
// shared/database/database.provider.ts
export const databaseProvider = {
  provide: DATABASE_CONNECTION,
  useFactory: (): sqlite3.Database => {
    const db = new sqlite3.Database("analytics.db");
    db.run("PRAGMA foreign_keys = ON");
    return db;
  },
};

// All repositories inject the SAME connection
@Injectable()
export class UsersRepository {
  constructor(@Inject(DATABASE_CONNECTION) private db: sqlite3.Database) {}
}

```

**Benefits:**

- Single connection shared by all repositories
- Proper NestJS dependency injection pattern
- Easy to mock `DATABASE_CONNECTION` in unit tests
- Central configuration (PRAGMA settings in one place)
- Memory efficient

### 8. No Input Validation (Security & Data Integrity)

**Before:** No validation on incoming request data. Invalid data could reach the database.

```
// Anyone could send anything
export interface CreateUserRequest {
  email: string; // No email format check
  planType: string; // No valid plan check
}
```

**Problems:**

- Invalid emails stored in database
- Invalid plan types accepted
- SQL errors from wrong data types
- Security vulnerabilities from unvalidated input

**After:** Request DTOs with validation decorators using `class-validator`.

```
import { IsEmail, IsNotEmpty } from "class-validator";
import { IsValidPlanType } from "../../shared/validators";

export class CreateUserRequest {
  @IsEmail({}, { message: "Please provide a valid email address" })
  @IsNotEmpty({ message: "Email is required" })
  email: string;

  @IsValidPlanType()
  @IsNotEmpty({ message: "Plan type is required" })
  planType: PlanType;
}
```

**Validation response on invalid data:**

```
{
  "statusCode": 400,
  "message": [
    "Please provide a valid email address",
    "planType must be one of: basic, enterprise"
  ],
  "error": "Bad Request"
}
```

### 9. Access Control Mixed with Business Logic

**Before:** Access validation was embedded inside handlers, mixing security concerns with business logic.

**After:** Dedicated `UserAccessGuard` with `@RequireAccess()` decorator.

```
// Controller - Clean and declarative
@Post("generate")
@UseGuards(UserAccessGuard)
@RequireAccess("reports")
async generateReport(@Body() body: GenerateReportRequest) {
  return this.generateReportHandler.execute(body);
}

```

**Benefits:**

- Separation of concerns (security vs business logic)
- Reusable across any endpoint
- Centralized access rules

### 10. Missing Error Handling (Reliability & Debugging)

- add proper error handling with try-catch blocks
- throw meaningful exceptions (e.g. NotFoundException, BadRequestException)
- log errors for debugging
- add `rejects` in repository to handle DB errors

## Unit Testing (VSA Pattern)

Unit tests are co-located with each slice following the Vertical Slice Architecture pattern.

### Testing Pattern

Each test file follows the same pattern:

1. **Happy path** - Verify successful execution
2. **Error path** - Verify proper exception handling
