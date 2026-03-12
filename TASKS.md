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
- [ ] Legal Gatekeeper (DOB minor check + guardian OTP hard gate)
- [ ] Consent audit trail (`consent_logs`) for guardian verification

## Notes

- Dev server: `npm run dev`
- First screen: `/onboarding`

## Today’s progress (Phase 1)

- Implemented `/signup` form with age detection and InsForge-backed signup API
- Extracted guardian consent + target university chips into modular components
- Cleaned up layout/branding so the page is screen-agnostic and matches PRD flows

## First task for tomorrow

- [ ] Guardian Consent flow: implement end-to-end OTP verification + `guardian_pending` → `guardian_verified` state transition (UI + API), using `guardian/consent` screen as reference.

