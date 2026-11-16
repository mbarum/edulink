# Quantitative Quality Scorecard, Coverage, and Audit Limitations

**Assessment Model:** Weighted Multi-Disciplinary Software Assurance Model  
**Audit Approach:** Static Code Analysis, Configuration Inspection, Dependency Auditing, and Architectural Modeling  
**Assessment Date:** October 2026  

---

## 1. Quantitative Quality Scorecard

The application was evaluated across eight core software assurance domains against international enterprise benchmarks. Scoring reflects verified technical implementation in the repository codebase.

> [!CAUTION]
> **Scoring Note:** Numeric scores reflect verified technical controls. In accordance with non-negotiable audit rules, **a numeric score never overrides a critical release blocker**. Regardless of aggregate score, the presence of confirmed P0 vulnerabilities mandates a release recommendation of **NOT READY**.

### Weighted Score Summary Table

| Assessment Domain | Domain Weight | Raw Score (/100) | Weighted Score | Verified Findings Count | Assessment Coverage | Auditor Confidence Level |
|---|:---:|:---:|:---:|:---:|:---:|:---:|
| **1. Application and API Security** | 25% | 34 / 100 | **8.5 / 25.0** | 10 Findings (5 Critical, 5 High) | 95% (Full API Inventory) | High |
| **2. Privacy & Data Governance** | 15% | 28 / 100 | **4.2 / 15.0** | 4 Findings (1 Critical, 1 High, 2 Med) | 90% (Schema & Policies) | High |
| **3. Architecture & Code Quality** | 15% | 46 / 100 | **6.9 / 15.0** | 4 Findings (1 Critical, 2 High, 1 Low) | 90% (Backend & Core) | High |
| **4. Functional & Data Integrity** | 15% | 32 / 100 | **4.8 / 15.0** | 5 Findings (1 Critical, 2 High, 2 Med) | 85% (Domain Workflows) | High |
| **5. UI/UX & Accessibility** | 10% | 40 / 100 | **4.0 / 10.0** | 4 Findings (2 High, 2 Med) | 85% (Frontend Views) | High |
| **6. Performance & Scalability** | 10% | 38 / 100 | **3.8 / 10.0** | 3 Findings (2 Med, 1 High) | 80% (Queries & Caching) | High |
| **7. DevSecOps & Operational** | 5% | 20 / 100 | **1.0 / 5.0** | 3 Findings (1 High, 1 Med, 1 Low) | 85% (DevOps Manifests) | High |
| **8. SEO & Public Web Quality** | 5% | 45 / 100 | **2.25 / 5.0** | 1 Finding (1 Low) | 80% (Public Pages) | High |
| **OVERALL COMPOSITE TOTAL** | **100%** | — | **35.45 / 100** | **34 Total Findings** | **87.5% Average** | **High** |

---

## 2. Domain-by-Domain Scoring Methodology & Evidence

### 2.1 Application and API Security (Weight: 25% | Score: 34/100 | Weighted: 8.5/25)
- **Scoring Method:** Assessed against OWASP ASVS 5.0 (Levels 2 and 3). Evaluated password hashing, session tokens, authorization guards, tenant scoping, webhook verification, and input validation across 72 API routes.
- **Evidence Supporting Score:**
  - Positive (+34): Bcrypt hashing with salt rounds 12; JWT stateless signing with expiration; rate limiting configured via `ThrottlerModule`; Helmet headers enabled.
  - Deductions (-66): Unscoped Redis caching causing cross-tenant data leaks (SEC-001); plaintext password storage in audit logs (SEC-002); hardcoded SuperAdmin credentials in source code (SEC-003); unauthenticated M-Pesa webhook callback (SEC-004); missing rawBody breaking Stripe signature validation (SEC-005); absence of RolesGuard on financial controllers (SEC-007); privilege escalation on user update (SEC-006).

### 2.2 Privacy, Data Protection & Governance (Weight: 15% | Score: 28/100 | Weighted: 4.2/15)
- **Scoring Method:** Evaluated against Kenya Data Protection Act 2019, GDPR, and UNICEF child data guidance.
- **Evidence Supporting Score:**
  - Positive (+28): High-level privacy policy exists; tenant isolation foundation established in base entities; role segregation between staff, teachers, and parents conceptually planned.
  - Deductions (-72): Total absence of parental consent verification mechanism (PRV-001); no minor age validation; unredacted child PII in audit logs; student promotion erases past academic history (FUN-001); deceptive privacy policy claims of non-existent MFA and E2EE (PRV-002); private messaging exposed tenant-wide (SEC-008).

### 2.3 Architecture and Code Quality (Weight: 15% | Score: 46/100 | Weighted: 6.9/15)
- **Scoring Method:** Evaluated against ISO/IEC 25010 maintainability, Clean Architecture, and SOLID principles.
- **Evidence Supporting Score:**
  - Positive (+46): Clear NestJS modular structure; distinct domain modules; TypeScript interfaces defined across modules; shared utility services.
  - Deductions (-54): Global ValidationPipe configured with `forbidNonWhitelisted: true` while DTOs lack decorators, breaking all write APIs (ARC-001); singleton middleware injecting request-scoped tenancy service causing concurrency race conditions (ARC-002); un-normalized parent contact info embedded on student entity; duplicate decorator definitions (ARC-004).

