import { NextResponse } from 'next/server'
import { getInsforgeAdminClient } from '@/lib/insforgeAdmin'
import { getUidFromCookies } from '@/lib/session'

interface StartBody {
  mock_test_id: string
}

export async function POST(req: Request) {
  try {
    const uid = await getUidFromCookies()
    if (!uid) {
      return NextResponse.json({ ok: false, error: 'Not signed in.' }, { status: 401 })
    }

    const body = (await req.json()) as StartBody
    const { mock_test_id } = body

    if (!mock_test_id) {
      return NextResponse.json({ ok: false, error: 'mock_test_id is required.' }, { status: 400 })
    }

    const db = getInsforgeAdminClient()

    // Verify the mock test exists and is published
    const testRes = await db.database
      .from('mock_tests')
      .select('id, duration_seconds, total_questions')
      .eq('id', mock_test_id)
      .eq('is_published', true)
      .single()

    if (testRes.error || !testRes.data) {
      return NextResponse.json({ ok: false, error: 'Mock test not found or not published.' }, { status: 404 })
    }

    const mockTest = testRes.data as { id: string; duration_seconds: number; total_questions: number }

    // Check if there's already an in_progress attempt for this test
    const existingRes = await db.database
      .from('mock_attempts')
      .select('id')
      .eq('student_profile_id', uid)
      .eq('mock_test_id', mock_test_id)
      .eq('status', 'in_progress')
      .maybeSingle()

    if (existingRes.data) {
      const existing = existingRes.data as { id: string }
      return NextResponse.json({ ok: true, attempt_id: existing.id, resumed: true })
    }

    // Count previous attempts for this student+test
    const countRes = await db.database
      .from('mock_attempts')
      .select('id', { count: 'exact', head: true })
      .eq('student_profile_id', uid)
      .eq('mock_test_id', mock_test_id)

    const attemptNumber = (countRes.count ?? 0) + 1

    // Create the attempt
    const insertRes = await db.database
      .from('mock_attempts')
      .insert({
        student_profile_id: uid,
        mock_test_id,
        attempt_number: attemptNumber,
        status: 'in_progress',
        started_at: new Date().toISOString(),
        duration_seconds_used: 0,
        meta_json: {
          total_questions: mockTest.total_questions,
          duration_seconds: mockTest.duration_seconds,
        },
      })
      .select('id')
      .single()

    if (insertRes.error || !insertRes.data) {
      return NextResponse.json(
        { ok: false, error: 'Failed to create attempt.' },
        { status: 500 }
      )
    }

    const attempt = insertRes.data as { id: string }
    return NextResponse.json({ ok: true, attempt_id: attempt.id, resumed: false })
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Unknown error'
    return NextResponse.json({ ok: false, error: msg }, { status: 500 })
  }
}
