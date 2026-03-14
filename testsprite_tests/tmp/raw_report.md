
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
- Signup did not navigate to '/onboarding/eligibility' after submitting the Create account form.
- 'User already exists' error message is displayed on the signup page.
- Current URL remains '/signup' indicating no redirect to the eligibility onboarding page.
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/88535211-f3b7-479c-afea-0b8a2d170047/5e9c9049-c82c-44df-85e0-649699935989
- **Status:** ❌ Failed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC002 Signup form validates required fields when submitted empty
- **Test Code:** [TC002_Signup_form_validates_required_fields_when_submitted_empty.py](./TC002_Signup_form_validates_required_fields_when_submitted_empty.py)
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/88535211-f3b7-479c-afea-0b8a2d170047/7c76d7f7-d11a-48d4-a83d-5d50382b19aa
- **Status:** ✅ Passed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC003 Minor DOB triggers DPDP minor notice and guardian-pending messaging
- **Test Code:** [TC003_Minor_DOB_triggers_DPDP_minor_notice_and_guardian_pending_messaging.py](./TC003_Minor_DOB_triggers_DPDP_minor_notice_and_guardian_pending_messaging.py)
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/88535211-f3b7-479c-afea-0b8a2d170047/46924b68-a1f4-432c-a5d9-6798f3c99ebc
- **Status:** ✅ Passed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC009 Minor signup page shows DPDP notice and guardian consent entry point
- **Test Code:** [TC009_Minor_signup_page_shows_DPDP_notice_and_guardian_consent_entry_point.py](./TC009_Minor_signup_page_shows_DPDP_notice_and_guardian_consent_entry_point.py)
- **Test Error:** TEST FAILURE

ASSERTIONS:
- Page title does not contain 'Signup' (page title: 'Create your account').
- 'Guardian' string not found on signup page.
- 'Request Guardian Consent' element not present or visible on signup page.
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/88535211-f3b7-479c-afea-0b8a2d170047/f4dfbc2a-fa50-41e7-b768-6ef66957f356
- **Status:** ❌ Failed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC010 Request guardian consent form accepts guardian name, phone, and email
- **Test Code:** [TC010_Request_guardian_consent_form_accepts_guardian_name_phone_and_email.py](./TC010_Request_guardian_consent_form_accepts_guardian_name_phone_and_email.py)
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/88535211-f3b7-479c-afea-0b8a2d170047/aecce1c7-f2f5-42cf-b5c0-2bce1656be10
- **Status:** ✅ Passed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC011 Send OTP shows confirmation that OTP/link was sent
- **Test Code:** [TC011_Send_OTP_shows_confirmation_that_OTPlink_was_sent.py](./TC011_Send_OTP_shows_confirmation_that_OTPlink_was_sent.py)
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/88535211-f3b7-479c-afea-0b8a2d170047/2cdf17b0-cd0b-489d-8fdb-20fb7b31803a
- **Status:** ✅ Passed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC014 OTP entry UI appears after requesting consent and supports verification attempt
- **Test Code:** [TC014_OTP_entry_UI_appears_after_requesting_consent_and_supports_verification_attempt.py](./TC014_OTP_entry_UI_appears_after_requesting_consent_and_supports_verification_attempt.py)
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/88535211-f3b7-479c-afea-0b8a2d170047/4d639de3-5994-40ee-b87e-65c8635d2eea
- **Status:** ✅ Passed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC015 Invalid OTP shows a visible error and remains on OTP entry state
- **Test Code:** [TC015_Invalid_OTP_shows_a_visible_error_and_remains_on_OTP_entry_state.py](./TC015_Invalid_OTP_shows_a_visible_error_and_remains_on_OTP_entry_state.py)
- **Test Error:** TEST FAILURE

