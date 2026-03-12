import { NextResponse } from 'next/server'
import { getInsforgeAdminClient } from '@/lib/insforgeAdmin'
import { getUidFromCookies } from '@/lib/session'

type Body = {
  class12Stream?: string
  targetUniversity?: string
  dreamCollege?: string
  dreamCourse?: string
}

export async function POST(req: Request) {
  try {
    const uid = await getUidFromCookies()
    if (!uid) {
      return NextResponse.json(
        { ok: false, error: 'Not signed in.' },
        { status: 401 }
      )
    }

    const body = (await req.json()) as Body

    const class12Stream = (body.class12Stream || '').trim()
    const targetUniversity = (body.targetUniversity || '').trim()
    const dreamCollege = (body.dreamCollege || '').trim()
    const dreamCourse = (body.dreamCourse || '').trim()

    if (!class12Stream || !targetUniversity || !dreamCollege || !dreamCourse) {
      return NextResponse.json(
        { ok: false, error: 'Missing required fields.' },
        { status: 400 }
      )
    }

    const insforge = getInsforgeAdminClient()

    const payload = {
      class_12_stream: class12Stream,
      target_university: targetUniversity,
      dream_college: dreamCollege,
      dream_course: dreamCourse
    }

    const updateRes = await insforge.database
      .from('student_profiles')
      .update({
        ...payload,
        account_state: 'target_selected',
        target_university_count: 1
      })
      .eq('user_id', uid)
      .select()

    if (updateRes.error) {
      return NextResponse.json(
        { ok: false, error: updateRes.error.message || 'Failed to save.' },
        { status: 500 }
      )
    }

    return NextResponse.json({ ok: true, data: updateRes.data })
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Unknown server error'
    return NextResponse.json({ ok: false, error: msg }, { status: 500 })
  }
}

