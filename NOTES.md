# Refactoring Notes - MVP Analytics

## Naming Conventions

- get_user_metrics => getUserMetrics
- calculate_retention_rate => calculateRetentionRate
- SQL_QUERY => sqlQuery
- RETENTION_SQL => retentionSql

---

## Architecture Refactoring

Refactored from monolithic architecture to **Vertical Slice Architecture (VSA)** with **Domain Repositories**.

---

## Project Structure: Before & After

### BEFORE (Monolithic)

```
src/
├── analytics.controller.ts    # ALL routes in one file
├── analytics.service.ts       # ALL business logic (~500+ lines)
├── analytics.controller.spec.ts
├── analytics.service.spec.ts
├── app.module.ts
└── main.ts
```

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

---

## Issues Fixed

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

**Files affected:** All repository files

- `src/users/users.repository.ts`
- `src/events/events.repository.ts`
- `src/reports/reports.repository.ts`
- `src/metrics/metrics.repository.ts`

---

### 2. TypeScript `any` Types Removed

**Before:** Extensive use of `any` type bypassing TypeScript's type safety.

```typescript
async getMetrics(type: string, params: any): Promise<any>
```

**After:** Replaced with proper types.

```typescript
async execute(type: string, params: Record<string, unknown>): Promise<Record<string, unknown>>
```

**Files affected:**

- `src/metrics/calculate-metrics/calculate-metrics.handler.ts`
- `src/metrics/metrics.controller.ts`

---

### 3. Single Responsibility Principle Violations

**Before:** One massive service file (`analytics.service.ts`) handling all business logic (~500+ lines).

**After:** Each use case has its own handler with single responsibility:

- `create-user/handler.ts` → Only creates users
- `track-event/handler.ts` → Only tracks events
- `generate-report/handler.ts` → Only generates reports
- `get-dashboard/handler.ts` → Only fetches dashboard data

---

### 6. Code Duplication in Database Access

**Before:** Same database query patterns repeated across multiple methods in the service.

**After:** Centralized database access in domain repositories:

- `UsersRepository` - All user-related queries
- `EventsRepository` - All event-related queries
- `ReportsRepository` - All report-related queries
- `MetricsRepository` - All metrics-related queries

---

### 7. Multiple Database Connections (Resource Waste)

**Before:** Each repository created its own database connection.

```typescript
// UsersRepository
constructor() {
  this.db = new sqlite3.Database("analytics.db"); // Connection 1
}

// EventsRepository
constructor() {
  this.db = new sqlite3.Database("analytics.db"); // Connection 2
}

// ReportsRepository
constructor() {
  this.db = new sqlite3.Database("analytics.db"); // Connection 3
}

// 4 repositories = 4 separate connections to the same database!
```

**Problems:**

- Resource waste (memory for each connection)
- SQLite connection limits
- Inconsistent transaction state
- Hard to mock for testing
- Configuration repeated in each file

**After:** Single shared database connection via dependency injection.

```typescript
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

**Files created:**

- `src/shared/database/database.provider.ts`
- `src/shared/database/database.module.ts`
- `src/shared/database/index.ts`

---

### 8. No Input Validation (Security & Data Integrity)

**Before:** No validation on incoming request data. Invalid data could reach the database.

```typescript
// Anyone could send anything
export interface CreateUserRequest {
  email: string; // No email format check
  planType: string; // No valid plan check
}

// Invalid data accepted:
// { email: "not-an-email", planType: "invalid_plan" }
```

**Problems:**

- Invalid emails stored in database
- Invalid plan types accepted
- SQL errors from wrong data types
- No meaningful error messages for users
- Security vulnerabilities from unvalidated input

**After:** Request DTOs with validation decorators using `class-validator`.

```typescript
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

```json
{
  "statusCode": 400,
  "message": [
    "Please provide a valid email address",
    "planType must be one of: basic, enterprise"
  ],
  "error": "Bad Request"
}
```

**Validations added:**

| Field        | Validations                                                              |
| ------------ | ------------------------------------------------------------------------ |
| `email`      | Required, valid email format                                             |
| `planType`   | Required, must be "basic" or "enterprise"                                |
| `userId`     | Required, integer, minimum 1                                             |
| `eventType`  | Required, non-empty string                                               |
| `eventData`  | Optional, must be object                                                 |
| `sessionId`  | Required, non-empty string                                               |
| `reportType` | Required, must be "user_activity", "daily_summary", or "user_engagement" |
| `format`     | Optional, must be "json", "html", or "csv"                               |

**Files created/updated:**

- `src/main.ts` - Global ValidationPipe enabled
- `src/shared/validators/plan-type.validator.ts` - Custom PlanType validator
- `src/users/create-user/create-user.request.ts`
- `src/events/track-event/track-event.request.ts`
- `src/reports/create-report/create-report.request.ts`
- `src/reports/generate-report/generate-report.request.ts`

**Dependencies added:**

- `class-validator` - Validation decorators
- `class-transformer` - Transform plain objects to class instances

---

## Summary: Before & After

| Aspect           | Before                            | After                                             |
| ---------------- | --------------------------------- | ------------------------------------------------- |
| Security         | SQL injection vulnerabilities     | Parameterized queries - injection eliminated      |
| Type Safety      | Extensive use of `any` types      | Full TypeScript type coverage                     |
| Maintainability  | 500+ lines in single service file | Each file has single responsibility               |
| Testability      | Hard to mock - tightly coupled    | Easy to mock repositories in unit tests           |
| Scalability      | Changes affect entire service     | New features added without touching existing code |
| Code Reuse       | Duplicate queries across methods  | Shared queries in repositories                    |
| Module Naming    | All modules named `AppModule`     | Proper names: `UsersModule`, `EventsModule`, etc. |
| Routes           | Double prefixes `/users/users`    | Clean routes `/users`                             |
| DB Connections   | 4 separate connections            | Single shared connection via DI                   |
| Input Validation | No validation, any data accepted  | class-validator with meaningful error messages    |

---

## Files Pending Removal

The following old files are still present for reference but should be removed after verification:

- `src/analytics.controller.ts`
- `src/analytics.service.ts`
- `src/analytics.controller.spec.ts`
- `src/analytics.service.spec.ts`

---
