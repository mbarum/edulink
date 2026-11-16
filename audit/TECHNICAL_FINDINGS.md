# Technical Findings Register

**Document ID:** EMIS-FINDINGS-REG-001  
**Total Findings Documented:** 32  
**Classification Distribution:** 7 Critical (P0), 12 High (P1), 9 Medium (P2), 4 Low (P3)  
**Status Distribution:** 28 Confirmed, 4 Suspected  

---

## 1. Findings Summary Table

| Finding ID | Category | Severity | Status | Affected Component | Standard Reference | Short Summary |
|---|---|---|---|---|---|---|
| **SEC-001** | Security / Tenant Isolation | **Critical** | Confirmed | Redis Caching / Students Module | OWASP ASVS 5.0 V4.1, ASVS V1.4 | Cross-tenant confidential student data leak via unscoped Redis cache keys |
| **SEC-002** | Security / Cryptography | **Critical** | Confirmed | Core Audit Interceptor | OWASP Top 10:2025 A02, ASVS V6.2 | Plaintext user passwords and sensitive PII logged to database audit logs |
| **SEC-003** | Security / Secrets | **Critical** | Confirmed | Super Admin Seeding & Crypto | OWASP Top 10:2025 A07, NIST SP 800-218 | Hardcoded super admin credentials and static fallback encryption key in source control |
| **SEC-004** | API / Payments | **Critical** | Confirmed | Mpesa Callback Controller | OWASP API 2023 API8, ASVS V13.2 | Unauthenticated M-Pesa webhook callback allowing arbitrary payment approval |
| **SEC-005** | API / Payments | **Critical** | Confirmed | Stripe Webhook & NestJS Bootstrap | OWASP API 2023 API8, Stripe Best Practices | Broken Stripe webhook handler due to missing rawBody initialization |
| **DAT-001** | Database / Integrity | **Critical** | Confirmed | TypeORM Migrations / MySQL | ISO/IEC 25010 Reliability | SQLite DDL syntax in database migration script failing against MySQL production engine |
| **ARC-001** | Architecture / Reliability | **Critical** | Confirmed | Global Validation & Module DTOs | NIST SSDF PW.5, ASVS V5.1 | Global ValidationPipe rejects all mutations for DTOs lacking validation decorators |
| **SEC-006** | Authorization / Access Control | **High** | Confirmed | Users Module & Controller | OWASP Top 10:2025 A01, ASVS V4.1 | Privilege escalation vulnerability allowing tenant admins to promote users to SuperAdmin |
| **SEC-007** | Authorization / Access Control | **High** | Confirmed | Financial Controllers (Fees, Expenses, Payroll)| OWASP Top 10:2025 A01, ASVS V4.1 | Complete absence of RolesGuard on fees, expenses, and payroll controllers |
| **SEC-008** | Authorization / Privacy | **High** | Confirmed | Communication Module | Kenya DPA 2019, GDPR Art. 5 | Unrestricted tenant-wide message snooping via un-scoped findAll messages query |
| **SEC-009** | Authentication / Sessions | **High** | Confirmed | Auth Module / Users Service | OWASP ASVS V2.5, V2.8 | Password reset tokens stored in plaintext and not invalidated upon password update |
| **SEC-010** | Authorization / Tenancy | **High** | Confirmed | Permissions Guard | OWASP Top 10:2025 A01 | Case mismatch ('SuperAdmin' vs 'super_admin') and substring role checking in guards |
| **ARC-002** | Architecture / Concurrency | **High** | Confirmed | Tenancy Module & Middleware | OWASP ASVS V1.4, NestJS Best Practices | Singleton TenantMiddleware injecting Request-scoped TenancyService causing concurrency risks |
| **ARC-003** | Architecture / Code Quality | **High** | Confirmed | Core TenantAwareCrudService | TypeORM Security Best Practices | Object spread operator in repository findAll spreading array conditions into numeric keys |
| **FUN-001** | Functional / EMIS | **High** | Confirmed | Students Promotion Service | UNESCO/UIS EMIS Guidelines | Student promotions destructively overwrite academic history without longitudinal tracking |
| **FUN-002** | Functional / EMIS | **High** | Confirmed | Examinations & Report Cards | UNESCO/UIS EMIS Guidelines | Report card schema lacks subject relationships and multi-criteria evaluation |
| **UI-001** | UI/UX / Functional | **High** | Confirmed | Teacher Portal (Grading, Attendance) | ISO/IEC 25010 Usability | Disconnected UI mockups with hardcoded demo data and browser alert stubs |
| **UI-002** | UI/UX / Functional | **High** | Confirmed | Students Management Page | ISO/IEC 25010 Usability | Complete absence of student CRUD, search, filter, and profile viewing in frontend |
| **OPS-001** | DevSecOps / Deployment | **High** | Confirmed | Containerization & Repository | NIST SP 800-218, CIS Docker | Empty 0-byte Dockerfile, Nginx config, and docker-compose referencing invalid paths |
| **QAL-001** | Quality Assurance | **High** | Confirmed | Test Suites | ISO/IEC 25010 Testability | Complete absence of automated tests (0% test coverage) and broken e2e scaffold |
| **SEC-011** | Supply Chain / Dependencies | **Medium** | Confirmed | package.json / npm audit | OWASP Top 10:2025 A06 | 53 package vulnerabilities (5 Critical, 27 High) present in dependency tree |
| **SEC-012** | Application Security | **Medium** | Confirmed | Auth Strategies / OAuth | OWASP ASVS V3.8 | OAuth registration creates orphan users without tenant association |
| **DAT-002** | Database / Performance | **Medium** | Confirmed | TypeORM Entities | ISO/IEC 25010 Performance | Missing composite indexes on tenantId and foreign key columns across 15+ entities |
| **DAT-003** | Database / Integrity | **Medium** | Confirmed | Attendance & Payments | ISO/IEC 25010 Reliability | Bulk operations (attendance, student imports) executed without database transactions |
| **PRV-001** | Privacy / Data Protection | **Medium** | Confirmed | Student Entity & Admissions | Kenya DPA Section 33, UNICEF | Absence of parental consent verification and minor age validation controls |
| **PRV-002** | Privacy / Compliance | **Medium** | Confirmed | Frontend Privacy Page | Kenya DPA / Consumer Protection | Misleading public privacy representations claiming nonexistent MFA and E2EE |
| **UI-003** | UI/UX / Accessibility | **Medium** | Confirmed | Client Components | WCAG 2.2 Level AA (1.3.1, 4.1.2) | Form controls and modals lack ARIA descriptions and visible focus management |
| **UI-004** | UI/UX / Session Handling | **Medium** | Confirmed | Axios API Interceptor & AuthContext | ISO/IEC 25010 Usability | Token expiration (401 Unauthorized) unhandled, causing application lockup |
| **PER-001** | Performance / Scalability | **Medium** | Confirmed | Reporting Service | ISO/IEC 25010 Efficiency | N+1 unbatched sequential queries in reporting dashboard endpoints |
| **SEC-013** | Secrets & Configuration | **Low** | Confirmed | Git Configuration (.gitignore) | OWASP ASVS V14.1 | .env file committed to git and dist directory tracked in source control |
| **SEO-001** | Public Web / Discoverability | **Low** | Confirmed | Public Landing Pages | Google Webmaster Guidelines | Missing robots.txt, sitemap.xml, canonical URLs, and Open Graph metadata |
| **ARC-004** | Architecture / Code Quality | **Low** | Confirmed | Decorator Definitions | Clean Code / DRY | Duplicate Roles decorator definitions in src/core and src/modules/auth |

