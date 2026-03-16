-- Manual seed for cutoff_benchmarks (run via: insforge db query)
-- Use when npm run seed:cutoffs fails due to schema cache. Requires DU colleges (SRCC, LSR, Hindu, Hansraj) and BHU to exist.
-- Get IDs from: SELECT id FROM universities WHERE short_code='DU'; SELECT id, name, short_code FROM colleges WHERE university_id='<du_id>'; etc.

-- Example (replace UUIDs with actual IDs from your DB):
-- INSERT INTO cutoff_benchmarks (university_id, college_id, program_id, category, round_label, exam_year, cutoff_score, cutoff_percentile) VALUES
-- ('<du_uuid>', '<srcc_college_uuid>', '<bcom_program_uuid>', 'General', 'Round 1', 2024, 782, 99.5),
-- ('<du_uuid>', '<srcc_college_uuid>', '<bcom_program_uuid>', 'General', 'Round 2', 2024, 775, 99.2);
