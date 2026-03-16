# 99Plus — Memory Anchor
**Date:** Monday, 16 March 2026
**Status:** PHASE 5 COMPLETE — PRODUCTION LOCKED

---

## 1. InsForge Connection

| Field          | Value                                          |
|----------------|------------------------------------------------|
| Status         | Connected and verified                      |
| Project Name   | 99Plus                                         |
| Project ID     | `5ef73f5a-235e-4b26-acfe-3345e5dbd682`         |
| App Key        | `s23f7sag`                                     |
| Region         | `ap-southeast`                                 |
| OSS Host       | `https://s23f7sag.ap-southeast.insforge.app`   |
| Auth User      | `banashripegu@gmail.com`                       |
| CLI command    | `insforge current`                             |

---

## 2. Database Tables (24 total in `public` schema)

| #  | Table                        | Notes                                                         |
|----|------------------------------|---------------------------------------------------------------|
| 1  | `users`                      | RLS ON — `users_insert_own` policy                           |
| 2  | `student_profiles`           | `account_state` transitions through onboarding stages        |
| 3  | `consent_logs`               | DPDP guardian consent audit trail                            |
| 4  | `user_targets`               | Student's selected university/college/program targets        |
| 5  | `universities`               | DU, BHU seeded                                                |
| 6  | `colleges`                   | SRCC, LSR, Hindu, Hansraj (DU), BHU colleges                 |
| 7  | `programs`                   | B.Com (Hons), B.A. Pol Sci, etc.                             |
| 8  | `eligibility_rules`          | 2 active rules, fully seeded — see Section 4                 |
| 9  | `eligibility_lock_snapshots` | Immutable lock events — RLS owner-only                       |
| 10 | `student_subject_locks`      | One row per locked subject per student — RLS owner-only      |
| 11 | `syllabus_hierarchy`        | NCERT syllabus graph                                          |
| 12 | `question_bank`              | Questions for mocks and drills                                |
| 13 | `mock_tests`                 | Mock test templates                                           |
| 14 | `mock_test_questions`        | Bridge mock_tests ↔ question_bank                             |
| 15 | `mock_attempts`              | Student attempt headers                                       |
| 16 | `mock_responses`             | Per-question responses                                        |
| 17 | `mark_leaks`                 | Recoverable score loss by syllabus node                       |
| 18 | `college_target_analytics`   | Distance-to-Seat heatmap data                                 |
| 19 | `practice_sessions`          | Drill sessions (gap_remedy, topic_mastery, pyq, full_mock)    |
| 20 | `practice_session_items`     | Questions per practice session                                |
| 21 | `surgical_credits`           | Credit ledger                                                 |
| 22 | `cutoff_benchmarks`          | DU/BHU historical cutoffs                                    |
| 23 | `payment_orders`             | Razorpay orders                                               |
| 24 | `payment_webhook_events`     | Idempotent webhook log                                        |

---

## 3. Phase 5 — Production Lock (COMPLETE)

### Task 1: Mobile Navigation ✅
- Hamburger menu for 360px breakpoint
- MobileNavDrawer, MobileHeaderBar, NavLinks, navConfig

### Task 2: Surgical Swap ✅
- Command Center (/command-center): heatmap, proficiency, mastery trend
- Surgical Drill (/surgical-drill): mark leak banner, Gap-Remedy Start

### Task 3: Data Hardening ✅
- Zod validation: signup, POST /api/payments/order

### Task 4: Founder Console ✅
- /admin dashboard: North Star ASI, Seat Success Funnel, Cohort Mark Leak Heatmap

### Build Repair ✅
- Next.js 16: await headers(), await cookies()
- InsForge SDK: sendResetPasswordEmail({ email })

---

## 4. Deployment Readiness

- Build: `npm run build` — green
- Migrations: 002 + 003 applied
- Seed: `npm run seed:cutoffs` (run after `NOTIFY pgrst, 'reload schema'` if PGRST204)

---

*Do not commit secrets from `.env.local` or `.insforge/project.json`. Both are in `.gitignore`.*
