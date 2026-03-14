-- ============================================================
-- 99Plus — Migration 004: Practice System (Phase 3)
-- ============================================================

-- ── Add Conceptual Bridge fields to question_bank ──────────
ALTER TABLE public.question_bank
  ADD COLUMN IF NOT EXISTS logic_fix_text TEXT,
  ADD COLUMN IF NOT EXISTS pattern_text TEXT;

-- ── practice_mode enum ────────────────────────────────────
DO $$ BEGIN
  CREATE TYPE practice_mode AS ENUM (
    'gap_remedy', 'topic_mastery', 'pyq', 'full_mock'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ── practice_sessions ─────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.practice_sessions (
  id                        UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  student_profile_id        UUID          NOT NULL,
  mode                      practice_mode NOT NULL DEFAULT 'gap_remedy',
  source_type               TEXT          NOT NULL DEFAULT 'auto_from_diagnosis',
  title                     TEXT          NOT NULL,
  description               TEXT,
  linked_mark_leak_id       UUID          REFERENCES public.mark_leaks(id) ON DELETE SET NULL,
  linked_mock_attempt_id    UUID          REFERENCES public.mock_attempts(id) ON DELETE SET NULL,
  target_duration_seconds   INT           NOT NULL DEFAULT 1200,
  status                    TEXT          NOT NULL DEFAULT 'assigned',
  credit_cost               INT           NOT NULL DEFAULT 0,
  started_at                TIMESTAMPTZ,
  completed_at              TIMESTAMPTZ,
  accuracy_pct              NUMERIC,
  score_delta_estimate      NUMERIC,
  seat_impact_estimate      NUMERIC,
  session_meta_json         JSONB         NOT NULL DEFAULT '{}',
  created_at                TIMESTAMPTZ   NOT NULL DEFAULT now(),
  updated_at                TIMESTAMPTZ   NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_ps_student   ON public.practice_sessions(student_profile_id);
CREATE INDEX IF NOT EXISTS idx_ps_mode      ON public.practice_sessions(mode);
CREATE INDEX IF NOT EXISTS idx_ps_status    ON public.practice_sessions(status);
CREATE INDEX IF NOT EXISTS idx_ps_leak      ON public.practice_sessions(linked_mark_leak_id);

ALTER TABLE public.practice_sessions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "ps_owner_all"         ON public.practice_sessions;
DROP POLICY IF EXISTS "ps_project_admin_all" ON public.practice_sessions;
CREATE POLICY "ps_owner_all"         ON public.practice_sessions FOR ALL TO authenticated
  USING (student_profile_id = auth.uid()) WITH CHECK (student_profile_id = auth.uid());
CREATE POLICY "ps_project_admin_all" ON public.practice_sessions FOR ALL TO project_admin
  USING (true) WITH CHECK (true);

-- ── practice_session_items ────────────────────────────────
CREATE TABLE IF NOT EXISTS public.practice_session_items (
  id                    UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  practice_session_id   UUID        NOT NULL REFERENCES public.practice_sessions(id) ON DELETE CASCADE,
  question_bank_id      UUID        NOT NULL REFERENCES public.question_bank(id) ON DELETE RESTRICT,
  display_order         INT         NOT NULL,
  is_attempted          BOOLEAN     NOT NULL DEFAULT false,
  is_correct            BOOLEAN,
  selected_answer       TEXT,
  time_spent_seconds    INT         NOT NULL DEFAULT 0,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (practice_session_id, display_order)
);

CREATE INDEX IF NOT EXISTS idx_psi_session  ON public.practice_session_items(practice_session_id);
CREATE INDEX IF NOT EXISTS idx_psi_question ON public.practice_session_items(question_bank_id);

ALTER TABLE public.practice_session_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "psi_owner_all"         ON public.practice_session_items;
DROP POLICY IF EXISTS "psi_project_admin_all" ON public.practice_session_items;
CREATE POLICY "psi_owner_all" ON public.practice_session_items FOR ALL TO authenticated
  USING (
    practice_session_id IN (
      SELECT id FROM public.practice_sessions WHERE student_profile_id = auth.uid()
    )
  )
  WITH CHECK (
    practice_session_id IN (
      SELECT id FROM public.practice_sessions WHERE student_profile_id = auth.uid()
    )
  );
CREATE POLICY "psi_project_admin_all" ON public.practice_session_items FOR ALL TO project_admin
  USING (true) WITH CHECK (true);