ASSERTIONS:
- Request Guardian Consent control not found on the signup page
- Guardian-specific input fields (guardian name, guardian phone, guardian email) for requesting consent are not present on the page
- No 'Send OTP' or 'Verify OTP' buttons or an OTP input field are visible on the signup page
- OTP verification behavior could not be validated because the prerequisite guardian consent/OTP UI is not available
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/88535211-f3b7-479c-afea-0b8a2d170047/c2f57560-0f3b-46a6-a025-6e67122d3fb2
- **Status:** ❌ Failed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC016 Lock eligibility snapshot for a valid subject combination
- **Test Code:** [TC016_Lock_eligibility_snapshot_for_a_valid_subject_combination.py](./TC016_Lock_eligibility_snapshot_for_a_valid_subject_combination.py)
- **Test Error:** TEST FAILURE

ASSERTIONS:
- Invalid credentials message displayed after submitting credentials, indicating login did not succeed
- URL remains on '/login' and did not navigate to '/onboarding/eligibility' after login attempts
- Sign in action did not authenticate the session; onboarding/eligibility page not accessible, blocking further test steps
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/88535211-f3b7-479c-afea-0b8a2d170047/7f1d4fa7-f636-4965-b0a0-73502b0911cd
- **Status:** ❌ Failed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC017 Complete selections and verify eligibility transitions to locked state
- **Test Code:** [TC017_Complete_selections_and_verify_eligibility_transitions_to_locked_state.py](./TC017_Complete_selections_and_verify_eligibility_transitions_to_locked_state.py)
- **Test Error:** TEST FAILURE

ASSERTIONS:
- Login failed - "Invalid credentials" message displayed on the login page.
- Onboarding/eligibility page not reached - URL does not contain "/onboarding/eligibility" after submitting credentials.
- Authentication did not complete despite entering credentials and clicking Sign in, preventing continuation to the eligibility flow.
- Sign-in form remains visible with email and password filled, indicating no authenticated session was established.
- No alternative authentication or bypass is available on the current page to continue the test.
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/88535211-f3b7-479c-afea-0b8a2d170047/ace852bb-d6b3-4396-81a6-2810487a1987
- **Status:** ❌ Failed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC018 Locked state shows lock hash after a successful verification
- **Test Code:** [TC018_Locked_state_shows_lock_hash_after_a_successful_verification.py](./TC018_Locked_state_shows_lock_hash_after_a_successful_verification.py)
- **Test Error:** TEST FAILURE

ASSERTIONS:
- Sign in button not found on page as an interactive element
- Login could not be performed; onboarding/eligibility page could not be reached
- Unable to verify presence of lock hash because the precondition (successful login and verification) could not be completed
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/88535211-f3b7-479c-afea-0b8a2d170047/38e49409-1b47-4f62-a0fc-f6ce59615316
- **Status:** ❌ Failed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC019 Invalid subject selection shows explicit mismatch reasons and does not lock
- **Test Code:** [TC019_Invalid_subject_selection_shows_explicit_mismatch_reasons_and_does_not_lock.py](./TC019_Invalid_subject_selection_shows_explicit_mismatch_reasons_and_does_not_lock.py)
- **Test Error:** TEST FAILURE

ASSERTIONS:
- Sign in button not found on login page
- Unable to complete login - no clickable login control to submit credentials
- Onboarding eligibility page could not be reached because login cannot be completed
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/88535211-f3b7-479c-afea-0b8a2d170047/c503b1d7-0b43-4a58-8181-d22c23a7dfdd
- **Status:** ❌ Failed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC021 Verify Eligibility button prevents locking when required selections are missing
- **Test Code:** [TC021_Verify_Eligibility_button_prevents_locking_when_required_selections_are_missing.py](./TC021_Verify_Eligibility_button_prevents_locking_when_required_selections_are_missing.py)
- **Test Error:** TEST FAILURE

ASSERTIONS:
- Login failed - 'Invalid credentials' error displayed after submitting credentials.
- Onboarding page '/onboarding/eligibility' not reached; current page remains the login page.
- Cannot verify 'Verify Eligibility' behavior because access to the onboarding page was blocked by authentication.
- No navigation element on the login page leads to the onboarding/eligibility page.
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/88535211-f3b7-479c-afea-0b8a2d170047/2afddc44-cc15-465e-9380-856e8ae88343
- **Status:** ❌ Failed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC022 Locked state shows lock hash after a successful verification
- **Test Code:** [TC022_Locked_state_shows_lock_hash_after_a_successful_verification.py](./TC022_Locked_state_shows_lock_hash_after_a_successful_verification.py)
- **Test Error:** TEST FAILURE

