-- Fix B.A. Political Science optional_subject_groups_json
UPDATE eligibility_rules
SET
  optional_subject_groups_json = '[{"name": "Domain Subjects", "subjects": ["Political Science", "History", "Sociology", "Economics", "Geography", "Psychology"], "min_required": 3}]'::jsonb,
  min_domain_count = 3
WHERE program_id = '00000003-0000-0000-0000-000000000002';

-- Verify
SELECT
  er.id,
  p.name AS program,
  er.mandatory_subjects_json::text,
  er.optional_subject_groups_json::text,
  er.recommended_subjects_json::text,
  er.min_domain_count
FROM eligibility_rules er
JOIN programs p ON p.id = er.program_id;
