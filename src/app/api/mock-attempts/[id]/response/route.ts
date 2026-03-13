import { NextResponse } from 'next/server'
import { getInsforgeAdminClient } from '@/lib/insforgeAdmin'
import { getUidFromCookies } from '@/lib/session'

interface ResponseBody {
  question_bank_id: string
  selected_answer_json: { answer: string } | null
  question_state: string
  time_spent_seconds: number
  visit_count: number
  changed_answer_count: number
  marked_for_review: boolean
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
    const body = (await req.json()) as ResponseBody
    const {
      question_bank_id,
      selected_answer_json,
      question_state,
      time_spent_seconds,
      visit_count,
      changed_answer_count,
      marked_for_review,
    } = body

    if (!question_bank_id) {
      return NextResponse.json({ ok: false, error: 'question_bank_id is required.' }, { status: 400 })
    }

    const db = getInsforgeAdminClient()

    // Verify attempt ownership and in_progress status
    const attemptRes = await db.database
      .from('mock_attempts')
      .select('id, status')
      .eq('id', attemptId)
      .eq('student_profile_id', uid)
      .single()

    if (attemptRes.error || !attemptRes.data) {
      return NextResponse.json({ ok: false, error: 'Attempt not found.' }, { status: 404 })
    }

    const attempt = attemptRes.data as { id: string; status: string }
    if (attempt.status !== 'in_progress') {
      return NextResponse.json({ ok: false, error: 'Attempt already submitted.' }, { status: 409 })
    }

    const now = new Date().toISOString()
    const isAnswered = selected_answer_json !== null

    // Upsert the response row
    const upsertRes = await db.database
      .from('mock_responses')
      .upsert(
        {
          mock_attempt_id: attemptId,
          question_bank_id,
          selected_answer_json,
          question_state,
          time_spent_seconds: time_spent_seconds ?? 0,
          visit_count: visit_count ?? 1,
          changed_answer_count: changed_answer_count ?? 0,
          marked_for_review: marked_for_review ?? false,
          answered_at: isAnswered ? now : null,
          updated_at: now,
        },
        { onConflict: 'mock_attempt_id,question_bank_id' }
      )
      .select('id')

    if (upsertRes.error) {
      return NextResponse.json(
        { ok: false, error: 'Failed to save response.' },
        { status: 500 }
      )
    }

    return NextResponse.json({ ok: true })
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Unknown error'
    return NextResponse.json({ ok: false, error: msg }, { status: 500 })
  }
}
