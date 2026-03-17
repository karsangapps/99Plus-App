import { NextResponse } from 'next/server'
import { getInsforgeAdminClient } from '@/lib/insforgeAdmin'
import { getUidFromCookies } from '@/lib/session'

interface RouteContext {
  params: Promise<{ sessionId: string }>
}

export async function POST(req: Request, { params }: RouteContext) {
  try {
    const uid = await getUidFromCookies()
    if (!uid) return NextResponse.json({ ok: false, error: 'Not signed in.' }, { status: 401 })

    const { sessionId } = await params
    const db = getInsforgeAdminClient()

    // Verify ownership
    const sessionRes = await db.database
      .from('practice_sessions')
      .select('id, status, linked_mark_leak_id, linked_mock_attempt_id, mode')
      .eq('id', sessionId)
      .eq('student_profile_id', uid)
      .single()

    if (sessionRes.error || !sessionRes.data) {
      return NextResponse.json({ ok: false, error: 'Session not found.' }, { status: 404 })
    }

    const session = sessionRes.data as {
      id: string; status: string
      linked_mark_leak_id: string | null
      linked_mock_attempt_id: string | null
      mode: string
    }

    if (session.status === 'completed') {
      return NextResponse.json({ ok: true, already_completed: true })
    }

    // Compute score from session items
    const itemsRes = await db.database
      .from('practice_session_items')
      .select('is_attempted, is_correct, time_spent_seconds')
      .eq('practice_session_id', sessionId)

    const items = (itemsRes.data ?? []) as Array<{
      is_attempted: boolean; is_correct: boolean | null; time_spent_seconds: number
    }>

    const attempted = items.filter(i => i.is_attempted)
    const correct = items.filter(i => i.is_correct === true)
    const wrong = items.filter(i => i.is_correct === false)
    const totalTime = items.reduce((sum, i) => sum + (i.time_spent_seconds ?? 0), 0)
    const accuracyPct = attempted.length > 0
      ? Math.round((correct.length / attempted.length) * 100)
      : 0

    // Determine mark_leak outcome
    let leakOutcome: 'sealed' | 'reduced' | 'unchanged' = 'unchanged'
    let leakUpdateMessage = ''

    if (session.linked_mark_leak_id) {
      if (accuracyPct >= 70) {
        leakOutcome = 'sealed'
        await db.database
          .from('mark_leaks')
          .update({
            is_resolved: true,
            severity_score: 0,
            last_seen_at: new Date().toISOString(),
          })
          .eq('id', session.linked_mark_leak_id)
        leakUpdateMessage = 'Mark leak sealed — this weakness is conquered.'
      } else if (accuracyPct >= 40) {
        leakOutcome = 'reduced'
        // Halve the severity
        const leakRes = await db.database
          .from('mark_leaks')
          .select('severity_score')
          .eq('id', session.linked_mark_leak_id)
          .single()
        const oldSeverity = (leakRes.data as { severity_score: number } | null)?.severity_score ?? 0
        await db.database
          .from('mark_leaks')
          .update({
            severity_score: oldSeverity * 0.5,
            last_seen_at: new Date().toISOString(),
          })
          .eq('id', session.linked_mark_leak_id)
        leakUpdateMessage = 'Mark leak severity reduced by 50% — keep drilling.'
      } else {
        leakUpdateMessage = 'More practice needed on this topic.'
      }
    }

    // Mark session as completed
    await db.database
      .from('practice_sessions')
      .update({
        status: 'completed',
        completed_at: new Date().toISOString(),
        accuracy_pct: accuracyPct,
        session_meta_json: {
          correct_count: correct.length,
          wrong_count: wrong.length,
          attempted_count: attempted.length,
          total_questions: items.length,
          total_time_seconds: totalTime,
          leak_outcome: leakOutcome,
        },
      })
      .eq('id', sessionId)

    return NextResponse.json({
      ok: true,
      accuracy_pct: accuracyPct,
      correct_count: correct.length,
      wrong_count: wrong.length,
      total_questions: items.length,
      leak_outcome: leakOutcome,
      leak_message: leakUpdateMessage,
      linked_attempt_id: session.linked_mock_attempt_id,
    })
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Unknown error'
    return NextResponse.json({ ok: false, error: msg }, { status: 500 })
  }
}
