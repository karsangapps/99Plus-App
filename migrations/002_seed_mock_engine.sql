-- ============================================================
-- 99Plus — Seed 002: 1 CUET Mock Test + 5 Questions
-- Run AFTER migration 002_mock_engine.sql
-- ============================================================

-- ── Seed question_bank ─────────────────────────────────────
INSERT INTO public.question_bank
  (question_code, subject, section_code, chapter_name, question_type, difficulty,
   question_body_json, options_json, correct_answer_json, explanation_json,
   source_type, source_year, source_exam, ncert_book, ncert_page_start, ncert_page_end,
   audit_status, is_active)
VALUES
(
  'CUET-ENG-001',
  'English',
  'IA',
  'Reading Comprehension',
  'mcq',
  2,
  '{"en": "<p>Read the following passage and answer the question below:</p><p><em>\"The greatest challenge facing humanity today is not the scarcity of resources, but the inequitable distribution of what we already possess. A world that wastes one-third of its food while millions go hungry is not a world that lacks solutions — it is a world that lacks the will to implement them.\"</em></p><p>What is the central argument of the passage?</p>", "hi": "<p>निम्नलिखित गद्यांश पढ़ें और नीचे दिए गए प्रश्न का उत्तर दें:</p><p><em>\"आज मानवता के सामने सबसे बड़ी चुनौती संसाधनों की कमी नहीं, बल्कि जो हमारे पास है उसका असमान वितरण है। एक ऐसी दुनिया जो अपना एक तिहाई खाना बर्बाद करती है जबकि लाखों लोग भूखे रहते हैं, उसमें समाधान की कमी नहीं है — उसमें उन्हें लागू करने की इच्छाशक्ति की कमी है।\"</em></p><p>गद्यांश का मुख्य तर्क क्या है?</p>"}',
  '[{"key":"A","en":"Resources are scarce and must be conserved.","hi":"संसाधन दुर्लभ हैं और उन्हें संरक्षित करना होगा।"},{"key":"B","en":"The real problem is unfair distribution, not resource scarcity.","hi":"असली समस्या संसाधनों की कमी नहीं बल्कि असमान वितरण है।"},{"key":"C","en":"Food waste is caused by individual carelessness.","hi":"भोजन की बर्बादी व्यक्तिगत लापरवाही के कारण होती है।"},{"key":"D","en":"Humanity lacks technological solutions to hunger.","hi":"मानवता के पास भूख के तकनीकी समाधान नहीं हैं।"}]',
  '{"answer":"B"}',
  '{"en":"The author states that the problem is not scarcity but ''inequitable distribution''. Option B directly captures this. Options A, C, D introduce ideas not supported by the text.","hi":"लेखक कहता है कि समस्या कमी नहीं बल्कि ''असमान वितरण'' है। विकल्प B इसे सीधे व्यक्त करता है।"}',
  'original', NULL, NULL,
  'NCERT English Core', 12, 14,
  'audited', true
),
(
  'CUET-ENG-002',
  'English',
  'IA',
  'Grammar — Tenses',
  'mcq',
  2,
  '{"en": "<p>Choose the grammatically correct sentence:</p>", "hi": "<p>व्याकरणिक रूप से सही वाक्य चुनें:</p>"}',
  '[{"key":"A","en":"Neither of the students have submitted their assignment.","hi":"दोनों में से किसी भी छात्र ने अपना असाइनमेंट जमा नहीं किया है।"},{"key":"B","en":"Neither of the students has submitted their assignment.","hi":"दोनों में से किसी भी छात्र ने अपना असाइनमेंट जमा नहीं किया है।"},{"key":"C","en":"Neither of the students are submitting their assignment.","hi":"दोनों में से कोई भी छात्र अपना असाइनमेंट जमा नहीं कर रहा है।"},{"key":"D","en":"Neither of the student has submitted their assignment.","hi":"किसी भी छात्र ने अपना असाइनमेंट जमा नहीं किया है।"}]',
  '{"answer":"B"}',
  '{"en":"''Neither of'' takes a singular verb. ''Neither of the students has'' is correct. Option D has a noun agreement error (student vs students).","hi":"''Neither of'' के साथ singular verb आती है। ''Neither of the students has'' सही है।"}',
  'original', NULL, NULL, NULL, NULL, NULL,
  'audited', true
),
(
  'CUET-MATH-001',
  'Mathematics',
  'IIA',
  'Relations and Functions',
  'mcq',
  3,
  '{"en": "<p>If <em>f</em>(<em>x</em>) = 2<em>x</em>² − 3<em>x</em> + 1, find <em>f</em>(−2).</p>", "hi": "<p>यदि <em>f</em>(<em>x</em>) = 2<em>x</em>² − 3<em>x</em> + 1 हो, तो <em>f</em>(−2) का मान ज्ञात करें।</p>"}',
  '[{"key":"A","en":"15","hi":"15"},{"key":"B","en":"11","hi":"11"},{"key":"C","en":"7","hi":"7"},{"key":"D","en":"3","hi":"3"}]',
  '{"answer":"A"}',
  '{"en":"f(−2) = 2(−2)² − 3(−2) + 1 = 2(4) + 6 + 1 = 8 + 6 + 1 = 15.","hi":"f(−2) = 2(4) + 6 + 1 = 15."}',
  'original', NULL, NULL,
  'NCERT Mathematics Part I', 2, 4,
  'audited', true
),
(
  'CUET-MATH-002',
  'Mathematics',
  'IIA',
  'Matrices',
  'mcq',
  3,
  '{"en": "<p>If matrix <strong>A</strong> is of order 2×3 and matrix <strong>B</strong> is of order 3×4, what is the order of the product matrix <strong>AB</strong>?</p>", "hi": "<p>यदि आव्यूह <strong>A</strong> की कोटि 2×3 है और आव्यूह <strong>B</strong> की कोटि 3×4 है, तो गुणनफल आव्यूह <strong>AB</strong> की कोटि क्या होगी?</p>"}',
  '[{"key":"A","en":"3×3","hi":"3×3"},{"key":"B","en":"2×4","hi":"2×4"},{"key":"C","en":"2×3","hi":"2×3"},{"key":"D","en":"3×4","hi":"3×4"}]',
  '{"answer":"B"}',
  '{"en":"For matrix multiplication, A(m×n) × B(n×p) = AB(m×p). Here A is 2×3 and B is 3×4, so AB is 2×4.","hi":"A(2×3) × B(3×4) = AB(2×4). अतः AB की कोटि 2×4 होगी।"}',
  'original', NULL, NULL,
  'NCERT Mathematics Part I', 45, 47,
  'audited', true
),
(
  'CUET-GT-001',
  'General Test',
  'X',
  'Quantitative Reasoning',
  'mcq',
  2,
  '{"en": "<p>A train travels at 60 km/h for the first 2 hours and at 80 km/h for the next 3 hours. What is the average speed for the entire journey?</p>", "hi": "<p>एक ट्रेन पहले 2 घंटे 60 किमी/घंटा की गति से और अगले 3 घंटे 80 किमी/घंटा की गति से चलती है। पूरी यात्रा की औसत गति क्या है?</p>"}',
  '[{"key":"A","en":"70 km/h","hi":"70 किमी/घंटा"},{"key":"B","en":"72 km/h","hi":"72 किमी/घंटा"},{"key":"C","en":"74 km/h","hi":"74 किमी/घंटा"},{"key":"D","en":"75 km/h","hi":"75 किमी/घंटा"}]',
  '{"answer":"B"}',
  '{"en":"Total distance = (60×2) + (80×3) = 120 + 240 = 360 km. Total time = 5 hours. Average speed = 360/5 = 72 km/h.","hi":"कुल दूरी = 120 + 240 = 360 किमी। कुल समय = 5 घंटे। औसत गति = 360/5 = 72 किमी/घंटा।"}',
  'original', NULL, NULL, NULL, NULL, NULL,
  'audited', true
);

