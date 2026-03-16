## Task Master

- [x] Next.js Scaffold (DONE)
- [x] Database Tables (DONE)
- [x] Setup (DONE)
- [x] Build Fixes (DONE)

# Tasks / Progress Log

This repo is tracking work manually (Task Master PRD parsing requires a Perplexity key we don't have).

## Status

- [x] Next.js Scaffold
- [x] Onboarding Screen 1 (Dream Target) UI
- [x] Save Dream Target to `student_profiles` (server route)
- [x] Real Signup Flow (Komposo "Create your account")
- [x] Signup layout + branding cleanup (2-column desktop, mobile-friendly)
- [x] Google OAuth entry wired via InsForge SDK
- [x] Legal Gatekeeper (DOB minor check + guardian OTP hard gate)
- [x] Consent audit trail (`consent_logs`) for guardian verification
- [x] **Eligibility Guardian §8.4** ← DONE
  - [x] DB: `universities`, `colleges`, `programs`, `eligibility_rules` tables
  - [x] Seed: DU — B.Com (Hons) + B.A. Pol Science (Hons) rules
  - [x] UI: `/onboarding/eligibility` — rule display, subject picker, hard-lock CTA
  - [x] API: `POST /api/eligibility/validate` — rule engine + lock snapshot
  - [x] DB: `eligibility_lock_snapshots`, `student_subject_locks` tables

## Notes

- Dev server: `npm run dev`
- First screen: `/onboarding`

## Today’s progress (Phase 5 - Task 1)

- Implemented functional Hamburger Menu for 360px mobile breakpoint
- Created shared navConfig, NavLinks, MobileNavDrawer, MobileHeaderBar
- Drawer: slide-in animation, backdrop close, nav link close, Escape key, body scroll lock
- Verified layout at 360px: no fixed widths breaking layout

## Phase 5 — Launch Sequence

### Task 1: Mobile Navigation ✅ DONE
- [x] Hamburger menu for mobile breakpoint (360px)
- [x] `src/lib/navConfig.ts` — shared nav items
- [x] `OnboardingSidebar` refactored to use `NavLinks` + navConfig
- [x] `MobileNavDrawer` — slide-in drawer with backdrop, Escape key, scroll lock
- [x] `MobileHeaderBar` — hamburger + title + badges (lg:hidden)
- [x] Wired in `OnboardingDreamTargetClient`
- [x] Verified at 360px: drawer opens/closes, backdrop works, no fixed-width breakage

### Build Repair ✅ DONE
- [x] `headers()` and `cookies()` — await for Next.js 16 Promise API
- [x] `sendResetPasswordEmail({ email })` — InsForge SDK compatibility

### Production Lock — DONE
- [x] migrations/003_production_tables.sql (cutoff_benchmarks, payment_orders, payment_webhook_events, subscriptions)
- [x] scripts/seed-cutoff-benchmarks.ts (DU + BHU historical cutoffs)
- [x] Zod validation: signup, POST /api/payments/order
- [x] /admin dashboard: North Star ASI, Seat Success Funnel, Cohort Mark Leak Heatmap
- [x] POST /api/payments/order with Zod

### Task 2: Surgical Swap — DONE
- [x] Command Center page — live data (heatmap, proficiency, mastery trend)
- [x] Surgical Drill page — live data (mark leak banner, Gap-Remedy Start)
- [x] DB migrations SQL — `migrations/002_surgical_swap_tables.sql` (run via InsForge)
- [x] API routes: `/api/command-center`, `/api/surgical-drill`, `POST /api/practice-sessions/start`
- [x] StudentDashboardLayout + nav config (Command Center → /command-center)

### Previous milestone: Eligibility Guardian (§8.4)

Build the hard-lock subject validation engine:
1. Reference tables (universities / colleges / programs / eligibility_rules) seeded with DU data
2. UI at `/onboarding/eligibility` showing rule card + subject picker stepper
3. API route that validates subject selection against rules and writes lock snapshot