---

## 2. Detailed Technical Findings

### Finding: SEC-001 — Cross-Tenant Confidential Student Data Leak via Unscoped Redis Cache Keys
- **Severity:** Critical (P0)
- **Status:** Confirmed
- **Evidence:**
  - File: `src/modules/students/students.controller.ts`, lines 30–39:
    ```typescript
    @Get()
    @UseInterceptors(CacheInterceptor)
    findAll() {
      return this.studentsService.findAll();
    }

    @Get(':id')
    @UseInterceptors(CacheInterceptor)
    findOne(@Param('id') id: string) {
      return this.studentsService.findOne(id);
    }
    ```
  - File: `src/modules/academics/academics.controller.ts`, lines 42, 54, 71, 83, 95.
  - File: `src/app.module.ts`, lines 103–116 (`CacheModule.registerAsync` defaults to standard NestJS cache key generation using raw request URL without tenant prefix).
- **Root Cause:** The default NestJS `CacheInterceptor` computes the Redis cache key using the HTTP request path (e.g. `/api/students`). Because multi-tenancy in this application uses a single shared instance with tenant identification passed via JWT or `x-tenant-id` header, the cache key ignores tenant context.
- **Impact:** Critical cross-tenant information disclosure. When Tenant A (e.g. School 1) queries `GET /api/students`, the response is cached in Redis for 60 seconds. If Tenant B (School 2) queries `GET /api/students` within that window, Redis serves Tenant A's confidential student records to Tenant B. Direct violation of international child protection standards and statutory data protection laws.
- **Affected Components:** `StudentsController`, `AcademicsController`, `CacheModule`.
- **Standard Reference:** OWASP ASVS 5.0 V4.1 (Access Control Architecture), ASVS V1.4 (Data Protection), ISO/IEC 27001:2022 A.8.12.
- **Recommendation:** Implement a custom, tenant-aware cache interceptor (`TenantAwareCacheInterceptor`) that overrides `trackBy(context: ExecutionContext)` to generate keys scoped to tenant: `${tenantId}:${httpAdapter.getRequestUrl(req)}`. Alternatively, configure `key: (req) => `${req.user?.tenantId || req.headers['x-tenant-id']}:${req.url}``.
- **Verification:** Execute concurrent synthetic requests from two distinct tenants against `GET /api/students`. Assert that Tenant B never receives records matching Tenant A's `tenantId`, regardless of cache warm state.

---

### Finding: SEC-002 — Plaintext User Passwords and Sensitive PII Logged to Database Audit Logs
- **Severity:** Critical (P0)
- **Status:** Confirmed
- **Evidence:**
  - File: `src/core/interceptors/audit.interceptor.ts`, lines 28–57:
    ```typescript
    // We only care about mutations
    if (!['POST', 'PATCH', 'PUT', 'DELETE'].includes(method)) {
      return next.handle();
    }
    ...
    this.auditService.log({
      tenantId,
      userId,
      action: method,
      entity,
      entityId,
      newValue: JSON.stringify(body), // Line 52: Full unredacted request body
      ipAddress: ip,
      userAgent: headers['user-agent'],
    })
    ```
  - File: `src/app.module.ts`, lines 165–168 (`AuditInterceptor` registered as global `APP_INTERCEPTOR`).
- **Root Cause:** The audit interceptor indiscriminately captures all mutation request bodies without checking for sensitive authentication parameters, credit card information, or personal identifiers.
- **Impact:** Every time a user registers a school (`/api/auth/register-school`), updates a user password (`/api/users/:id`), or logs in via mutation, their plaintext password and credentials are written to the `audit_logs` MySQL table in cleartext. Anyone with read access to the database or audit logs can retrieve user passwords.
- **Affected Components:** `AuditInterceptor`, `AuditService`, `AuthModule`, `UsersModule`.
- **Standard Reference:** OWASP Top 10:2025 A02 (Cryptographic Failures), OWASP ASVS 5.0 V6.2, NIST SP 800-218 PW.2.
- **Recommendation:** Implement a recursive data masking utility in `AuditInterceptor` that redacts blacklisted keys (`password`, `password_hash`, `adminPassword`, `token`, `secret`, `credential1`, `credential2`, `cardNumber`, `cvv`) and replaces them with `"[REDACTED]"` prior to serialization.
- **Verification:** Send a POST request containing `{"password": "SecretPassword123!"}`. Inspect the resulting row in `audit_logs` and assert that the value is redacted.

---

### Finding: SEC-003 — Hardcoded Super Admin Credentials and Static Fallback Encryption Key in Source Control
- **Severity:** Critical (P0)
- **Status:** Confirmed
- **Evidence:**
  - File: `scripts/create-super-admin.ts`, lines 43–44:
    ```typescript
    const username = 'systems@saaslink.tech';
    const password = 'revolution2026';
    ```
  - File: `src/shared/crypto.service.ts`, lines 21–25:
    ```typescript
    if (isProduction && (!secret || secret.length !== 32)) {
      throw new Error('ENCRYPTION_KEY environment variable must be a 32-character string in production.');
    }
    const finalSecret = secret || '12345678901234567890123456789012';
    this.key = Buffer.from(finalSecret, 'utf-8');
    ```
  - File: `.env.example`, line 17:
    ```bash
    ENCRYPTION_KEY=12345678901234567890123456789012
    ```
- **Root Cause:** Operational convenience during initial development resulted in hardcoded default super-admin credentials in migration/seeding scripts and fallback symmetric encryption keys in core shared services.
- **Impact:** If `scripts/create-super-admin.ts` is run in production or staging, a privileged account with username `systems@saaslink.tech` and password `revolution2026` is created. An attacker reading the public repository can gain full administrative access across all tenant institutions. If `NODE_ENV` is omitted or misconfigured, LMS API keys and credentials are encrypted using a publicly known key.
- **Affected Components:** `scripts/create-super-admin.ts`, `CryptoService`, `LmsModule`.
- **Standard Reference:** OWASP Top 10:2025 A07 (Identification and Authentication Failures), NIST SP 800-218 PW.1, ISO/IEC 27001:2022 A.8.24.
- **Recommendation:** Modify `scripts/create-super-admin.ts` to strictly ingest `SUPER_ADMIN_EMAIL` and `SUPER_ADMIN_PASSWORD` from environment variables, throwing an immediate error if unset. Remove default fallback keys from `CryptoService` and mandate valid keys regardless of `NODE_ENV`.
- **Verification:** Execute `npm run create:super-admin` with no environment variables; verify execution terminates with a configuration error.

---

