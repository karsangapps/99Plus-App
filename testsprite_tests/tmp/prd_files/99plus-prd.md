99Plus PRD 

Product: 99Plus 

Mission: Surgical Selection for CUET aspirants in India 

Document Type: Technical Product Requirements Document (PRD) for AI-assisted development in Cursor 

Primary Stack: Next.js (App Router) + Tailwind CSS + InsForge (PostgreSQL) + Razorpay 

Primary Audience: AI Developer / Full-Stack Builder / Technical PM 

Version: v1.0 

 

1. Executive Summary 

1.1 The Mission: “Surgical Selection” 

99Plus is not a generic test-prep product. It is a seat-conversion engine for CUET aspirants. 

The product promise is: 

Help a student choose the right university/program target 

Lock the legally valid CUET subject combination required by that target 

Replicate the NTA exam interface with high fidelity 

Diagnose exactly where marks are leaking 

Convert those leaks into short, measurable “Surgical Drills” 

Translate score changes into a live Distance-to-Seat heatmap 

Guide the student through selection, preferences, and seat allotment 

Maintain legal trust with DPDP-compliant guardian consent for minors 

This is a data-driven feedback loop, not a content library. 

1.2 Core Product Thesis 

Every student action must move through this loop: 

Target selected 

Eligibility hard-locked 

Mock taken 

Mistakes mapped to syllabus 

Mark leaks quantified 

Practice prescribed 

Improvement measured 

Seat probability updated 

Preference list optimized 

Seat secured 

1.3 Success Definition 

A successful build turns the 28 screenshots into a real application where: 

the UI is faithful to the flows shown 

all key states are persisted in PostgreSQL 

analytics are recomputed after every mock and drill 

guardian compliance is auditable 

monetization gates are enforced consistently 

every student sees a live relationship between current score and target seat 

 

2. Product Goals 

2.1 Primary Goals 

Build a production-grade Next.js app that covers the full student journey from landing page to seat allotment. 

Implement a deterministic backend data model in InsForge/PostgreSQL. 

Create a Pixel-perfect NTA simulation engine. 

Build the Seat-Success Loop: score → simulated normalization → cutoff comparison → heatmap → practice recommendation. 

Support DPDP-compliant guardian consent and consent logs. 

Support Razorpay-powered sachet credits and Pro Pass subscriptions. 

2.2 Secondary Goals 

Support admin tooling for: 

question bank management 

NTA simulator config 

cutoff manager 

legal/compliance operations 

funnel/ops analytics 

2.3 Non-Goals for v1 

Live proctoring 

AI-generated new questions at runtime 

Native mobile apps 

Real-time video classes 

Social/community features 

 

3. User Roles 

3.1 Student 

Primary product user. Can: 

sign up 

set target 

verify subject eligibility 

take mocks 

review diagnosis 

perform Surgical Drills 

purchase sachets / Pro 

use Selection Hub and Admissions OS 

3.2 Guardian 

Required for minors under DPDP-related consent flow. Can: 

receive secure consent link or OTP 

verify identity to approve data processing 

approve exam-alert communications 

generate auditable consent artifact 

3.3 Admin / Ops 

Can: 

manage content and question bank 

configure simulator rules 

manage cutoffs and university mandates 

review flagged questions 

handle DPDP and grievance workflows 

3.4 Founder / Superadmin 

Can: 

oversee system health 

control pricing 

inspect cohort funnel 

trigger annual cycle shifts 

audit revenue and compliance 

 

4. Product Scope / Modules 

4.1 Marketing & Conversion 

Landing page 

Value proposition 

Start Free CTA 

“How it works” 

College heatmap proof 

Results/social proof 

4.2 Onboarding 

Student signup 

language selection 

DOB-based minor detection 

target university selection 

guardian consent if minor 

4.3 Compliance 

DPDP notice 

consent artifact 

guardian OTP/email verification 

audit trail 

4.4 Academic Targeting 

dream mapping 

target university / college / course selection 

subject eligibility verification 

hard-locked subject combination 

4.5 Testing 

pre-test configuration 

instruction screen 

NTA mock engine 

result computation 

4.6 Diagnosis 

percentile estimate 

heatmap matrix 

mark leak analysis 

recovery plan 

4.7 Practice 

Surgical Drill Hub with 4 modes: 

Gap-Remedy 

Topic Mastery 

PYQs 

Full Mocks 

4.8 Admissions Layer 

Selection Hub 

Admissions OS preference optimizer 

seat allotment tracker 

document vault 

4.9 Admin Console 

ops dashboard 

content/NTA config 

legal/compliance vault 

revenue controls 

 

5. Technical Stack 

5.1 Required Stack 

Frontend: Next.js (App Router) 

Styling: Tailwind CSS 

Backend/Data: InsForge + PostgreSQL 

Payments: Razorpay 

5.2 Recommended Architecture 

Rendering model: React Server Components by default 

Client components: only where needed 

timers 

question interactions 

local autosave 

charts 

payment initiation 

Validation: Zod 

ORM/query layer: Drizzle ORM or Prisma 

Auth/session: InsForge auth if available, otherwise secure session cookies with role-based middleware 

Charts: lightweight charting library only for analytics screens 

PWA: service worker + manifest + offline cache for shell and recent analytics 

5.3 App Structure 

Suggested Next.js route groups: 

app/(marketing) 

