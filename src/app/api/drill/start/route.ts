import { NextResponse } from 'next/server'
import { getInsforgeAdminClient } from '@/lib/insforgeAdmin'
import { getUidFromCookies } from '@/lib/session'

interface StartBody {
  mark_leak_id?: string
  mock_attempt_id?: string
  mode?: 'gap_remedy' | 'topic_mastery' | 'pyq' | 'full_mock'
}

export async function POST(req: Request) {
  try {
    const uid = await getUidFromCookies()
    if (!uid) return NextResponse.json({ ok: false, error: 'Not signed in.' }, { status: 401 })

    const body = (await req.json()) as StartBody
    const mode = body.mode ?? 'gap_remedy'
    const db = getInsforgeAdminClient()

    let sessionTitle = 'Gap-Remedy Drill'
    let linkedLeakId: string | null = null
    let linkedAttemptId: string | null = body.mock_attempt_id ?? null
    let questionIds: string[] = []

    if (mode === 'gap_remedy' && body.mark_leak_id) {
      // Fetch the specific mark leak to build a targeted drill
      const leakRes = await db.database
        .from('mark_leaks')
        .select('id, subject, chapter_name, question_bank_id, lost_marks, severity_score, mock_attempt_id')
        .eq('id', body.mark_leak_id)
        .eq('student_profile_id', uid)
        .single()

      if (leakRes.error || !leakRes.data) {
        return NextResponse.json({ ok: false, error: 'Mark leak not found.' }, { status: 404 })
      }

      const leak = leakRes.data as {
        id: string; subject: string; chapter_name: string; question_bank_id: string | null
        lost_marks: number; severity_score: number; mock_attempt_id: string | null
      }

      linkedLeakId = leak.id
      linkedAttemptId = leak.mock_attempt_id ?? linkedAttemptId
      sessionTitle = `Gap-Remedy: ${leak.chapter_name}`

      // Build question set from same chapter/subject in question_bank
      // Include the original wrong question + similar ones from same chapter
      const qRes = await db.database
        .from('question_bank')
        .select('id, question_code, subject, chapter_name, difficulty')
        .eq('subject', leak.subject)
        .eq('chapter_name', leak.chapter_name)
        .eq('is_active', true)
        .eq('audit_status', 'audited')
        .limit(8)

      const chapterQs = (qRes.data ?? []) as Array<{ id: string }>
      questionIds = chapterQs.map(q => q.id)

      // If the original wrong question isn't already in the list, prepend it
      if (leak.question_bank_id && !questionIds.includes(leak.question_bank_id)) {
        questionIds = [leak.question_bank_id, ...questionIds].slice(0, 8)
      }

      // Fall back to all questions from the same subject if chapter has too few
      if (questionIds.length < 3) {
        const fallbackRes = await db.database
          .from('question_bank')
          .select('id')
          .eq('subject', leak.subject)
          .eq('is_active', true)
          .limit(8)
        questionIds = ((fallbackRes.data ?? []) as Array<{ id: string }>).map(q => q.id)
      }
    } else {
      // Generic: use all questions from the mock test question bank
      const qRes = await db.database
        .from('question_bank')
        .select('id')
        .eq('is_active', true)
        .eq('audit_status', 'audited')
        .limit(8)
      questionIds = ((qRes.data ?? []) as Array<{ id: string }>).map(q => q.id)
    }

    if (questionIds.length === 0) {
      return NextResponse.json({ ok: false, error: 'No questions available for this drill.' }, { status: 404 })
    }

    // Create the practice session
    const sessionRes = await db.database
      .from('practice_sessions')
      .insert({
        student_profile_id: uid,
        mode,
        source_type: body.mark_leak_id ? 'auto_from_diagnosis' : 'manual_browse',
        title: sessionTitle,
        linked_mark_leak_id: linkedLeakId,
        linked_mock_attempt_id: linkedAttemptId,
        target_duration_seconds: 1200,
        status: 'assigned',
        session_meta_json: {
          question_count: questionIds.length,
          mark_leak_id: linkedLeakId,
        },
      })
      .select('id')
      .single()

    if (sessionRes.error || !sessionRes.data) {
      return NextResponse.json({ ok: false, error: 'Failed to create session.' }, { status: 500 })
    }

    const sessionId = (sessionRes.data as { id: string }).id

    // Create session items (one per question)
    const items = questionIds.map((qId, idx) => ({
      practice_session_id: sessionId,
      question_bank_id: qId,
      display_order: idx + 1,
    }))

    await db.database.from('practice_session_items').insert(items)

    return NextResponse.json({ ok: true, session_id: sessionId })
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Unknown error'
    return NextResponse.json({ ok: false, error: msg }, { status: 500 })
  }
}
