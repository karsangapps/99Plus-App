import { NextResponse } from 'next/server'
import { getInsforgeAdminClient } from '@/lib/insforgeAdmin'
import { getUidFromCookies } from '@/lib/session'

type Body = {
  otp?: string
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

function isExpired(createdAtIso: string, ttlMinutes: number) {
  const created = new Date(createdAtIso)
  if (Number.isNaN(created.getTime())) return true
  const expires = new Date(created.getTime() + ttlMinutes * 60 * 1000)
  return new Date() > expires
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
    const otp = String(body.otp || '').trim()
    if (!otp) {
      return NextResponse.json(
        { ok: false, error: 'OTP is required.' },
        { status: 400 }
      )
    }

    const insforge = getInsforgeAdminClient()

    const profileRes = await insforge.database
      .from('student_profiles')
      .select('id, guardian_required, account_state')
      .eq('user_id', uid)
      .limit(1)

    if (profileRes.error || !profileRes.data?.[0]?.id) {
      return NextResponse.json(
        { ok: false, error: 'Student profile not found.' },
        { status: 404 }
      )
    }

    const studentProfileId = profileRes.data[0].id as string

    const latestOtp = await insforge.database
      .from('consent_logs')
      .select('id, otp_reference, token_hash, created_at, status')
      .eq('student_profile_id', studentProfileId)
      .eq('status', 'otp_sent')
      .order('created_at', { ascending: false })
      .limit(1)

    if (latestOtp.error || !latestOtp.data?.[0]?.id) {
      return NextResponse.json(
        { ok: false, error: 'No OTP request found.' },
        { status: 400 }
      )
    }

    const row = latestOtp.data[0] as {
      id: string
      otp_reference: string | null
      token_hash: string | null
      created_at: string
    }

    if (!row.otp_reference || !row.token_hash) {
      return NextResponse.json(
        { ok: false, error: 'OTP record is incomplete.' },
        { status: 500 }
      )
    }

    if (isExpired(row.created_at, 10)) {
      await insforge.database
        .from('consent_logs')
        .update({ status: 'expired' })
        .eq('id', row.id)
      return NextResponse.json(
        { ok: false, error: 'OTP expired. Please request a new one.' },
        { status: 400 }
      )
    }

    const computed = await sha256Hex(`${row.otp_reference}:${otp}`)
    if (computed !== row.token_hash) {
      return NextResponse.json(
        { ok: false, error: 'Invalid OTP.' },
        { status: 400 }
      )
    }

    const verifyRes = await insforge.database
      .from('consent_logs')
      .update({ status: 'verified', verified_at: new Date().toISOString() })
      .eq('id', row.id)
      .select()

    if (verifyRes.error) {
      return NextResponse.json(
        { ok: false, error: verifyRes.error.message || 'Failed to record consent.' },
        { status: 500 }
      )
    }

    const unlockRes = await insforge.database
      .from('student_profiles')
      .update({ account_state: 'guardian_verified' })
      .eq('id', studentProfileId)

    if (unlockRes.error) {
      return NextResponse.json(
        { ok: false, error: unlockRes.error.message || 'Failed to unlock student.' },
        { status: 500 }
      )
    }

    const verifiedGuardianId =
      (verifyRes.data?.[0] as { guardian_profile_id?: string } | undefined)
        ?.guardian_profile_id || null

    if (verifiedGuardianId) {
      await insforge.database
        .from('guardian_links')
        .update({ verified_at: new Date().toISOString() })
        .eq('student_profile_id', studentProfileId)
        .eq('guardian_profile_id', verifiedGuardianId)
    }

    return NextResponse.json({ ok: true, next: '/onboarding' })
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Unknown error'
    return NextResponse.json({ ok: false, error: msg }, { status: 500 })
  }
}

