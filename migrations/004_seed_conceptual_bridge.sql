-- ============================================================
-- 99Plus — Seed 004: Conceptual Bridge data for 5 CUET questions
-- ============================================================

UPDATE public.question_bank
SET
  logic_fix_text = 'The passage directly says "inequitable distribution" — Option B captures this exactly. Scarcity (A), carelessness (C), and technology (D) are never mentioned.',
  pattern_text   = 'Comprehension questions: always anchor your answer to words explicitly in the passage. Never infer beyond what is written.'
WHERE question_code = 'CUET-ENG-001';

UPDATE public.question_bank
SET
  logic_fix_text = '"Neither of" = singular. Rule: neither/either + of + [plural noun] → singular verb. "Neither of the students HAS" (not "have"). Option D fails on noun: "the student" (should be "students").',
  pattern_text   = 'Neither/Either of [plural noun] → singular verb. This trips up 60% of students. Memorize: NENO — Neither/Either + Noun → One verb.'
WHERE question_code = 'CUET-ENG-002';

UPDATE public.question_bank
SET
  logic_fix_text = 'Total distance = (60×2) + (80×3) = 360 km. Total time = 5 h. Average = 360÷5 = 72 km/h. Never use (60+80)÷2 for different time intervals — that only works for equal time.',
  pattern_text   = 'Average speed = Total Distance ÷ Total Time. Only use (v1+v2)/2 when TIME is equal. When DISTANCE is equal, use harmonic mean: 2v1v2/(v1+v2).'
WHERE question_code = 'CUET-GT-001';

UPDATE public.question_bank
SET
  logic_fix_text = 'f(−2) = 2(−2)² − 3(−2) + 1 = 2(4) + 6 + 1 = 8 + 6 + 1 = 15. Common error: sign mistake on the −3(−2) term. Negative × Negative = Positive.',
  pattern_text   = 'When substituting negative values: (−2)² = +4 (even power → positive). −3×(−2) = +6 (neg × neg = pos). Work each term separately before adding.'
WHERE question_code = 'CUET-MATH-001';

UPDATE public.question_bank
SET
  logic_fix_text = 'A(2×3) × B(3×4): inner dimensions must match (3=3 ✓). Product order = A_rows × B_cols = 2×4. The middle "3s" cancel out.',
  pattern_text   = 'Matrix multiplication order: A(m×n) × B(n×p) = C(m×p). Remember "The middle numbers eat each other. The outer numbers survive."'
WHERE question_code = 'CUET-MATH-002';
