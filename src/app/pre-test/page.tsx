/**
 * /pre-test — Pre-Test Configuration (PRD §9.1)
 * Student configures and launches a CUET 2026 mock attempt.
 */
import { redirect } from 'next/navigation'
import { getUidFromCookies } from '@/lib/session'
import { getInsforgeAdminClient } from '@/lib/insforgeAdmin'
import type { Metadata, Viewport } from 'next'
import PreTestClient from '@/components/pre-test/PreTestClient'

export const metadata: Metadata = { title: 'Pre-Test Setup — CUET 2026 | 99Plus' }
export const viewport: Viewport = { width: 'device-width', initialScale: 1 }

export default async function PreTestPage() {
  const uid = await getUidFromCookies()
  if (!uid) redirect('/login')

  const db = getInsforgeAdminClient()

  const { data: mockTests } = await db.database
    .from('mock_tests')
    .select('id, title, subject, duration_seconds, total_questions, marks_correct, marks_wrong')
    .eq('status', 'published')
    .order('created_at', { ascending: false })

  const tests = (mockTests as Array<{
    id: string; title: string; subject: string;
    duration_seconds: number; total_questions: number;
    marks_correct: number; marks_wrong: number;
  }> | null) ?? []

  return <PreTestClient mockTests={tests} />
}