### Finding: SEC-004 — Unauthenticated M-Pesa Webhook Callback Allowing Arbitrary Payment Approval
- **Severity:** Critical (P0)
- **Status:** Confirmed
- **Evidence:**
  - File: `src/modules/mpesa/mpesa.controller.ts`, lines 31–36:
    ```typescript
    @Post('callback')
    @HttpCode(HttpStatus.OK)
    handleCallback(@Body() body: Record<string, any>) {
      return this.mpesaService.handleCallback(body);
    }
    ```
  - File: `src/modules/mpesa/mpesa.service.ts`, lines 219–264:
    ```typescript
    async handleCallback(callbackData: Record<string, any>): Promise<any> {
      ...
      const { ResultCode, ResultDesc, CheckoutRequestID } = body.stkCallback;
      if (ResultCode === 0) {
        const pendingPayment = await this.pendingPaymentRepository.findOne({
          where: { reference: CheckoutRequestID },
          relations: ['tenant'],
        });
        if (pendingPayment) {
          pendingPayment.isApproved = true;
          await this.pendingPaymentRepository.save(pendingPayment);
          const tenant = pendingPayment.tenant;
          tenant.subscriptionStatus = SubscriptionStatus.ACTIVE;
          ...
          await this.tenantRepository.save(tenant);
        }
      }
    }
    ```
- **Root Cause:** The M-Pesa callback endpoint lacks authentication, IP whitelisting for Safaricom IP subnets, or cryptographic payload verification.
- **Impact:** Complete financial bypass. Any unauthenticated user on the Internet can forge a POST request to `/api/mpesa/callback` with `ResultCode: 0` and any valid or guessed `CheckoutRequestID` to automatically mark payments as approved, extend institution subscriptions, and upgrade subscription plans for free.
- **Affected Components:** `MpesaController`, `MpesaService`, `PaymentsModule`.
- **Standard Reference:** OWASP API Security Top 10:2023 API8 (Security Misconfiguration), ASVS 5.0 V13.2 (API Authentication).
- **Recommendation:** Implement IP filtering middleware restricting `/api/mpesa/callback` to Safaricom Daraja gateway IPs (196.201.214.200-214). Validate that incoming requests match internal pending payment state, verify payment amounts against the initial request, and record transaction signatures.
- **Verification:** Send an unauthorized synthetic POST request to `/api/mpesa/callback` from an external IP; verify rejection with HTTP 403 Forbidden.

---

### Finding: SEC-005 — Broken Stripe Webhook Handler Due to Missing RawBody Initialization
- **Severity:** Critical (P0)
- **Status:** Confirmed
- **Evidence:**
  - File: `src/modules/subscriptions/stripe-webhook.controller.ts`, lines 45–72:
    ```typescript
    @Post()
    async handleWebhook(
      @Headers('stripe-signature') signature: string,
      @Req() req: RequestWithRawBody,
    ) {
      ...
      if (!req.rawBody) {
        throw new Error('Raw body not found in request.');
      }
      event = this.getStripe().webhooks.constructEvent(
        req.rawBody,
        signature,
        webhookSecret,
      );
    }
    ```
  - File: `src/main.ts`, lines 12–17:
    ```typescript
    async function bootstrap() {
      const app = await NestFactory.create(
        AppModule,
        new ExpressAdapter(),
        { cors: true } // rawBody is NOT set to true
      );
    }
    ```
- **Root Cause:** Stripe webhook signature verification (`constructEvent`) requires the unparsed, raw HTTP request buffer. In NestJS, this requires passing `{ rawBody: true }` into `NestFactory.create()`. Because it was omitted, `req.rawBody` is `undefined`.
- **Impact:** Every single legitimate Stripe webhook event sent by Stripe fails with `BadRequestException: Webhook Error: Raw body not found in request.`. As a consequence, subscription creation, subscription renewal, automated cancellation, and plan tier synchronization are entirely broken in production.
- **Affected Components:** `StripeWebhookController`, `SubscriptionsModule`, `main.ts`.
- **Standard Reference:** OWASP API Security Top 10:2023 API8, Stripe Webhook Best Practices.
- **Recommendation:** Update `src/main.ts` line 16 to `NestFactory.create(AppModule, new ExpressAdapter(), { cors: true, rawBody: true })`.
- **Verification:** Dispatch a signed Stripe webhook using the Stripe CLI (`stripe trigger customer.subscription.updated`); assert HTTP 200 OK response and database update.

---

