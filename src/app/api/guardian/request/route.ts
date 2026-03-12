import { NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { getInsforgeAdminClient } from '@/lib/insforgeAdmin'
import { getUidFromCookies } from '@/lib/session'

type Body = {
  guardianName?: string
  relationship?: string | null
  channel?: 'sms' | 'email'
  contact?: string
  communicationAlertsOptIn?: boolean
  confirmGuardian?: boolean
}

function sha256Hex(input: string) {
  const data = new TextEncoder().encode(input)
  return crypto.subtle.digest('SHA-256', data).then((buf) => {
    const bytes = new Uint8Array(buf)
    return Array.from(bytes)
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('')
  })
}

function randomOtp() {
  return String(Math.floor(100000 + Math.random() * 900000))
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
    const guardianName = String(body.guardianName || '').trim()
    const channel = body.channel === 'email' ? 'email' : 'sms'
    const contact = String(body.contact || '').trim()
    const communicationAlertsOptIn = Boolean(body.communicationAlertsOptIn)
    const confirmGuardian = Boolean(body.confirmGuardian)

    if (!guardianName || !contact || !confirmGuardian) {
      return NextResponse.json(
        { ok: false, error: 'Missing required fields.' },
        { status: 400 }
      )
    }

    const insforge = getInsforgeAdminClient()

    const profileRes = await insforge.database
      .from('student_profiles')
      .select('id, account_state, guardian_required, is_minor')
      .eq('user_id', uid)
      .limit(1)

    if (profileRes.error || !profileRes.data?.[0]?.id) {
      return NextResponse.json(
        { ok: false, error: 'Student profile not found.' },
        { status: 404 }
      )
    }

    const studentProfileId = profileRes.data[0].id as string

    const otp = randomOtp()
    const otpReference = `otp_${crypto.randomUUID()}`
    const tokenHash = await sha256Hex(`${otpReference}:${otp}`)

    const h = headers()
    const ua = h.get('user-agent')
    const ip = h.get('x-forwarded-for')?.split(',')[0]?.trim() || null

    const insertRes = await insforge.database.from('consent_logs').insert([
      {
        student_profile_id: studentProfileId,
        guardian_profile_id: null,
        notice_version: 'dpdp_v1',
        status: 'otp_sent',
        consent_purpose: 'dpdp_minor_processing',
        communication_alerts_opt_in: communicationAlertsOptIn,
        verification_channel: channel,
        otp_reference: otpReference,
        token_hash: tokenHash,
        ip_address: ip,
        user_agent: ua,
        artifact_url: null,
        verified_at: null,
        revoked_at: null
      }
    ])

    if (insertRes.error) {
      return NextResponse.json(
        { ok: false, error: insertRes.error.message || 'Failed to log OTP.' },
        { status: 500 }
      )
    }

    // Ensure student remains hard-gated until verified.
    await insforge.database
      .from('student_profiles')
      .update({ guardian_required: true, account_state: 'guardian_pending' })
      .eq('id', studentProfileId)

    // NOTE: This is a dev-safe placeholder. In production we would dispatch OTP via SMS/email.
    // We return no OTP in the API response.
    // For now, we log it to the server console to validate end-to-end flow.
    console.log(`[guardian-otp] channel=${channel} contact=${contact} otp=${otp} ref=${otpReference}`)

    return NextResponse.json({ ok: true })
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Unknown error'
    return NextResponse.json({ ok: false, error: msg }, { status: 500 })
  }
}

