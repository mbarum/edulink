# International Institutional Procurement Readiness Checklist

**Reviewer:** International ICT Procurement and Compliance Reviewer  
**Target Evaluation Benchmarks:** UN / UNESCO / UNICEF ICT Standards, World Bank EMIS Guidelines, Kenyan Public Procurement and Asset Disposal Act (PPADA) 2015  

---

## 1. Procurement Evaluation Framework

Major institutional buyers, including Ministries of Education, international development agencies, and multilateral organizations, apply rigorous technical due diligence criteria before approving software platforms for consideration. Platforms managing sensitive child and institutional financial records must demonstrate operational maturity, verified compliance, and risk containment.

> [!IMPORTANT]
> **Regulatory Disclaimer:** Technical alignment with the standards listed below does **not** constitute official United Nations endorsement, accredited certification, or pre-qualification for any specific international procurement tender. Formal qualification requires independent accredited audit and certification by authorized regulatory authorities.

---

## 2. Institutional Procurement Compliance Matrix

| Evaluation Domain | Mandatory Institutional Criterion | Current Status | Technical Evidence & Gap Assessment | Procurement Readiness |
|---|---|:---:|---|:---:|
| **1. Architecture & IP** | Architectural blueprints, data dictionaries, and verified IP ownership. | **PARTIAL** | High-level code structure exists, but no formalized architectural specifications, data dictionaries, or verified license disclosures exist. | **Amber** |
| **2. Vulnerability Management**| Formal vulnerability disclosure policy, clean dependency tree, regular SAST. | **FAIL** | 53 vulnerabilities in npm tree (5 Critical, 27 High); zero automated SAST/DAST tooling in repository. | **Red (Blocker)** |
| **3. Multi-Tenancy & Sovereignty**| Strict institution data separation, configurable residency, no cross-contamination. | **FAIL** | Redis cache leaks student records cross-tenant; multi-tenancy middleware has concurrency race risks. | **Red (Blocker)** |
| **4. Child Data Protection** | Verifiable parental consent mechanism, compliance with KDPA §33 and GDPR Art. 8. | **FAIL** | Schema lacks date of birth, age checks, and parental consent audit tracking. | **Red (Blocker)** |
| **5. Service Level & Support** | Documented SLAs/SLOs, incident management runbooks, and disaster recovery procedures. | **FAIL** | No RPO/RTO metrics defined; zero operational runbooks or verified backup recovery procedures. | **Red (Blocker)** |
| **6. EMIS Functional Scope** | Longitudinal student tracking, multi-subject report cards, UNESCO/UIS compatibility. | **FAIL** | Promotions destructively overwrite records; report card schema cannot evaluate multiple subjects. | **Red (Blocker)** |
| **7. Software Supply Chain** | Reproducible builds, SBOM (Software Bill of Materials), locked dependencies. | **PARTIAL** | `package-lock.json` present, but Dockerfile is 0 bytes and deployment artifacts are broken. | **Amber** |
| **8. Accessibility (a11y)** | Verified WCAG 2.2 Level AA compliance for equitable educational access. | **FAIL** | Missing form labels, broken focus states, unannounced dynamic content. | **Amber** |
| **9. Institutional Exit & Portability**| Complete, open data export without proprietary lock-in. | **PARTIAL** | Basic Excel export exists for finances, but lacks comprehensive JSON/SQL student data export. | **Amber** |
| **10. Deceptive Claims** | Factual accuracy in public compliance and security marketing materials. | **FAIL** | Public privacy policy falsely claims MFA and E2EE are implemented. | **Red (Legal Risk)**|

---

## 3. Detailed Procurement Readiness Gaps

### 3.1 Data Sovereignty and Cross-Border Transfers
- **Gap:** International education tenders typically mandate that student data remain within national borders (data residency). The current architecture makes hardcoded calls to external cloud providers (Google APIs, Stripe US endpoints) without regional data residency configuration options.
- **Remediation:** Introduce abstract cloud adapters allowing deployment to sovereign regional data centers (e.g., local Kenyan cloud providers or local AWS/Azure data centers).

### 3.2 Auditability, Logging & Accountability
- **Gap:** The existing `audit_logs` table logs user actions but stores unredacted plaintext passwords (SEC-002). Furthermore, log entries do not use append-only cryptographic hashes (merkle trees or HMAC chains), meaning an attacker with database access can alter historical audit logs without detection.
- **Remediation:** Sanitize logged parameters and implement immutable, tamper-evident audit logging with external streaming to a secured WORM (Write Once, Read Many) log repository.

### 3.3 Institutional Data Portability & Exit Strategy
- **Gap:** In the event an educational institution or ministry terminates its contract, the vendor must provide a complete, automated extraction of all historical student, academic, staff, and financial records in standardized open formats (CSV, JSON, SQL dump).
- **Remediation:** Implement an automated tenant export command (`npm run tenant:export -- --tenantId=<id>`) that packages all institutional data and associated media attachments into an encrypted, portable archive.

---

## 4. Overall Procurement Recommendation

### Institutional Due Diligence Status: **REJECTED (NOT PROCUREMENT-READY)**

The platform in its current state would fail preliminary technical due diligence conducted by international procurement reviewers. Tenders funded by multilateral bodies require zero critical vulnerabilities, verified tenant isolation, compliant child data governance, and functional educational core workflows. 

Following the successful execution of Phases 0, 1, and 2 of the Implementation Roadmap, the platform can be resubmitted for an independent institutional compliance audit.
