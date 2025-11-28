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

### 9. Access Control Mixed with Business Logic

**Before:** Access validation was embedded inside handlers, mixing security concerns with business logic.

```typescript
// generate-report.handler.ts - Access check mixed with business logic
async execute(request: GenerateReportRequest): Promise<GenerateReportResponse> {
  // Access check buried in handler
  const hasAccess = await this.validateUserAccess(request.userId, "reports");
  if (!hasAccess) {
    return { error: "Access denied" };
  }

  // Business logic...
}
```

**Problems:**

- Access logic duplicated in each handler
- Easy to forget adding access check to new endpoints
- Hard to test business logic separately from access control
- Violates Single Responsibility Principle
- No centralized access rules

**After:** Dedicated `UserAccessGuard` with `@RequireAccess()` decorator.

```typescript
// Controller - Clean and declarative
@Post("generate")
@UseGuards(UserAccessGuard)      // Guard runs BEFORE handler
@RequireAccess("reports")         // Declares what resource is needed
async generateReport(@Body() body: GenerateReportRequest) {
  return this.generateReportHandler.execute(body);  // Only business logic
}

// Handler - Only business logic, no access checks
async execute(request: GenerateReportRequest): Promise<GenerateReportResponse> {
  // Pure business logic here
  console.log(`Generating ${request.reportType} report`);
  // ...
}
```

**How the Guard works:**

```
Request → ValidationPipe → UserAccessGuard → Controller → Handler → Response
                              ↓
                    1. Read @RequireAccess("reports")
                    2. Extract userId from request
                    3. Look up user's plan_type
                    4. Check if plan allows "reports"
                    5. Allow or throw ForbiddenException
```

**Access Rules defined in one place:**

```typescript
const accessRules: Record<ResourceType, string[]> = {
  reports: ["pro", "enterprise"], // Pro and Enterprise only
  analytics: ["pro", "enterprise"], // Pro and Enterprise only
  metrics: ["basic", "pro", "enterprise"], // All plans
  admin: ["enterprise"], // Enterprise only
};
```

**Benefits:**

- Separation of concerns (security vs business logic)
- Reusable across any endpoint
- Easy to test guard and handler independently
- Centralized access rules
- Clear, declarative syntax with decorators

**Files created:**

- `src/shared/guards/user-access.guard.ts` - The guard implementation
- `src/shared/guards/index.ts` - Exports

---

### 10. Missing Error Handling (Reliability & Debugging)

**Before:** Database errors were silently ignored, making debugging nearly impossible.

```typescript
// Repository - Error completely ignored
async findById(id: number): Promise<User | null> {
  return new Promise((resolve) => {
    this.db.get(`SELECT * FROM users WHERE id = ?`, [id], (err, row) => {
      resolve(row || null);  // err is ignored!
    });
  });
}

// Handler - No try/catch, errors crash the server
async execute(userId: string): Promise<number> {
  return this.usersRepository.countUserEventsByType(userId, metricType);
}

// Bug: reject without return continues to resolve
this.db.all(sql, (err, rows) => {
  if (err) reject(err);  // Missing return!
  resolve(rows || []);   // This still executes after reject
});
```

**Problems:**

- Database errors silently swallowed
- Hard to debug production issues
- No meaningful error messages for API consumers
- `return null` instead of proper HTTP exceptions
- Promise both rejected AND resolved (undefined behavior)

**After:** Proper error handling at all layers.

**Repositories - Error propagation with reject:**

```typescript
async findById(id: number): Promise<User | null> {
  return new Promise((resolve, reject) => {
    this.db.get(`SELECT * FROM users WHERE id = ?`, [id], (err, row) => {
      if (err) return reject(err);  // Error bubbles up
      resolve(row || null);
    });
  });
}
```

**Handlers - try/catch with proper HTTP exceptions:**

```typescript
async execute(userId: string, metricType: string): Promise<number> {
  try {
    return await this.usersRepository.countUserEventsByType(userId, metricType);
  } catch (error) {
    console.error("Failed to get user metrics:", error);
    throw new InternalServerErrorException("Failed to get user metrics");
  }
}
```

**Returning proper HTTP exceptions instead of null:**

```typescript
// Before: Returning null
async execute(reportId: string): Promise<ExecuteReportResponse | null> {
  const report = await this.reportsRepository.findById(reportId);
  if (!report) return null;  // Client gets empty response
}

// After: Throwing NotFoundException
async execute(reportId: string): Promise<ExecuteReportResponse> {
  const report = await this.reportsRepository.findById(reportId);
  if (!report) {
    throw new NotFoundException(`Report with ID ${reportId} not found`);
  }
}
```

**Database provider - Connection error handling:**

```typescript
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error(`Failed to connect to database: ${err.message}`);
    throw err;
  }
  console.log(`Database connected: ${dbPath}`);
});
```

**Guard - NaN check for userId:**

```typescript
const userId = Number(rawUserId);
if (isNaN(userId)) {
  return null; // Invalid userId like "abc" is rejected
}
```

**Error types used:**

| Exception                      | When to Use                      |
| ------------------------------ | -------------------------------- |
| `NotFoundException`            | Resource not found (404)         |
| `BadRequestException`          | Invalid input/unknown type (400) |
| `ForbiddenException`           | Access denied (403)              |
| `InternalServerErrorException` | Database/server errors (500)     |

**Files updated:**

- `src/shared/database/database.provider.ts` - Connection error handling
- `src/shared/guards/user-access.guard.ts` - NaN check + DB error handling
- All 4 repositories - `if (err) return reject(err)` pattern
- All 12 handlers - try/catch with proper exceptions

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
| Access Control   | Mixed in handlers                 | Dedicated guard with @RequireAccess decorator     |
| Error Handling   | Errors silently ignored           | Proper exceptions with meaningful messages        |

---

## Files Pending Removal

The following old files are still present for reference but should be removed after verification:

- `src/analytics.controller.ts`
- `src/analytics.service.ts`
- `src/analytics.controller.spec.ts`
- `src/analytics.service.spec.ts`

---