-- ── Seed mock_tests ────────────────────────────────────────
INSERT INTO public.mock_tests
  (id, title, test_type, subject_bundle_json, total_questions, total_marks,
   duration_seconds, negative_marking_enabled, marks_correct, marks_wrong,
   instructions_json, is_published)
VALUES
(
  '10000001-0000-0000-0000-000000000001',
  'CUET 2026 — Baseline Mock #1',
  'full_mock',
  '["English", "Mathematics", "General Test"]',
  5,
  25,
  3600,
  true,
  5,
  1,
  '{"en": ["Read all questions carefully before answering.", "Each correct answer carries 5 marks. Each wrong answer carries a penalty of 1 mark. Unanswered questions carry no penalty.", "You can navigate between questions using the question palette on the right.", "You can ''Mark for Review'' a question and come back to it later. A marked question with an answer will still be evaluated.", "The timer is displayed at the top right. The test will auto-submit when time runs out.", "Once you click ''Submit'', the test cannot be resumed."], "hi": ["उत्तर देने से पहले सभी प्रश्नों को ध्यानपूर्वक पढ़ें।", "प्रत्येक सही उत्तर के लिए 5 अंक मिलेंगे। प्रत्येक गलत उत्तर के लिए 1 अंक काटा जाएगा। अनुत्तरित प्रश्नों के लिए कोई कटौती नहीं होगी।", "आप दाईं ओर प्रश्न पैलेट का उपयोग करके प्रश्नों के बीच नेविगेट कर सकते हैं।", "आप एक प्रश्न को ''समीक्षा के लिए चिह्नित'' कर सकते हैं और बाद में उस पर वापस आ सकते हैं।", "टाइमर ऊपर दाईं ओर प्रदर्शित है। समय समाप्त होने पर परीक्षा स्वतः सबमिट हो जाएगी।", "एक बार ''सबमिट'' क्लिक करने के बाद, परीक्षा फिर से शुरू नहीं की जा सकती।"]}',
  true
);

-- ── Seed mock_test_questions ───────────────────────────────
INSERT INTO public.mock_test_questions
  (mock_test_id, question_bank_id, display_order, section_label, marks_correct, marks_wrong)
SELECT
  '10000001-0000-0000-0000-000000000001',
  id,
  row_number,
  CASE
    WHEN question_code LIKE 'CUET-ENG-%'  THEN 'English'
    WHEN question_code LIKE 'CUET-MATH-%' THEN 'Mathematics'
    WHEN question_code LIKE 'CUET-GT-%'   THEN 'General Test'
  END,
  5,
  1
FROM (
  SELECT id, question_code,
         ROW_NUMBER() OVER (ORDER BY question_code) AS row_number
  FROM public.question_bank
  WHERE question_code IN (
    'CUET-ENG-001', 'CUET-ENG-002',
    'CUET-MATH-001', 'CUET-MATH-002',
    'CUET-GT-001'
  )
) sub;
