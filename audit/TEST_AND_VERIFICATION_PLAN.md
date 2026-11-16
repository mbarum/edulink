# Test and Verification Quality Plan

**Author:** Software Quality Assurance Lead  
**Evaluation Standard:** ISO/IEC 25010 Software Quality Principles, OWASP Testing Guide v4.2  
**Baseline Test Coverage:** **0% (Zero Unit Tests, Broken E2E Scaffold)**  
**Target Coverage for Production Release:** **$\ge 80\%$ Line & Branch Coverage on Business Logic, 100% on Tenant Isolation Boundaries**  

---

## 1. Quality Baseline & Current Deficiencies

### 1.1 Current Test Deficiencies
1. **Zero Unit Tests:** The codebase contains 0 `*.spec.ts` files across all 21 backend modules and 0 test files in the React frontend.
2. **Broken Legacy Scaffold Test:** The sole e2e test ([test/app.e2e-spec.ts](file:///c:/Users/HP/Downloads/multitenacny-school-management-system-main%20(2)/multitenacny-school-management-system-main/test/app.e2e-spec.ts)) tests `GET /` expecting `'Hello World!'`. Because `AppController` was removed from `app.module.ts`, running `npm run test:e2e` fails immediately.
3. **No CI/CD Quality Gates:** There are no automated GitHub Actions or GitLab CI pipelines executing `lint`, `test`, or security audits on pull requests.

---

## 2. Multi-Tiered Verification Framework

```
                 +-------------------------------+
                 |   End-to-End (E2E) Tests     |  5-10% of suite
                 |  (Playwright / Supertest E2E) |  Auth -> Payment -> Enrollment
                 +-------------------------------+
                 |      Integration Tests        |  20-30% of suite
                 | (Tenant Isolation / DB Txns)  |  Cross-Tenant Access / Migrations
                 +-------------------------------+
                 |         Unit Tests            |  60-70% of suite
                 | (Jest / Services / DTO / Core)|  Business Logic, Guards, Redaction
                 +-------------------------------+
```

---

## 3. Detailed Verification Test Suites

### 3.1 Tenant Isolation & Security Boundary Suite (`test/security/tenancy.spec.ts`)
- **TEST-TEN-001 (Cross-Tenant Data Leak via Redis):**
  - Setup: Populate Tenant A with 10 students. Populate Tenant B with 5 students.
  - Action: Make HTTP `GET /api/students` with Tenant A's JWT. Cache warms. Make HTTP `GET /api/students` with Tenant B's JWT.
  - Assertion: Response for Tenant B contains exactly 5 students belonging to Tenant B. Zero Tenant A records present.
- **TEST-TEN-002 (Header Spoofing Prevention):**
  - Setup: Authenticate as Tenant A Admin.
  - Action: Send `GET /api/students` with `Authorization: Bearer <TenantA_JWT>` and `x-tenant-id: <TenantB_ID>`.
  - Assertion: Application throws HTTP 403 Forbidden (`Security Violation: Provided Tenant ID does not match authenticated session`).
- **TEST-TEN-003 (Concurrent Concurrency Stress Test):**
  - Setup: Spin up 50 simulated concurrent worker threads across 5 tenants.
  - Action: Dispatch 500 simultaneous requests to `/api/academics/subjects` and `/api/students`.
  - Assertion: 0 cross-tenant records returned; 0 unhandled promise rejections.

### 3.2 Authorization & Role-Based Access Control Suite (`test/security/rbac.spec.ts`)
- **TEST-RBAC-001 (Privilege Escalation Block):**
  - Action: Authenticate as `admin` of School 1. Send `PATCH /api/users/<user_id>` with payload `{"role": "super_admin"}`.
  - Assertion: Request rejected with HTTP 403 Forbidden.
- **TEST-RBAC-002 (Financial Data Isolation):**
  - Action: Authenticate as `parent` or `teacher`. Dispatch `GET /api/payroll`, `POST /api/payroll`, `DELETE /api/fees/:id`.
  - Assertion: All requests rejected with HTTP 403 Forbidden.
- **TEST-RBAC-003 (Private Message Confidentiality):**
  - Setup: Teacher A sends message to Parent B.
  - Action: Authenticate as Teacher C. Dispatch `GET /api/communication/messages`.
  - Assertion: Message between Teacher A and Parent B is not included in response.

### 3.3 Data Integrity & Transaction Verification Suite (`test/integration/transactions.spec.ts`)
- **TEST-TX-001 (Bulk Attendance Atomic Rollback):**
  - Setup: Create batch of 20 attendance records, where record 15 contains an invalid `studentId`.
  - Action: Send `POST /api/attendance/bulk`.
  - Assertion: Request fails with HTTP 400/404; database contains 0 new attendance records (atomic rollback).
- **TEST-TX-002 (Student Promotion Historical Retention):**
  - Setup: Student is enrolled in Grade 10, Academic Year 2025/2026.
  - Action: Promote student to Grade 11, Academic Year 2026/2027.
  - Assertion: Current student pointers reflect Grade 11; query to `enrollment_history` returns immutable record for Grade 10.

### 3.4 Webhook & Payment Verification Suite (`test/integration/webhooks.spec.ts`)
- **TEST-PAY-001 (M-Pesa Callback IP Filter):**
  - Action: Send forged `POST /api/mpesa/callback` with `ResultCode: 0` from an unauthorized IP.
  - Assertion: Request rejected with HTTP 403 Forbidden.
- **TEST-PAY-002 (Stripe Webhook HMAC Verification):**
  - Action: Send mock Stripe webhook payload with invalid signature header.
  - Assertion: Request rejected with HTTP 400 Bad Request (`Webhook Error: Invalid signature`).

---

## 4. Minimum Release Gates for Production

To approve any software release for deployment to institutions handling student data, the following automated release gates must pass:

```
[GATE 1: STATIC ANALYSIS]
  ├── ESLint passes with 0 errors
  ├── TypeScript compiler ('tsc --noEmit') compiles with 0 errors
  └── Dependency audit ('npm audit') reports 0 Critical and 0 High vulnerabilities

[GATE 2: AUTOMATED TESTING]
  ├── Unit Test Suite: 100% pass rate, >80% line coverage
  ├── Security & Tenancy Suite: 100% pass rate (0 tolerance for leaks)
  ├── RBAC Suite: 100% pass rate across all roles (Admin, Teacher, Parent, SuperAdmin)
  └── Database Migration Test: Clean run and rollback against MySQL 8.0 container

[GATE 3: ACCESSIBILITY & BUILD]
  ├── Frontend production build ('vite build') succeeds without warnings
  ├── Axe-core accessibility scan reports 0 critical violations
  └── Docker multi-stage build creates container image without root privileges
```
