import { notFound, redirect } from 'next/navigation'
import { getInsforgeAdminClient } from '@/lib/insforgeAdmin'
import { getUidFromCookies } from '@/lib/session'
import { NtaTestShell } from '@/components/nta-test/NtaTestShell'
import type { AttemptPayload, TestQuestion, BankQuestion } from '@/components/nta-test/types'

interface PageProps {
  params: Promise<{ attemptId: string }>
}

export default async function NtaTestPage({ params }: PageProps) {
  const { attemptId } = await params
  const uid = await getUidFromCookies()
  if (!uid) redirect('/login')

  const db = getInsforgeAdminClient()

  // Fetch the attempt (verify ownership)
  const attemptRes = await db.database
    .from('mock_attempts')
    .select('id, mock_test_id, student_profile_id, status, started_at, duration_seconds_used, mock_tests(id, title, test_type, subject_bundle_json, total_questions, total_marks, duration_seconds, negative_marking_enabled, marks_correct, marks_wrong, instructions_json)')
    .eq('id', attemptId)
    .eq('student_profile_id', uid)
    .single()

  if (attemptRes.error || !attemptRes.data) {
    notFound()
  }

  type MockTestShape = {
    id: string
    title: string
    test_type: string
    subject_bundle_json: string[]
    total_questions: number
    total_marks: number
    duration_seconds: number
    negative_marking_enabled: boolean
    marks_correct: number
    marks_wrong: number
    instructions_json: { en: string[]; hi: string[] } | null
  }

  // InsForge returns joined FK as array or single depending on cardinality
  const rawAttempt = attemptRes.data as unknown as {
    id: string
    mock_test_id: string
    student_profile_id: string
    status: string
    started_at: string
    duration_seconds_used: number
    mock_tests: MockTestShape | MockTestShape[]
  }

  const attempt = {
    ...rawAttempt,
    mock_tests: Array.isArray(rawAttempt.mock_tests)
      ? rawAttempt.mock_tests[0]
      : rawAttempt.mock_tests,
  }

  if (attempt.status === 'submitted') {
    redirect(`/diagnosis/${attemptId}`)
  }

  // Fetch questions for this mock test
  const questionsRes = await db.database
    .from('mock_test_questions')
    .select(`
      id, mock_test_id, question_bank_id, display_order, section_label,
      marks_correct, marks_wrong,
      question_bank (
        id, question_code, subject, chapter_name, question_type, difficulty,
        question_body_json, options_json, correct_answer_json, explanation_json
      )
    `)
    .eq('mock_test_id', attempt.mock_test_id)
    .order('display_order', { ascending: true })

  if (questionsRes.error || !questionsRes.data || questionsRes.data.length === 0) {
    notFound()
  }

  const questions: TestQuestion[] = (questionsRes.data as unknown as Array<{
    id: string
    mock_test_id: string
    question_bank_id: string
    display_order: number
    section_label: string
    marks_correct: number
    marks_wrong: number
    question_bank: BankQuestion
  }>).map((row) => ({
    id: row.id,
    mock_test_id: row.mock_test_id,
    question_bank_id: row.question_bank_id,
    display_order: row.display_order,
    section_label: row.section_label,
    marks_correct: row.marks_correct,
    marks_wrong: row.marks_wrong,
    question: row.question_bank,
  }))

  // Fetch candidate name
  const profileRes = await db.database
    .from('student_profiles')
    .select('full_name')
    .eq('user_id', uid)
    .single()

  const candidateName =
    (profileRes.data as { full_name: string } | null)?.full_name ?? 'Student'

  const mt = attempt.mock_tests
  const elapsed = attempt.duration_seconds_used ?? 0
  const remaining = Math.max(0, mt.duration_seconds - elapsed)

  const payload: AttemptPayload = {
    attemptId: attempt.id,
    mockTest: {
      id: mt.id,
      title: mt.title,
      test_type: mt.test_type,
      subject_bundle_json: mt.subject_bundle_json,
      total_questions: mt.total_questions,
      total_marks: mt.total_marks,
      duration_seconds: mt.duration_seconds,
      negative_marking_enabled: mt.negative_marking_enabled,
      marks_correct: mt.marks_correct,
      marks_wrong: mt.marks_wrong,
      instructions_json: mt.instructions_json,
    },
    questions,
    startedAt: attempt.started_at,
    durationSeconds: remaining,
  }

  return <NtaTestShell payload={payload} candidateName={candidateName} />
}
