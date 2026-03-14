
# TestSprite AI Testing Report(MCP)

---

## 1️⃣ Document Metadata
- **Project Name:** 99plus-app
- **Date:** 2026-03-14
- **Prepared by:** TestSprite AI Team

---

## 2️⃣ Requirement Validation Summary

#### Test TC001 Create a student account successfully and reach Eligibility onboarding
- **Test Code:** [TC001_Create_a_student_account_successfully_and_reach_Eligibility_onboarding.py](./TC001_Create_a_student_account_successfully_and_reach_Eligibility_onboarding.py)
- **Test Error:** TEST FAILURE

ASSERTIONS:
- Create account failed: 'User already exists' error message is displayed on the signup page preventing account creation.
- Navigation to '/onboarding/eligibility' did not occur after clicking Create account; the application remained on the signup page.
- A new user account was not created because the provided email is already registered.
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/7abcd155-081f-4361-b572-e246663add4f/f51d5d2c-b6c8-4643-9b13-291671867e9b
- **Status:** ❌ Failed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC016 Lock eligibility snapshot for a valid subject combination
- **Test Code:** [TC016_Lock_eligibility_snapshot_for_a_valid_subject_combination.py](./TC016_Lock_eligibility_snapshot_for_a_valid_subject_combination.py)
- **Test Error:** TEST FAILURE

ASSERTIONS:
- Onboarding eligibility page '/onboarding/eligibility' not reachable: clicking the Eligibility navigation did not load the eligibility UI and the URL remains '/onboarding'.
- No 'Verify Eligibility' or 'Lock Eligibility' button/control found on the current onboarding page.
- No lock hash (SHA-256) or lock details displayed after selecting a stream option; locking behavior is not observable on this page.
- The eligibility locking flow required by the test cases appears to be absent from the current onboarding page.
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/7abcd155-081f-4361-b572-e246663add4f/161eb0aa-2778-410e-bace-907fed4f2edd
- **Status:** ❌ Failed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC018 Locked state shows lock hash after a successful verification
- **Test Code:** [TC018_Locked_state_shows_lock_hash_after_a_successful_verification.py](./TC018_Locked_state_shows_lock_hash_after_a_successful_verification.py)
- **Test Error:** TEST FAILURE

ASSERTIONS:
- Lock hash (SHA-256 or equivalent long hex identifier) not found on the eligibility page after locking — only short requirement IDs like 'REQ-2026-DU-AD388E' are present.
- 'Lock' / 'Locked' labels are visible but no immutable lock string (expected long hex, e.g., 64 hex chars) is displayed anywhere on the page.
- No visible lock hash was present in the inspected page elements or the screenshot for /onboarding/eligibility.
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/7abcd155-081f-4361-b572-e246663add4f/9033fa8a-7a64-4426-9844-d3fdecfcbb4d
- **Status:** ❌ Failed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC019 Invalid subject selection shows explicit mismatch reasons and does not lock
- **Test Code:** [TC019_Invalid_subject_selection_shows_explicit_mismatch_reasons_and_does_not_lock.py](./TC019_Invalid_subject_selection_shows_explicit_mismatch_reasons_and_does_not_lock.py)
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/7abcd155-081f-4361-b572-e246663add4f/5afd7c5b-f3be-4ca9-9d34-27bf8daa517d
- **Status:** ✅ Passed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC023 Invalid subject selection shows explicit mismatch reasons and does not lock
- **Test Code:** [TC023_Invalid_subject_selection_shows_explicit_mismatch_reasons_and_does_not_lock.py](./TC023_Invalid_subject_selection_shows_explicit_mismatch_reasons_and_does_not_lock.py)
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/7abcd155-081f-4361-b572-e246663add4f/c32e79ca-a90b-4dd1-8cef-b814cd720103
- **Status:** ✅ Passed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC025 Verify Eligibility button prevents locking when required selections are missing
- **Test Code:** [TC025_Verify_Eligibility_button_prevents_locking_when_required_selections_are_missing.py](./TC025_Verify_Eligibility_button_prevents_locking_when_required_selections_are_missing.py)
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/7abcd155-081f-4361-b572-e246663add4f/634ea97b-7035-4005-a545-ebd2bba86035
- **Status:** ✅ Passed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---


## 3️⃣ Coverage & Matching Metrics

- **50.00** of tests passed

| Requirement        | Total Tests | ✅ Passed | ❌ Failed  |
|--------------------|-------------|-----------|------------|
| ...                | ...         | ...       | ...        |
---


## 4️⃣ Key Gaps / Risks
{AI_GNERATED_KET_GAPS_AND_RISKS}
---