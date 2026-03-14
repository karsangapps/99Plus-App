import { NextResponse } from 'next/server'
import { getInsforgeAdminClient } from '@/lib/insforgeAdmin'
import { getUidFromCookies } from '@/lib/session'

interface AnswerBody {
  question_bank_id: string
  selected_answer: string
  time_spent_seconds: number
}

interface RouteContext {
  params: Promise<{ sessionId: string }>
}

export async function POST(req: Request, { params }: RouteContext) {
  try {
    const uid = await getUidFromCookies()
    if (!uid) return NextResponse.json({ ok: false, error: 'Not signed in.' }, { status: 401 })

    const { sessionId } = await params
    const body = (await req.json()) as AnswerBody
    const { question_bank_id, selected_answer, time_spent_seconds } = body

    const db = getInsforgeAdminClient()

    // Verify session ownership and that it's active
    const sessionRes = await db.database
      .from('practice_sessions')
      .select('id, status, student_profile_id')
      .eq('id', sessionId)
      .eq('student_profile_id', uid)
      .single()

    if (sessionRes.error || !sessionRes.data) {
      return NextResponse.json({ ok: false, error: 'Session not found.' }, { status: 404 })
    }

    const session = sessionRes.data as { id: string; status: string; student_profile_id: string }
    if (session.status === 'completed' || session.status === 'abandoned') {
      return NextResponse.json({ ok: false, error: 'Session already closed.' }, { status: 409 })
    }

    // Start the session if not yet started
    if (session.status === 'assigned') {
      await db.database
        .from('practice_sessions')
        .update({ status: 'started', started_at: new Date().toISOString() })
        .eq('id', sessionId)
    }

    // Fetch the question — correct answer + Conceptual Bridge data
    const qRes = await db.database
      .from('question_bank')
      .select('id, question_code, subject, chapter_name, difficulty, correct_answer_json, logic_fix_text, pattern_text, ncert_book, ncert_page_start, ncert_page_end')
      .eq('id', question_bank_id)
      .single()

    if (qRes.error || !qRes.data) {
      return NextResponse.json({ ok: false, error: 'Question not found.' }, { status: 404 })
    }

    const q = qRes.data as {
      id: string; question_code: string; subject: string; chapter_name: string
      difficulty: number
      correct_answer_json: { answer: string }
      logic_fix_text: string | null; pattern_text: string | null
      ncert_book: string | null; ncert_page_start: number | null; ncert_page_end: number | null
    }

    const correctAnswer = q.correct_answer_json?.answer ?? ''
    const isCorrect = selected_answer === correctAnswer

    // Update the session item
    const itemUpdate = await db.database
      .from('practice_session_items')
      .update({
        is_attempted: true,
        is_correct: isCorrect,
        selected_answer,
        time_spent_seconds: time_spent_seconds ?? 0,
      })
      .eq('practice_session_id', sessionId)
      .eq('question_bank_id', question_bank_id)

    if (itemUpdate.error) {
      return NextResponse.json({ ok: false, error: 'Failed to save answer.' }, { status: 500 })
    }

    // Build NCERT reference string
    const ncertRef = q.ncert_book
      ? `${q.ncert_book}${q.ncert_page_start ? `, pg. ${q.ncert_page_start}` : ''}`
      : `${q.subject} — ${q.chapter_name}`

    // Return the Conceptual Bridge payload immediately
    return NextResponse.json({
      ok: true,
      is_correct: isCorrect,
      correct_answer: correctAnswer,
      conceptual_bridge: {
        logic_fix: q.logic_fix_text ?? `The correct answer is ${correctAnswer}. Review ${q.chapter_name} carefully.`,
        pattern: q.pattern_text ?? `Master the core concept in ${q.chapter_name} to avoid similar leaks.`,
        ncert_ref: ncertRef,
        ncert_page: q.ncert_page_start,
        chapter_name: q.chapter_name,
        subject: q.subject,
      },
    })
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Unknown error'
    return NextResponse.json({ ok: false, error: msg }, { status: 500 })
  }
}
