import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createClient } from '@insforge/sdk'
import fs from 'node:fs'
import path from 'node:path'
import { uidCookieName } from '@/lib/session'

type Body = {
  email?: string
  password?: string
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

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as Body
    const email = String(body.email || '').trim().toLowerCase()
    const password = String(body.password || '')

    if (!email || !password) {
      return NextResponse.json(
        { ok: false, error: 'Email and password are required.' },
        { status: 400 }
      )
    }

    const { baseUrl, key } = getProjectConfig()
    const insforge = createClient({ baseUrl, anonKey: key })

    const signInRes = await insforge.auth.signInWithPassword({ email, password })
    if (signInRes.error || !signInRes.data?.user?.id) {
      return NextResponse.json(
        { ok: false, error: signInRes.error?.message || 'Invalid credentials.' },
        { status: 401 }
      )
    }

    const uid = signInRes.data.user.id as string

    const cookieStore = await cookies()
    cookieStore.set(uidCookieName(), uid, {
      httpOnly: true,
      sameSite: 'lax',
      secure: false,
      path: '/'
    })

    const profileRes = await insforge.database
      .from('student_profiles')
      .select('account_state, guardian_required')
      .eq('user_id', uid)
      .limit(1)

    const accountState =
      (profileRes.data?.[0] as { account_state?: string } | undefined)
        ?.account_state || 'registered'

    const next =
      accountState === 'guardian_pending' ? '/guardian/consent' : '/onboarding'

    return NextResponse.json({ ok: true, next })
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Unknown error'
    return NextResponse.json({ ok: false, error: msg }, { status: 500 })
  }
}

