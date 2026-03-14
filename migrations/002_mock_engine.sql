-- ============================================================
-- 99Plus — Migration 002: Mock Engine Tables
-- Run this in InsForge SQL Editor or via CLI:
--   npx @insforge/cli db import migrations/002_mock_engine.sql
-- ============================================================

-- ── Enums ──────────────────────────────────────────────────
DO $$ BEGIN
  CREATE TYPE question_type AS ENUM (
    'mcq', 'assertion_reason', 'case_based', 'passage_based'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE audit_status AS ENUM ('pending', 'audited', 'flagged');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ── question_bank ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.question_bank (
  id                   UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  question_code        TEXT          UNIQUE NOT NULL,
  subject              TEXT          NOT NULL,
  section_code         TEXT,
  chapter_name         TEXT          NOT NULL,
  question_type        question_type NOT NULL DEFAULT 'mcq',
  difficulty           INT           NOT NULL DEFAULT 3
                                     CHECK (difficulty BETWEEN 1 AND 5),
  language_primary     TEXT          NOT NULL DEFAULT 'en',
  question_body_json   JSONB         NOT NULL,
  options_json         JSONB         NOT NULL,
  correct_answer_json  JSONB         NOT NULL,
  explanation_json     JSONB,
  source_type          TEXT          NOT NULL DEFAULT 'original',
  source_year          INT,
  source_exam          TEXT,
  ncert_book           TEXT,
  ncert_page_start     INT,
  ncert_page_end       INT,
  syllabus_node_id     UUID,
  audit_status         audit_status  NOT NULL DEFAULT 'pending',
  flagged_count        INT           NOT NULL DEFAULT 0,
  is_active            BOOLEAN       NOT NULL DEFAULT true,
  created_at           TIMESTAMPTZ   NOT NULL DEFAULT now(),
  updated_at           TIMESTAMPTZ   NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_qb_subject        ON public.question_bank(subject);
CREATE INDEX IF NOT EXISTS idx_qb_source_year    ON public.question_bank(source_year);
CREATE INDEX IF NOT EXISTS idx_qb_syllabus_node  ON public.question_bank(syllabus_node_id);
CREATE INDEX IF NOT EXISTS idx_qb_audit_status   ON public.question_bank(audit_status);
CREATE INDEX IF NOT EXISTS idx_qb_chapter        ON public.question_bank(subject, chapter_name);

ALTER TABLE public.question_bank ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "qb_authenticated_read" ON public.question_bank;
CREATE POLICY "qb_authenticated_read"
  ON public.question_bank FOR SELECT
  TO authenticated
  USING (is_active = true AND audit_status != 'flagged');

DROP POLICY IF EXISTS "qb_service_role_all" ON public.question_bank;
CREATE POLICY "qb_service_role_all"
  ON public.question_bank FOR ALL
  TO project_admin
  USING (true) WITH CHECK (true);

-- ── mock_tests ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.mock_tests (
  id                          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  title                       TEXT        NOT NULL,
  test_type                   TEXT        NOT NULL DEFAULT 'full_mock',
  subject_bundle_json         JSONB       NOT NULL DEFAULT '[]',
  total_questions             INT         NOT NULL DEFAULT 0,
  total_marks                 NUMERIC     NOT NULL DEFAULT 0,
  duration_seconds            INT         NOT NULL DEFAULT 10800,
  negative_marking_enabled    BOOLEAN     NOT NULL DEFAULT true,
  marks_correct               NUMERIC     NOT NULL DEFAULT 5,
  marks_wrong                 NUMERIC     NOT NULL DEFAULT 1,
  instructions_json           JSONB,
  config_snapshot_json        JSONB,
  is_published                BOOLEAN     NOT NULL DEFAULT false,
  created_at                  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at                  TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.mock_tests ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "mt_authenticated_read_published" ON public.mock_tests;
CREATE POLICY "mt_authenticated_read_published"
  ON public.mock_tests FOR SELECT
  TO authenticated
  USING (is_published = true);

DROP POLICY IF EXISTS "mt_service_role_all" ON public.mock_tests;
CREATE POLICY "mt_service_role_all"
  ON public.mock_tests FOR ALL
  TO project_admin
  USING (true) WITH CHECK (true);

-- ── mock_test_questions ────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.mock_test_questions (
  id                  UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  mock_test_id        UUID        NOT NULL
                                  REFERENCES public.mock_tests(id)
                                  ON DELETE CASCADE,
  question_bank_id    UUID        NOT NULL
                                  REFERENCES public.question_bank(id)
                                  ON DELETE RESTRICT,
  display_order       INT         NOT NULL,
  section_label       TEXT,
  marks_correct       NUMERIC     NOT NULL DEFAULT 5,
  marks_wrong         NUMERIC     NOT NULL DEFAULT 1,
  question_meta_json  JSONB,
  UNIQUE (mock_test_id, display_order)
);

CREATE INDEX IF NOT EXISTS idx_mtq_mock_test_id     ON public.mock_test_questions(mock_test_id);
CREATE INDEX IF NOT EXISTS idx_mtq_question_bank_id ON public.mock_test_questions(question_bank_id);
CREATE INDEX IF NOT EXISTS idx_mtq_section_label    ON public.mock_test_questions(mock_test_id, section_label);

ALTER TABLE public.mock_test_questions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "mtq_authenticated_read" ON public.mock_test_questions;
CREATE POLICY "mtq_authenticated_read"
  ON public.mock_test_questions FOR SELECT
  TO authenticated
  USING (true);

DROP POLICY IF EXISTS "mtq_service_role_all" ON public.mock_test_questions;
CREATE POLICY "mtq_service_role_all"
  ON public.mock_test_questions FOR ALL
  TO project_admin
  USING (true) WITH CHECK (true);

-- ── mock_attempts ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.mock_attempts (
  id                          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  student_profile_id          UUID        NOT NULL,
  mock_test_id                UUID        NOT NULL
                                          REFERENCES public.mock_tests(id),
  attempt_number              INT         NOT NULL DEFAULT 1,
  status                      TEXT        NOT NULL DEFAULT 'in_progress',
  started_at                  TIMESTAMPTZ NOT NULL DEFAULT now(),
  submitted_at                TIMESTAMPTZ,
  auto_submitted              BOOLEAN     NOT NULL DEFAULT false,
  duration_seconds_used       INT         NOT NULL DEFAULT 0,
  raw_score                   NUMERIC,
  simulated_percentile        NUMERIC,
  simulated_normalized_score  NUMERIC,
  accuracy_pct                NUMERIC,
  negative_marks_total        NUMERIC,
  meta_json                   JSONB       NOT NULL DEFAULT '{}',
  created_at                  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_ma_student_profile  ON public.mock_attempts(student_profile_id);
CREATE INDEX IF NOT EXISTS idx_ma_mock_test        ON public.mock_attempts(mock_test_id);
CREATE INDEX IF NOT EXISTS idx_ma_submitted_at     ON public.mock_attempts(submitted_at);

ALTER TABLE public.mock_attempts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "ma_owner_all" ON public.mock_attempts;
CREATE POLICY "ma_owner_all"
  ON public.mock_attempts FOR ALL
  TO authenticated
  USING (student_profile_id = auth.uid())
  WITH CHECK (student_profile_id = auth.uid());

DROP POLICY IF EXISTS "ma_service_role_all" ON public.mock_attempts;
CREATE POLICY "ma_service_role_all"
  ON public.mock_attempts FOR ALL
  TO project_admin
  USING (true) WITH CHECK (true);

-- ── mock_responses ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.mock_responses (
  id                    UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  mock_attempt_id       UUID        NOT NULL
                                    REFERENCES public.mock_attempts(id)
                                    ON DELETE CASCADE,
  question_bank_id      UUID        NOT NULL
                                    REFERENCES public.question_bank(id),
  selected_answer_json  JSONB,
  is_correct            BOOLEAN,
  question_state        TEXT        NOT NULL DEFAULT 'not_visited',
  time_spent_seconds    INT         NOT NULL DEFAULT 0,
  visit_count           INT         NOT NULL DEFAULT 0,
  changed_answer_count  INT         NOT NULL DEFAULT 0,
  marked_for_review     BOOLEAN     NOT NULL DEFAULT false,
  answered_at           TIMESTAMPTZ,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (mock_attempt_id, question_bank_id)
);

CREATE INDEX IF NOT EXISTS idx_mr_mock_attempt    ON public.mock_responses(mock_attempt_id);
CREATE INDEX IF NOT EXISTS idx_mr_question_state  ON public.mock_responses(question_state);
CREATE INDEX IF NOT EXISTS idx_mr_is_correct      ON public.mock_responses(is_correct);

ALTER TABLE public.mock_responses ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "mr_owner_all" ON public.mock_responses;
CREATE POLICY "mr_owner_all"
  ON public.mock_responses FOR ALL
  TO authenticated
  USING (
    mock_attempt_id IN (
      SELECT id FROM public.mock_attempts
      WHERE student_profile_id = auth.uid()
    )
  )
  WITH CHECK (
    mock_attempt_id IN (
      SELECT id FROM public.mock_attempts
      WHERE student_profile_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "mr_service_role_all" ON public.mock_responses;
CREATE POLICY "mr_service_role_all"
  ON public.mock_responses FOR ALL
  TO project_admin
  USING (true) WITH CHECK (true);