### Finding: DAT-001 — SQLite DDL Syntax in Database Migration Script Failing Against MySQL Production Engine
- **Severity:** Critical (P0)
- **Status:** Confirmed
- **Evidence:**
  - File: `src/migrations/1774374830744-InitialMigration.ts`, lines 7, 20, 29, 33–36:
    ```typescript
    await queryRunner.query(`CREATE TABLE "tenants" ("id" varchar PRIMARY KEY NOT NULL...`);
    await queryRunner.query(`CREATE TABLE "pending_payments" (... "createdAt" datetime NOT NULL DEFAULT (datetime('now'))...)`);
    await queryRunner.query(`CREATE TABLE "temporary_users" ...`);
    await queryRunner.query(`DROP TABLE "users"`);
    await queryRunner.query(`ALTER TABLE "temporary_users" RENAME TO "users"`);
    ```
  - File: `ormconfig.ts`, lines 12–22 (specifies `type: 'mysql'`).
  - File: `src/app.module.ts`, lines 80–89 (specifies `type: 'mysql'`, `synchronize: NODE_ENV !== 'production'`).
- **Root Cause:** The initial migration file was generated using SQLite. It relies on SQLite-specific functions (`datetime('now')`), SQLite double-quoted identifier escaping, and SQLite's table rebuild workaround pattern (`CREATE TABLE temporary_... -> DROP -> RENAME`).
- **Impact:** Running `npm run db:migrate` against a MySQL database throws fatal syntax errors on line 7 (`datetime('now')` and ANSI quoting). Because `synchronize` is disabled in production (`NODE_ENV === 'production'`), deploying this application to a real production environment results in a non-functional database with zero tables.
- **Affected Components:** `src/migrations/1774374830744-InitialMigration.ts`, `ormconfig.ts`, `AppModule`.
- **Standard Reference:** ISO/IEC 25010 Reliability / Fault Tolerance, TypeORM Migration Standards.
- **Recommendation:** Delete the SQLite migration file and generate a clean, native MySQL migration using `npm run typeorm:generate -- -n InitialMySQLMigration` against a live MySQL 8.0 instance. Ensure all table creations use backtick identifiers, `CURRENT_TIMESTAMP`, and native foreign keys.
- **Verification:** Run `npm run typeorm:run` on an empty MySQL 8.0 schema; verify all tables, indexes, and constraints create without warnings or errors.

---

### Finding: ARC-001 — Global ValidationPipe Rejects All Mutations for DTOs Lacking Validation Decorators
- **Severity:** Critical (P0)
- **Status:** Confirmed
- **Evidence:**
  - File: `src/main.ts`, lines 19–25:
    ```typescript
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );
    ```
  - Un-decorated DTO files:
    - `src/modules/fees/dto/create-fee.dto.ts` (0 decorators)
    - `src/modules/expenses/dto/create-expense.dto.ts` (0 decorators)
    - `src/modules/payroll/dto/create-payroll.dto.ts` (0 decorators)
    - `src/modules/examinations/dto/create-examination.dto.ts` (0 decorators)
    - `src/modules/report-cards/dto/create-report-card.dto.ts` (0 decorators)
    - `src/modules/staff/dto/create-staff.dto.ts` (0 decorators)
    - `src/modules/library/dto/create-book.dto.ts` (0 decorators)
    - `src/modules/communication/dto/create-message.dto.ts` (0 decorators)
- **Root Cause:** In NestJS, `ValidationPipe({ whitelist: true, forbidNonWhitelisted: true })` strips and rejects any request property that lacks at least one `class-validator` decorator. The majority of domain DTOs were defined as plain TypeScript classes without decorators.
- **Impact:** System-wide functional failure. Any client attempting to create or update fees, expenses, payroll entries, examinations, report cards, staff members, books, or messages receives an immediate HTTP 400 Bad Request error from NestJS (`property X should not exist`). Core business features are completely inoperable through the API.
- **Affected Components:** Fees, Expenses, Payroll, Examinations, Report Cards, Staff, Library, and Communication modules.
- **Standard Reference:** NIST SSDF PW.5, OWASP ASVS 5.0 V5.1 (Input Validation).
- **Recommendation:** Add proper `class-validator` decorators (`@IsString()`, `@IsNumber()`, `@IsDateString()`, `@IsOptional()`, `@IsUUID()`) to every property across all DTO classes in the repository.
- **Verification:** Issue `POST` requests to each affected endpoint with valid JSON payloads; verify requests pass validation and return HTTP 201 Created instead of HTTP 400.

---

### Finding: SEC-006 — Privilege Escalation Allowing Tenant Admins to Promote Users to SuperAdmin
- **Severity:** High (P1)
- **Status:** Confirmed
- **Evidence:**
  - File: `src/modules/users/users.controller.ts`, lines 28–32:
    ```typescript
    @Patch(':id')
    @Roles(UserRole.ADMIN)
    update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
      return this.usersService.update(id, updateUserDto);
    }
    ```
  - File: `src/modules/users/dto/create-user.dto.ts`, lines 4–15:
    ```typescript
    export class CreateUserDto {
      @IsString()
      @IsNotEmpty()
      username: string;

      @IsString()
      @MinLength(8)
      password_hash: string; // Accepts raw password_hash field directly

      @IsEnum(UserRole)
      role: UserRole; // Accepts UserRole.SUPER_ADMIN
    }
    ```
  - File: `src/modules/users/dto/update-user.dto.ts`, line 4 (`export class UpdateUserDto extends PartialType(CreateUserDto) {}`).
- **Root Cause:** `UpdateUserDto` inherits the `role` enum from `CreateUserDto` without restricting `SUPER_ADMIN` assignment, and `UsersController.update` performs no authorization check to prevent a tenant `admin` from updating user roles to `super_admin`.
- **Impact:** Horizontal and vertical privilege escalation. A standard school administrator can issue a `PATCH /api/users/<user_id>` with payload `{"role": "super_admin"}` to elevate any account to platform-wide Super Admin status, granting access to all institutional tenants.
- **Affected Components:** `UsersController`, `UsersService`, `UpdateUserDto`.
- **Standard Reference:** OWASP Top 10:2025 A01 (Broken Access Control), OWASP ASVS 5.0 V4.1.
- **Recommendation:** Restrict `UpdateUserDto` by creating a dedicated DTO that omits the `role` field, or enforce in `UsersService` that only callers with `role === UserRole.SUPER_ADMIN` can assign elevated roles, and prevent assigning `SUPER_ADMIN` from tenant endpoints.
- **Verification:** As an authenticated `admin`, issue `PATCH /api/users/:id` with `{"role": "super_admin"}`; assert request is rejected with HTTP 403 Forbidden.

---

### Finding: SEC-007 — Complete Absence of RolesGuard on Financial and Sensitive Operations
- **Severity:** High (P1)
- **Status:** Confirmed
- **Evidence:**
  - File: `src/modules/fees/fees.controller.ts`, line 7 (`@UseGuards(JwtAuthGuard)` - No `RolesGuard`, no `@Roles()`).
  - File: `src/modules/expenses/expenses.controller.ts`, line 7 (`@UseGuards(JwtAuthGuard)` - No `RolesGuard`, no `@Roles()`).
  - File: `src/modules/payroll/payroll.controller.ts`, line 7 (`@UseGuards(JwtAuthGuard)` - No `RolesGuard`, no `@Roles()`).
  - File: `src/modules/examinations/examinations.controller.ts`, line 7 (`@UseGuards(JwtAuthGuard)` - No `RolesGuard`).
  - File: `src/modules/report-cards/report-cards.controller.ts`, line 7 (`@UseGuards(JwtAuthGuard)` - No `RolesGuard`).
- **Root Cause:** Developers applied `JwtAuthGuard` to verify token authenticity but omitted `RolesGuard` and `@Roles()` annotations on entire controller classes.
- **Impact:** Any authenticated user within a school tenant—including students, parents, and temporary staff—can perform full CRUD operations on sensitive financial and academic records:
  - Create, modify, and delete school fee structures and student fee records (`/api/fees`).
  - View and alter school operating expenses (`/api/expenses`).
  - View confidential staff salaries, payment dates, and payroll statuses (`/api/payroll`).
  - Modify examination schedules and alter student grade report cards.
- **Affected Components:** Fees, Expenses, Payroll, Examinations, Report Cards modules.
- **Standard Reference:** OWASP Top 10:2025 A01 (Broken Access Control), OWASP ASVS 5.0 V4.1.
- **Recommendation:** Add `@UseGuards(JwtAuthGuard, RolesGuard)` and explicit `@Roles(UserRole.ADMIN)` decorators on all administrative and financial controllers.
- **Verification:** Authenticate as a user with `role: 'parent'`; issue `GET /api/payroll`; assert HTTP 403 Forbidden.

---

### Finding: SEC-008 — Unrestricted Tenant-Wide Message Snooping via Un-Scoped Messages Query
- **Severity:** High (P1)
- **Status:** Confirmed
- **Evidence:**
  - File: `src/modules/communication/communication.controller.ts`, lines 16–25:
    ```typescript
    @Get('messages')
    findAll() {
      return this.communicationService.findAll();
    }
    @Get('messages/:id')
    findOne(@Param('id') id: string) {
      return this.communicationService.findOne(id);
    }
    ```
  - File: `src/modules/communication/entities/message.entity.ts`, lines 5–17 (entity contains `senderId` and `recipientId`).
- **Root Cause:** `CommunicationController.findAll()` delegates directly to `TenantAwareCrudService.findAll()`, which scopes queries solely by `tenantId` and applies no filtering for `senderId` or `recipientId`.
- **Impact:** Total breach of private school communications. Any logged-in user in a school can read every private message sent between teachers, parents, students, and administrators.
- **Affected Components:** `CommunicationController`, `CommunicationService`.
- **Standard Reference:** Kenya Data Protection Act 2019 Part IV, GDPR Art. 5(1)(f), OWASP ASVS 5.0 V4.1.
- **Recommendation:** Update `findAll()` to extract the authenticated `userId` from the request and query only messages where `senderId = userId OR recipientId = userId`.
- **Verification:** Authenticate as User X; invoke `GET /api/communication/messages`; verify response contains zero messages between User Y and User Z.

---

### Finding: SEC-009 — Password Reset Tokens Stored in Plaintext and Not Invalidated
- **Severity:** High (P1)
- **Status:** Confirmed
- **Evidence:**
  - File: `src/modules/users/users.service.ts`, lines 108–134:
    ```typescript
    async setPasswordResetToken(id: string, token: string, expires: Date): Promise<void> {
      await this.userRepository.update(id, {
        password_reset_token: token, // Stored in plaintext
        password_reset_expires: expires,
      });
    }

    async resetPassword(id: string, password: string): Promise<User | null> {
      const salt = await bcrypt.genSalt(12);
      const hashedPassword = await bcrypt.hash(password, salt);
      await this.userRepository.update(id, {
        password_hash: hashedPassword,
        password_reset_token: undefined, // TypeORM ignores undefined properties
        password_reset_expires: undefined,
      });
      return this.userRepository.findOne({ where: { id } });
    }
    ```
- **Root Cause:** Reset tokens generated via `uuidv4()` are stored in the database in plaintext. In `resetPassword()`, the reset fields are assigned `undefined`, which TypeORM skips in SQL `UPDATE` statements, leaving the old token intact.
- **Impact:** Database reads or leaks expose active reset tokens. Because the token is never cleared (`undefined` is omitted by TypeORM), an attacker who intercepted the token can reuse it prior to expiration to hijack the account repeatedly.
- **Affected Components:** `UsersService`, `AuthService`.
- **Standard Reference:** OWASP ASVS 5.0 V2.5 (Credential Recovery), ASVS V2.8.
- **Recommendation:** Hash reset tokens using SHA-256 before storing in the database. In `resetPassword()`, explicitly set `password_reset_token: null` and `password_reset_expires: null`. Revoke all active user JWT sessions upon password reset.
- **Verification:** Trigger password reset, complete password change, and assert in the database that `password_reset_token` is `NULL`.

---

### Finding: SEC-010 — Flawed SuperAdmin Check and Substring Role Matching in Guards
- **Severity:** High (P1)
- **Status:** Confirmed
- **Evidence:**
  - File: `src/modules/auth/guards/permissions.guard.ts`, lines 31–32:
    ```typescript
    // Super Admin has all permissions
    if (user.role === 'SuperAdmin') return true;
    ```
  - File: `src/common/user-role.enum.ts`, lines 1–6:
    ```typescript
    export enum UserRole {
      SUPER_ADMIN = 'super_admin', // Lowercase with underscore
      ADMIN = 'admin',
      TEACHER = 'teacher',
      PARENT = 'parent',
    }
    ```
  - File: `src/modules/auth/guards/roles.guard.ts`, line 19:
    ```typescript
    return requiredRoles.some((role) => user?.role?.includes(role));
    ```
- **Root Cause:** `PermissionsGuard` uses a hardcoded PascalCase string `'SuperAdmin'` that never matches the enum value `'super_admin'`. In `RolesGuard`, `user?.role?.includes(role)` performs substring matching on string primitives (`'super_admin'.includes('admin') === true`).
- **Impact:** Legitimate Super Admins are blocked by `PermissionsGuard` because `'super_admin' !== 'SuperAdmin'`. In `RolesGuard`, substring matching creates accidental privilege overlap (e.g., any role containing `'admin'` satisfies an `@Roles(UserRole.ADMIN)` check).
- **Affected Components:** `PermissionsGuard`, `RolesGuard`.
- **Standard Reference:** OWASP Top 10:2025 A01, ASVS 5.0 V4.1.
- **Recommendation:** Use exact equality checks against `UserRole` enum values (`user.role === UserRole.SUPER_ADMIN` and `requiredRoles.includes(user.role)`).
- **Verification:** Test `RolesGuard` with a mock user whose role is `'guest_admin'`; verify access to `@Roles(UserRole.ADMIN)` endpoints is denied.

---

### Finding: ARC-002 — Singleton TenantMiddleware Injecting Request-Scoped TenancyService
- **Severity:** High (P1)
- **Status:** Confirmed
- **Evidence:**
  - File: `src/core/tenancy/tenant.middleware.ts`, lines 20–26:
    ```typescript
    @Injectable()
    export class TenantMiddleware implements NestMiddleware {
      constructor(
        private readonly tenantsService: TenantsService,
        private readonly tenancyService: TenancyService,
        private readonly jwtService: JwtService,
      ) {}
    ```
  - File: `src/core/tenancy/tenancy.service.ts`, lines 4–6:
    ```typescript
    @Injectable({ scope: Scope.REQUEST })
    export class TenancyService {
      private tenant: Tenant;
    ```
- **Root Cause:** In NestJS, middlewares are singletons created at application bootstrap and cannot reliably inject request-scoped providers. When a request-scoped provider is injected into a singleton middleware, NestJS instantiates a single shared instance or fails to bind request context correctly.
- **Impact:** High-concurrency race condition. When multiple requests from different schools arrive concurrently, `tenancyService.setTenant(tenant)` mutates shared state, causing Request 1 to execute queries using Request 2's tenant context.
- **Affected Components:** `TenancyModule`, `TenantMiddleware`, `TenancyService`.
- **Standard Reference:** OWASP ASVS 5.0 V1.4, NestJS Architectural Guidelines.
- **Recommendation:** Implement multi-tenancy using Node.js `AsyncLocalStorage` via NestJS `ClsModule` (Context Local Storage). This provides thread-safe, request-isolated tenancy context without modifying service scopes or risking race conditions.
- **Verification:** Run 100 concurrent requests across 5 tenants; log the resolved tenant ID in both middleware and service; assert zero cross-tenant contamination.

---

### Finding: ARC-003 — Object Spread Operator in Repository findAll Spreading Array Conditions into Numeric Keys
- **Severity:** High (P1)
- **Status:** Confirmed
- **Evidence:**
  - File: `src/core/common/tenant-aware-crud.service.ts`, lines 21–29:
    ```typescript
    findAll(options?: FindManyOptions<T>): Promise<T[]> {
      return this.repository.find({
        ...options,
        where: {
          ...options?.where,
          tenantId: this.tenancyService.getTenantId() as string,
        } as any,
      });
    }
    ```
- **Root Cause:** In TypeORM, `FindManyOptions.where` can be an array of conditions to represent SQL `OR` clauses (e.g. `[{ name: 'A' }, { name: 'B' }]`). When JavaScript object spread (`...options?.where`) is applied to an array, it converts the array into an object with numeric keys (`{ '0': { name: 'A' }, '1': { name: 'B' }, tenantId: '...' }`).
- **Impact:** Any service call that passes an array of conditions to `findAll()` corrupts the TypeORM query builder, causing SQL syntax errors or stripping tenant isolation on `OR` queries.
- **Affected Components:** `TenantAwareCrudService`, all inheriting domain services.
- **Standard Reference:** TypeORM Query Formulation Guidelines, OWASP Top 10:2025 A03.
- **Recommendation:** Refactor `findAll` to inspect `Array.isArray(options?.where)`. If an array is provided, map each element: `options.where.map(cond => ({ ...cond, tenantId }))`.
- **Verification:** Call `findAll({ where: [{ status: 'active' }, { status: 'pending' }] })`; verify generated SQL contains `WHERE (status = 'active' AND tenantId = ?) OR (status = 'pending' AND tenantId = ?)`.

---

### Finding: FUN-001 — Student Promotions Destructively Overwrite Academic History Without Longitudinal Tracking
- **Severity:** High (P1)
- **Status:** Confirmed
- **Evidence:**
  - File: `src/modules/students/promotion.service.ts`, lines 34–44:
    ```typescript
    const updatedStudents = students.map((student) => {
      return {
        ...student,
        classLevelId: nextClassLevelId,
        sectionId: nextSectionId,
        academicYearId: nextAcademicYearId,
      };
    });
    await this.studentRepository.save(updatedStudents);
    ```
- **Root Cause:** The system lacks an `enrollments` or `student_academic_history` ledger table. Student grade levels and sections are stored solely as foreign keys directly on the `Student` entity.
- **Impact:** Promoting students to the next grade permanently erases their historical enrollment. Schools cannot view past class rosters, generate transcripts for previous years, or track student academic trajectories. Destroys EMIS historical reporting integrity.
- **Affected Components:** `PromotionService`, `Student` entity, `StudentsModule`.
- **Standard Reference:** UNESCO/UIS EMIS Data Quality Standards, ISO/IEC 25010 Functional Suitability.
- **Recommendation:** Implement an `EnrollmentHistory` entity (`id`, `tenantId`, `studentId`, `academicYearId`, `classLevelId`, `sectionId`, `status`, `promotedAt`). On promotion, create an immutable enrollment history record before updating current pointers.
- **Verification:** Promote a student from Grade 10 to Grade 11; query the enrollment history table and assert Grade 10 records remain intact.

---

### Finding: FUN-002 — Report Card Schema Lacks Subject Relationships and Multi-Criteria Evaluation
- **Severity:** High (P1)
- **Status:** Confirmed
- **Evidence:**
  - File: `src/modules/report-cards/entities/report-card.entity.ts`, lines 5–20:
    ```typescript
    @Entity({ name: 'report_cards' })
    export class ReportCard extends TenantAwareEntity {
      @Column()
      studentId: string;

      @Column()
      examinationId: string;

      @Column('decimal', { precision: 5, scale: 2 })
      marks: number;

      @Column({ nullable: true })
      grade: string;

      @Column({ nullable: true })
      remarks: string;
    }
    ```
- **Root Cause:** The `ReportCard` entity stores only a single mark and grade for an entire exam, omitting foreign keys to subjects, class teachers, terms, and grading scales.
- **Impact:** An entire student term report card is reduced to a single decimal number. Real-world schools evaluate students across 6–12 distinct subjects with subject-specific teacher remarks, GPA calculations, and class rankings. The current schema cannot generate standard institutional report cards.
- **Affected Components:** `ReportCardsModule`, `ExaminationsModule`.
- **Standard Reference:** UNESCO EMIS Guidelines, SDG 4 Indicator Reporting.
- **Recommendation:** Redesign report cards into a composite model: `ReportCard` (header with student, term, academic year, attendance, principal remarks) and `ReportCardItem` (detail rows with `subjectId`, marks, letter grade, teacher comments, subject position).
- **Verification:** Create a multi-subject report card with 8 distinct subjects; verify marks, letter grades, and GPA calculate accurately.

---

### Finding: UI-001 — Disconnected UI Mockups with Hardcoded Demo Data and Browser Alert Stubs
- **Severity:** High (P1)
- **Status:** Confirmed
- **Evidence:**
  - File: `client/src/pages/TeacherGradingPage.tsx`, lines 13–35:
    ```typescript
    useEffect(() => {
      // Mocking student grades
      setStudents([
        { id: 1, name: 'Alice Johnson', grade: 85, remarks: 'Good progress' },
        { id: 2, name: 'Bob Smith', grade: 92, remarks: 'Excellent work' },
        ...
      ]);
    }, [selectedClass, assessmentType]);

    const handleSave = () => {
      alert('Grades saved successfully!'); // No API call
    };
    ```
  - File: `client/src/pages/TeacherAttendancePage.tsx`, lines 13–30 (hardcoded student roster, `alert('Attendance saved successfully!')`).
  - File: `client/src/pages/TeacherClassesPage.tsx`, lines 13–22 (`setTimeout` returning hardcoded classes).
  - File: `client/src/components/CheckoutForm.tsx`, line 17 (calls non-existent `/payments/create-payment-intent`).
- **Root Cause:** "Vibe-coding" practice of implementing polished UI components that display static mock arrays and trigger fake alerts rather than integrating with backend endpoints.
- **Impact:** Deceptive usability. Teachers attempting to record attendance or submit grades are shown mock data; pressing "Save" triggers an alert box but saves nothing to the server. Work is silently lost.
- **Affected Components:** Teacher portal pages, CheckoutForm.
- **Standard Reference:** ISO/IEC 25010 Usability & Functional Completeness.
- **Recommendation:** Replace static arrays in teacher pages with real API integrations calling `/api/examinations`, `/api/report-cards`, and `/api/attendance/bulk`. Remove dummy alert boxes and add proper toast notifications and error handling.
- **Verification:** Enter grades for real students in the UI; verify database updates and page retains entered data on refresh.

---

### Finding: UI-002 — Complete Absence of Student CRUD, Search, Filter, and Profile Viewing in Frontend
- **Severity:** High (P1)
- **Status:** Confirmed
- **Evidence:**
  - File: `client/src/pages/StudentsManagementPage.tsx`, lines 64–156.
- **Root Cause:** The "Students Management" page only contains a drag-and-drop file upload form for bulk Excel importing.
- **Impact:** School administrators cannot view the list of registered students, cannot search or filter students by class, cannot view student profiles, and cannot edit or delete student records from the UI.
- **Affected Components:** `StudentsManagementPage.tsx`, `client/src/App.tsx`.
- **Standard Reference:** ISO/IEC 25010 Usability, WCAG 2.2 Level AA.
- **Recommendation:** Build a comprehensive Student Management interface featuring data tables, search/filter inputs, pagination, single-student registration modals, edit forms, and status toggles.
- **Verification:** Navigate to `/students`; assert presence of data grid showing live student records with search, edit, and delete functionality.

---

### Finding: OPS-001 — Empty 0-Byte Dockerfile, Nginx Config, and Broken Docker Compose
- **Severity:** High (P1)
- **Status:** Confirmed
- **Evidence:**
  - File: `Dockerfile` (0 bytes).
  - File: `nginx.conf` (0 bytes).
  - File: `.dockerignore` (0 bytes).
  - File: `docker-compose.yml`, lines 13–16:
    ```yaml
    backend:
      build:
        context: .
        dockerfile: server/Dockerfile # Directory 'server' does not exist
    ```
- **Root Cause:** Containerization configuration files were created as blank placeholders and never populated or tested.
- **Impact:** The system cannot be containerized or deployed using Docker. `docker compose up` fails with file-not-found errors for `server/Dockerfile`. Automated CI/CD deployment pipelines cannot build container images.
- **Affected Components:** Root DevOps artifacts.
- **Standard Reference:** NIST SP 800-218 (Secure Build Environment), CIS Docker Benchmarks.
- **Recommendation:** Write a multi-stage production `Dockerfile` building both client and server; populate `nginx.conf` with secure TLS headers and reverse proxy rules; update `docker-compose.yml` to build the unified container and include a Redis 7 service.
- **Verification:** Execute `docker compose build && docker compose up -d`; verify all services (frontend, backend, MySQL, Redis) start cleanly.

---

### Finding: QAL-001 — Complete Absence of Automated Tests (0% Test Coverage)
- **Severity:** High (P1)
- **Status:** Confirmed
- **Evidence:**
  - No `*.spec.ts` files exist in `src/`.
  - File: `test/app.e2e-spec.ts`, lines 19–24:
    ```typescript
    it('/ (GET)', () => {
      return request(app.getHttpServer())
        .get('/')
        .expect(200)
        .expect('Hello World!');
    });
    ```
  - In `src/app.module.ts` line 154: `controllers: []` (root controllers removed; `GET /` does not exist).
- **Root Cause:** Quality assurance was neglected during development. The only existing test is an obsolete, failing template from the initial NestJS boilerplate.
- **Impact:** Extreme regression risk. No automated validation exists for authentication, multi-tenant isolation, financial calculations, or API contracts. Any code modification risks silently breaking critical functionality.
- **Affected Components:** Entire repository.
- **Standard Reference:** ISO/IEC 25010 Testability, OWASP SAMM Verification.
- **Recommendation:** Establish a testing baseline: unit tests for all services, integration tests for tenant isolation, and e2e tests covering authentication, student registration, and fee collection. Mandate >80% test coverage in CI.
- **Verification:** Run `npm test` and `npm run test:e2e`; verify all test suites execute and pass.

---

### Finding: SEC-011 — 53 Vulnerabilities in Dependency Tree (5 Critical, 27 High)
- **Severity:** Medium (P2)
- **Status:** Confirmed
- **Evidence:**
  - `npm audit --json` output:
    - Critical vulnerabilities: 5
    - High vulnerabilities: 27
    - Moderate vulnerabilities: 20
    - Low vulnerabilities: 1
    - Total: 53 vulnerabilities across 1,165 dependencies.
    - Specific packages: `vite` (path traversal, arbitrary command execution), `bull` / `uuid` (predictable UUID v1 generation), `@angular-devkit/core`, `esbuild`.
- **Root Cause:** Outdated top-level and transitive dependencies specified in `package.json`.
- **Impact:** Potential supply chain compromise, local file inclusion via Vite dev server, and predictable identifiers.
- **Affected Components:** `package.json`, `package-lock.json`.
- **Standard Reference:** OWASP Top 10:2025 A06 (Vulnerable and Outdated Components).
- **Recommendation:** Run `npm audit fix`, upgrade `vite` to version 5.4.14+ or 6.x, upgrade `bull` / `@nestjs/bull`, and introduce automated Dependabot or Renovate PR workflows.
- **Verification:** Execute `npm.cmd audit`; verify critical and high findings are reduced to zero.

---

### Finding: SEC-012 — OAuth Registration Creates Orphan Users Without Tenant Association
- **Severity:** Medium (P2)
- **Status:** Confirmed
- **Evidence:**
  - File: `src/modules/auth/auth.service.ts`, lines 68–80:
    ```typescript
    // Create a new user entirely
    // We assume default tenant...
    // For now, we will create the raw user without a tenant ID
    const newUserDto: Partial<User> = {
      username: email,
      role: UserRole.PARENT,
      googleId: provider === 'google' ? providerId : undefined,
      microsoftId: provider === 'microsoft' ? providerId : undefined,
    };
    return this.usersService.createRaw(newUserDto);
    ```
- **Root Cause:** Incomplete OAuth provisioning logic. When an unknown Google or Microsoft user logs in, the user is persisted with `tenantId: null`.
- **Impact:** Orphaned user records with no tenant context. When the user logs in, their JWT lacks a `tenantId`, causing subsequent requests to fail or bypass tenant checks.
- **Affected Components:** `AuthService`, `GoogleStrategy`, `MicrosoftStrategy`.
- **Standard Reference:** OWASP ASVS 5.0 V3.8.
- **Recommendation:** Prevent automatic user provisioning on OAuth login unless an active school invitation token or domain matching rule binds the user to a verified tenant.
- **Verification:** Attempt Google login with an uninvited email; assert that the application displays an "Invitation Required" error rather than creating an unassociated user.

---

### Finding: DAT-002 — Missing Composite Indexes on TenantId and Foreign Keys Across 15+ Entities
- **Severity:** Medium (P2)
- **Status:** Confirmed
- **Evidence:**
  - Entities across `src/modules/*/entities/`:
    - `Student`: `tenantId`, `classLevelId`, `sectionId`, `academicYearId` lack composite indexes.
    - `Attendance`: `tenantId`, `studentId`, `date` lack a composite index.
    - `Fee`: `tenantId`, `studentId`, `status` lack a composite index.
    - `ReportCard`: `tenantId`, `studentId`, `examinationId` lack indexes.
- **Root Cause:** Entities only declare individual column definitions without TypeORM `@Index(['tenantId', 'studentId'])` composite index decorators.
- **Impact:** Severe query degradation under scale. As the system scales to thousands of schools and millions of records, every tenant-scoped query results in full-table index scans.
- **Affected Components:** Database schema across all domain entities.
- **Standard Reference:** ISO/IEC 25010 Performance Efficiency.
- **Recommendation:** Add composite indexes on `(tenantId, <foreign_key>)` and `(tenantId, status)` across all tenant-aware entities.
- **Verification:** Run `EXPLAIN SELECT * FROM attendance WHERE tenantId = ? AND studentId = ?`; verify query uses index lookup (`ref`) rather than table scan (`ALL`).

---

### Finding: DAT-003 — Bulk Operations Executed Without Database Transactions
- **Severity:** Medium (P2)
- **Status:** Confirmed
- **Evidence:**
  - File: `src/modules/attendance/attendance.controller.ts`, lines 26–29:
    ```typescript
    @Post('bulk')
    bulkCreate(@Body() data: { records: CreateAttendanceDto[] }) {
      return Promise.all(data.records.map(record => this.attendanceService.create(record)));
    }
    ```
  - File: `src/modules/students/students.service.ts`, lines 80–140 (`bulkUpload` imports rows sequentially without `queryRunner.startTransaction()`).
- **Root Cause:** Asynchronous `Promise.all` mapping over individual repository save operations without wrapping in a TypeORM transactional manager.
- **Impact:** Partial write failures leave the database in an inconsistent state. If 50 out of 100 attendance records succeed before a database failure occurs, half the class is marked present with no atomic rollback.
- **Affected Components:** `AttendanceController`, `StudentsService`.
- **Standard Reference:** ISO/IEC 25010 Data Integrity.
- **Recommendation:** Wrap bulk attendance and bulk student imports inside `this.dataSource.transaction(async (manager) => { ... })`.
- **Verification:** Inject an error halfway through a bulk attendance payload; verify that zero records are committed to the database.

---

### Finding: PRV-001 — Absence of Parental Consent Verification and Minor Age Validation
- **Severity:** Medium (P2)
- **Status:** Confirmed
- **Evidence:**
  - File: `src/modules/students/entities/student.entity.ts`, lines 8–54.
- **Root Cause:** Student registration captures no date of birth, no age verification flag, and no parental consent verification audit trail.
- **Impact:** Violation of Section 33 of the Kenya Data Protection Act 2019 and GDPR Article 8, which prohibit processing children's personal data without verifiable consent from parents or legal guardians.
- **Affected Components:** `Student` entity, `StudentsService`.
- **Standard Reference:** Kenya DPA Section 33, UNICEF Child Data Protection Guidance.
- **Recommendation:** Add `dateOfBirth`, `parentalConsentVerified`, and `consentTimestamp` fields to `Student` entity. Require administrators to upload or confirm consent verification during student enrollment.
- **Verification:** Attempt to enroll a student without parental consent confirmation; assert validation blocks registration.

---

### Finding: PRV-002 — Misleading Public Privacy Representations Claiming Nonexistent MFA and E2EE
- **Severity:** Medium (P2)
- **Status:** Confirmed
- **Evidence:**
  - File: `client/src/pages/PrivacyPage.tsx`, line 64:
    ```typescript
    We implement enterprise-grade security measures, including end-to-end encryption (AES-256), secure socket layers (SSL), and multi-factor authentication.
    ```
- **Root Cause:** Marketing boilerplate was placed into legal privacy documents without verifying technical controls.
- **Impact:** Legal and compliance risk for deceptive representations. Multi-factor authentication is not implemented anywhere in the repository, and end-to-end encryption is not utilized for student records.
- **Affected Components:** `PrivacyPage.tsx`.
- **Standard Reference:** ISO/IEC 27701:2025 Transparency, Kenya Consumer Protection Act.
- **Recommendation:** Update public privacy policy text to accurately reflect verified technical controls. Implement real TOTP-based MFA for administrative roles.
- **Verification:** Review public policy text against verified system inventory.

---

### Finding: UI-003 — Form Controls and Modals Lack Accessibility Attributes (WCAG 2.2 AA)
- **Severity:** Medium (P2)
- **Status:** Confirmed
- **Evidence:**
  - File: `client/src/pages/StaffManagementPage.tsx`, lines 74–125: Inputs rely on placeholder text without associated `<label for="id">` attributes.
  - File: `client/src/pages/StudentsManagementPage.tsx`, line 108: Hidden file input lacks an accessible name or screen-reader description.
- **Root Cause:** Custom Tailwind styling without standard accessibility attributes (`aria-label`, `htmlFor`, `id`).
- **Impact:** Screen reader users and visually impaired staff cannot navigate form fields or interpret validation errors, failing WCAG 2.2 AA criteria.
- **Affected Components:** Client form components.
- **Standard Reference:** WCAG 2.2 Level AA (Criteria 1.3.1, 4.1.2).
- **Recommendation:** Link all labels to inputs via `htmlFor` and `id`, provide `aria-describedby` links to validation error text, and add `aria-live="polite"` regions for dynamic notifications.
- **Verification:** Audit pages using Axe Accessibility linter; verify zero critical accessibility violations.

---

### Finding: UI-004 — Unhandled Token Expiration (401 Unauthorized) Causing Application Lockup
- **Severity:** Medium (P2)
- **Status:** Confirmed
- **Evidence:**
  - File: `client/src/services/api.ts`, lines 19–31:
    ```typescript
    api.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response && error.response.status === 402) {
          if (window.location.pathname !== '/pricing') {
            window.location.href = '/pricing?locked=true';
          }
        }
        return Promise.reject(error);
      }
    );
    ```
- **Root Cause:** Axios response interceptor only checks for status 402 (Payment Required) and ignores status 401 (Unauthorized).
- **Impact:** When a user's JWT expires (after 60 minutes), subsequent API requests fail with 401. The application does not clear `localStorage`, does not notify the user, and does not redirect to `/login`. The UI enters an unresponsive state with infinite loading spinners.
- **Affected Components:** `client/src/services/api.ts`, `AuthContext.tsx`.
- **Standard Reference:** ISO/IEC 25010 Usability / Fault Tolerance.
- **Recommendation:** Update the Axios response interceptor to intercept 401 errors, clear `localStorage` credentials, trigger `logout()`, and redirect to `/login?session_expired=true`.
- **Verification:** Expire JWT token in `localStorage` and trigger an API call; verify automatic redirection to `/login`.

---

### Finding: PER-001 — N+1 Unbatched Sequential Queries in Reporting Endpoints
- **Severity:** Medium (P2)
- **Status:** Confirmed
- **Evidence:**
  - File: `src/modules/reporting/reporting.service.ts`, lines 268–298:
    ```typescript
    const children = await Promise.all(
      childrenRaw.map(async (child) => {
        const totalDays = await this.attendanceRepository.count({ where: { studentId: child.id } });
        const presentDays = await this.attendanceRepository.count({ where: { studentId: child.id, status: 'present' } });
        const nextFee = await this.feeRepository.findOne({ where: { studentId: child.id, status: 'unpaid' } });
        ...
      })
    );
    ```
- **Root Cause:** Iterating over children and executing 3 distinct database queries per child sequentially within `Promise.all`.
- **Impact:** For a parent with 3 children, loading the dashboard generates 10 separate SQL queries. Under heavy parent portal traffic, database connection pools are rapidly exhausted.
- **Affected Components:** `ReportingService`.
- **Standard Reference:** ISO/IEC 25010 Performance Efficiency.
- **Recommendation:** Replace unbatched loops with a single aggregated SQL query or SQL `GROUP BY studentId` grouping.
- **Verification:** Benchmark dashboard query count using TypeORM query logging; verify total query count is reduced from $O(3N+1)$ to $O(1)$.

---

### Finding: SEC-013 — Environment File Committed to Git and Dist Directory Tracked
- **Severity:** Low (P3)
- **Status:** Confirmed
- **Evidence:**
  - `git ls-files .env` returns `.env`.
  - `.gitignore`, lines 1–2:
    ```gitignore
    node_modules
    node_modules
    ```
- **Root Cause:** `.gitignore` was configured with duplicate `node_modules` lines and omitted `.env`, `.env.local`, and `dist/`.
- **Impact:** Secrets and database configurations in `.env` are committed to the git revision history.
- **Affected Components:** `.gitignore`, `.git` history.
- **Standard Reference:** OWASP ASVS 5.0 V14.1.
- **Recommendation:** Add `.env`, `.env.*`, `dist/`, and `*.log` to `.gitignore`. Purge `.env` from git history using `git rm --cached .env`.
- **Verification:** Run `git status`; verify `.env` is ignored.

---

### Finding: SEO-001 — Missing Sitemaps, Robots Directives, and Open Graph Metadata
- **Severity:** Low (P3)
- **Status:** Confirmed
- **Evidence:**
  - Root directory lacks `robots.txt` and `sitemap.xml`.
  - `client/index.html` lacks description meta tags and Open Graph cards.
- **Root Cause:** Public SEO optimization was omitted during initial MVP build.
- **Impact:** Search engine crawlers cannot discover public marketing pages (`/pricing`, `/contact`, `/terms`, `/privacy`), and there are no explicit disallow directives preventing crawlers from indexing authenticated portals.
- **Affected Components:** `client/index.html`, public root.
- **Standard Reference:** Google Search Central Webmaster Guidelines.
- **Recommendation:** Create `public/robots.txt` allowing public routes while explicitly disallowing `/api/`, `/dashboard`, `/super-admin`, `/teacher`, and `/parent`. Add canonical tags and structured JSON-LD schemas.
- **Verification:** Request `/robots.txt`; verify valid directives.

---

### Finding: ARC-004 — Duplicate Roles Decorator Definitions
- **Severity:** Low (P3)
- **Status:** Confirmed
- **Evidence:**
  - File: `src/core/decorators/roles.decorator.ts`.
  - File: `src/modules/auth/decorators/roles.decorator.ts`.
- **Root Cause:** Code duplication during refactoring. Controllers import from two distinct paths (`src/core/decorators` vs `../auth/decorators`).
- **Impact:** Confusion and technical debt. While both files currently define identical metadata keys, future modifications to one file will break role checks in controllers importing the other.
- **Affected Components:** Core and Auth modules.
- **Standard Reference:** Clean Code DRY Principle.
- **Recommendation:** Consolidate into a single location (`src/common/decorators/roles.decorator.ts`) and update all imports.
- **Verification:** Grep for `roles.decorator`; verify only one source file exists.
