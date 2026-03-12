## Task Master

- [x] Next.js Scaffold (DONE)
- [x] Database Tables (DONE)

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
- [ ] **Eligibility Guardian §8.4** ← IN PROGRESS
  - [ ] DB: `universities`, `colleges`, `programs`, `eligibility_rules` tables
  - [ ] Seed: DU — B.Com (Hons) + B.A. Pol Science (Hons) rules
  - [ ] UI: `/onboarding/eligibility` — rule display, subject picker, hard-lock CTA
  - [ ] API: `POST /api/eligibility/validate` — rule engine + lock snapshot
  - [ ] DB: `eligibility_lock_snapshots`, `student_subject_locks` tables

## Notes

- Dev server: `npm run dev`
- First screen: `/onboarding`

## Today’s progress (Phase 1)

- Implemented `/signup` form with age detection and InsForge-backed signup API
- Extracted guardian consent + target university chips into modular components
- Cleaned up layout/branding so the page is screen-agnostic and matches PRD flows

## Current milestone: Eligibility Guardian (§8.4)

Build the hard-lock subject validation engine:
1. Reference tables (universities / colleges / programs / eligibility_rules) seeded with DU data
2. UI at `/onboarding/eligibility` showing rule card + subject picker stepper
3. API route that validates subject selection against rules and writes lock snapshot

