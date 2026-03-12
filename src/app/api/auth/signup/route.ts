import { NextResponse } from 'next/server'
import { cookies, headers } from 'next/headers'
import { createClient } from '@insforge/sdk'
import fs from 'node:fs'
import path from 'node:path'
import { uidCookieName } from '@/lib/session'

type Body = {
  fullName?: string
  email?: string
  phone?: string
  dob?: string // yyyy-mm-dd
  password?: string
  preferredLanguage?: string
  examYear?: number
  class12Stream?: string
  boardName?: string
  targetUniversities?: unknown
  termsAccepted?: unknown
  guardian?: null | {
    method?: 'sms' | 'email'
    phone?: string | null
    email?: string | null
  }
}

type ProjectJson = {
  oss_host?: string
  api_key?: string
}

function getProjectConfig(): { baseUrl: string; key: string } {
  const projectJsonPath = path.join(process.cwd(), '.insforge', 'project.json')
  const raw = fs.readFileSync(projectJsonPath, 'utf8')
  const parsed = JSON.parse(raw) as ProjectJson
  if (!parsed.oss_host || !parsed.api_key) {
    throw new Error('Missing .insforge/project.json oss_host/api_key')
  }
  return { baseUrl: parsed.oss_host, key: parsed.api_key }
}

function computeAge(dobIso: string) {
  const dob = new Date(dobIso)
  if (Number.isNaN(dob.getTime())) return null
  const today = new Date()
  let age = today.getFullYear() - dob.getFullYear()
  const m = today.getMonth() - dob.getMonth()
  if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) age -= 1
  return age
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as Body

    const fullName = String(body.fullName || '').trim()
    const email = String(body.email || '').trim().toLowerCase()
    const phone = String(body.phone || '').trim()
    const dob = String(body.dob || '').trim()
    const password = String(body.password || '')

    const preferredLanguage = String(body.preferredLanguage || 'en').trim()
    const examYear = Number.isFinite(body.examYear) ? Number(body.examYear) : 2026
    const class12Stream = String(body.class12Stream || '').trim()
    const boardName = String(body.boardName || '').trim()
    const termsAccepted = Boolean(body.termsAccepted)
    const targetUniversities = Array.isArray(body.targetUniversities)
      ? body.targetUniversities
          .filter((x) => typeof x === 'string')
          .map((x) => x.trim())
          .filter(Boolean)
      : []

    if (!fullName || !email || !dob || !password) {
      return NextResponse.json(
        { ok: false, error: 'Missing required fields.' },
        { status: 400 }
      )
    }
    if (password.length < 8) {
      return NextResponse.json(
        { ok: false, error: 'Password must be at least 8 characters.' },
        { status: 400 }
      )
    }
    if (!class12Stream || !boardName) {
      return NextResponse.json(
        { ok: false, error: 'Class 12 stream and board are required.' },
        { status: 400 }
      )
    }
    if (!termsAccepted) {
      return NextResponse.json(
        { ok: false, error: 'You must accept the Terms and Privacy Policy.' },
        { status: 400 }
      )
    }
    if (!targetUniversities.length) {
      return NextResponse.json(
        { ok: false, error: 'Pick at least one target university.' },
        { status: 400 }
      )
    }

    const age = computeAge(dob)
    if (typeof age !== 'number') {
      return NextResponse.json(
        { ok: false, error: 'Invalid DOB.' },
        { status: 400 }
      )
    }
    const isMinor = age < 18

    const { baseUrl, key } = getProjectConfig()
    const insforge = createClient({ baseUrl, anonKey: key })

    const signUpRes = await insforge.auth.signUp({ email, password })
    if (signUpRes.error || !signUpRes.data?.user?.id) {
      return NextResponse.json(
        { ok: false, error: signUpRes.error?.message || 'Signup failed.' },
        { status: 500 }
      )
    }

    const authUserId = signUpRes.data.user.id as string

    // Public users row
    const userInsert = await insforge.database
      .from('users')
      .insert([
        {
          id: authUserId,
          role: 'student',
          email,
          phone: phone || null,
          is_active: true
        }
      ])
      .select('id')

    if (userInsert.error) {
      return NextResponse.json(
        { ok: false, error: userInsert.error.message || 'Failed to create user.' },
        { status: 500 }
      )
    }

    // Student profile
    const accountState = isMinor ? 'guardian_pending' : 'registered'
    const guardianRequired = isMinor

    const profileInsert = await insforge.database
      .from('student_profiles')
      .insert([
        {
          user_id: authUserId,
          full_name: fullName,
          dob,
          is_minor: isMinor,
          guardian_required: guardianRequired,
          account_state: accountState,
          preferred_language: preferredLanguage,
          exam_year: examYear,
          class_12_stream: class12Stream,
          board_name: boardName,
          target_university_count: targetUniversities.length
        }
      ])
      .select('id')

    if (profileInsert.error || !profileInsert.data?.[0]?.id) {
      return NextResponse.json(
        {
          ok: false,
          error: profileInsert.error?.message || 'Failed to create profile.'
        },
        { status: 500 }
      )
    }

    const studentProfileId = profileInsert.data[0].id as string

    // Provisional target universities (best-effort)
    const uniLookup = await insforge.database
      .from('universities')
      .select('id, short_code')
      .in('short_code', targetUniversities)

    if (!uniLookup.error && Array.isArray(uniLookup.data) && uniLookup.data.length) {
      const idByCode = new Map(
        (uniLookup.data as { id: string; short_code: string }[]).map((u) => [
          String(u.short_code),
          String(u.id)
        ])
      )

      const rows = targetUniversities
        .map((code, idx) => {
          const universityId = idByCode.get(code)
          if (!universityId) return null
          return {
            student_profile_id: studentProfileId,
            university_id: universityId,
            priority_rank: idx + 1,
            status: 'provisional',
            selected_subjects_json: {},
            eligibility_status: 'valid'
          }
        })
        .filter(Boolean) as unknown as Record<string, unknown>[]

      if (rows.length) {
        const targetsInsert = await insforge.database.from('user_targets').insert(rows)
        if (targetsInsert.error) {
          return NextResponse.json(
            {
              ok: false,
              error: targetsInsert.error.message || 'Failed to save targets.'
            },
            { status: 500 }
          )
        }
      }
    }

    // DPDP notice log (pending)
    const h = headers()
    const ua = h.get('user-agent')
    const ip = h.get('x-forwarded-for')?.split(',')[0]?.trim() || null

    const noticeInsert = await insforge.database.from('consent_logs').insert([
      {
        student_profile_id: studentProfileId,
        guardian_profile_id: null,
        notice_version: 'dpdp_v1',
        status: 'pending',
        consent_purpose: isMinor ? 'dpdp_minor_processing' : 'dpdp_student_notice',
        communication_alerts_opt_in: false,
        verification_channel: isMinor ? String(body.guardian?.method || 'sms') : 'none',
        otp_reference: null,
        token_hash: null,
        ip_address: ip,
        user_agent: ua,
        artifact_url: null,
        verified_at: null,
        revoked_at: null
      }
    ])

    if (noticeInsert.error) {
      return NextResponse.json(
        { ok: false, error: noticeInsert.error.message || 'Failed to log consent.' },
        { status: 500 }
      )
    }

    // Set session cookie (simple UID cookie for now)
    cookies().set(uidCookieName(), authUserId, {
      httpOnly: true,
      sameSite: 'lax',
      secure: false,
      path: '/'
    })

    return NextResponse.json({
      ok: true,
      next: isMinor ? '/guardian/consent' : '/onboarding'
    })
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Unknown error'
    return NextResponse.json({ ok: false, error: msg }, { status: 500 })
  }
}

