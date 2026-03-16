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

### Previous milestone: Eligibility Guardian (§8.4)

Build the hard-lock subject validation engine:
1. Reference tables (universities / colleges / programs / eligibility_rules) seeded with DU data
2. UI at `/onboarding/eligibility` showing rule card + subject picker stepper
3. API route that validates subject selection against rules and writes lock snapshot

