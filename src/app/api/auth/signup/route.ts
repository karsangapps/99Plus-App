import { NextResponse } from 'next/server'
import { cookies, headers } from 'next/headers'
import { createClient } from '@insforge/sdk'
import fs from 'node:fs'
import path from 'node:path'
import { uidCookieName } from '@/lib/session'
import { signupBodySchema } from '@/lib/validations/signup'

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
    console.log('[Signup API] Received /api/auth/signup request')
    const raw = await req.json()
    const parsed = signupBodySchema.safeParse(raw)
    if (!parsed.success) {
      const issues = parsed.error.issues
      const first = issues[0]
      const msg = first ? `${first.path.join('.')}: ${first.message}` : 'Validation failed.'
      console.log('[Signup API] Validation failed:', issues)
      return NextResponse.json({ ok: false, error: msg }, { status: 400 })
    }
    const body = parsed.data

    const fullName = body.fullName
    const email = body.email
    const phone = body.phone
    const dob = body.dob
    const password = body.password
    const preferredLanguage = body.preferredLanguage
    const examYear = body.examYear
    const class12Stream = body.class12Stream
    const boardName = body.boardName
    const targetUniversities = body.targetUniversities

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

    console.log('[Signup API] Step 1: auth.signUp for', email)
    const signUpRes = await insforge.auth.signUp({ email, password, name: fullName })
    if (signUpRes.error) {
      console.error('[Signup API] auth.signUp failed:', signUpRes.error)
      return NextResponse.json(
        { ok: false, error: signUpRes.error?.message || 'Signup failed.' },
        { status: 500 }
      )
    }

    // requireEmailVerification is disabled in project config.
    // If it were enabled, data.requireEmailVerification would be true
    // and data.user.id would still be present but no accessToken.
    if (signUpRes.data?.requireEmailVerification) {
      console.error('[Signup API] Email verification unexpectedly required — disable it in InsForge auth config.')
      return NextResponse.json(
        { ok: false, error: 'Email verification is enabled on the server. Contact support.' },
        { status: 500 }
      )
    }

    const authUserId = signUpRes.data?.user?.id as string | undefined
    if (!authUserId) {
      console.error('[Signup API] signUp returned no user id', signUpRes.data)
      return NextResponse.json({ ok: false, error: 'Signup failed: no user id.' }, { status: 500 })
    }
    console.log('[Signup API] Step 2: insert users row for', authUserId)

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
      console.error('[Signup API] users insert failed:', userInsert.error)
      return NextResponse.json(
        { ok: false, error: userInsert.error.message || 'Failed to create user.' },
        { status: 500 }
      )
    }

    console.log('[Signup API] Step 3: insert student_profiles')
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
      console.error('[Signup API] student_profiles insert failed:', profileInsert.error)
      return NextResponse.json(
        {
          ok: false,
          error: profileInsert.error?.message || 'Failed to create profile.'
        },
        { status: 500 }
      )
    }

    const studentProfileId = profileInsert.data[0].id as string
    console.log('[Signup API] Created student profile', {
      authUserId,
      studentProfileId,
      accountState
    })

    console.log('[Signup API] Step 4: insert user_targets (best-effort)')
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
          console.error('[Signup API] user_targets insert failed:', targetsInsert.error)
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

    console.log('[Signup API] Step 5: insert consent_logs')
    // DPDP notice log (pending)
    const h = await headers()
    const ua = h.get('user-agent')
    const rawIp = h.get('x-forwarded-for')?.split(',')[0]?.trim()
    const ip = rawIp && rawIp.length > 0 ? rawIp : null

    const noticeInsert = await insforge.database.from('consent_logs').insert([
      {
        student_profile_id: studentProfileId,
        guardian_profile_id: null,
        notice_version: 'dpdp_v1',
        status: 'pending',
        consent_purpose: isMinor ? 'dpdp_minor_processing' : 'dpdp_student_notice',
        communication_alerts_opt_in: false,
        verification_channel: isMinor ? String(body.guardian?.method ?? 'sms') : 'none',
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
      console.error('[Signup API] consent_logs insert failed:', noticeInsert.error)
      return NextResponse.json(
        { ok: false, error: noticeInsert.error.message || 'Failed to log consent.' },
        { status: 500 }
      )
    }

    console.log('[Signup API] Step 6: set uid cookie')
    // Set session cookie (Next.js 15+ requires awaiting cookies())
    const cookieStore = await cookies()
    cookieStore.set(uidCookieName(), authUserId, {
      httpOnly: true,
      sameSite: 'lax',
      secure: false,
      path: '/'
    })

    const next = isMinor ? '/guardian/consent' : '/onboarding'
    console.log('[Signup API] Completed signup', {
      authUserId,
      isMinor,
      next
    })

    return NextResponse.json({
      ok: true,
      next
    })
  } catch (e) {
    console.error('[Signup API] CRASH:', e)
    const msg = e instanceof Error ? e.message : 'Unknown error'
    return NextResponse.json({ ok: false, error: msg }, { status: 500 })
  }
}

