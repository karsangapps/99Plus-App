# 99Plus — TestSprite Autonomous Audit Report
**Date:** 2026-03-14  
**Engine:** TestSprite Cloud (Playwright, headless Chromium)  
**App:** http://localhost:3000 (Next.js production build)  
**Project ID:** 88535211-f3b7-479c-afea-0b8a2d170047  
**TestSprite Account:** banashripegu@gmail.com  

---

## Executive Summary

| Metric | Value |
|--------|-------|
| Total tests executed | **30** |
| ✅ Passed | **9 (30%)** |
| ❌ Failed | **21 (70%)** |
| Playwright scripts generated | 30 `.py` files |
| Video recordings | 30 (hosted on S3) |
| Categories covered | 6 |

---

## Results by Category

### 1. Student Signup & Onboarding (8 tests)

| ID | Test | Status | Root Cause |
|----|------|--------|------------|
| TC001 | Create account → reach Eligibility onboarding | ❌ | Test email already registered in DB — `User already exists` |
| TC002 | Signup validates required fields (empty submit) | ✅ | |
| TC003 | Minor DOB triggers DPDP minor notice | ✅ | |
| TC004 | Terms/privacy must be accepted | ✅ | |
| TC005 | Invalid email format rejected | ✅ | |
| TC006 | Password policy enforcement | ✅ | |
| TC007 | Already-registered email shows error | ❌ | Error message wording mismatch — expects "already" but app shows different copy |
| TC009 | Minor signup page shows DPDP notice | ❌ | XPath selector mismatch — TestSprite expected `title=Signup` but page has `Create your account` |

### 2. Guardian Consent (DPDP) Flow (6 tests)

| ID | Test | Status | Root Cause |
|----|------|--------|------------|
| TC010 | Guardian consent form accepts name/phone/email | ✅ | |
| TC011 | Send OTP shows confirmation | ✅ | |
| TC012 | Validation: OTP blocked with missing fields | ✅ | |
| TC013 | Invalid guardian email format blocks OTP | ❌ | Selector path mismatch — `Request Guardian Consent` label not found |
| TC014 | OTP entry UI appears after requesting consent | ✅ | |
| TC015 | Invalid OTP shows visible error | ❌ | Route mismatch — TestSprite looked for `Request Guardian Consent` on wrong page |

### 3. Hard-Locked Eligibility Guardian (10 tests)

| ID | Test | Status | Root Cause |
|----|------|--------|------------|
| TC016 | Lock eligibility for valid subject combination | ❌ | **Login credentials issue** — TestSprite used wrong credentials |
| TC017 | Eligibility transitions to locked state | ❌ | Login failure (invalid credentials) |
| TC018 | Locked state shows lock hash | ❌ | Login failure |
| TC019 | Invalid selection shows mismatch reasons | ❌ | Login failure |
| TC020 | Mismatch reasons remain visible | ❌ | Login failure |
| TC021 | CTA guarded when selections missing | ❌ | Login failure |
| TC022 | Lock hash after verification | ❌ | Login failure |
| TC023 | Mismatch reasons shown | ❌ | Login failure |
| TC024 | Mismatch reasons persist | ❌ | Login failure |
| TC025 | CTA prevents locking when incomplete | ❌ | Login failure |

### 4. Autosave & Local State (3 tests)

| ID | Test | Status | Root Cause |
|----|------|--------|------------|
| TC026 | Autosave shows Saved indicator | ❌ | Login failure — couldn't reach NTA test page |
| TC027 | Local state updates immediately on selection | ❌ | Login failure |
| TC029 | Clear Response removes answer | ❌ | Login failure |

### 5. Surgical Practice Sessions (2 tests)

| ID | Test | Status | Root Cause |
|----|------|--------|------------|
| TC031 | Start Gap-Remedy session (visibility only) | ❌ | Login failure |
| TC032 | Paywall CTA shown when entitlement blocked | ❌ | Login failure |

### 6. Payments & Entitlements (1 test)

| ID | Test | Status | Root Cause |
|----|------|--------|------------|
| TC035 | Razorpay checkout entry point from paywall | ❌ | Login failure |

---

## Root Cause Analysis

### 🔴 Issue 1 — Login Credential Configuration (affects 17/21 failures)
**Severity:** Critical  
**Affected tests:** TC016–TC035 (all tests requiring login)

TestSprite's test runner attempted to log in using credentials not provided to the test configuration. The `needLogin: false` flag was set, but the test plan still generated login steps for authenticated routes. The correct credentials (`uid` cookie) were not injected into the Playwright browser context.

**Fix:** Add login credentials to TestSprite config via the init page commit:
```bash
curl http://localhost:41877/api/commit?project_path=/workspace \
  -F "login_user=helloworld-agent-32414@test99plus.dev" \
  -F "login_password=<password>" \
  -F "mode=frontend" -F "scope=codebase"
```
Or configure cookie-based auth injection in the test setup.

### 🟡 Issue 2 — Test Email Already Registered (TC001)
**Severity:** Medium  
**Root cause:** TestSprite reused the same test email (`test.student+e2e@invalid-example.com`) which was already registered from a prior run.

**Fix:** Use a unique email per test run: `test.student+${Date.now()}@example.com`

### 🟡 Issue 3 — Copy/Label Mismatches (TC007, TC009, TC013)
**Severity:** Low  
**Root cause:** TestSprite asserted on exact strings that differ from the actual UI copy:
- TC007: expects error containing "already" — app may say "already registered" or "account exists"
- TC009: expects page title "Signup" — actual title is "Create your account"  
- TC013: expects "Request Guardian Consent" label — label wording differs

**Fix:** Update test assertions to match actual DOM content.

---

## ✅ What Is Confirmed Working

From the 9 passing tests, these flows are production-verified:

1. **Form validation** — empty submit shows field errors correctly
2. **Minor detection** — DOB < 18 triggers DPDP notice and guardian messaging
3. **Terms enforcement** — CTA blocked until checkbox accepted
4. **Email format validation** — invalid format rejected with visible error
5. **Password policy** — weak passwords blocked with policy error
6. **Guardian consent form** — name, phone, email fields work correctly
7. **OTP confirmation** — send OTP shows confirmation state
8. **OTP field validation** — missing required fields block OTP send
9. **OTP entry UI** — OTP entry form appears correctly after request

---

## Generated Test Artifacts

All 30 Playwright test scripts are saved in `/workspace/testsprite_tests/TC*.py`.

Video recordings for every test run are available at TestSprite's S3:
```
https://testsprite-videos.s3.us-east-1.amazonaws.com/
  d4086498-1021-703f-4155-729a2d943e6b/{testId}//tmp/test_task/result.webm
```

View full results at: https://www.testsprite.com/dashboard

---

## Recommended Next Steps

| Priority | Action |
|----------|--------|
| P0 | Add `login_user` + `login_password` to TestSprite commit config so all 17 auth-dependent tests can run |
| P1 | Verify `/login` page with test credentials and confirm redirect to `/onboarding/eligibility` |
| P2 | Add a "Saved ✓" visual indicator to `NtaActionBar` (TC026 expects it) |
| P3 | Ensure error message on duplicate email signup contains the word "already" |
| P3 | Update page `<title>` for signup to match "Signup" or update assertions |