ASSERTIONS:
- Login failed - 'Invalid credentials' message displayed on the login page.
- Onboarding eligibility page not reached after sign-in attempts; current URL remains on '/login'.
- No visible UI element available to bypass authentication and reach the onboarding eligibility page.
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/88535211-f3b7-479c-afea-0b8a2d170047/76805df2-d263-42f5-a5ee-e7863867a8d7
- **Status:** ❌ Failed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC023 Invalid subject selection shows explicit mismatch reasons and does not lock
- **Test Code:** [TC023_Invalid_subject_selection_shows_explicit_mismatch_reasons_and_does_not_lock.py](./TC023_Invalid_subject_selection_shows_explicit_mismatch_reasons_and_does_not_lock.py)
- **Test Error:** TEST FAILURE

ASSERTIONS:
- Authentication failed: 'Invalid credentials' message displayed after submitting the login form.
- Required authentication cookie 'uid' (da159e75-0fad-4a07-a054-dfe0df47b972) could not be set via the page UI or available interactive elements.
- Onboarding page (/onboarding/eligibility) was not reached because login did not succeed and no alternative authentication mechanism is available.
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/88535211-f3b7-479c-afea-0b8a2d170047/f63e6884-8fa2-4926-bb64-52c602d4de0d
- **Status:** ❌ Failed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC025 Verify Eligibility button prevents locking when required selections are missing
- **Test Code:** [TC025_Verify_Eligibility_button_prevents_locking_when_required_selections_are_missing.py](./TC025_Verify_Eligibility_button_prevents_locking_when_required_selections_are_missing.py)
- **Test Error:** TEST FAILURE

ASSERTIONS:
- Login failed - 'Invalid credentials' message displayed on the login page after submitting credentials.
- Onboarding/eligibility page not reached - current URL remains /login.
- No authenticated session available to access /onboarding/eligibility (provided credentials rejected and automated cookie-based authentication was not applied).
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/88535211-f3b7-479c-afea-0b8a2d170047/294d32a6-143c-424d-85e0-a2b3a244dd77
- **Status:** ❌ Failed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC026 Autosave success shows Saved indicator after answering
- **Test Code:** [TC026_Autosave_success_shows_Saved_indicator_after_answering.py](./TC026_Autosave_success_shows_Saved_indicator_after_answering.py)
- **Test Error:** TEST FAILURE

ASSERTIONS:
- Login failed - 'Invalid credentials' error message displayed on the login page
- Onboarding/Eligibility page not reached; current URL remains /login and no redirect occurred
- Unable to verify UI update and autosave behavior because authentication did not complete
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/88535211-f3b7-479c-afea-0b8a2d170047/898ed6bb-8bd6-4eb0-9069-2559c526a698
- **Status:** ❌ Failed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC027 Local state updates immediately on option selection (before save confirmation)
- **Test Code:** [TC027_Local_state_updates_immediately_on_option_selection_before_save_confirmation.py](./TC027_Local_state_updates_immediately_on_option_selection_before_save_confirmation.py)
- **Test Error:** TEST FAILURE

ASSERTIONS:
- Login failed - 'Invalid credentials' error displayed after submitting credentials.
- Onboarding page not reached - URL did not change to contain '/onboarding/eligibility' after signing in.
- Selected answer option could not be verified because the onboarding page was not accessible due to failed authentication.
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/88535211-f3b7-479c-afea-0b8a2d170047/9ffc60e5-e1f5-49bd-82e9-ce43fb66306b
- **Status:** ❌ Failed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC029 Clear Response removes the selected answer and returns to unanswered state
- **Test Code:** [TC029_Clear_Response_removes_the_selected_answer_and_returns_to_unanswered_state.py](./TC029_Clear_Response_removes_the_selected_answer_and_returns_to_unanswered_state.py)
- **Test Error:** TEST FAILURE

