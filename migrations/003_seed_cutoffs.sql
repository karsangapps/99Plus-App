-- ============================================================
-- 99Plus — Seed 003: DU Cutoff Benchmarks (2025 actuals)
-- SRCC, LSR from STATUS.md seeded colleges
-- Hansraj, Hindu added for heatmap richness
-- ============================================================

-- Seed additional colleges (Hansraj, Hindu) under DU
INSERT INTO public.colleges (id, university_id, name, short_code, campus_type, is_active)
VALUES
  ('00000002-0000-0000-0000-000000000003', '00000001-0000-0000-0000-000000000001',
   'Hansraj College', 'HRC', 'main', true),
  ('00000002-0000-0000-0000-000000000004', '00000001-0000-0000-0000-000000000001',
   'Hindu College', 'HC', 'main', true),
  ('00000002-0000-0000-0000-000000000005', '00000001-0000-0000-0000-000000000001',
   'Miranda House', 'MH', 'main', true),
  ('00000002-0000-0000-0000-000000000006', '00000001-0000-0000-0000-000000000001',
   'Kirori Mal College', 'KMC', 'main', true)
ON CONFLICT (id) DO NOTHING;

-- Seed B.Com (Hons) programs at the new colleges
INSERT INTO public.programs (id, college_id, name, degree_type, discipline, is_active)
VALUES
  ('00000003-0000-0000-0000-000000000003', '00000002-0000-0000-0000-000000000003',
   'B.Com (Hons)', 'UG', 'Commerce', true),
  ('00000003-0000-0000-0000-000000000004', '00000002-0000-0000-0000-000000000004',
   'B.Com (Hons)', 'UG', 'Commerce', true),
  ('00000003-0000-0000-0000-000000000005', '00000002-0000-0000-0000-000000000005',
   'B.A. (Hons) Economics', 'UG', 'Humanities', true),
  ('00000003-0000-0000-0000-000000000006', '00000002-0000-0000-0000-000000000006',
   'B.Com (Hons)', 'UG', 'Commerce', true)
ON CONFLICT (id) DO NOTHING;

-- ── DU Cutoff Benchmarks 2025 (General Category, CSAS Round 1) ──────
INSERT INTO public.cutoff_benchmarks
  (university_id, college_id, program_id, category, round, exam_year,
   cutoff_score, cutoff_percentile, total_seats, confidence, notes)
VALUES
  -- SRCC — B.Com (Hons) — highest cutoff in DU
  ('00000001-0000-0000-0000-000000000001',
   '00000002-0000-0000-0000-000000000001',
   '00000003-0000-0000-0000-000000000001',
   'General', 'CSAS Round 1', 2025,
   770, 96.1, 400, 'high',
   'SRCC B.Com 2025: 770/800 in CUET General, ~96.1 percentile'),

  -- Hindu College — B.Com (Hons)
  ('00000001-0000-0000-0000-000000000001',
   '00000002-0000-0000-0000-000000000004',
   '00000003-0000-0000-0000-000000000004',
   'General', 'CSAS Round 1', 2025,
   707, 88.4, 322, 'high',
   'Hindu College B.Com 2025: ~88.4 percentile'),

  -- Hansraj College — B.Com (Hons)
  ('00000001-0000-0000-0000-000000000001',
   '00000002-0000-0000-0000-000000000003',
   '00000003-0000-0000-0000-000000000003',
   'General', 'CSAS Round 1', 2025,
   634, 79.2, 355, 'high',
   'Hansraj College B.Com 2025: ~79.2 percentile'),

  -- LSR — B.A. Political Science (Hons)
  ('00000001-0000-0000-0000-000000000001',
   '00000002-0000-0000-0000-000000000002',
   '00000003-0000-0000-0000-000000000002',
   'General', 'CSAS Round 1', 2025,
   656, 82.1, 50, 'high',
   'LSR Political Science 2025: ~82.1 percentile'),

  -- Miranda House — B.A. Economics
  ('00000001-0000-0000-0000-000000000001',
   '00000002-0000-0000-0000-000000000005',
   '00000003-0000-0000-0000-000000000005',
   'General', 'CSAS Round 1', 2025,
   690, 86.5, 60, 'medium',
   'Miranda House Economics 2025: ~86.5 percentile'),

  -- Kirori Mal — B.Com (Hons)
  ('00000001-0000-0000-0000-000000000001',
   '00000002-0000-0000-0000-000000000006',
   '00000003-0000-0000-0000-000000000006',
   'General', 'CSAS Round 1', 2025,
   580, 72.5, 320, 'high',
   'Kirori Mal B.Com 2025: ~72.5 percentile')

ON CONFLICT (college_id, program_id, category, round, exam_year)
  WHERE college_id IS NOT NULL AND program_id IS NOT NULL
  DO UPDATE SET
    cutoff_score = EXCLUDED.cutoff_score,
    cutoff_percentile = EXCLUDED.cutoff_percentile,
    notes = EXCLUDED.notes;