app/(auth) 

app/(student) 

app/(guardian) 

app/(admin) 

app/api/* 

Suggested major route areas: 

/ 

/signup 

/guardian/consent/[token] 

/command-center 

/pre-test 

/nta-test/[attemptId] 

/diagnosis/[attemptId] 

/surgical-drill 

/selection-hub 

/admissions-os 

/seat-allotment 

/admin/* 

 

6. Product Principles 

6.1 Seat-first, not syllabus-first 

Every feature should answer: Does this increase seat probability? 

6.2 Hard data over vague motivation 

Every practice prescription must be backed by: 

question data 

topic mapping 

lost marks 

time inefficiency 

cutoff impact 

6.3 Legal trust is a product feature 

Guardian consent must be auditable, versioned, and reversible where required by law. 

6.4 Fast on low-end Android 

Product must work on: 

low-memory devices 

unstable networks 

3G/Fast 3G connections 

Hindi/English mixed market 

 

7. End-to-End User Lifecycle 

7.1 Lifecycle States 

A student account should move through these states: 

lead 

registered 

guest_mode 

guardian_pending 

guardian_verified 

target_selected 

eligibility_locked 

baseline_pending 

diagnosed 

drill_active 

preference_ready 

seat_secured 

These states should exist as explicit backend state, not just UI assumptions. 

 

8. User Flow & DPDP Compliance 

8.1 Sign-up Flow 

8.1.1 Inputs 

Student enters: 

full name 

email 

phone 

DOB 

password 

target universities 

CUET exam year 

terms/privacy acceptance 

8.1.2 Frontend Logic 

On submit: 

validate required fields 

compute age from DOB 

if age < 18, mark as minor = true 

create account 

create student profile 

create onboarding state 

show DPDP notice 

if minor, move to guardian flow 

8.1.3 Backend Data Movement 

Student click → DB 

Client submits POST /api/auth/signup 

Server validates payload 

Insert row into users 

Insert row into student_profiles 

Insert row into user_targets with provisional selections 

Insert row into consent_logs with: 

status = pending_student_notice_ack 

notice_version 

If minor: 

set student_profiles.guardian_required = true 

set student_profiles.account_state = guardian_pending 

Return session + next required step 

8.1.4 Required DB Writes 

users 

student_profiles 

consent_logs 

user_targets 

 

8.2 DPDP Notice & Minor Detection 

8.2.1 Required Logic 

If student_age < 18: 

require guardian consent before unlocking full features 

student may enter Guest Mode 

Guest Mode allows: 

calibration sprint 

limited preview 

non-sensitive interactions 

Guest Mode must not unlock: 

full analytics 

paid flows 

high-risk data processing beyond declared consent scope 

8.2.2 Compliance Requirements 

Consent flow must store: 

guardian action timestamp 

consent version 

channel used (SMS OTP / email / link) 

IP address 

device fingerprint if permitted 

consented purposes 

student id 

guardian name 

relationship 

proof of OTP verification 

 

8.3 Guardian Consent Flow (OTP / Secure Link) 

8.3.1 Trigger 

Minor student completes signup or calibration flow. 

8.3.2 Inputs 

Guardian screen should capture: 

guardian confirmation checkbox for legal guardianship 

consent to data processing 

consent to exam-critical alerts 

OTP via SMS or email 

optional relationship field 

8.3.3 UX States 

pending_verification 

otp_sent 

otp_verified 

consent_recorded 

expired 

revoked 

8.3.4 Backend Data Movement 

Student / guardian click → DB 

Student requests guardian verification 

Server inserts guardian_verification_requests 

OTP token generated and stored hashed 

SMS/email dispatched 

Guardian opens link or enters OTP 

POST /api/guardian/verify 

Server verifies token or OTP 

Insert guardian_profiles if not exists 

Insert/update guardian_links between guardian and student 

Insert consent_logs with: 

status = verified 

purpose = dpdp_minor_processing 

communication_alerts = true/false 

Update student_profiles.account_state = guardian_verified 

Generate immutable consent_artifact_pdf_url or signed artifact payload 

Unlock student account 

8.3.5 Acceptance Criteria 

OTP expiry configurable 

resends rate-limited 

one-time token invalid after success 

all attempts auditable 

guardian can later request erasure or complaint path 

 

8.4 Hard-Locked Eligibility Guardian 

8.4.1 Purpose 

Translate a student’s: 

class 12 stream 

selected CUET subjects 

target university/college/course into a valid or invalid eligibility configuration. 

The lock is critical because CUET targets often require specific subject combinations. 

8.4.2 Universities in Scope 

Initial rules must support: 

DU 

BHU 

JNU 

Jamia 

Allahabad University 

extensible for others 

8.4.3 Inputs 

class 12 stream 

board 

selected target university 

target college 

target course/program 

category/quota if relevant 

selected CUET subjects 

8.4.4 Rule Types 

Eligibility rules must support: 

mandatory subjects 

alternative subject groups 

recommended but non-mandatory subjects 

stream constraints 

category-specific variants 

cycle/year versioning 

university-specific hard locks 

8.4.5 Example Rule Shape 

A DU/B.Com program could require: 

English mandatory 

General Test mandatory or recommended 

Domain subjects from approved commerce/humanities/science groups 

minimum count of valid domain subjects 

A math-heavy program could require: 

Mathematics mandatory 

English mandatory 

plus specific domain combinations 

8.4.6 Locking Logic 

After student confirms subject combination: 

create a deterministic validation result 

if valid, create immutable lock snapshot 

changes after lock should: 

either be blocked 

or invalidate previous target and force re-verification 

8.4.7 Backend Data Movement 

Student clicks “Secure My Seat” or “Verify Eligibility” → DB 

Client submits selected target and subjects 

Server fetches matching eligibility_rules 

Rule engine validates subject set 

If valid: 

insert eligibility_lock_snapshots 

insert student_subject_locks 

update user_targets.status = locked 

update student_profiles.account_state = eligibility_locked 

If invalid: 

insert failed validation event 

return UI with exact mismatch reasons 

8.4.8 Required Outputs 

required subject list 

locked subject tags 

warnings 

disqualification risk notice 

tamper-proof lock hash 

8.4.9 Audit Requirements 

Must preserve: 

which rule version was used 

timestamp of lock 

subject set at lock time 

admin changes to rule after lock 

lock validity across cycle changes 

 

9. Mock Engine Logic (Pixel-Perfect NTA Replication) 

9.1 Objective 

Replicate the NTA interface and behavior as closely as possible. 

9.2 Required UI/Behavior 

instructions page before test start 

language switch (English/Hindi) 

section tabs 

countdown timer 

question palette with states 

Save & Next 

Clear Response 

Mark for Review & Next 

answer status legend 

current question highlight 

negative marking display 

remaining questions count 

subject/section headers 

9.3 Supported Question Types 

MCQ 

Assertion-Reason 

Case-Based / Passage-Based 

single correct option 

future-ready for numerical or matrix types 

9.4 Palette States 

Store and render exact question state: 

not_visited 

not_answered 

answered 

marked_for_review 

answered_and_marked 

current 

9.5 Timing Rules 

per mock total duration 

optional section duration 

auto-submit on timer expiry 

track: 

time entered per question 

time spent 

revisit count 

answer-change count 

9.6 Autosave Logic 

Every answer change should: 

update local client state instantly 

debounce persist to backend 

persist final state before route change 

maintain offline retry queue if connection drops 

9.7 Backend Data Movement 

Student selects answer → DB 

Client updates local question state 

Debounced POST /api/mock-attempts/[id]/response 

Server upserts mock_responses 

Server updates question_status 

Optional lightweight event written to attempt_events 

UI palette refreshes from local state immediately 

9.8 Start Attempt Logic 

Student clicks “Start Test” → DB 

Create mock_attempts 

Create mock_attempt_sections 

Precreate optional mock_responses placeholders or create on first answer 

Store simulator config snapshot 

Return attempt payload with question order and timing metadata 

9.9 Submit Logic 

Student clicks Submit or timer ends → DB 

Lock attempt 

Compute raw score 

Compute sectional performance 

Insert mock_attempt_scores 

Trigger analytics job: 

normalization simulation 

mark leak generation 

target heatmap update 

drill recommendations 

Store result snapshot 

Mark attempt as submitted 

 

10. The Brain: Seat-Success Loop 

10.1 Purpose 

Convert a student’s test data into: 

estimated percentile / normalized score 

target-college seat probability 

chapter-level mark leaks 

recommended drills 

updated Distance-to-Seat heatmap 

10.2 Core Inputs 

raw score by subject and section 

accuracy 

negative marks 

response time per question 

target university / course / category 

eligibility-locked subject combination 

historical mock performance 

historical cutoff benchmarks 

question difficulty 

chapter/topic mapping 

simulated normalization model 

10.3 Derived Outputs 

estimated normalized score 

estimated percentile 

projected target score 

distance to cutoff (marks) 

distance to cutoff (percentile) 

seat status: 

safe 

possible 

close 

reach 

leak severity by chapter 

recommended drill queue 

probability matrix across colleges/programs 

10.4 Simulated Normalization Model 

Because actual CUET normalization depends on live slot distributions, the product should produce a simulated normalization. 

10.4.1 Required Model Inputs 

subject combination 

test difficulty profile 

total raw score 

section raw scores 

historical raw-to-percentile mappings by subject bundle 

slot difficulty coefficients 

cycle year 

target program competitiveness 

10.4.2 Suggested Scoring Pipeline 

For each attempt: 

Compute raw score: 

raw_score = correct * marks_correct - wrong * marks_wrong 

Compute subject-level raw: 

raw_subject[s] 

Difficulty adjustment: 

use question-level difficulty weights 

derive attempt_difficulty_index 

Estimate percentile: 

preferred: use a calibration table fitted from historical CUET/public score distributions 

fallback: z-score approximation 

Convert percentile to simulated normalized score: 

output on the score scale used by the target configuration 

e.g. out of 800 for 4-subject target sets 

10.4.3 Recommended Approximation 

Use a model like: 

z = (raw_score - expected_mean_for_bundle) / expected_std_for_bundle 

percentile = normal_cdf(z) 

normalized_score = inverse_percentile_to_score(percentile, target_bundle_scale) 

Where expected_mean_for_bundle and expected_std_for_bundle come from a calibration table grouped by: 

subject bundle 

difficulty bucket 

cycle year 

target category 

10.4.4 Required Calibration Tables 

Need backend tables for: 

historical score distributions 

subject bundle cohorts 

cutoff benchmarks by round 

category-specific cutoffs 

simulated slot difficulty offsets 

 

11. Distance-to-Seat Heatmap Logic 

11.1 Definition 

Distance-to-Seat is the computed gap between the student’s simulated performance and each target program’s effective cutoff. 

11.2 Per Target Program Calculation 

For each college/course/category/round target: 

fetch current simulated_normalized_score 

fetch target cutoff estimate for same bundle 

compute: 

score_gap = student_score - cutoff_score 

percentile_gap = student_percentile - cutoff_percentile 

11.3 Status Thresholds 

Suggested defaults: 

safe: score_gap >= +15 

possible: +1 to +14 

close: -1 to -10 

reach: < -10 

Thresholds should be configurable by admin. 

11.4 Heatmap Output 

Each target card should show: 

college 

course 

target cutoff 

current projected score 

probability 

status 

marks away / marks above 

trend after last drill or mock 

11.5 Updating Logic 

Recompute after: 

mock submission 

drill completion 

target change 

rule/cutoff updates by admin 

score input in Admissions OS 

 

12. Mark Leaks: Concept and Rules 

12.1 What is a Mark Leak? 

A Mark Leak is not just a wrong answer. It is a recoverable loss tied to a topic, behavior, and seat outcome. 

12.2 Leak Categories 

conceptual 

application 

speed 

guessing 

careless 

stamina 

pattern_gap 

12.3 Leak Severity 

Derived from: 

lost marks 

frequency 

recurrence across attempts 

difficulty-adjusted miss rate 

cutoff impact 

12.4 NCERT Relationship 

Every leak should map to: 

subject 

unit 

chapter 

topic/subtopic 

NCERT book/chapter/page 

affected target(s) 

This is required for the screenshots showing “NCERT-mapped” remediation. 

 

13. Surgical Practice System 

13.1 Four Modes 

The system must support these explicit modes: 

A. Gap-Remedy 

shortest path to recover a specific mark leak 

usually 10–20 minutes 

auto-generated from diagnosis 

B. Topic Mastery 

chapter/topic-based focused learning 

drill entire NCERT hierarchy 

C. PYQs 

official previous year paper archive 

filtered by year/subject/difficulty 

D. Full Mocks 

high-fidelity NTA simulation 

stamina builder 

long-form performance measurement 

13.2 Session Generation Rules 

Practice sessions should be generated from: 

unresolved mark leaks 

syllabus weak zones 

target program competitiveness 

user credit/subscription access 

recent repetition avoidance 

13.3 Session Completion Outputs 

On completion of a session: 

accuracy updated 

mark leak severity reduced or unchanged 

target heatmap updated if impact threshold crossed 

mastery trend updated 

credits consumed if applicable 

 

14. Database Schema (InsForge / PostgreSQL) 

This section defines the core relational model. 

14.1 Recommended Enums 

user_role 

student 

guardian 

admin 

superadmin 

account_state 

registered 

guest_mode 

guardian_pending 

guardian_verified 

target_selected 

eligibility_locked 

diagnosed 

drill_active 

preference_ready 

seat_secured 

practice_mode 

gap_remedy 

topic_mastery 

pyq 

full_mock 

payment_product_type 

sachet 

credit_pack 

pro_pass 

consent_status 

pending 

otp_sent 

verified 

revoked 

expired 

question_type 

mcq 

assertion_reason 

case_based 

passage_based 

audit_status 

pending 

audited 

flagged 

mark_leak_type 

conceptual 

application 

speed 

guessing 

careless 

stamina 

eligibility_status 

valid 

invalid 

locked 

invalidated 

seat_status 

safe 

possible 

close 

reach 

 

14.2 Core Tables 

14.2.1 users 

Single auth/user identity table. 

Fields: 

id UUID PK 

role user_role 

email text unique nullable 

phone text unique nullable 

password_hash text nullable 

is_active boolean 

created_at 

updated_at 

last_login_at 

 

14.2.2 student_profiles 

Student-specific metadata. 

Fields: 

id UUID PK 

user_id UUID FK -> users.id 

full_name 

dob 

is_minor boolean 

guardian_required boolean 

account_state account_state 

preferred_language text 

exam_year int 

class_12_stream text 

board_name text 

category text nullable 

avatar_url text nullable 

target_university_count int default 0 

created_at 

updated_at 

Indexes: 

user_id 

account_state 

exam_year 

 

14.2.3 guardian_profiles 

Guardian identity table. 

Fields: 

id UUID PK 

user_id UUID FK -> users.id nullable 

full_name 

phone 

email 

relationship_to_student 

created_at 

updated_at 

 

14.2.4 guardian_links 

Links guardian to student. 

Fields: 

id UUID PK 

student_profile_id UUID FK 

guardian_profile_id UUID FK 

is_primary boolean 

verified_at 

created_at 

Unique: 

(student_profile_id, guardian_profile_id) 

 

14.2.5 consent_logs 

Immutable DPDP / consent audit table. 

Fields: 

id UUID PK 

student_profile_id UUID FK 

guardian_profile_id UUID FK nullable 

notice_version text 

status consent_status 

consent_purpose text 

communication_alerts_opt_in boolean 

verification_channel text 

otp_reference text nullable 

token_hash text nullable 

ip_address inet nullable 

user_agent text nullable 

artifact_url text nullable 

verified_at timestamp nullable 

revoked_at timestamp nullable 

created_at 

Indexes: 

student_profile_id 

guardian_profile_id 

status 

notice_version 

 

14.2.6 universities 

Fields: 

id UUID PK 

name 

short_code 

city 

state 

is_active 

created_at 

 

14.2.7 colleges 

Fields: 

id UUID PK 

university_id UUID FK 

name 

short_code 

campus_type 

is_active 

created_at 

 

14.2.8 programs 

Fields: 

id UUID PK 

college_id UUID FK 

name 

degree_type 

discipline 

seat_count 

is_active 

created_at 

 

14.2.9 eligibility_rules 

Stores university/program subject mandates. 

Fields: 

id UUID PK 

university_id UUID FK 

college_id UUID FK nullable 

program_id UUID FK nullable 

exam_year int 

rule_version text 

stream_constraint text nullable 

mandatory_subjects_json jsonb 

optional_subject_groups_json jsonb 

recommended_subjects_json jsonb 

min_domain_count int nullable 

category_constraint text nullable 

is_hard_lock boolean 

is_active boolean 

created_by UUID FK -> users.id 

created_at 

updated_at 

Index: 

(program_id, exam_year, is_active) 

 

14.2.10 user_targets 

Current student targets. 

Fields: 

id UUID PK 

student_profile_id UUID FK 

university_id UUID FK 

college_id UUID FK nullable 

program_id UUID FK nullable 

priority_rank int 

status text 

selected_subjects_json jsonb 

eligibility_status eligibility_status 

locked_rule_id UUID FK nullable 

created_at 

updated_at 

Indexes: 

student_profile_id 

priority_rank 

 

14.2.11 eligibility_lock_snapshots 

Immutable lock event. 

Fields: 

id UUID PK 

student_profile_id UUID FK 

user_target_id UUID FK 

eligibility_rule_id UUID FK 

locked_subjects_json jsonb 

validation_result_json jsonb 

lock_hash text 

status eligibility_status 

locked_at 

invalidated_at nullable 

created_at 

 

14.2.12 question_bank 

Core question repository. 

Fields: 

id UUID PK 

question_code text unique 

subject text 

section_code text nullable 

chapter_name text 

question_type question_type 

difficulty int 

language_primary text 

question_body_json jsonb 

options_json jsonb 

correct_answer_json jsonb 

explanation_json jsonb 

source_type text 

source_year int nullable 

source_exam text nullable 

ncert_book text nullable 

ncert_page_start int nullable 

ncert_page_end int nullable 

syllabus_node_id UUID FK nullable 

audit_status audit_status 

flagged_count int default 0 

is_active boolean 

created_at 

updated_at 

Indexes: 

subject 

source_year 

syllabus_node_id 

audit_status 

 

14.2.13 mock_tests 

Mock or test template definition. 

Fields: 

id UUID PK 

title 

test_type text 

subject_bundle_json jsonb 

total_questions 

total_marks 

duration_seconds 

negative_marking_enabled boolean 

marks_correct numeric 

marks_wrong numeric 

instructions_json jsonb 

config_snapshot_json jsonb 

is_published boolean 

created_at 

updated_at 

 

14.2.14 mock_test_questions 

Bridge table between mock tests and question bank. 

Fields: 

id UUID PK 

mock_test_id UUID FK 

question_bank_id UUID FK 

display_order int 

section_label text nullable 

marks_correct 

marks_wrong 

question_meta_json jsonb 

Unique: 

(mock_test_id, display_order) 

 

14.2.15 mock_attempts 

Student attempt header. 

Fields: 

id UUID PK 

student_profile_id UUID FK 

mock_test_id UUID FK 

attempt_number int 

status text 

started_at 

submitted_at nullable 

auto_submitted boolean 

duration_seconds_used int 

raw_score numeric nullable 

simulated_percentile numeric nullable 

simulated_normalized_score numeric nullable 

accuracy_pct numeric nullable 

negative_marks_total numeric nullable 

meta_json jsonb 

created_at 

Indexes: 

student_profile_id 

mock_test_id 

submitted_at 

 

14.2.16 mock_responses 

One row per question per attempt. 

Fields: 

id UUID PK 

mock_attempt_id UUID FK 

question_bank_id UUID FK 

selected_answer_json jsonb nullable 

is_correct boolean nullable 

question_state text 

time_spent_seconds int default 0 

visit_count int default 0 

changed_answer_count int default 0 

marked_for_review boolean default false 

answered_at timestamp nullable 

created_at 

updated_at 

Unique: 

(mock_attempt_id, question_bank_id) 

Indexes: 

mock_attempt_id 

question_state 

is_correct 

 

14.3 Required Specialized Tables 

14.3.1 syllabus_hierarchy 

Mandatory table. Canonical syllabus graph. 

Purpose: 

map questions to syllabus 

map leaks to chapters and subtopics 

support NCERT Explorer and Topic Mastery 

Fields: 

id UUID PK 

subject text 

board text default 'NCERT' 

exam text default 'CUET' 

level text  

allowed: subject, unit, chapter, topic, subtopic 

parent_id UUID FK -> syllabus_hierarchy.id nullable 

code text unique 

title text 

display_order int 

ncert_book text nullable 

ncert_chapter_number int nullable 

ncert_page_start int nullable 

ncert_page_end int nullable 

learning_outcomes_json jsonb nullable 

is_active boolean 

created_at 

updated_at 

Indexes: 

parent_id 

subject 

level 

code 

 

14.3.2 mark_leaks 

Mandatory table. Must connect mistakes to syllabus and NCERT pages. 

Purpose: 

aggregate recoverable score loss 

tie each leak to chapter/page and seat impact 

drive Gap-Remedy generation 

Fields: 

id UUID PK 

student_profile_id UUID FK 

mock_attempt_id UUID FK nullable 

question_bank_id UUID FK nullable 

syllabus_node_id UUID FK 

leak_type mark_leak_type 

lost_marks numeric 

negative_marks_component numeric default 0 

speed_penalty_component numeric default 0 

confidence_penalty_component numeric default 0 

occurrence_count int default 1 

severity_score numeric 

is_resolved boolean default false 

first_seen_at timestamp 

last_seen_at timestamp 

ncert_book text nullable 

ncert_page_start int nullable 

ncert_page_end int nullable 

evidence_json jsonb 

affected_targets_json jsonb 

created_at 

updated_at 

Indexes: 

student_profile_id 

mock_attempt_id 

syllabus_node_id 

is_resolved 

severity_score 

Required Relationship Logic 

When a student gets a question wrong: 

mock_responses stores the raw response 

backend looks up question_bank.syllabus_node_id 

backend copies NCERT metadata from question_bank or syllabus_hierarchy 

backend upserts/increments mark_leaks for that student + node + leak type 

This is how the system ties: mistake → question → syllabus node → NCERT page → drill 

 

14.3.3 practice_sessions 

Mandatory table. Must distinguish all 4 Surgical Modes. 

Purpose: 

represent any focused practice or drill unit 

capture mode, source, duration, and outcome 

Fields: 

id UUID PK 

student_profile_id UUID FK 

mode practice_mode 

source_type text  

e.g. auto_from_diagnosis, manual_browse, pyq_archive, mock_library 

title text 

description text nullable 

linked_mark_leak_id UUID FK nullable 

linked_syllabus_node_id UUID FK nullable 

linked_mock_test_id UUID FK nullable 

target_duration_seconds int 

status text  

assigned, started, completed, abandoned 

credit_cost int default 0 

subscription_required boolean default false 

started_at nullable 

completed_at nullable 

accuracy_pct numeric nullable 

score_delta_estimate numeric nullable 

seat_impact_estimate numeric nullable 

session_meta_json jsonb 

created_at 

updated_at 

Indexes: 

student_profile_id 

mode 

status 

linked_mark_leak_id 

Critical Requirement 

practice_sessions.mode must explicitly support: 

gap_remedy 

topic_mastery 

pyq 

full_mock 

No generic session type. The system depends on this distinction for UI, access gating, and analytics. 

 

14.3.4 practice_session_items 

Bridge between a practice session and actual questions/items. 

Fields: 

id UUID PK 

practice_session_id UUID FK 

question_bank_id UUID FK 

display_order int 

is_attempted boolean default false 

is_correct boolean nullable 

time_spent_seconds int default 0 

created_at 

 

14.3.5 college_target_analytics 

Mandatory table. Snapshot of target probability over time. 

Purpose: 

store per-target projections after each mock/drill 

power Distance-to-Seat heatmap 

Fields: 

id UUID PK 

student_profile_id UUID FK 

user_target_id UUID FK 

source_attempt_id UUID FK nullable 

source_practice_session_id UUID FK nullable 

simulated_normalized_score numeric 

simulated_percentile numeric 

cutoff_score_estimate numeric 

cutoff_percentile_estimate numeric 

score_gap numeric 

percentile_gap numeric 

probability_pct numeric 

seat_status seat_status 

round_label text 

analytics_version text 

snapshot_json jsonb 

created_at 

Indexes: 

student_profile_id 

user_target_id 

created_at 

seat_status 

 

14.3.6 surgical_credits 

Mandatory table. Use ledger model, not just balance field. 

Purpose: 

sachet purchases 

credit pack purchases 

credit consumption 

refunds/expiry 

Fields: 

id UUID PK 

student_profile_id UUID FK 

txn_type text  

purchase, consume, refund, bonus, expire 

product_type payment_product_type 

delta_credits int 

balance_after int 

razorpay_payment_id text nullable 

razorpay_order_id text nullable 

practice_session_id UUID FK nullable 

expires_at timestamp nullable 

meta_json jsonb 

created_at 

Indexes: 

student_profile_id 

txn_type 

razorpay_payment_id 

 

14.4 Additional Monetization Tables 

14.4.1 subscriptions 

For Pro Pass / unlimited access. 

Fields: 

id UUID PK 

student_profile_id UUID FK 

plan_code 

status 

starts_at 

ends_at 

razorpay_subscription_id text nullable 

razorpay_payment_id text nullable 

cancel_at nullable 

created_at 

updated_at 

 

14.4.2 payment_orders 

Fields: 

id UUID PK 

student_profile_id UUID FK 

product_type payment_product_type 

product_reference text nullable 

amount_paise int 

currency text 

status 

razorpay_order_id text unique 

meta_json jsonb 

created_at 

updated_at 

 

14.4.3 payment_webhook_events 

Idempotent webhook log. 

Fields: 

id UUID PK 

provider text 

event_type text 

external_event_id text unique 

payload_json jsonb 

processed boolean 

processed_at nullable 

created_at 

 

14.5 Recommended Admin Tables 

14.5.1 nta_simulator_configs 

cycle-specific scoring/timing rules 

negative marking 

calculator allowance 

shuffle rules 

UI behavior version 

14.5.2 cutoff_benchmarks 

university 

college 

program 

category 

round 

exam_year 

cutoff_score 

cutoff_percentile 

confidence level 

14.5.3 question_audit_flags 

question id 

flag type 

reported by 

status 

resolution notes 

14.5.4 grievance_tickets 

student 

issue type 

SLA timer 

status 

resolution 

 

15. Crucial Backend Logic 

15.1 PracticeSessions Mode Logic 

The same table must support different product behaviors: 

Gap-Remedy 

linked to one or more mark_leaks 

short duration 

highest ROI 

consumes sachet credit unless Pro 

Topic Mastery 

linked to syllabus_hierarchy 

can be browsed without diagnosis 

may require Pro or credit depending on policy 

PYQ 

linked to archived question sets / papers 

filtered by year and subject 

may be free-to-browse but paid-to-attempt 

Full Mock 

linked to mock_tests 

long duration 

major analytics update trigger 

 

15.2 MarkLeaks ↔ NCERT Relationship 

This is a hard requirement. 

Each leak must be traceable to: 

student_profile_id 

mock_attempt_id 

question_bank_id 

syllabus_node_id 

ncert_page_start 

ncert_page_end 

This enables: 

chapter explorer 

page-specific remediation 

“Surgical Fix” explanation cards 

exact leak aggregation by chapter/subtopic 

Example Flow 

Student answers Q17 wrong: 

Response saved to mock_responses 

question_bank says Q17 maps to syllabus_node_id = Calculus > Continuity 

NCERT page 156 is attached 

Upsert into mark_leaks 

practice_sessions auto-generated: 

mode = gap_remedy 

linked_mark_leak_id = leak row 

linked_syllabus_node_id = continuity node 

 

16. Razorpay Monetization Strategy 

16.1 Products 

Sachet / Credit 

small one-time purchase 

unlocks: 

one mock 

or a short batch of drills 

stored as ledger entries in surgical_credits 

Pro Pass 

subscription or season pass 

unlocks: 

unlimited mocks 

unlimited drills 

premium admissions layer features 

full analytics access 

16.2 Access Rules 

A feature check helper is required: 

hasAccess(student, feature) 

Priority: 

if active Pro Pass → allow 

else if sufficient credits for this feature → allow 

else block with paywall 

16.3 Purchase Flow 

Student clicks Buy → DB 

Create payment_orders 

Call Razorpay order creation 

Return order details to client 

Client opens Razorpay checkout 

On success, Razorpay hits webhook 

Verify signature 

Insert payment_webhook_events 

Update payment_orders.status 

If sachet/credit: 

insert surgical_credits ledger row 

If Pro Pass: 

insert/update subscriptions 

client polls or refetches entitlements 

gated button unlocks 

16.4 Webhook Requirements 

Must handle idempotently: 

payment.captured 

order.paid 

subscription.activated 

subscription.charged 

subscription.cancelled 

refund.processed if used 

16.5 Entitlement Source of Truth 

Do not trust client payment success callback as final truth. Use verified Razorpay webhook + server-side signature verification. 

16.6 Credit Consumption Flow 

When a paid session starts: 

server checks entitlement 

if Pro active → no credit deduction 

else insert negative row into surgical_credits 

set balance_after 

create practice_sessions 

only then allow session start 

 

17. Data Movement: Click-to-Database Examples 

17.1 Student clicks “Create Account” 

Writes: 

users 

student_profiles 

consent_logs 

user_targets 

17.2 Guardian verifies OTP 

Writes: 

guardian_profiles 

guardian_links 

consent_logs Updates: 

student_profiles.account_state 

17.3 Student locks target subjects 

Reads: 

eligibility_rules Writes: 

eligibility_lock_snapshots 

user_targets Updates: 

student_profiles.account_state 

17.4 Student starts mock 

Writes: 

mock_attempts 

mock_attempt_sections if implemented 

17.5 Student answers a question 

Writes: 

mock_responses 

optionally attempt_events 

17.6 Student submits mock 

Updates/Writes: 

mock_attempts 

mock_responses final states 

mark_leaks 

college_target_analytics 

practice_sessions recommendations 

17.7 Student completes drill 

Updates/Writes: 

practice_sessions 

practice_session_items 

mark_leaks severity/resolution 

college_target_analytics 

17.8 Student buys sachet 

Writes: 

payment_orders 

payment_webhook_events 

surgical_credits 

17.9 Student buys Pro 

Writes: 

payment_orders 

payment_webhook_events 

subscriptions 

 

18. Analytics Requirements 

18.1 Student Analytics 

percentile trend 

target heatmap 

leak recovery trend 

mastery by subject 

time-per-question heatmap 

guessing risk 

skip-saves 

pace/stamina trend 

18.2 Admin Analytics 

signup → diagnosis → drill → seat funnel 

cohort score improvement 

mark leak cohort heatmap 

question audit backlog 

pricing/revenue by product 

entitlement conversion 

 

19. Admin Console Requirements 

19.1 Ops Dashboard 

cycle health 

funnel metrics 

revenue summary 

cohort score improvement 

seat projection funnel 

19.2 Content & NTA Config 

question bank table 

add/edit question 

audit flags 

simulator config toggles 

bulk import/export 

19.3 Admissions & Legal Vault 

cutoff manager 

consent log table 

right-to-erasure queue 

grievance portal 

DPDP compliance status 

19.4 Required RBAC 

admin 

content_admin 

legal_admin 

superadmin 

Every admin action should be audit logged. 

 

20. PWA & Accessibility Requirements 

20.1 PWA Requirements 

installable manifest 

branded icons 

splash screen 

offline app shell 

background sync for queued responses if supported 

retry unsent answers after reconnect 

cache last result/diagnosis pages for quick reopen 

20.2 3G Network Optimization 

Hard requirement for Indian student context. 

Must do 

server components by default 

reduce client JS 

lazy-load charts and heavy analytics 

compress images with next/image 

use WebP/AVIF where possible 

avoid shipping large animation libraries globally 

route-level code splitting 

no blocking analytics scripts on critical path 

debounce autosave payloads 

batch non-critical writes 

show resilient skeletons and optimistic states 

Target budgets 

first authenticated route usable on Fast 3G 

avoid large initial JS bundles 

sub-second local interaction for answer selection 

answer save must not block UI 

20.3 Accessibility 

keyboard navigable mock engine 

visible focus states 

accessible color contrast 

palette states not color-only; also icon/text based 

screen-reader labels for timer, status, buttons 

form validation with clear inline errors 

touch target sizes adequate for mobile 

language toggle accessible 

reduced-motion support 

 

21. Non-Functional Requirements 

21.1 Security 

hash passwords properly 

signed guardian links 

OTP tokens stored hashed 

webhook signature verification 

role-based authorization middleware 

audit logs for admin actions 

minimize PII exposure in client payloads 

21.2 Reliability 

idempotent webhooks 

retries for OTP dispatch 

transactional writes for purchase fulfillment 

autosave recovery in mock engine 

21.3 Observability 

structured logs 

attempt submission errors 

webhook processing errors 

eligibility validation failures 

mock autosave latency 

 

22. Recommended API / Server Action Surface 

22.1 Auth / Onboarding 

POST /api/auth/signup 

POST /api/auth/login 

POST /api/guardian/request 

POST /api/guardian/verify 

POST /api/targets/validate 

POST /api/targets/lock 

22.2 Testing 

POST /api/mock-attempts/start 

POST /api/mock-attempts/[id]/response 

POST /api/mock-attempts/[id]/submit 

GET /api/mock-attempts/[id]/result 

22.3 Practice 

POST /api/practice-sessions/start 

POST /api/practice-sessions/[id]/response 

POST /api/practice-sessions/[id]/complete 

22.4 Analytics 

GET /api/command-center 

GET /api/diagnosis/[attemptId] 

GET /api/selection-hub 

GET /api/admissions-os 

22.5 Payments 

POST /api/payments/order 

POST /api/webhooks/razorpay 

22.6 Admin 

POST /api/admin/questions 

PATCH /api/admin/questions/[id] 

POST /api/admin/simulator-config 

POST /api/admin/cutoffs 

POST /api/admin/eligibility-rules 

 

23. AI Developer Implementation Notes 

23.1 Build Priority Order 

Phase 1 

auth/signup 

student profile 

guardian consent 

target selection 

eligibility rules + hard lock 

Phase 2 

question bank 

mock engine 

mock scoring 

diagnosis and mark leaks 

Phase 3 

Surgical Drill system 

PYQ archive 

mastery explorer 

heatmap updates 

Phase 4 

monetization 

Selection Hub 

Admissions OS 

seat allotment screens 

Phase 5 

admin console 

legal vault 

ops analytics 

23.2 Important Product Constraint 

Never compute analytics only in the client. The backend must be source of truth for: 

scores 

normalization 

leak severity 

target probability 

entitlements 

23.3 Important UI Constraint 

Use screenshots as visual reference, but build reusable primitives: 

stat cards 

lock banners 

status chips 

test palette 

heatmap cells 

severity bars 

timeline blocks 

drill cards 

 

24. Acceptance Criteria 

24.1 Onboarding 

minor detection works 

guardian consent required for minors 

audit log generated 

guest mode supported 

24.2 Eligibility Guardian 

valid subject combinations pass 

invalid combinations return exact reason 

locks persist and are auditable 

24.3 Mock Engine 

answer states match NTA behavior 

autosave works 

timer expiry auto-submits 

results compute correctly 

24.4 Seat-Success Loop 

every submitted mock updates: 

percentile estimate 

normalized score 

target heatmap 

mark leaks 

practice suggestions 

24.5 Practice 

4 modes are distinguishable in DB and UI 

drill completion updates leak severity 

24.6 Payments 

sachets create credit ledger entries 

Pro creates active subscription 

webhook is idempotent 

entitlements unlock immediately after verified payment 

24.7 PWA / Performance 

app installable 

core screens usable on 3G/Fast 3G 

mock engine remains responsive during save operations 

 

25. Final Product Statement 

99Plus should be implemented as a seat-conversion operating system: 

legally trusted 

academically precise 

operationally measurable 

commercially flexible 

The backend is the nervous system. The mock engine is the sensor. The mark leak model is the diagnosis. The Surgical Drill system is the intervention. The heatmap is the decision layer. The seat allotment workflow is the final outcome. 

 