import { NextResponse } from 'next/server'
import { getUidFromCookies } from '@/lib/session'
import { getStudentProfileId } from '@/lib/studentProfile'
import { getInsforgeAdminClient } from '@/lib/insforgeAdmin'

type Body = {
  mode: 'gap_remedy' | 'topic_mastery' | 'pyq' | 'full_mock'
  linkedMarkLeakId?: string
}

export async function POST(req: Request) {
  try {
    const uid = await getUidFromCookies()
    if (!uid) {
      return NextResponse.json({ ok: false, error: 'Not signed in.' }, { status: 401 })
    }

    const studentProfileId = await getStudentProfileId(uid)
    if (!studentProfileId) {
      return NextResponse.json({ ok: false, error: 'Student profile not found.' }, { status: 404 })
    }

    const body = (await req.json()) as Body
    const { mode, linkedMarkLeakId } = body

    if (mode !== 'gap_remedy' && mode !== 'topic_mastery' && mode !== 'pyq' && mode !== 'full_mock') {
      return NextResponse.json(
        { ok: false, error: 'Valid mode required: gap_remedy, topic_mastery, pyq, full_mock.' },
        { status: 400 }
      )
    }

    if (mode === 'gap_remedy' && !linkedMarkLeakId) {
      return NextResponse.json(
        { ok: false, error: 'linkedMarkLeakId required for gap_remedy mode.' },
        { status: 400 }
      )
    }

    const db = getInsforgeAdminClient()
    let syllabusNodeId: string | null = null

    if (mode === 'gap_remedy' && linkedMarkLeakId) {
      const leakRes = await db.database
        .from('mark_leaks')
        .select('syllabus_node_id')
        .eq('id', linkedMarkLeakId)
        .eq('student_profile_id', studentProfileId)
        .single()
      if (leakRes.error || !leakRes.data) {
        return NextResponse.json({ ok: false, error: 'Mark leak not found.' }, { status: 404 })
      }
      syllabusNodeId = (leakRes.data as { syllabus_node_id: string }).syllabus_node_id
    }

    const questionCount = 15
    let questionIds: string[] = []

    if (syllabusNodeId) {
      const qRes = await db.database
        .from('question_bank')
        .select('id')
        .eq('syllabus_node_id', syllabusNodeId)
        .eq('is_active', true)
        .limit(questionCount)
      if (!qRes.error && Array.isArray(qRes.data) && qRes.data.length > 0) {
        questionIds = (qRes.data as { id: string }[]).map((q) => q.id)
      }
      if (questionIds.length === 0) {
        const fallbackRes = await db.database
          .from('question_bank')
          .select('id')
          .eq('is_active', true)
          .limit(questionCount)
        if (!fallbackRes.error && Array.isArray(fallbackRes.data)) {
          questionIds = (fallbackRes.data as { id: string }[]).map((q) => q.id)
        }
      }
    } else {
      const qRes = await db.database
        .from('question_bank')
        .select('id')
        .eq('is_active', true)
        .limit(questionCount)
      if (!qRes.error && Array.isArray(qRes.data)) {
        questionIds = (qRes.data as { id: string }[]).map((q) => q.id)
      }
    }

    const title =
      mode === 'gap_remedy'
        ? 'Gap-Remedy Drill'
        : mode === 'topic_mastery'
          ? 'Topic Mastery'
          : mode === 'pyq'
            ? 'PYQ Practice'
            : 'Full Mock'

    const sessionRes = await db.database
      .from('practice_sessions')
      .insert({
        student_profile_id: studentProfileId,
        mode,
        source_type: mode === 'gap_remedy' ? 'auto_from_diagnosis' : 'manual_browse',
        title,
        linked_mark_leak_id: mode === 'gap_remedy' ? linkedMarkLeakId : null,
        linked_syllabus_node_id: syllabusNodeId,
        target_duration_seconds: 900,
        status: 'assigned',
        credit_cost: 0
      })
      .select('id')
      .single()

    if (sessionRes.error || !sessionRes.data) {
      return NextResponse.json(
        { ok: false, error: sessionRes.error?.message ?? 'Failed to create session.' },
        { status: 500 }
      )
    }

    const sessionId = (sessionRes.data as { id: string }).id

    if (questionIds.length > 0) {
      const items = questionIds.map((qId, idx) => ({
        practice_session_id: sessionId,
        question_bank_id: qId,
        display_order: idx + 1
      }))
      await db.database.from('practice_session_items').insert(items)
    }

    return NextResponse.json({
      ok: true,
      sessionId,
      questionCount: questionIds.length
    })
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Unknown error'
    return NextResponse.json({ ok: false, error: msg }, { status: 500 })
  }
}
