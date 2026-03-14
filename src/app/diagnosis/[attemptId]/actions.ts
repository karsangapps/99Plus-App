'use server'

import { getInsforgeAdminClient } from '@/lib/insforgeAdmin'
import { getUidFromCookies } from '@/lib/session'
import { redirect } from 'next/navigation'

// ── Types ───────────────────────────────────────────────────────────────────

export type LeakType = 'conceptual' | 'application' | 'speed' | 'guessing' | 'careless' | 'stamina' | 'pattern_gap'
export type SeatStatus = 'safe' | 'possible' | 'close' | 'reach'

export interface MarkLeak {
  id: string
  subject: string
  chapterName: string
  leakType: LeakType
  lostMarks: number
  severityScore: number
  ncertBook: string | null
  ncertPageStart: number | null
  ncertPageEnd: number | null
  occurrenceCount: number
  questionCode: string
  timeSpentSeconds: number
}

export interface SeatRow {
  collegeName: string
  programName: string
  universityName: string
  cutoffPercentile: number
  currentPercentile: number
  scoreGap: number
  percentileGap: number
  probabilityPct: number
  seatStatus: SeatStatus
  marksAway: number
}

export interface DiagnosisPayload {
  attempt: {
    id: string
    mockTestTitle: string
    completedAt: string
    rawScore: number
    totalMarks: number
    simulatedPercentile: number
    simulatedNormalizedScore: number
    accuracyPct: number
    correctCount: number
    wrongCount: number
    unattemptedCount: number
    avgTimeSeconds: number
    negativeMksTotal: number
    durationSecondsUsed: number
  }
  candidateName: string
  markLeaks: MarkLeak[]
  seatHeatmap: SeatRow[]
  topLeak: MarkLeak | null
  prescription: {
    drillTitle: string
    subject: string
    chapterName: string
    ncertReference: string
    estimatedMinutes: number
    projectedPercentileDelta: number
  } | null
}

// ── Helpers ─────────────────────────────────────────────────────────────────

function classifyLeakType(
  timeSpentSeconds: number,
  changedAnswerCount: number,
  difficulty: number,
  avgTimeSeconds: number
): LeakType {
  if (timeSpentSeconds < 15) return 'guessing'
  if (changedAnswerCount > 1) return 'careless'
  if (timeSpentSeconds > avgTimeSeconds * 2.5) return 'speed'
  if (difficulty >= 4) return 'conceptual'
  return 'application'
}

function computeSeverity(lostMarks: number, difficulty: number, occurrenceCount: number): number {
  return Math.round((lostMarks * (1 + 0.3 * difficulty) * (1 + 0.1 * (occurrenceCount - 1))) * 10) / 10
}

function computeProbability(scoreGap: number): number {
  // Logistic function centred on gap=0, sharpness=8
  const raw = 1 / (1 + Math.exp(-scoreGap / 8))
  return Math.round(raw * 1000) / 10 // 0.0–100.0
}

function computeSeatStatus(scoreGap: number): SeatStatus {
  if (scoreGap >= 15) return 'safe'
  if (scoreGap >= 1) return 'possible'
  if (scoreGap >= -10) return 'close'
  return 'reach'
}

// ── Main Action ─────────────────────────────────────────────────────────────

