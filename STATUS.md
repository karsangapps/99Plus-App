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

## 7. Phase 2: NTA-Mirror Engine — STABLE

**Route:** `http://localhost:3000/nta-test/[attemptId]`
**Status:** Pixel-faithful TCS iON interface live — instructions, timer, palette, all 5 states

### New Database Tables (5 more → 15 total)

| # | Table | Notes |
|---|-------|-------|
| 11 | `question_bank` | 5 CUET questions seeded (ENG×2, MATH×2, GT×1) |
| 12 | `mock_tests` | "CUET 2026 — Baseline Mock #1" seeded, published |
| 13 | `mock_test_questions` | 5 bridge rows linking questions to the mock test |
| 14 | `mock_attempts` | Student attempt header (status, score, percentile) |
| 15 | `mock_responses` | One row per question per attempt (autosaved) |

### Files shipped

```
migrations/
├── 002_mock_engine.sql         ← DDL for all 5 tables (run ✓)
└── 002_seed_mock_engine.sql    ← 5 questions + 1 mock test (run ✓)

scripts/
└── run-migration.cjs           ← InsForge rawsql migration runner

src/app/nta-test/[attemptId]/
├── layout.tsx                  ← Bare layout (no global nav)
├── loading.tsx                 ← Skeleton
└── page.tsx                    ← Server component — fetches attempt + questions

src/components/nta-test/
├── types.ts                    ← Shared TS types + QuestionState enum
├── NtaTestShell.tsx            ← 'use client' — useReducer state manager
├── NtaInstructionsModal.tsx    ← Pre-test screen (bilingual)
├── NtaHeader.tsx               ← Timer, submit, NTA logo, candidate name
├── NtaTimer.tsx                ← Countdown clock (red flash < 5 min)
├── NtaSectionTabs.tsx          ← Subject section navigation
├── NtaQuestionPanel.tsx        ← Question display + language toggle
├── NtaOptionList.tsx           ← MCQ options A–D
├── NtaActionBar.tsx            ← Save&Next / Clear / Mark for Review
├── NtaQuestionPalette.tsx      ← Right sidebar — 5-state color grid
├── NtaPaletteLegend.tsx        ← Legend + counters per state
└── NtaLanguageToggle.tsx       ← EN/HI switcher

src/app/api/mock-attempts/
├── start/route.ts              ← POST — create or resume attempt
├── [id]/response/route.ts      ← POST — debounced autosave
└── [id]/submit/route.ts        ← POST — score + normalization + lock
```

### Palette States (all working)

| State | Color | Trigger |
|-------|-------|---------|
| `not_visited` | Gray | Unseen |
| `not_answered` | Red | Visited, no answer |
| `answered` | Green | Answer saved |
| `marked_for_review` | Purple | Flagged, no answer |
| `answered_and_marked` | Purple + green ring | Flagged + has answer |
| `current` | Blue highlight | Active question |

### Score Engine (submit route)

- raw_score = correct × marks_correct − wrong × marks_wrong
- simulated_percentile via z-score approximation (normal CDF)
- simulated_normalized_score scaled to 800
- Updates `student_profiles.account_state` → `diagnosed`

---

## 8. Diagnosis Screen §10/§12 — STABLE

**Route:** `http://localhost:3000/diagnosis/[attemptId]`
**Status:** Fully operational — Percentile gauge, Mark Leak Engine, College Heatmap, Recovery Path

### New Database Tables (3 more → 18 total)

| # | Table | Notes |
|---|-------|-------|
| 16 | `mark_leaks` | Per-question wrong-answer → NCERT chapter mapping |
| 17 | `college_target_analytics` | Seat probability snapshot per mock submission |
| 18 | `cutoff_benchmarks` | 6 DU colleges seeded (SRCC, Hindu, Hansraj, LSR, Miranda, KMC) |

### Files shipped this session

```
src/app/diagnosis/[attemptId]/
├── layout.tsx      ← Student sidebar layout
├── loading.tsx     ← Skeleton
├── page.tsx        ← Server Component (calls getDiagnosisAction)
└── actions.ts      ← 'use server' — full computation pipeline

src/components/diagnosis/
├── DiagnosisShell.tsx       ← Client wrapper
├── PercentileGauge.tsx      ← SVG animated circular gauge
├── LeakBanner.tsx           ← Dark red "N marks away" banner
├── CollegeHeatmapTable.tsx  ← Probability bars + status chips
├── GapAnalysisCard.tsx      ← Chapter breakdown + behavioral flags
└── RecoveryPathCard.tsx     ← 3-step plan + projected impact + CTA
```

### getDiagnosisAction pipeline
1. Fetches `mock_responses` + `question_bank` for the attempt
2. Classifies each wrong answer: guessing (<15s) / careless (changed>1) / speed (2.5x avg) / conceptual (difficulty≥4) / application
3. Computes severity = lost_marks × (1 + 0.3×difficulty)
4. Upserts `mark_leaks` with NCERT mapping
5. Fetches `cutoff_benchmarks` for all DU colleges
6. Computes seat heatmap: score_gap, probability (logistic), seat_status
7. Deletes + inserts `college_target_analytics`
8. Builds Recovery Prescription from top severity leak

### Screen S14 fidelity (5-screen-2.html)
- ✅ Percentile gauge with `stroke-dashoffset` animation
- ✅ Mark Leaks card with pulsing red CSS animation
- ✅ Dark red gradient leak banner with diagonal stripe overlay
- ✅ College heatmap with hover translateX + probability bars
- ✅ Gap Analysis with behavioral flag (guessing detected)
- ✅ Recovery path with 3 steps + projected impact + indigo CTA

---

## 9. Phase 2 Complete — Next: Phase 3 Surgical Drill System

The NTA-Mirror Engine is stable. Continuing Phase 2:

1. ✅ **NTA Interface** — pixel-faithful mock exam UI (question panel, timer, section nav)
2. ✅ **Question Bank** — `question_bank` table seeded with CUET-pattern questions
3. ✅ **Mock Attempt Engine** — `mock_tests`, `mock_attempts`, `mock_responses` tables
4. ✅ **Scoring + Normalization** — raw score → simulated NTA normalization model
5. ⏳ **Mark-Leak Diagnosis** — chapter-level gap analysis after each attempt
6. ⏳ **Extend eligibility seed** — add BHU, JNU, Jamia rules (PRD §8.4.2)
7. ⏳ **Diagnosis page** — `/diagnosis/[attemptId]` — score breakdown, mark leaks

---

*Do not commit secrets from `.env.local` or `.insforge/project.json`. Both are in `.gitignore`.*
