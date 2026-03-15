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

## Today’s progress (Phase 1)

- Implemented `/signup` form with age detection and InsForge-backed signup API
- Extracted guardian consent + target university chips into modular components
- Cleaned up layout/branding so the page is screen-agnostic and matches PRD flows

## Current milestone: Eligibility Guardian (§8.4)

Build the hard-lock subject validation engine:
1. Reference tables (universities / colleges / programs / eligibility_rules) seeded with DU data
2. UI at `/onboarding/eligibility` showing rule card + subject picker stepper
3. API route that validates subject selection against rules and writes lock snapshot


---

## Phase 4 — Monetization & Selection Hub (IN PROGRESS)

- [x] **Task 1 — DB: Commerce Tables** (`scripts/create_commerce_tables.sql`)
  - [x] `payment_product_type` ENUM
  - [x] `surgical_credits` — immutable ledger model (PRD §14.3.6)
  - [x] `subscriptions` — Pro Pass lifecycle (PRD §14.4.1)
  - [x] `payment_orders` — Razorpay order record (PRD §14.4.2)
  - [x] `payment_webhook_events` — idempotent webhook log (PRD §14.4.3)
  - [x] Indexes + RLS policies on all tables
  - [ ] **TODO: Run migration** via `insforge db run scripts/create_commerce_tables.sql`

- [x] **Task 2 — Security: Razorpay Webhook Handler**
  - [x] `src/app/api/payments/webhook/route.ts`
  - [x] HMAC-SHA256 signature verification (constant-time)
  - [x] Idempotency via `external_event_id UNIQUE` constraint
  - [x] Handles: `payment.captured`, `order.paid`, `subscription.activated`, `subscription.charged`, `subscription.cancelled`, `refund.processed`
  - [ ] **TODO: Set `RAZORPAY_WEBHOOK_SECRET` in `.env.local`**

- [x] **Task 3 — Frontend: Surgical Store** (`/store`)
  - [x] `src/app/store/page.tsx` — server component (fetches credit balance + Pro status)
  - [x] `src/components/store/StoreSidebar.tsx`
  - [x] `src/components/store/StoreHeader.tsx` (live credit balance widget)
  - [x] `src/components/store/StorePricingCards.tsx` (3-column pricing grid)
  - [ ] **TODO: Wire to `POST /api/payments/create-order` (Phase 4 Step 2)**

- [x] **Task 4 — Frontend: Selection Hub** (`/selection-hub`)
  - [x] `src/app/selection-hub/page.tsx` — server component with eligibility gate
  - [x] `src/components/selection-hub/SelectionHubClient.tsx`
  - [x] Preference list, Cutoff Analysis, Allotment Tracker tabs
  - [x] Pro Pass gate for preference optimiser
  - [ ] **TODO: Connect to live cutoff benchmarks table (Phase 5)**
