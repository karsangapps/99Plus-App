-- Task 2: Surgical Swap — Mock, Mark Leak, Analytics tables
-- Run via: insforge db query (paste each block)
-- Order matters for FK dependencies

-- 1. syllabus_hierarchy (referenced by mark_leaks, question_bank)
CREATE TABLE IF NOT EXISTS syllabus_hierarchy (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  subject TEXT NOT NULL,
  board TEXT DEFAULT 'NCERT',
  exam TEXT DEFAULT 'CUET',
  level TEXT NOT NULL,
  parent_id UUID REFERENCES syllabus_hierarchy(id),
  code TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  display_order INT DEFAULT 0,
  ncert_book TEXT,
  ncert_chapter_number INT,
  ncert_page_start INT,
  ncert_page_end INT,
  learning_outcomes_json JSONB,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_syllabus_parent ON syllabus_hierarchy(parent_id);
CREATE INDEX IF NOT EXISTS idx_syllabus_subject ON syllabus_hierarchy(subject);
CREATE INDEX IF NOT EXISTS idx_syllabus_code ON syllabus_hierarchy(code);

-- 2. question_bank (minimal for drill generation)
CREATE TABLE IF NOT EXISTS question_bank (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  question_code TEXT UNIQUE NOT NULL,
  subject TEXT NOT NULL,
  section_code TEXT,
  chapter_name TEXT NOT NULL,
  question_type TEXT DEFAULT 'mcq',
  difficulty INT DEFAULT 1,
  language_primary TEXT DEFAULT 'en',
  question_body_json JSONB NOT NULL DEFAULT '{}',
  options_json JSONB NOT NULL DEFAULT '[]',
  correct_answer_json JSONB NOT NULL DEFAULT '{}',
  explanation_json JSONB,
  source_type TEXT,
  source_year INT,
  source_exam TEXT,
  ncert_book TEXT,
  ncert_page_start INT,
  ncert_page_end INT,
  syllabus_node_id UUID REFERENCES syllabus_hierarchy(id),
  audit_status TEXT DEFAULT 'pending',
  flagged_count INT DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_question_subject ON question_bank(subject);
CREATE INDEX IF NOT EXISTS idx_question_syllabus ON question_bank(syllabus_node_id);

-- 3. mock_tests
CREATE TABLE IF NOT EXISTS mock_tests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  test_type TEXT NOT NULL,
  subject_bundle_json JSONB NOT NULL DEFAULT '[]',
  total_questions INT NOT NULL,
  total_marks INT NOT NULL,
  duration_seconds INT NOT NULL,
  negative_marking_enabled BOOLEAN DEFAULT true,
  marks_correct NUMERIC DEFAULT 4,
  marks_wrong NUMERIC DEFAULT 1,
  instructions_json JSONB DEFAULT '{}',
  config_snapshot_json JSONB DEFAULT '{}',
  is_published BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 4. mock_test_questions
CREATE TABLE IF NOT EXISTS mock_test_questions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  mock_test_id UUID REFERENCES mock_tests(id) NOT NULL,
  question_bank_id UUID REFERENCES question_bank(id) NOT NULL,
  display_order INT NOT NULL,
  section_label TEXT,
  marks_correct NUMERIC DEFAULT 4,
  marks_wrong NUMERIC DEFAULT 1,
  question_meta_json JSONB DEFAULT '{}',
  UNIQUE(mock_test_id, display_order)
);

-- 5. mock_attempts
CREATE TABLE IF NOT EXISTS mock_attempts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  student_profile_id UUID NOT NULL,
  mock_test_id UUID REFERENCES mock_tests(id) NOT NULL,
  attempt_number INT NOT NULL DEFAULT 1,
  status TEXT NOT NULL DEFAULT 'in_progress',
  started_at TIMESTAMPTZ DEFAULT now(),
  submitted_at TIMESTAMPTZ,
  auto_submitted BOOLEAN DEFAULT false,
  duration_seconds_used INT DEFAULT 0,
  raw_score NUMERIC,
  simulated_percentile NUMERIC,
  simulated_normalized_score NUMERIC,
  accuracy_pct NUMERIC,
  negative_marks_total NUMERIC,
  meta_json JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_mock_attempts_student ON mock_attempts(student_profile_id);
CREATE INDEX IF NOT EXISTS idx_mock_attempts_submitted ON mock_attempts(submitted_at);

-- 6. mock_responses
CREATE TABLE IF NOT EXISTS mock_responses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  mock_attempt_id UUID REFERENCES mock_attempts(id) NOT NULL,
  question_bank_id UUID REFERENCES question_bank(id) NOT NULL,
  selected_answer_json JSONB,
  is_correct BOOLEAN,
  question_state TEXT DEFAULT 'not_visited',
  time_spent_seconds INT DEFAULT 0,
  visit_count INT DEFAULT 0,
  changed_answer_count INT DEFAULT 0,
  marked_for_review BOOLEAN DEFAULT false,
  answered_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(mock_attempt_id, question_bank_id)
);
CREATE INDEX IF NOT EXISTS idx_mock_responses_attempt ON mock_responses(mock_attempt_id);

