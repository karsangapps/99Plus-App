# 99Plus — Memory Anchor
**Date:** Friday, 13 March 2026
**Session:** Eligibility Guardian §8.4 complete → Phase 2 (NTA-Mirror Engine) is next

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

## 2. Database Tables (10 total in `public` schema)

| #  | Table                        | Notes                                                         |
|----|------------------------------|---------------------------------------------------------------|
| 1  | `users`                      | RLS ON — `users_insert_own` policy                           |
| 2  | `student_profiles`           | `account_state` transitions through onboarding stages        |
| 3  | `consent_logs`               | DPDP guardian consent audit trail                            |
| 4  | `user_targets`               | Student's selected university/college/program targets        |
| 5  | `universities`               | DU seeded — `short_code = 'DU'`, `id = 00000001-...`        |
| 6  | `colleges`                   | SRCC, LSR seeded under DU                                     |
| 7  | `programs`                   | B.Com (Hons) @ SRCC, B.A. Political Science (Hons) @ LSR    |
| 8  | `eligibility_rules`          | 2 active rules, fully seeded — see Section 4                 |
| 9  | `eligibility_lock_snapshots` | Immutable lock events — RLS owner-only                       |
| 10 | `student_subject_locks`      | One row per locked subject per student — RLS owner-only      |

### Seeded Eligibility Rules (DU 2026)

| Program                             | Mandatory | Alternative Group                                              | Min Domains |
|-------------------------------------|-----------|----------------------------------------------------------------|-------------|
| B.Com (Hons) — SRCC                 | English   | Mathematics OR Accountancy (pick 1)                           | 2           |
| B.A. Political Science (Hons) — LSR | English   | Pol Sci / History / Sociology / Economics / Geography / Psychology (pick 3) | 3 |

---

## 3. Eligibility Guardian §8.4 — STABLE

**Route:** `http://localhost:3000/onboarding/eligibility`
**Status:** Fully operational — subject picker live, hard-lock CTA wired, SHA-256 receipt permanent

### Files shipped this session

```
src/app/onboarding/eligibility/
└── page.tsx                    ← server component, fetches rules by student target

src/app/onboarding/battle/
└── page.tsx                    ← placeholder (404 fix) — Battle Plan landing

src/app/api/eligibility/
└── validate/route.ts           ← POST — rule engine + lock snapshot writer

src/components/eligibility/
├── EligibilityShell.tsx        ← sticky header, hex-pattern bg (unchanged)
├── EligibilityStepper.tsx      ← 3-step progress bar (unchanged)
├── EligibilityRuleCard.tsx     ← upgraded: checkboxes for optional subjects
└── EligibilityClient.tsx       ← new client wrapper — state, CTA guard, lock action
```

### What the page does now
- Reads `uid` cookie → looks up student's `user_targets` → fetches matching `eligibility_rules`
- Falls back to DU seed data if no target set yet
- Mandatory subjects (English) are permanently locked — no toggle
- Optional/recommended subjects render interactive checkboxes
- "Lock Eligibility" CTA is **disabled** until all optional group minimums are satisfied (client-side guard)
- On successful lock: inserts `eligibility_lock_snapshots` + `student_subject_locks`, sets `account_state = eligibility_locked`
- Displays full SHA-256 tamper-proof hash receipt — user must click "Continue to Battle Plan" to proceed (no auto-redirect)

### Key fixes applied
- **404 eliminated** — `/onboarding/battle` now exists and returns 200
- **Receipt stays on screen** — removed `setTimeout` auto-redirect; user controls navigation after reviewing the lock hash

---

## 4. Historical Bug Fixes (Phase 1)

### 500 Lock Error — Root cause & fix
`requireEmailVerification` was `true` in InsForge auth config — `signUp()` returned no `accessToken`, all DB inserts ran as `anon` and were blocked by RLS.

**Fix 1** — Disabled email verification via admin HTTP API
**Fix 2** — Added `CREATE POLICY "users_insert_own"` for authenticated role on `public.users`
**Fix 3** — Awaited `cookies()` and `headers()` (Next.js 16 requirement)
**Fix 4** — SignupForm toggle clears opposite guardian contact field when switching SMS ↔ Email

---

## 5. InsForge MCP Server (Cursor Sidebar)

```json
"insforge": {
  "command": "npx",
  "args": ["-y", "@insforge/mcp@latest"],
  "env": {
    "INSFORGE_PROJECT_URL": "https://s23f7sag.ap-southeast.insforge.app",
    "INSFORGE_API_KEY": "ik_1d681ab8a2174104863d70ef60bf4811"
  }
}
```
Toggle the server off/on in Cursor Settings → Agents to activate.

---

## 6. GitHub

| Field    | Value                                                              |
|----------|--------------------------------------------------------------------|
| Remote   | `https://github.com/karsangapps/99Plus-App.git`                    |
| Branch   | `master`                                                           |
| Latest   | `dd9ac86` — Fixed Eligibility redirect and 404 bug                 |
| Previous | `dccd4e0` — Finished Eligibility Guardian §8.4                     |

---

## 7. Next Session — Phase 2: NTA-Mirror Engine

The Eligibility Guardian is stable and pushed. Phase 2 begins with the NTA Mock Simulator:

1. **NTA Interface** — pixel-faithful mock exam UI (question panel, timer, section nav)
2. **Question Bank** — `question_bank` table seeded with CUET-pattern questions
3. **Mock Attempt Engine** — `mock_tests`, `mock_attempts`, `mock_responses` tables
4. **Scoring + Normalization** — raw score → simulated NTA normalization model
5. **Mark-Leak Diagnosis** — chapter-level gap analysis after each attempt
6. **Extend eligibility seed** — add BHU, JNU, Jamia rules (PRD §8.4.2)

---

*Do not commit secrets from `.env.local` or `.insforge/project.json`. Both are in `.gitignore`.*