ASSERTIONS:
- Invalid credentials error displayed after submitting login form; authentication did not succeed.
- Login page did not redirect to '/onboarding/eligibility' after attempting to sign in.
- Sign in button click was performed but the email/password inputs and the error message remained visible.
- The test requires an authenticated session to proceed and the provided credentials produced an authentication error.
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/88535211-f3b7-479c-afea-0b8a2d170047/d48ee573-25f7-4885-8be8-f005d41dbf0e
- **Status:** ❌ Failed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC031 Start Gap-Remedy session from diagnosis leak (happy path visibility only)
- **Test Code:** [TC031_Start_Gap_Remedy_session_from_diagnosis_leak_happy_path_visibility_only.py](./TC031_Start_Gap_Remedy_session_from_diagnosis_leak_happy_path_visibility_only.py)
- **Test Error:** TEST FAILURE

ASSERTIONS:
- Login failed - 'Invalid credentials' error displayed after submitting test credentials.
- Dashboard page did not load; current URL remains '/login', preventing access to post-login functionality.
- Unable to verify 'Start Gap-Remedy' text or initiate a Gap-Remedy session because authentication did not succeed.
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/88535211-f3b7-479c-afea-0b8a2d170047/bd529091-e0e9-4c7c-b911-a472df04b787
- **Status:** ❌ Failed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC032 Attempt to start Gap-Remedy when blocked by entitlement shows paywall CTA
- **Test Code:** [TC032_Attempt_to_start_Gap_Remedy_when_blocked_by_entitlement_shows_paywall_CTA.py](./TC032_Attempt_to_start_Gap_Remedy_when_blocked_by_entitlement_shows_paywall_CTA.py)
- **Test Error:** TEST FAILURE

ASSERTIONS:
- Login failed - "Invalid credentials" error displayed on the login page after submitting credentials.
- Post-login dashboard not accessible - URL remains '/login' after the login attempt and no navigation occurred.
- Paywall "Buy Sachet" CTA could not be verified because authentication did not complete.
- Required authentication cookie 'uid' was not set, preventing access to authenticated pages.
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/88535211-f3b7-479c-afea-0b8a2d170047/6bc8c61e-846d-4115-9e8f-c9e663470542
- **Status:** ❌ Failed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC035 Buy flow shows Razorpay checkout entry point from paywall
- **Test Code:** [TC035_Buy_flow_shows_Razorpay_checkout_entry_point_from_paywall.py](./TC035_Buy_flow_shows_Razorpay_checkout_entry_point_from_paywall.py)
- **Test Error:** TEST FAILURE

ASSERTIONS:
- Login failed - 'Invalid credentials' message displayed on the login page
- Dashboard or '/onboarding/eligibility' page did not load after sign-in attempt
- Paywall could not be reached because authentication did not succeed
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/88535211-f3b7-479c-afea-0b8a2d170047/aa7859bc-c7c9-4613-862c-101ba386fb37
- **Status:** ❌ Failed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC004 Terms/privacy must be accepted before account creation
- **Test Code:** [TC004_Termsprivacy_must_be_accepted_before_account_creation.py](./TC004_Termsprivacy_must_be_accepted_before_account_creation.py)
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/88535211-f3b7-479c-afea-0b8a2d170047/02d45aea-9411-430a-ada5-b49653302d24
- **Status:** ✅ Passed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC005 Invalid email format is rejected on signup
- **Test Code:** [TC005_Invalid_email_format_is_rejected_on_signup.py](./TC005_Invalid_email_format_is_rejected_on_signup.py)
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/88535211-f3b7-479c-afea-0b8a2d170047/9f75e19a-be7d-4bde-a2d7-bf3b7a100fec
- **Status:** ✅ Passed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC006 Password policy enforcement prevents weak passwords
- **Test Code:** [TC006_Password_policy_enforcement_prevents_weak_passwords.py](./TC006_Password_policy_enforcement_prevents_weak_passwords.py)
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/88535211-f3b7-479c-afea-0b8a2d170047/e1d69417-4c2d-406f-baa3-3648ff3880bc
- **Status:** ✅ Passed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC007 Already-registered email shows a visible signup error
- **Test Code:** [TC007_Already_registered_email_shows_a_visible_signup_error.py](./TC007_Already_registered_email_shows_a_visible_signup_error.py)
- **Test Error:** TEST FAILURE