-- 7. mark_leaks
CREATE TABLE IF NOT EXISTS mark_leaks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  student_profile_id UUID NOT NULL,
  mock_attempt_id UUID REFERENCES mock_attempts(id),
  question_bank_id UUID REFERENCES question_bank(id),
  syllabus_node_id UUID REFERENCES syllabus_hierarchy(id) NOT NULL,
  leak_type TEXT NOT NULL DEFAULT 'conceptual',
  lost_marks NUMERIC NOT NULL,
  negative_marks_component NUMERIC DEFAULT 0,
  speed_penalty_component NUMERIC DEFAULT 0,
  confidence_penalty_component NUMERIC DEFAULT 0,
  occurrence_count INT DEFAULT 1,
  severity_score NUMERIC NOT NULL,
  is_resolved BOOLEAN DEFAULT false,
  first_seen_at TIMESTAMPTZ DEFAULT now(),
  last_seen_at TIMESTAMPTZ DEFAULT now(),
  ncert_book TEXT,
  ncert_page_start INT,
  ncert_page_end INT,
  evidence_json JSONB DEFAULT '{}',
  affected_targets_json JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_mark_leaks_student ON mark_leaks(student_profile_id);
CREATE INDEX IF NOT EXISTS idx_mark_leaks_resolved ON mark_leaks(is_resolved);
CREATE INDEX IF NOT EXISTS idx_mark_leaks_severity ON mark_leaks(severity_score DESC);

-- 8. college_target_analytics
CREATE TABLE IF NOT EXISTS college_target_analytics (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  student_profile_id UUID NOT NULL,
  user_target_id UUID NOT NULL,
  source_attempt_id UUID REFERENCES mock_attempts(id),
  source_practice_session_id UUID,
  simulated_normalized_score NUMERIC,
  simulated_percentile NUMERIC,
  cutoff_score_estimate NUMERIC,
  cutoff_percentile_estimate NUMERIC,
  score_gap NUMERIC,
  percentile_gap NUMERIC,
  probability_pct NUMERIC,
  seat_status TEXT NOT NULL DEFAULT 'reach',
  round_label TEXT,
  analytics_version TEXT,
  snapshot_json JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_college_analytics_student ON college_target_analytics(student_profile_id);
CREATE INDEX IF NOT EXISTS idx_college_analytics_target ON college_target_analytics(user_target_id);
CREATE INDEX IF NOT EXISTS idx_college_analytics_created ON college_target_analytics(created_at DESC);

-- 9. practice_sessions
CREATE TABLE IF NOT EXISTS practice_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  student_profile_id UUID NOT NULL,
  mode TEXT NOT NULL,
  source_type TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  linked_mark_leak_id UUID REFERENCES mark_leaks(id),
  linked_syllabus_node_id UUID REFERENCES syllabus_hierarchy(id),
  linked_mock_test_id UUID REFERENCES mock_tests(id),
  target_duration_seconds INT,
  status TEXT NOT NULL DEFAULT 'assigned',
  credit_cost INT DEFAULT 0,
  subscription_required BOOLEAN DEFAULT false,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  accuracy_pct NUMERIC,
  score_delta_estimate NUMERIC,
  seat_impact_estimate NUMERIC,
  session_meta_json JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_practice_sessions_student ON practice_sessions(student_profile_id);
CREATE INDEX IF NOT EXISTS idx_practice_sessions_mode ON practice_sessions(mode);

-- 10. practice_session_items
CREATE TABLE IF NOT EXISTS practice_session_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  practice_session_id UUID REFERENCES practice_sessions(id) NOT NULL,
  question_bank_id UUID REFERENCES question_bank(id) NOT NULL,
  display_order INT NOT NULL,
  is_attempted BOOLEAN DEFAULT false,
  is_correct BOOLEAN,
  time_spent_seconds INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 11. surgical_credits (for drill gating)
CREATE TABLE IF NOT EXISTS surgical_credits (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  student_profile_id UUID NOT NULL,
  txn_type TEXT NOT NULL,
  product_type TEXT,
  delta_credits INT NOT NULL,
  balance_after INT NOT NULL,
  razorpay_payment_id TEXT,
  razorpay_order_id TEXT,
  practice_session_id UUID REFERENCES practice_sessions(id),
  expires_at TIMESTAMPTZ,
  meta_json JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_surgical_credits_student ON surgical_credits(student_profile_id);
