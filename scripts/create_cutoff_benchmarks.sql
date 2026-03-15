-- ============================================================
-- cutoff_benchmarks — PRD §14.5.2
-- Powers the Distance-to-Seat heatmap (PRD §11)
-- ============================================================

CREATE TABLE IF NOT EXISTS cutoff_benchmarks (
  id                  UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  university          TEXT NOT NULL,
  college             TEXT NOT NULL,
  program             TEXT NOT NULL,
  category            TEXT NOT NULL DEFAULT 'General',
  round               INTEGER NOT NULL DEFAULT 1,
  exam_year           INTEGER NOT NULL,
  cutoff_score        NUMERIC(6,2),
  cutoff_percentile   NUMERIC(6,2) NOT NULL,
  confidence_level    TEXT NOT NULL DEFAULT 'official'
                        CHECK (confidence_level IN ('official', 'estimated', 'projected')),
  source              TEXT,
  created_at          TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at          TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Compound unique: one benchmark per college/program/category/round/year
CREATE UNIQUE INDEX IF NOT EXISTS uq_cutoff_benchmarks
  ON cutoff_benchmarks (college, program, category, round, exam_year);

CREATE INDEX IF NOT EXISTS idx_cutoff_college   ON cutoff_benchmarks (college);
CREATE INDEX IF NOT EXISTS idx_cutoff_year      ON cutoff_benchmarks (exam_year);
CREATE INDEX IF NOT EXISTS idx_cutoff_percentile ON cutoff_benchmarks (cutoff_percentile);

-- RLS: public read (cutoff data is reference data, not personal)
ALTER TABLE cutoff_benchmarks ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "public_read" ON cutoff_benchmarks;
CREATE POLICY "public_read" ON cutoff_benchmarks FOR SELECT USING (true);

-- ============================================================
-- Seed: CUET 2025 cutoff data — DU colleges
-- Source: DU CSAS 2025 official closing ranks
-- ============================================================

INSERT INTO cutoff_benchmarks
  (university, college, program, category, round, exam_year, cutoff_score, cutoff_percentile, confidence_level, source)
VALUES
  -- SRCC — B.Com (Hons)
  ('University of Delhi', 'Shri Ram College of Commerce (SRCC)', 'B.Com (Hons)', 'General',   1, 2025, NULL, 98.5, 'official', 'DU CSAS 2025 Round 1'),
  ('University of Delhi', 'Shri Ram College of Commerce (SRCC)', 'B.Com (Hons)', 'OBC-NCL',   1, 2025, NULL, 97.2, 'official', 'DU CSAS 2025 Round 1'),
  ('University of Delhi', 'Shri Ram College of Commerce (SRCC)', 'B.Com (Hons)', 'SC',        1, 2025, NULL, 93.0, 'official', 'DU CSAS 2025 Round 1'),
  ('University of Delhi', 'Shri Ram College of Commerce (SRCC)', 'B.Com (Hons)', 'ST',        1, 2025, NULL, 88.5, 'official', 'DU CSAS 2025 Round 1'),

  -- Hindu College — B.A. (Hons) Political Science
  ('University of Delhi', 'Hindu College',                        'B.A. Political Science (Hons)', 'General', 1, 2025, NULL, 97.2, 'official', 'DU CSAS 2025 Round 1'),
  ('University of Delhi', 'Hindu College',                        'B.A. Political Science (Hons)', 'OBC-NCL', 1, 2025, NULL, 95.8, 'official', 'DU CSAS 2025 Round 1'),
  ('University of Delhi', 'Hindu College',                        'B.A. Political Science (Hons)', 'SC',      1, 2025, NULL, 90.5, 'official', 'DU CSAS 2025 Round 1'),
  ('University of Delhi', 'Hindu College',                        'B.A. Political Science (Hons)', 'ST',      1, 2025, NULL, 85.0, 'official', 'DU CSAS 2025 Round 1'),

  -- Hansraj College — B.A. (Hons) Political Science
  ('University of Delhi', 'Hansraj College',                      'B.A. Political Science (Hons)', 'General', 1, 2025, NULL, 96.5, 'official', 'DU CSAS 2025 Round 1'),
  ('University of Delhi', 'Hansraj College',                      'B.A. Political Science (Hons)', 'OBC-NCL', 1, 2025, NULL, 94.5, 'official', 'DU CSAS 2025 Round 1'),
  ('University of Delhi', 'Hansraj College',                      'B.A. Political Science (Hons)', 'SC',      1, 2025, NULL, 88.0, 'official', 'DU CSAS 2025 Round 1'),
  ('University of Delhi', 'Hansraj College',                      'B.A. Political Science (Hons)', 'ST',      1, 2025, NULL, 82.5, 'official', 'DU CSAS 2025 Round 1'),

  -- SRCC — B.Com (Hons) Round 2 & 3 (for allotment tracker)
  ('University of Delhi', 'Shri Ram College of Commerce (SRCC)', 'B.Com (Hons)', 'General',   2, 2025, NULL, 98.2, 'official', 'DU CSAS 2025 Round 2'),
  ('University of Delhi', 'Shri Ram College of Commerce (SRCC)', 'B.Com (Hons)', 'General',   3, 2025, NULL, 97.9, 'official', 'DU CSAS 2025 Round 3')

ON CONFLICT (college, program, category, round, exam_year) DO UPDATE
  SET cutoff_percentile = EXCLUDED.cutoff_percentile,
      updated_at        = now();
