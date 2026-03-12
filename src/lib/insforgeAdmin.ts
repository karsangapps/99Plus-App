import { createClient } from '@insforge/sdk'
import fs from 'node:fs'
import path from 'node:path'

type InsforgeProjectJson = {
  oss_host?: string
  api_key?: string
}

let cached:
  | ReturnType<typeof createClient>
  | null = null

export function getInsforgeAdminClient() {
  if (cached) return cached

  const projectJsonPath = path.join(process.cwd(), '.insforge', 'project.json')
  const raw = fs.readFileSync(projectJsonPath, 'utf8')
  const parsed = JSON.parse(raw) as InsforgeProjectJson

  const baseUrl = parsed.oss_host
  const anonKey = parsed.api_key

  if (!baseUrl || !anonKey) {
    throw new Error(
      'InsForge is linked but project.json is missing oss_host/api_key.'
    )
  }

  cached = createClient({ baseUrl, anonKey })
  return cached
}