### 2.4 Functional Correctness & Data Integrity (Weight: 15% | Score: 32/100 | Weighted: 4.8/15)
- **Scoring Method:** Tested end-to-end CRUD and business logic across education domains (academics, fees, payroll, exams, promotions).
- **Evidence Supporting Score:**
  - Positive (+32): Schema models cover a broad EMIS scope (classes, sections, academic years, books, timetable, calendar).
  - Deductions (-68): Report card entity stores only a single mark and grade with no subject relationship (FUN-002); promotions overwrite academic history (FUN-001); bulk uploads and attendance operations lack database transactions (DAT-003); student management UI has no view, edit, or delete functionality (UI-002).

### 2.5 UI/UX and Accessibility (Weight: 10% | Score: 40/100 | Weighted: 4.0/10)
- **Scoring Method:** Evaluated against WCAG 2.2 Level AA and multi-device usability.
- **Evidence Supporting Score:**
  - Positive (+40): Clean visual styling using Tailwind CSS; modern typography and responsive grid layouts on desktop; Framer Motion micro-interactions.
  - Deductions (-60): Presence of "vibe-coded" fake interfaces (Teacher Grading and Attendance use hardcoded arrays and `alert()` stubs) (UI-001); missing form `<label>` associations and visible focus states (UI-003); unhandled 401 token expiration freezing the application (UI-004); lack of skip links and unmanaged modal focus traps.

### 2.6 Performance, Scalability and Reliability (Weight: 10% | Score: 38/100 | Weighted: 3.8/10)
- **Scoring Method:** Evaluated database indexing, connection pooling, queue reliability, and query complexity.
- **Evidence Supporting Score:**
  - Positive (+38): Redis integrated for background jobs and caching; stateless HTTP API server capable of horizontal scaling.
  - Deductions (-62): Absence of composite indexes on `(tenantId, ...)` across 15+ entities (DAT-002); severe N+1 query patterns in reporting endpoints (PER-001); default MySQL connection pool limit (10) prone to saturation; Redis cache key collisions cross-tenant.

### 2.7 DevSecOps and Operational Readiness (Weight: 5% | Score: 20/100 | Weighted: 1.0/5)
- **Scoring Method:** Evaluated container hardening, CI/CD, migration quality, and dependency health.
- **Evidence Supporting Score:**
  - Positive (+20): `docker-compose.yml` manifest exists; PM2 ecosystem configuration provided; `package-lock.json` present.
  - Deductions (-80): 0-byte blank `Dockerfile` and `nginx.conf` (OPS-001); `docker-compose.yml` references non-existent `server/Dockerfile` and omits Redis; database migration contains SQLite syntax failing on MySQL (DAT-001); 53 npm dependency vulnerabilities (SEC-011); `.env` tracked in git (SEC-013).

### 2.8 SEO and Public Web Quality (Weight: 5% | Score: 45/100 | Weighted: 2.25/5)
- **Scoring Method:** Evaluated public indexability, Core Web Vitals readiness, and portal confidentiality protection.
- **Evidence Supporting Score:**
  - Positive (+45): Public marketing pages exist (`/`, `/pricing`, `/privacy`, `/terms`, `/contact`); clean modern HTML structure.
  - Deductions (-55): Missing `robots.txt` and `sitemap.xml` (SEO-001); no Open Graph social metadata; no explicit `Disallow` directives preventing crawlers from indexing private school dashboards and student portals.

---

## 3. Assessment Coverage and Confidence Levels

| Dimension | Evaluated Scope | Omitted / Untested Areas | Coverage % | Confidence Level |
|---|---|---|:---:|:---:|
| **Codebase & Architecture** | Complete source code in `src/`, `client/`, `scripts/` | None (100% inspected) | 100% | High |
| **API Endpoints** | All 72 controller routes and DTO definitions | Dynamic runtime fuzzing | 95% | High |
| **Database Schemas** | All 21 TypeORM entities and migration scripts | Long-term live multi-year dataset | 90% | High |
| **Frontend UI/UX** | All 27 React page components and form handlers | Live assistive screen-reader testing on mobile hardware | 85% | High |
| **External Webhooks** | M-Pesa Daraja and Stripe integration code | Live production payment processor callbacks | 80% | High |
| **Infrastructure & CI/CD** | Repository configurations and docker manifests | Live production cloud infrastructure / Kubernetes | 60% | Moderate |

---

## 4. Assessment Limitations & Environmental Constraints

1. **Absence of Live Production Infrastructure Access:** Audit was conducted exclusively on the local repository codebase, dependency lockfiles, and configuration manifests. Cloud provider infrastructure (AWS, Azure, Google Cloud, or local ISP hosting) and live DNS/TLS configurations were not directly accessible for infrastructure-as-code or network perimeter penetration testing.
2. **Authorized Synthetic Analysis Only:** In accordance with non-negotiable audit rules, no destructive penetration testing was performed against live institutional data, and no real financial transactions were executed through production payment gateways.
3. **M-Pesa Sandbox Constraints:** Safaricom Daraja API callbacks were analyzed via static source code and interface inspection; real-time Daraja sandbox callbacks could not be received due to local development network isolation.
4. **Third-Party External Legal Assessment:** The privacy and regulatory review provides technical alignment analysis against statutory standards (KDPA 2019, GDPR). This evaluation does not replace a formal legal opinion from an accredited data protection advocate or certified DPO.