export async function getDiagnosisAction(attemptId: string): Promise<DiagnosisPayload> {
  const uid = await getUidFromCookies()
  if (!uid) redirect('/login')

  const db = getInsforgeAdminClient()

  // ── 1. Fetch the attempt ────────────────────────────────────────────────
  const attemptRes = await db.database
    .from('mock_attempts')
    .select(`
      id, student_profile_id, mock_test_id, status, submitted_at, started_at,
      raw_score, simulated_percentile, simulated_normalized_score,
      accuracy_pct, negative_marks_total, duration_seconds_used, meta_json,
      mock_tests ( id, title, total_marks, marks_correct, marks_wrong )
    `)
    .eq('id', attemptId)
    .eq('student_profile_id', uid)
    .single()

  if (attemptRes.error || !attemptRes.data) {
    throw new Error('Attempt not found or access denied.')
  }

  type AttemptRow = {
    id: string; student_profile_id: string; mock_test_id: string
    status: string; submitted_at: string | null; started_at: string
    raw_score: number; simulated_percentile: number; simulated_normalized_score: number
    accuracy_pct: number; negative_marks_total: number; duration_seconds_used: number
    meta_json: { correct_count?: number; wrong_count?: number; unattempted_count?: number }
    mock_tests: { id: string; title: string; total_marks: number; marks_correct: number; marks_wrong: number } | Array<{ id: string; title: string; total_marks: number; marks_correct: number; marks_wrong: number }>
  }

  const raw = attemptRes.data as unknown as AttemptRow
  const mt = Array.isArray(raw.mock_tests) ? raw.mock_tests[0] : raw.mock_tests
  const meta = raw.meta_json ?? {}

  // ── 2. Fetch responses + question data ──────────────────────────────────
  const respRes = await db.database
    .from('mock_responses')
    .select(`
      id, question_bank_id, selected_answer_json, is_correct,
      question_state, time_spent_seconds, visit_count, changed_answer_count,
      marked_for_review,
      question_bank (
        id, question_code, subject, chapter_name, difficulty,
        correct_answer_json, ncert_book, ncert_page_start, ncert_page_end
      )
    `)
    .eq('mock_attempt_id', attemptId)

  type ResponseRow = {
    id: string; question_bank_id: string
    selected_answer_json: { answer: string } | null
    is_correct: boolean | null; question_state: string
    time_spent_seconds: number; visit_count: number; changed_answer_count: number
    marked_for_review: boolean
    question_bank: {
      id: string; question_code: string; subject: string; chapter_name: string
      difficulty: number; correct_answer_json: { answer: string }
      ncert_book: string | null; ncert_page_start: number | null; ncert_page_end: number | null
    } | null
  }

  const responses = (respRes.data ?? []) as unknown as ResponseRow[]

  const answeredResponses = responses.filter(r => r.selected_answer_json !== null)
  const wrongResponses = responses.filter(r => r.is_correct === false)
  const correctCount = responses.filter(r => r.is_correct === true).length
  const wrongCount = wrongResponses.length
  const unattemptedCount = responses.filter(r => r.selected_answer_json === null).length

  const totalTimeSpent = responses.reduce((sum, r) => sum + (r.time_spent_seconds ?? 0), 0)
  const visitedCount = responses.filter(r => r.visit_count > 0).length
  const avgTimeSeconds = visitedCount > 0 ? Math.round(totalTimeSpent / visitedCount) : 0

  // ── 3. Build + upsert mark_leaks ─────────────────────────────────────────
  const markLeaks: MarkLeak[] = []

  for (const resp of wrongResponses) {
    const q = resp.question_bank
    if (!q) continue

    const leakType = classifyLeakType(
      resp.time_spent_seconds,
      resp.changed_answer_count,
      q.difficulty,
      avgTimeSeconds
    )
    const lostMarks = mt?.marks_wrong ?? 1
    const severityScore = computeSeverity(lostMarks, q.difficulty, 1)

    // Insert mark_leak row — ignoreDuplicates preserves first_seen_at on refresh
    const now = new Date().toISOString()
    const insertRes = await db.database
      .from('mark_leaks')
      .upsert(
        {
          student_profile_id: uid,
          mock_attempt_id: attemptId,
          question_bank_id: q.id,
          subject: q.subject,
          chapter_name: q.chapter_name,
          leak_type: leakType,
          lost_marks: lostMarks,
          negative_marks_component: lostMarks,
          severity_score: severityScore,
          ncert_book: q.ncert_book ?? null,
          ncert_page_start: q.ncert_page_start ?? null,
          ncert_page_end: q.ncert_page_end ?? null,
          first_seen_at: now,
          last_seen_at: now,
          evidence_json: {
            time_spent_seconds: resp.time_spent_seconds,
            changed_answer_count: resp.changed_answer_count,
            difficulty: q.difficulty,
            selected: resp.selected_answer_json?.answer,
            correct: q.correct_answer_json?.answer,
          },
          affected_targets_json: [],
        },
        {
          onConflict: 'student_profile_id,mock_attempt_id,question_bank_id',
          ignoreDuplicates: true,  // preserve first_seen_at — never overwrite on refresh
        }
      )
      .select('id')
      .single()

    markLeaks.push({
      id: (insertRes.data as { id: string } | null)?.id ?? crypto.randomUUID(),
      subject: q.subject,
      chapterName: q.chapter_name,
      leakType,
      lostMarks,
      severityScore,
      ncertBook: q.ncert_book,
      ncertPageStart: q.ncert_page_start,
      ncertPageEnd: q.ncert_page_end,
      occurrenceCount: 1,
      questionCode: q.question_code,
      timeSpentSeconds: resp.time_spent_seconds,
    })
  }

  // Sort by severity descending
  markLeaks.sort((a, b) => b.severityScore - a.severityScore)

  // ── 4. Seat Heatmap — fetch targets + cutoffs ───────────────────────────
  const targetsRes = await db.database
    .from('user_targets')
    .select(`
      id, university_id, college_id, program_id, status,
      universities ( id, name, short_code ),
      colleges ( id, name, short_code ),
      programs ( id, name )
    `)
    .eq('student_profile_id', uid)

  type TargetRow = {
    id: string; university_id: string; college_id: string | null; program_id: string | null; status: string
    universities: { id: string; name: string; short_code: string } | Array<{ id: string; name: string; short_code: string }> | null
    colleges: { id: string; name: string; short_code: string } | Array<{ id: string; name: string; short_code: string }> | null
    programs: { id: string; name: string } | Array<{ id: string; name: string }> | null
  }

  const targets = (targetsRes.data ?? []) as unknown as TargetRow[]

  // Fetch all active DU cutoffs (so even if no target set, show something)
  const cutoffsRes = await db.database
    .from('cutoff_benchmarks')
    .select(`
      id, college_id, program_id, cutoff_score, cutoff_percentile, category, round,
      colleges ( id, name, short_code ),
      programs ( id, name )
    `)
    .eq('exam_year', 2025)
    .eq('category', 'General')
    .eq('is_active', true)
    .order('cutoff_percentile', { ascending: false })

  type CutoffRow = {
    id: string; college_id: string; program_id: string
    cutoff_score: number; cutoff_percentile: number; category: string; round: string
    colleges: { id: string; name: string; short_code: string } | Array<{ id: string; name: string; short_code: string }> | null
    programs: { id: string; name: string } | Array<{ id: string; name: string }> | null
  }

  const cutoffs = (cutoffsRes.data ?? []) as unknown as CutoffRow[]

  const currentPercentile = raw.simulated_percentile ?? 0
  const currentScore = raw.simulated_normalized_score ?? 0

  const seatHeatmap: SeatRow[] = cutoffs.map((cb) => {
    const college = Array.isArray(cb.colleges) ? cb.colleges[0] : cb.colleges
    const program = Array.isArray(cb.programs) ? cb.programs[0] : cb.programs
    const scoreGap = currentScore - cb.cutoff_score
    const percentileGap = currentPercentile - cb.cutoff_percentile
    const probabilityPct = computeProbability(scoreGap)
    const seatStatus = computeSeatStatus(scoreGap)

    return {
      collegeName: college?.name ?? 'Unknown College',
      programName: program?.name ?? 'Unknown Program',
      universityName: 'University of Delhi',
      cutoffPercentile: cb.cutoff_percentile,
      currentPercentile,
      scoreGap: Math.round(scoreGap * 10) / 10,
      percentileGap: Math.round(percentileGap * 10) / 10,
      probabilityPct,
      seatStatus,
      marksAway: scoreGap < 0 ? Math.abs(Math.round(scoreGap)) : 0,
    }
  })

  // Sort: safe → possible → close → reach
  const statusOrder: Record<SeatStatus, number> = { safe: 0, possible: 1, close: 2, reach: 3 }
  seatHeatmap.sort((a, b) => statusOrder[a.seatStatus] - statusOrder[b.seatStatus])

  // ── 5. Insert college_target_analytics (one batch per attempt) ──────────
  // Delete stale rows for this attempt first, then insert fresh
  await db.database
    .from('college_target_analytics')
    .delete()
    .eq('source_attempt_id', attemptId)

  const analyticsRows = seatHeatmap.map(row => {
    const matchingCutoff = cutoffs.find((cb) => {
      const c = Array.isArray(cb.colleges) ? cb.colleges[0] : cb.colleges
      return c?.name === row.collegeName
    })
    return {
      student_profile_id: uid,
      source_attempt_id: attemptId,
      simulated_normalized_score: currentScore,
      simulated_percentile: currentPercentile,
      cutoff_score_estimate: matchingCutoff?.cutoff_score ?? 0,
      cutoff_percentile_estimate: matchingCutoff?.cutoff_percentile ?? 0,
      score_gap: row.scoreGap,
      percentile_gap: row.percentileGap,
      probability_pct: row.probabilityPct,
      seat_status: row.seatStatus,
      round_label: matchingCutoff?.round ?? 'CSAS Round 1',
      snapshot_json: { attempt_id: attemptId, college: row.collegeName, program: row.programName },
    }
  })

  if (analyticsRows.length > 0) {
    await db.database.from('college_target_analytics').insert(analyticsRows)
  }

  // ── 6. Fetch candidate name ──────────────────────────────────────────────
  const profileRes = await db.database
    .from('student_profiles')
    .select('full_name')
    .eq('user_id', uid)
    .single()
  const candidateName = (profileRes.data as { full_name: string } | null)?.full_name ?? 'Student'

  // ── 7. Build prescription from top leak ─────────────────────────────────
  const topLeak = markLeaks[0] ?? null
  const prescription = topLeak
    ? buildPrescription(topLeak, currentPercentile, seatHeatmap)
    : null

  return {
    attempt: {
      id: raw.id,
      mockTestTitle: mt?.title ?? 'Mock Test',
      completedAt: raw.submitted_at ?? raw.started_at,
      rawScore: raw.raw_score ?? 0,
      totalMarks: mt?.total_marks ?? 0,
      simulatedPercentile: raw.simulated_percentile ?? 0,
      simulatedNormalizedScore: raw.simulated_normalized_score ?? 0,
      accuracyPct: raw.accuracy_pct ?? 0,
      correctCount: meta.correct_count ?? correctCount,
      wrongCount: meta.wrong_count ?? wrongCount,
      unattemptedCount: meta.unattempted_count ?? unattemptedCount,
      avgTimeSeconds,
      negativeMksTotal: raw.negative_marks_total ?? 0,
      durationSecondsUsed: raw.duration_seconds_used ?? 0,
    },
    candidateName,
    markLeaks,
    seatHeatmap,
    topLeak,
    prescription,
  }
}

// ── Prescription builder ─────────────────────────────────────────────────────

function buildPrescription(
  topLeak: MarkLeak,
  currentPercentile: number,
  heatmap: SeatRow[]
): DiagnosisPayload['prescription'] {
  const ncertRef = topLeak.ncertBook
    ? `${topLeak.ncertBook}${topLeak.ncertPageStart ? `, pp. ${topLeak.ncertPageStart}–${topLeak.ncertPageEnd ?? topLeak.ncertPageStart}` : ''}`
    : `${topLeak.subject} — ${topLeak.chapterName}`

  // Find the closest reachable seat
  const closestSeat = heatmap.find(r => r.seatStatus === 'close') ?? heatmap.find(r => r.seatStatus === 'possible') ?? heatmap[0]

  // Estimate percentile delta: recovering lostMarks * 0.5 percentile points per mark (rough)
  const projectedDelta = Math.round(topLeak.lostMarks * 0.5 * 10) / 10

  return {
    drillTitle: `Surgical Drill: ${topLeak.chapterName}`,
    subject: topLeak.subject,
    chapterName: topLeak.chapterName,
    ncertReference: ncertRef,
    estimatedMinutes: 20,
    projectedPercentileDelta: projectedDelta,
  }
}
