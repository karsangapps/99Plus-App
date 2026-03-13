import { NextResponse } from 'next/server'
import { getInsforgeAdminClient } from '@/lib/insforgeAdmin'
import { getUidFromCookies } from '@/lib/session'
import type { ResponseState } from '@/components/nta-test/types'

interface SubmitBody {
  responses: Record<string, ResponseState>
  auto_submitted: boolean
  duration_seconds_used: number
}

interface RouteContext {
  params: Promise<{ id: string }>
}

export async function POST(req: Request, { params }: RouteContext) {
  try {
    const uid = await getUidFromCookies()
    if (!uid) {
      return NextResponse.json({ ok: false, error: 'Not signed in.' }, { status: 401 })
    }

    const { id: attemptId } = await params
    const body = (await req.json()) as SubmitBody
    const { responses, auto_submitted, duration_seconds_used } = body

    const db = getInsforgeAdminClient()

    // Verify attempt ownership
    const attemptRes = await db.database
      .from('mock_attempts')
      .select('id, mock_test_id, status')
      .eq('id', attemptId)
      .eq('student_profile_id', uid)
      .single()

    if (attemptRes.error || !attemptRes.data) {
      return NextResponse.json({ ok: false, error: 'Attempt not found.' }, { status: 404 })
    }

    const attempt = attemptRes.data as { id: string; mock_test_id: string; status: string }

    // Idempotent: already submitted
    if (attempt.status === 'submitted') {
      return NextResponse.json({ ok: true, already_submitted: true })
    }

    // Fetch the mock test for scoring rules
    const testRes = await db.database
      .from('mock_tests')
      .select('marks_correct, marks_wrong, negative_marking_enabled')
      .eq('id', attempt.mock_test_id)
      .single()

    const test = (testRes.data as {
      marks_correct: number
      marks_wrong: number
      negative_marking_enabled: boolean
    } | null) ?? { marks_correct: 5, marks_wrong: 1, negative_marking_enabled: true }

    // Fetch correct answers from question_bank
    const questionIds = Object.keys(responses)
    const qRes = await db.database
      .from('question_bank')
      .select('id, correct_answer_json')
      .in('id', questionIds)

    const correctMap: Record<string, string> = {}
    if (qRes.data) {
      for (const row of qRes.data as Array<{ id: string; correct_answer_json: { answer: string } }>) {
        correctMap[row.id] = row.correct_answer_json?.answer ?? ''
      }
    }

    // Compute scores
    let rawScore = 0
    let correctCount = 0
    let wrongCount = 0
    let unattemptedCount = 0
    let negativeMarsTotal = 0

    const responseRows: Array<{
      mock_attempt_id: string
      question_bank_id: string
      selected_answer_json: { answer: string } | null
      is_correct: boolean | null
      question_state: string
      time_spent_seconds: number
      visit_count: number
      changed_answer_count: number
      marked_for_review: boolean
      answered_at: string | null
      updated_at: string
    }> = []

    const now = new Date().toISOString()

    for (const [qId, r] of Object.entries(responses)) {
      const correctAnswer = correctMap[qId]
      const selectedAnswer = r.selectedAnswer
      let isCorrect: boolean | null = null

      if (selectedAnswer && correctAnswer) {
        isCorrect = selectedAnswer === correctAnswer
        if (isCorrect) {
          rawScore += test.marks_correct
          correctCount++
        } else {
          if (test.negative_marking_enabled) {
            rawScore -= test.marks_wrong
            negativeMarsTotal += test.marks_wrong
          }
          wrongCount++
        }
      } else {
        unattemptedCount++
      }

      responseRows.push({
        mock_attempt_id: attemptId,
        question_bank_id: qId,
        selected_answer_json: selectedAnswer ? { answer: selectedAnswer } : null,
        is_correct: isCorrect,
        question_state: r.questionState,
        time_spent_seconds: r.timeSpentSeconds,
        visit_count: r.visitCount,
        changed_answer_count: r.changedAnswerCount,
        marked_for_review:
          r.questionState === 'marked_for_review' ||
          r.questionState === 'answered_and_marked',
        answered_at: selectedAnswer ? now : null,
        updated_at: now,
      })
    }

    const totalAttempted = correctCount + wrongCount
    const accuracyPct =
      totalAttempted > 0 ? Math.round((correctCount / totalAttempted) * 100) : 0

    // Simulated normalization (z-score approximation)
    // For baseline: expected mean ≈ 30% correct, SD ≈ 15 marks
    const expectedMean = questionIds.length * test.marks_correct * 0.30
    const expectedStd = questionIds.length * test.marks_correct * 0.15
    const z = expectedStd > 0 ? (rawScore - expectedMean) / expectedStd : 0
    const simulatedPercentile = Math.min(99.9, Math.max(0.1, normalCDF(z) * 100))
    const simulatedNormalizedScore = Math.round(simulatedPercentile * 8) // scaled to 800

    // Upsert all response rows
    if (responseRows.length > 0) {
      await db.database
        .from('mock_responses')
        .upsert(responseRows, { onConflict: 'mock_attempt_id,question_bank_id' })
    }

    // Lock the attempt
    await db.database
      .from('mock_attempts')
      .update({
        status: 'submitted',
        submitted_at: now,
        auto_submitted: auto_submitted ?? false,
        duration_seconds_used: duration_seconds_used ?? 0,
        raw_score: rawScore,
        simulated_percentile: Math.round(simulatedPercentile * 10) / 10,
        simulated_normalized_score: simulatedNormalizedScore,
        accuracy_pct: accuracyPct,
        negative_marks_total: negativeMarsTotal,
        meta_json: {
          correct_count: correctCount,
          wrong_count: wrongCount,
          unattempted_count: unattemptedCount,
          total_questions: questionIds.length,
        },
      })
      .eq('id', attemptId)

    // Update student account_state to 'diagnosed' if eligible
    await db.database
      .from('student_profiles')
      .update({ account_state: 'diagnosed' })
      .eq('user_id', uid)
      .in('account_state', ['eligibility_locked', 'baseline_pending'])

    return NextResponse.json({
      ok: true,
      raw_score: rawScore,
      simulated_percentile: Math.round(simulatedPercentile * 10) / 10,
      simulated_normalized_score: simulatedNormalizedScore,
      accuracy_pct: accuracyPct,
      correct_count: correctCount,
      wrong_count: wrongCount,
      unattempted_count: unattemptedCount,
    })
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Unknown error'
    return NextResponse.json({ ok: false, error: msg }, { status: 500 })
  }
}

// Approximation of the standard normal CDF using the Horner method
function normalCDF(z: number): number {
  const a1 = 0.254829592
  const a2 = -0.284496736
  const a3 = 1.421413741
  const a4 = -1.453152027
  const a5 = 1.061405429
  const p = 0.3275911
  const sign = z < 0 ? -1 : 1
  const x = Math.abs(z) / Math.sqrt(2)
  const t = 1.0 / (1.0 + p * x)
  const y = 1 - ((((a5 * t + a4) * t + a3) * t + a2) * t + a1) * t * Math.exp(-x * x)
  return 0.5 * (1 + sign * y)
}
