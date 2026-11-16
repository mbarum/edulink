# Security and API Audit Report

**Assessment Frameworks:** OWASP ASVS 5.0 (Level 2/3), OWASP Top 10:2025, OWASP API Security Top 10:2023, NIST SP 800-218  
**Scope:** Full API Surface, Authentication, Authorization Guards, Tenant Isolation, Cryptography, and External Integrations  

---

## 1. Authentication and Session Lifecycle

### 1.1 Password Storage and Hashing
- **Implementation:** Password hashing uses `bcrypt` with salt rounds configured as 12 in `auth.service.ts` and `users.service.ts`.
- **Finding (SEC-002):** While passwords are appropriately hashed before database storage in the `users` table, the global `AuditInterceptor` captures the raw, plaintext password in `request.body` on user registration (`/api/auth/register-school`) and writes it to the `audit_logs` table in cleartext.
- **Rating:** **Failing (Critical Vulnerability)**

### 1.2 Session and Token Lifecycle
- **Implementation:** Authentication is based on stateless JSON Web Tokens (JWT) issued via `@nestjs/jwt` with a 60-minute expiration (`signOptions: { expiresIn: '60m' }`).
- **Token Invalidation:** There is no token revocation mechanism (e.g. Redis blacklist or token versioning). If a user changes their password or is compromised, previously issued tokens remain valid until natural expiration.
- **Refresh Tokens:** No refresh-token rotation scheme is implemented. Clients store tokens in browser `localStorage`, exposing sessions to theft via Cross-Site Scripting (XSS).
- **Client Session Expiration Handling:** The frontend Axios interceptor ([client/src/services/api.ts:19-31](file:///c:/Users/HP/Downloads/multitenacny-school-management-system-main%20(2)/multitenacny-school-management-system-main/client/src/services/api.ts#L19-L31)) fails to handle HTTP 401 Unauthorized errors. When a token expires, the client continues making requests, causing UI freezes rather than redirecting to `/login`.

### 1.3 Account Recovery & Enumeration
- **Enumeration Defense:** `AuthService.forgotPassword()` properly avoids account enumeration by returning void even if the user is not found:
  ```typescript
  if (!user) {
    // Don't reveal that the user doesn't exist
    return;
  }
  ```
- **Reset Token Security (SEC-009):** Reset tokens are generated using standard `uuidv4()` and stored in plaintext in MySQL. In `users.service.ts`, `password_reset_token: undefined` is used during reset, which TypeORM skips in SQL updates. Tokens are never cleared from the database, allowing reuse.

### 1.4 Multi-Factor Authentication (MFA)
- **Status:** **Completely Absent**. No TOTP, SMS, or FIDO2/WebAuthn MFA mechanisms exist in the codebase despite public representations in the privacy policy.

---

## 2. Authorization and Multi-Tenant Isolation

### 2.1 Multi-Tenancy Architecture Analysis
The application uses a shared-database, shared-schema architecture with row-level discriminator columns (`tenantId`).
- Base Class: `TenantAwareEntity` provides `tenantId` and a `ManyToOne` relationship to `Tenant`.
- Crud Abstraction: `TenantAwareCrudService<T>` appends `tenantId` to queries.

```
+-----------------------------------------------------------+
|                      Client Request                       |
|   (Headers: Authorization: Bearer <jwt>, x-tenant-id)     |
+-----------------------------+-----------------------------+
                              |
                              v
+-----------------------------------------------------------+
|                    TenantMiddleware                       |
|  1. Verify JWT & extract tenantId                         |
|  2. Check x-tenant-id against JWT tenantId               |
|  3. Call TenancyService.setTenant(tenant)                 |
+-----------------------------+-----------------------------+
                              |
               [CRITICAL CONCURRENCY FLAW]
        Singleton Middleware mutates Request-Scoped
        TenancyService -> Race conditions under load
                              |
                              v
+-----------------------------------------------------------+
|               TypeORM / TenantAwareCrudService            |
|       WHERE tenantId = TenancyService.getTenantId()       |
+-----------------------------------------------------------+
```

### 2.2 Concurrency and Thread-Safety Flaws (ARC-002)
`TenantMiddleware` is instantiated as a singleton by NestJS. In [tenant.middleware.ts:24](file:///c:/Users/HP/Downloads/multitenacny-school-management-system-main%20(2)/multitenacny-school-management-system-main/src/core/tenancy/tenant.middleware.ts#L24), it injects `TenancyService`, which is marked `Scope.REQUEST`. In Node.js, asynchronous event loop context switches during database lookups mean concurrent requests can overwrite `TenancyService.tenant`, causing cross-tenant data contamination.

### 2.3 Cross-Tenant Cache Leakage (SEC-001)
NestJS `CacheInterceptor` defaults to using `req.url` as the cache key in Redis. Because tenant identity is not part of the URL path (e.g. `/api/students`), caching an API response for School A immediately serves that cached response to School B when School B accesses the same endpoint.

### 2.4 Server-Side Access Control & Role Enforcement
- **Default-Allow RolesGuard:** In [roles.guard.ts:15-17](file:///c:/Users/HP/Downloads/multitenacny-school-management-system-main%20(2)/multitenacny-school-management-system-main/src/modules/auth/guards/roles.guard.ts#L15-L17):
  ```typescript
  if (!requiredRoles) {
    return true; // Default allow!
  }
  ```
  If an endpoint lacks an explicit `@Roles(...)` decorator, access is granted to all authenticated users.
- **Unprotected Modules (SEC-007):** Entire modules lack `RolesGuard`:
  - `FeesController`: All authenticated users can create, modify, and delete student fee records.
  - `ExpensesController`: All authenticated users can view and alter operating expenses.
  - `PayrollController`: All authenticated users can inspect staff salaries.
  - `ExaminationsController` & `ReportCardsController`: Students can alter grades and exam dates.

---

## 3. Cryptography & Secrets Management

| Asset | Mechanism | Implementation Finding | Risk Level |
|---|---|---|:---:|
| **JWT Signing** | HMAC-SHA256 | Uses `JWT_SECRET` from ConfigService; throws if unset. | Moderate |
| **Password Storage**| Bcrypt | Salt rounds = 12; proper hashing in `AuthService`. | Low |
| **Reset Tokens** | UUID v4 | Stored in plaintext in MySQL; never invalidated. | **High** |
| **Data Encryption** | AES-256-CBC | Static fallback key `12345678901234567890123456789012`; no HMAC authentication (padding oracle risk). | **Critical** |
| **Source Control** | Git Repository | Hardcoded SuperAdmin password in `create-super-admin.ts`; `.env` committed. | **Critical** |

---

## 4. API Security Coverage Matrix

This matrix inventories every API endpoint, evaluates authorization controls, tenant isolation, and input validation, and records verified audit results.

| HTTP Method | Route Path | Controller | Required Roles / Guards | Tenant Scoped? | DTO Validation | Verified Audit Result |
|---|---|---|---|:---:|:---:|---|
| `POST` | `/api/auth/login` | `AuthController` | LocalAuthGuard | N/A | Missing decorators | Pass (Login succeeds, but body logged) |
| `POST` | `/api/auth/register-school`| `AuthController` | Public | Creates Tenant | Decorated (`RegisterSchoolDto`)| **Critical (Plaintext password logged)** |
| `POST` | `/api/auth/forgot-password`| `AuthController` | Public | Global User | Decorated (`ForgotPasswordDto`)| Pass |
| `POST` | `/api/auth/reset-password` | `AuthController` | Public | Global User | Decorated (`ResetPasswordDto`) | **High (Token plaintext & reusable)** |
| `GET` | `/api/auth/google` | `AuthController` | AuthGuard('google') | None | None | **Medium (Creates orphaned users)** |
| `GET` | `/api/auth/microsoft` | `AuthController` | AuthGuard('microsoft') | None | None | **Medium (Creates orphaned users)** |
| `GET` | `/api/students` | `StudentsController` | JwtAuthGuard, RolesGuard | Yes (DB) | N/A | **Critical (Cross-tenant Redis leak)** |
| `GET` | `/api/students/:id` | `StudentsController` | JwtAuthGuard, RolesGuard | Yes (DB) | N/A | **Critical (Cross-tenant Redis leak)** |
| `POST` | `/api/students` | `StudentsController` | Admin | Enforced | Decorated (`CreateStudentDto`) | Pass |
| `PATCH`| `/api/students/:id` | `StudentsController` | Admin | Enforced | Decorated (`UpdateStudentDto`) | Pass |
| `DELETE`| `/api/students/:id` | `StudentsController` | Admin | Enforced | None | Pass |
| `POST` | `/api/students/bulk-upload`| `StudentsController` | Admin | Enforced | Multer Upload | **Medium (No DB transaction)** |
| `POST` | `/api/students/promotion/promote`| `PromotionController`| JwtAuthGuard | Enforced | None (Plain JS object) | **High (No RolesGuard; erases history)**|
| `POST` | `/api/students/promotion/graduate`| `PromotionController`| JwtAuthGuard | Enforced | None (Plain JS object) | **High (No RolesGuard)** |
| `GET` | `/api/staff` | `StaffController` | JwtAuthGuard, RolesGuard | Enforced | N/A | **High (Default-allow: parents can view)**|
| `GET` | `/api/staff/:id` | `StaffController` | JwtAuthGuard, RolesGuard | Enforced | N/A | **High (Default-allow: parents can view)**|
| `POST` | `/api/staff` | `StaffController` | Admin | Enforced | **Broken (0 decorators)** | **Critical (400 Bad Request error)** |
| `PATCH`| `/api/staff/:id` | `StaffController` | Admin | Enforced | **Broken (0 decorators)** | **Critical (400 Bad Request error)** |
| `DELETE`| `/api/staff/:id` | `StaffController` | Admin | Enforced | None | Pass |
| `GET` | `/api/fees` | `FeesController` | JwtAuthGuard (No Roles) | Enforced | N/A | **High (Missing RolesGuard)** |
| `GET` | `/api/fees/:id` | `FeesController` | JwtAuthGuard (No Roles) | Enforced | N/A | **High (Missing RolesGuard)** |
| `POST` | `/api/fees` | `FeesController` | JwtAuthGuard (No Roles) | Enforced | **Broken (0 decorators)** | **Critical (400 Bad Request error)** |
| `PATCH`| `/api/fees/:id` | `FeesController` | JwtAuthGuard (No Roles) | Enforced | **Broken (0 decorators)** | **Critical (400 Bad Request error)** |
| `DELETE`| `/api/fees/:id` | `FeesController` | JwtAuthGuard (No Roles) | Enforced | None | **High (Missing RolesGuard)** |
| `GET` | `/api/expenses` | `ExpensesController` | JwtAuthGuard (No Roles) | Enforced | N/A | **High (Missing RolesGuard)** |
| `POST` | `/api/expenses` | `ExpensesController` | JwtAuthGuard (No Roles) | Enforced | **Broken (0 decorators)** | **Critical (400 Bad Request error)** |
| `PATCH`| `/api/expenses/:id` | `ExpensesController` | JwtAuthGuard (No Roles) | Enforced | **Broken (0 decorators)** | **Critical (400 Bad Request error)** |
| `DELETE`| `/api/expenses/:id` | `ExpensesController` | JwtAuthGuard (No Roles) | Enforced | None | **High (Missing RolesGuard)** |
| `GET` | `/api/payroll` | `PayrollController` | JwtAuthGuard (No Roles) | Enforced | N/A | **High (Missing RolesGuard; salary leak)**|
| `POST` | `/api/payroll` | `PayrollController` | JwtAuthGuard (No Roles) | Enforced | **Broken (0 decorators)** | **Critical (400 Bad Request error)** |
| `PATCH`| `/api/payroll/:id` | `PayrollController` | JwtAuthGuard (No Roles) | Enforced | **Broken (0 decorators)** | **Critical (400 Bad Request error)** |
| `DELETE`| `/api/payroll/:id` | `PayrollController` | JwtAuthGuard (No Roles) | Enforced | None | **High (Missing RolesGuard)** |
| `GET` | `/api/academics/subjects` | `AcademicsController` | JwtAuthGuard | Enforced | N/A | **Critical (Cross-tenant Redis leak)** |
| `POST` | `/api/academics/subjects` | `AcademicsController` | JwtAuthGuard (No Roles) | Enforced | Decorated (`CreateSubjectDto`) | **High (Missing RolesGuard)** |
| `GET` | `/api/academics/academic-years`| `AcademicsController` | JwtAuthGuard | Enforced | N/A | **Critical (Cross-tenant Redis leak)** |
| `POST` | `/api/academics/academic-years`| `AcademicsController` | JwtAuthGuard (No Roles) | Enforced | Decorated (`CreateAcademicYearDto`)| **High (Missing RolesGuard)** |
| `PATCH`| `/api/academics/academic-years/:id/set-current`| `AcademicsController`| JwtAuthGuard | Enforced | None | **High (Missing RolesGuard)** |
| `GET` | `/api/academics/class-levels`| `AcademicsController` | JwtAuthGuard | Enforced | N/A | **Critical (Cross-tenant Redis leak)** |
| `POST` | `/api/academics/class-levels`| `AcademicsController` | JwtAuthGuard (No Roles) | Enforced | Decorated (`CreateClassLevelDto`)| **High (Missing RolesGuard)** |
| `GET` | `/api/academics/sections` | `AcademicsController` | JwtAuthGuard | Enforced | N/A | **Critical (Cross-tenant Redis leak)** |
| `POST` | `/api/academics/sections` | `AcademicsController` | JwtAuthGuard (No Roles) | Enforced | Decorated (`CreateSectionDto`)| **High (Missing RolesGuard)** |
| `GET` | `/api/academics/grading-scales`| `AcademicsController`| JwtAuthGuard | Enforced | N/A | **Critical (Cross-tenant Redis leak)** |
| `POST` | `/api/academics/grading-scales`| `AcademicsController`| JwtAuthGuard (No Roles) | Enforced | None | **High (Missing RolesGuard)** |
| `GET` | `/api/attendance` | `AttendanceController` | JwtAuthGuard (No Roles) | Enforced | N/A | **High (Missing RolesGuard)** |
| `POST` | `/api/attendance` | `AttendanceController` | JwtAuthGuard (No Roles) | Enforced | Decorated (`CreateAttendanceDto`)| **High (Missing RolesGuard)** |
| `POST` | `/api/attendance/bulk` | `AttendanceController` | JwtAuthGuard (No Roles) | Enforced | None (Plain JS object) | **High (Missing RolesGuard, no txn)**|
| `GET` | `/api/examinations` | `ExaminationsController`| JwtAuthGuard (No Roles) | Enforced | N/A | **High (Missing RolesGuard)** |
| `POST` | `/api/examinations` | `ExaminationsController`| JwtAuthGuard (No Roles) | Enforced | **Broken (0 decorators)** | **Critical (400 Bad Request error)** |
| `GET` | `/api/report-cards` | `ReportCardsController` | JwtAuthGuard (No Roles) | Enforced | N/A | **High (Missing RolesGuard)** |
| `POST` | `/api/report-cards` | `ReportCardsController` | JwtAuthGuard (No Roles) | Enforced | **Broken (0 decorators)** | **Critical (400 Bad Request error)** |
| `GET` | `/api/library/books` | `LibraryController` | JwtAuthGuard (No Roles) | Enforced | N/A | **High (Missing RolesGuard)** |
| `POST` | `/api/library/books` | `LibraryController` | JwtAuthGuard (No Roles) | Enforced | **Broken (0 decorators)** | **Critical (400 Bad Request error)** |
| `GET` | `/api/communication/messages`| `CommunicationController`| JwtAuthGuard | Tenant Only | N/A | **High (Tenant-wide message leak)**|
| `POST` | `/api/communication/messages`| `CommunicationController`| JwtAuthGuard | Enforced | **Broken (0 decorators)** | **Critical (400 Bad Request error)** |
| `GET` | `/api/timetable` | `TimetableController` | JwtAuthGuard (No Roles) | Enforced | N/A | **High (Missing RolesGuard)** |
| `POST` | `/api/timetable` | `TimetableController` | JwtAuthGuard (No Roles) | Enforced | Decorated (`CreateTimetableEntryDto`)| **High (Missing RolesGuard)** |
| `GET` | `/api/calendar` | `CalendarController` | JwtAuthGuard (No Roles) | Enforced | N/A | **High (Missing RolesGuard)** |
| `POST` | `/api/calendar` | `CalendarController` | JwtAuthGuard (No Roles) | Enforced | Decorated (`CreateCalendarEventDto`)| **High (Missing RolesGuard)** |
| `GET` | `/api/reporting/financials`| `ReportingController` | PermissionsGuard | Enforced | Query params | **High (PermissionsGuard broken check)**|
| `GET` | `/api/reporting/attendance`| `ReportingController` | PermissionsGuard | Enforced | Query params | **High (PermissionsGuard broken check)**|
| `GET` | `/api/reporting/teacher-dashboard-stats`| `ReportingController`| JwtAuthGuard | Enforced | N/A | Pass |
| `GET` | `/api/reporting/parent-dashboard-stats`| `ReportingController`| JwtAuthGuard | Enforced | N/A | **Medium (N+1 database query pattern)**|
| `POST` | `/api/mpesa/stk-push` | `MpesaController` | JwtAuthGuard | Enforced | Decorated (`StkPushDto`) | Pass |
| `POST` | `/api/mpesa/callback` | `MpesaController` | **None (Public)** | Reference | Plain object | **Critical (Arbitrary payment forgery)**|
| `POST` | `/api/stripe-webhook` | `StripeWebhookController`| Header Signature | stripeCustomerId | Raw Buffer | **Critical (Missing rawBody in bootstrap)**|
| `POST` | `/api/subscriptions/create-checkout-session`| `SubscriptionsController`| Admin | Enforced | Decorated | Pass |
| `GET` | `/api/subscriptions/billing-portal`| `SubscriptionsController`| Admin | Enforced | N/A | Pass |
| `POST` | `/api/payments/bank-transfer`| `PaymentsController`| Admin | Enforced | Plain DTO | Pass |
| `POST` | `/api/payments/:id/approve`| `PaymentsController` | SuperAdmin | Platform | Param | Pass |
| `GET` | `/api/users` | `UsersController` | Admin | Enforced | N/A | Pass |
| `PATCH`| `/api/users/:id` | `UsersController` | Admin | Enforced | Decorated (`UpdateUserDto`) | **High (Admin can elevate to SuperAdmin)**|
| `DELETE`| `/api/users/:id` | `UsersController` | Admin | Enforced | None | Pass |
| `GET` | `/api/super-admin/analytics`| `SuperAdminController` | SuperAdmin | Cross-Tenant | N/A | Pass |
| `GET` | `/api/super-admin/tenants` | `SuperAdminController` | SuperAdmin | Cross-Tenant | N/A | Pass |
| `PATCH`| `/api/super-admin/tenants/:id/status`| `SuperAdminController`| SuperAdmin | Cross-Tenant | Decorated | Pass |
| `DELETE`| `/api/super-admin/tenants/:id`| `SuperAdminController`| SuperAdmin | Cross-Tenant | None | Pass |
| `GET` | `/api/config` | `ConfigController` | Public | None | N/A | Pass |
| `GET` | `/api/config/health` | `ConfigController` | Public | None | N/A | Pass |
| `POST` | `/api/lms/connect` | `LmsController` | Admin, SuperAdmin | Enforced | Decorated (`ConnectLmsDto`)| Pass |
| `POST` | `/api/lms/sync/students`| `LmsController` | Admin, SuperAdmin | Enforced | None | Pass |
| `POST` | `/api/lms/sync/courses` | `LmsController` | Admin, SuperAdmin | Enforced | None | Pass |
| `GET` | `/api/lms/grades/:studentId`| `LmsController` | Admin, SuperAdmin, Teacher| Enforced| Param | **High (Returns un-awaited Bull job ID)**|

---

## 5. Summary of API Deficiencies & Remediation Requirements

1. **Implement Tenant-Aware Caching:** Wrap `CacheInterceptor` with custom key generation incorporating `tenantId`.
2. **Authorize All Controllers:** Enforce `RolesGuard` globally or on every domain controller with default-deny behavior.
3. **Add Validation Decorators:** Populate `class-validator` annotations across all 15 naked DTO classes.
4. **Secure Webhook Endpoints:**
   - Enforce IP whitelisting on `/api/mpesa/callback`.
   - Enable `{ rawBody: true }` in NestJS bootstrap for Stripe signature verification.
5. **Eliminate Privilege Escalation:** Strip `role` mutations from tenant `UsersController.update`.
