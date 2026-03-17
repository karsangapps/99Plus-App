-- ============================================================
-- 99Plus — Migration 003: Diagnosis & Mark Leak Engine
-- Run: node scripts/run-migration.cjs migrations/003_diagnosis.sql
-- ============================================================

-- ── Enums (safe) ───────────────────────────────────────────
DO $$ BEGIN
  CREATE TYPE mark_leak_type AS ENUM (
    'conceptual', 'application', 'speed', 'guessing', 'careless', 'stamina', 'pattern_gap'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE seat_status AS ENUM ('safe', 'possible', 'close', 'reach');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ── mark_leaks ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.mark_leaks (
  id                          UUID            PRIMARY KEY DEFAULT gen_random_uuid(),
  student_profile_id          UUID            NOT NULL,
  mock_attempt_id             UUID            REFERENCES public.mock_attempts(id) ON DELETE SET NULL,
  question_bank_id            UUID            REFERENCES public.question_bank(id) ON DELETE SET NULL,
  subject                     TEXT            NOT NULL,
  chapter_name                TEXT            NOT NULL,
  leak_type                   mark_leak_type  NOT NULL DEFAULT 'conceptual',
  lost_marks                  NUMERIC         NOT NULL DEFAULT 0,
  negative_marks_component    NUMERIC         NOT NULL DEFAULT 0,
  speed_penalty_component     NUMERIC         NOT NULL DEFAULT 0,
  confidence_penalty_component NUMERIC        NOT NULL DEFAULT 0,
  occurrence_count            INT             NOT NULL DEFAULT 1,
  severity_score              NUMERIC         NOT NULL DEFAULT 0,
  is_resolved                 BOOLEAN         NOT NULL DEFAULT false,
  first_seen_at               TIMESTAMPTZ     NOT NULL DEFAULT now(),
  last_seen_at                TIMESTAMPTZ     NOT NULL DEFAULT now(),
  ncert_book                  TEXT,
  ncert_page_start            INT,
  ncert_page_end              INT,
  evidence_json               JSONB           NOT NULL DEFAULT '{}',
  affected_targets_json       JSONB           NOT NULL DEFAULT '[]',
  created_at                  TIMESTAMPTZ     NOT NULL DEFAULT now(),
  updated_at                  TIMESTAMPTZ     NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_ml_student      ON public.mark_leaks(student_profile_id);
CREATE INDEX IF NOT EXISTS idx_ml_attempt      ON public.mark_leaks(mock_attempt_id);
CREATE INDEX IF NOT EXISTS idx_ml_subject      ON public.mark_leaks(student_profile_id, subject);
CREATE INDEX IF NOT EXISTS idx_ml_resolved     ON public.mark_leaks(is_resolved);
CREATE INDEX IF NOT EXISTS idx_ml_severity     ON public.mark_leaks(severity_score DESC);

ALTER TABLE public.mark_leaks ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "ml_owner_all"         ON public.mark_leaks;
DROP POLICY IF EXISTS "ml_project_admin_all" ON public.mark_leaks;

CREATE POLICY "ml_owner_all"
  ON public.mark_leaks FOR ALL TO authenticated
  USING (student_profile_id = auth.uid())
  WITH CHECK (student_profile_id = auth.uid());

CREATE POLICY "ml_project_admin_all"
  ON public.mark_leaks FOR ALL TO project_admin
  USING (true) WITH CHECK (true);

-- ── college_target_analytics ───────────────────────────────
CREATE TABLE IF NOT EXISTS public.college_target_analytics (
  id                          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  student_profile_id          UUID        NOT NULL,
  user_target_id              UUID        REFERENCES public.user_targets(id) ON DELETE SET NULL,
  source_attempt_id           UUID        REFERENCES public.mock_attempts(id) ON DELETE SET NULL,
  simulated_normalized_score  NUMERIC     NOT NULL DEFAULT 0,
  simulated_percentile        NUMERIC     NOT NULL DEFAULT 0,
  cutoff_score_estimate       NUMERIC     NOT NULL DEFAULT 0,
  cutoff_percentile_estimate  NUMERIC     NOT NULL DEFAULT 0,
  score_gap                   NUMERIC     NOT NULL DEFAULT 0,
  percentile_gap              NUMERIC     NOT NULL DEFAULT 0,
  probability_pct             NUMERIC     NOT NULL DEFAULT 0,
  seat_status                 seat_status NOT NULL DEFAULT 'reach',
  round_label                 TEXT        NOT NULL DEFAULT 'CSAS Round 1',
  analytics_version           TEXT        NOT NULL DEFAULT 'v1',
  snapshot_json               JSONB       NOT NULL DEFAULT '{}',
  created_at                  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_cta_student     ON public.college_target_analytics(student_profile_id);
CREATE INDEX IF NOT EXISTS idx_cta_target      ON public.college_target_analytics(user_target_id);
CREATE INDEX IF NOT EXISTS idx_cta_attempt     ON public.college_target_analytics(source_attempt_id);
CREATE INDEX IF NOT EXISTS idx_cta_seat_status ON public.college_target_analytics(seat_status);

ALTER TABLE public.college_target_analytics ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "cta_owner_all"         ON public.college_target_analytics;
DROP POLICY IF EXISTS "cta_project_admin_all" ON public.college_target_analytics;

CREATE POLICY "cta_owner_all"
  ON public.college_target_analytics FOR ALL TO authenticated
  USING (student_profile_id = auth.uid())
  WITH CHECK (student_profile_id = auth.uid());

CREATE POLICY "cta_project_admin_all"
  ON public.college_target_analytics FOR ALL TO project_admin
  USING (true) WITH CHECK (true);

-- ── cutoff_benchmarks ──────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.cutoff_benchmarks (
  id                  UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  university_id       UUID        NOT NULL,
  college_id          UUID,
  program_id          UUID,
  category            TEXT        NOT NULL DEFAULT 'General',
  round               TEXT        NOT NULL DEFAULT 'CSAS Round 1',
  exam_year           INT         NOT NULL DEFAULT 2025,
  cutoff_score        NUMERIC     NOT NULL,
  cutoff_percentile   NUMERIC     NOT NULL,
  total_seats         INT,
  confidence          TEXT        NOT NULL DEFAULT 'high',
  notes               TEXT,
  is_active           BOOLEAN     NOT NULL DEFAULT true,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_cb_unique
  ON public.cutoff_benchmarks(college_id, program_id, category, round, exam_year)
  WHERE college_id IS NOT NULL AND program_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_cb_college ON public.cutoff_benchmarks(college_id);
CREATE INDEX IF NOT EXISTS idx_cb_year    ON public.cutoff_benchmarks(exam_year);

ALTER TABLE public.cutoff_benchmarks ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "cb_read_all"          ON public.cutoff_benchmarks;
DROP POLICY IF EXISTS "cb_project_admin_all" ON public.cutoff_benchmarks;

CREATE POLICY "cb_read_all"
  ON public.cutoff_benchmarks FOR SELECT TO authenticated
  USING (is_active = true);

CREATE POLICY "cb_project_admin_all"
  ON public.cutoff_benchmarks FOR ALL TO project_admin
  USING (true) WITH CHECK (true);
