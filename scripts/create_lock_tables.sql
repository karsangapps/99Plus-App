-- ============================================================
-- eligibility_lock_snapshots — immutable lock event
-- ============================================================
CREATE TABLE IF NOT EXISTS eligibility_lock_snapshots (
  id                     UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  student_profile_id     UUID NOT NULL,
  user_target_id         UUID,
  eligibility_rule_id    UUID REFERENCES eligibility_rules(id) NOT NULL,
  locked_subjects_json   JSONB NOT NULL,
  validation_result_json JSONB NOT NULL,
  lock_hash              TEXT NOT NULL,
  status                 TEXT NOT NULL DEFAULT 'locked',
  locked_at              TIMESTAMPTZ DEFAULT now(),
  invalidated_at         TIMESTAMPTZ,
  created_at             TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- student_subject_locks — one row per locked subject
-- ============================================================
CREATE TABLE IF NOT EXISTS student_subject_locks (
  id                 UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  student_profile_id UUID NOT NULL,
  snapshot_id        UUID REFERENCES eligibility_lock_snapshots(id) NOT NULL,
  subject_name       TEXT NOT NULL,
  section            TEXT NOT NULL,
  tag                TEXT NOT NULL,
  locked_at          TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- RLS — Reference tables: public read
-- ============================================================
ALTER TABLE universities      ENABLE ROW LEVEL SECURITY;
ALTER TABLE colleges          ENABLE ROW LEVEL SECURITY;
ALTER TABLE programs          ENABLE ROW LEVEL SECURITY;
ALTER TABLE eligibility_rules ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public_read" ON universities;
DROP POLICY IF EXISTS "public_read" ON colleges;
DROP POLICY IF EXISTS "public_read" ON programs;
DROP POLICY IF EXISTS "public_read" ON eligibility_rules;

CREATE POLICY "public_read" ON universities      FOR SELECT USING (true);
CREATE POLICY "public_read" ON colleges          FOR SELECT USING (true);
CREATE POLICY "public_read" ON programs          FOR SELECT USING (true);
CREATE POLICY "public_read" ON eligibility_rules FOR SELECT USING (true);

-- ============================================================
-- RLS — Lock tables: owner only
-- ============================================================
ALTER TABLE eligibility_lock_snapshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_subject_locks      ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "owner_read"   ON eligibility_lock_snapshots;
DROP POLICY IF EXISTS "owner_insert" ON eligibility_lock_snapshots;
DROP POLICY IF EXISTS "owner_read"   ON student_subject_locks;
DROP POLICY IF EXISTS "owner_insert" ON student_subject_locks;

CREATE POLICY "owner_read"   ON eligibility_lock_snapshots FOR SELECT USING (auth.uid()::text = student_profile_id::text);
CREATE POLICY "owner_insert" ON eligibility_lock_snapshots FOR INSERT WITH CHECK (auth.uid()::text = student_profile_id::text);
CREATE POLICY "owner_read"   ON student_subject_locks      FOR SELECT USING (auth.uid()::text = student_profile_id::text);
CREATE POLICY "owner_insert" ON student_subject_locks      FOR INSERT WITH CHECK (auth.uid()::text = student_profile_id::text);
