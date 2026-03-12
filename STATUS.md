# 99Plus — Memory Anchor
**Date:** Thursday, 12 March 2026
**Session:** Phase 1 complete → Phase 2 started (Eligibility Guardian)

---

## 1. InsForge Connection

| Field          | Value                                          |
|----------------|------------------------------------------------|
| Status         | ✅ Connected and verified                      |
| Project Name   | 99Plus                                         |
| Project ID     | `5ef73f5a-235e-4b26-acfe-3345e5dbd682`         |
| App Key        | `s23f7sag`                                     |
| Region         | `ap-southeast`                                 |
| OSS Host       | `https://s23f7sag.ap-southeast.insforge.app`   |
| Auth User      | `banashripegu@gmail.com`                       |
| CLI command    | `npx @insforge/cli current`                    |

---

## 2. Database Tables (8 total in `public` schema)

| # | Table               | Columns | Records | Notes                                     |
|---|---------------------|---------|---------|-------------------------------------------|
| 1 | `users`             | 9       | 0       | RLS ON — `users_insert_own` policy added  |
| 2 | `student_profiles`  | 19      | 0       | RLS OFF                                   |
| 3 | `consent_logs`      | 16      | 0       | RLS OFF — DPDP audit trail                |
| 4 | `user_targets`      | 12      | 0       | RLS OFF                                   |
| 5 | `universities`      | 7       | 1       | DU seeded (`short_code = 'DU'`)           |
| 6 | `colleges`          | 7       | 2       | SRCC, LSR seeded                          |
| 7 | `programs`          | 8       | 2       | B.Com (Hons) @ SRCC, B.A. Pol Sci @ LSR  |
| 8 | `eligibility_rules` | 17      | 2       | DU rules seeded — see Section 4 below     |

### Seeded Eligibility Rules

| Program                       | Mandatory  | Alternative Group            | Min Domains |
|-------------------------------|------------|------------------------------|-------------|
| B.Com (Hons) — SRCC           | English    | Mathematics OR Accountancy   | 2           |
| B.A. Political Science (Hons) — LSR | English | —                       | 3           |

---

## 3. Current State of `/onboarding/eligibility`

**Route:** `http://localhost:3000/onboarding/eligibility`
**Status:** ✅ Scaffold complete — UI renders, Lock CTA disabled (next sprint)

### Files created today

```
src/app/onboarding/eligibility/
└── page.tsx                         ← server component, fetches rules by student target

src/components/eligibility/
├── EligibilityShell.tsx             ← sticky header (shield + "HARD-LOCK VERIFICATION PROTOCOL"), hex-pattern bg
├── EligibilityStepper.tsx           ← 3-step: Dream Mapping ✓ → Eligibility Lock (active) → Battle Plan
└── EligibilityRuleCard.tsx          ← per-program rule display: Mandatory / Alternative / Recommended tags
```

### What the page does right now
- Reads `uid` cookie → looks up student's `user_targets` → fetches matching `eligibility_rules`
- Falls back to DU seed data if no target set yet
- Renders rule cards with subject rows and lock icons
- Green "Confirmed Locked" state shown for mandatory subjects
- **Lock CTA button is rendered but disabled** — wired in next sprint

### What is NOT built yet (next sprint)
- `POST /api/eligibility/validate` — rule engine + tamper-proof lock hash
- `eligibility_lock_snapshots` table
- `student_subject_locks` table
- Subject picker UI (student selects their CUET subjects)
- `account_state = eligibility_locked` transition on `student_profiles`

---

## 4. Critical Bug Fixed Today — The 500 Lock Error

### Root cause
`requireEmailVerification` was `true` in InsForge auth config.

After `insforge.auth.signUp()`, when email verification is required, **no `accessToken` is returned** — the SDK client has no authenticated session. Every subsequent `database.insert()` ran as the `anon` role. The `public.users` table has RLS enabled with **no INSERT policy for `anon`** → insert silently blocked → API returned 500.

### Fix 1 — Disable email verification (admin HTTP API)
```powershell
Invoke-RestMethod `
  -Uri "https://s23f7sag.ap-southeast.insforge.app/api/auth/config" `
  -Method PUT `
  -Headers @{ "Authorization" = "Bearer ik_1d681ab8a2174104863d70ef60bf4811"; "Content-Type" = "application/json" } `
  -Body '{"requireEmailVerification": false, "passwordMinLength": 6}'
```
Result: `requireEmailVerification: false` — `signUp()` now returns `accessToken` immediately.

### Fix 2 — Add RLS INSERT policy for `authenticated` role
```sql
CREATE POLICY "users_insert_own" ON public.users
FOR INSERT TO authenticated
WITH CHECK (auth.uid() = id);
```
Run via: `npx @insforge/cli db import <sql-file>` or `db query`.

### Fix 3 — Await `cookies()` and `headers()` (Next.js 16)
In `src/app/api/auth/signup/route.ts`:
```ts
// WRONG (crashes in Next.js 15/16):
cookies().set(...)
const h = headers()

// CORRECT:
const cookieStore = await cookies()
cookieStore.set(...)
const h = await headers()
```

### Fix 4 — SignupForm toggle (silent validation block)
```ts
// WRONG: raw setter preserves old field value on toggle
onConsentMethodChange={setConsentMethod}

// CORRECT: clear opposite field when switching SMS ↔ Email
function handleConsentMethodChange(method: ConsentMethod) {
  setConsentMethod(method)
  if (method === 'sms') setGuardianEmail('')
  if (method === 'email') setGuardianPhone('')
}
```

---

## 5. InsForge MCP Server (Cursor Sidebar)

The InsForge MCP dot was red. Fix applied to `~/.cursor/mcp.json`:
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

| Field    | Value                                              |
|----------|----------------------------------------------------|
| Remote   | `https://github.com/karsangapps/99Plus-App.git`    |
| Branch   | `master`                                           |
| Latest   | `7ce6f85` — Phase 1: Database tables created and Onboarding scaffolded |
| Previous | `4aa4808` — Phase 1: Signup, Login, and Branding cleanup complete |

---

## 7. Tomorrow's Goal — Eligibility Guardian §8.4 (continue)

1. **Subject Picker UI** — student selects their CUET subjects from a list
2. **Rule Engine API** — `POST /api/eligibility/validate` validates subjects against `eligibility_rules`
3. **Lock Snapshot** — on valid: insert `eligibility_lock_snapshots`, update `user_targets.status = locked`
4. **New tables** — `eligibility_lock_snapshots`, `student_subject_locks`
5. **Extend seed data** — add BHU, JNU, Jamia rules (PRD §8.4.2)

---

*Generated automatically at end of session. Do not commit secrets from `.cursor/rules/.env.local`.*
