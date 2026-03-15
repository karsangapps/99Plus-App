import { NextResponse } from 'next/server'
import { createClient } from '@insforge/sdk'
import fs from 'node:fs'
import path from 'node:path'

type Body = {
  email?: string
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
    if (!email) {
      return NextResponse.json(
        { ok: false, error: 'Email is required.' },
        { status: 400 }
      )
    }

    const { baseUrl, key } = getProjectConfig()
    const insforge = createClient({ baseUrl, anonKey: key })

    // InsForge SDK is Supabase-compatible; this triggers a secure reset email.
    const resetRes = await insforge.auth.sendResetPasswordEmail({ email })

    if (resetRes?.error) {
      return NextResponse.json(
        { ok: false, error: resetRes.error.message || 'Failed to send reset email.' },
        { status: 500 }
      )
    }

    return NextResponse.json({ ok: true })
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Unknown error'
    return NextResponse.json({ ok: false, error: msg }, { status: 500 })
  }
}