ASSERTIONS:
- Error message containing 'already' not found on the signup page after submitting the form with an existing email address.
- Form validation error 'Pick at least one target university.' displayed instead, preventing the duplicate-email error from appearing.
- The application remained on '/signup', but the expected duplicate-email error did not appear.
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/88535211-f3b7-479c-afea-0b8a2d170047/79de69f4-bf82-4c59-9d27-0c507c7573d2
- **Status:** ❌ Failed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC012 Validation: cannot send OTP with missing guardian fields
- **Test Code:** [TC012_Validation_cannot_send_OTP_with_missing_guardian_fields.py](./TC012_Validation_cannot_send_OTP_with_missing_guardian_fields.py)
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/88535211-f3b7-479c-afea-0b8a2d170047/3ad66cc3-b58e-4ba1-8be1-f23122976923
- **Status:** ✅ Passed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC013 Validation: invalid guardian email format blocks sending OTP
- **Test Code:** [TC013_Validation_invalid_guardian_email_format_blocks_sending_OTP.py](./TC013_Validation_invalid_guardian_email_format_blocks_sending_OTP.py)
- **Test Error:** TEST FAILURE

ASSERTIONS:
- Request Guardian Consent control not found on signup page
- Guardian Name, Guardian Phone, and Guardian Email input fields not present; cannot enter guardian details
- 'Send OTP' action could not be performed because the guardian consent UI is missing
- Unable to validate that an invalid email format triggers a visible error and prevents progression to OTP-sent state because the guardian consent feature is absent
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/88535211-f3b7-479c-afea-0b8a2d170047/676b0fcd-d07b-4754-95d4-278b4b0a6c71
- **Status:** ❌ Failed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC020 Mismatch reasons remain visible after invalid verification attempt
- **Test Code:** [TC020_Mismatch_reasons_remain_visible_after_invalid_verification_attempt.py](./TC020_Mismatch_reasons_remain_visible_after_invalid_verification_attempt.py)
- **Test Error:** TEST FAILURE

ASSERTIONS:
- Login failed - 'Invalid credentials' error is displayed after submitting credentials.
- Onboarding/eligibility page did not load - Current URL remains on the login page (/login).
- Unable to reach the 'Verify Eligibility' flow or verify 'Mismatch' and 'reason' because the session is not authenticated.
- Required test prerequisite (valid authenticated session) is missing, preventing completion of eligibility/mismatch checks.
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/88535211-f3b7-479c-afea-0b8a2d170047/d63d3fd8-46a5-4f6d-8d1b-388d7fd8bc3e
- **Status:** ❌ Failed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC024 Mismatch reasons remain visible after invalid verification attempt
- **Test Code:** [TC024_Mismatch_reasons_remain_visible_after_invalid_verification_attempt.py](./TC024_Mismatch_reasons_remain_visible_after_invalid_verification_attempt.py)
- **Test Error:** TEST FAILURE

ASSERTIONS:
- Sign in button not found on login page
- Login could not be performed; onboarding/eligibility page not reached
- Mismatch message verification could not be completed because authentication was not possible
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/88535211-f3b7-479c-afea-0b8a2d170047/6ded4083-46a6-4a17-a865-3b7d96424044
- **Status:** ❌ Failed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---


## 3️⃣ Coverage & Matching Metrics

- **30.00** of tests passed

| Requirement        | Total Tests | ✅ Passed | ❌ Failed  |
|--------------------|-------------|-----------|------------|
| ...                | ...         | ...       | ...        |
---


## 4️⃣ Key Gaps / Risks
{AI_GNERATED_KET_GAPS_AND_RISKS}
---