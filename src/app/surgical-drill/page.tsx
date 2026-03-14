import { redirect } from 'next/navigation'
import { getInsforgeAdminClient } from '@/lib/insforgeAdmin'
import { getUidFromCookies } from '@/lib/session'
import { DrillHubShell } from '@/components/drill/DrillHubShell'
import type { ActiveLeak, DrillSession } from '@/components/drill/types'

export const dynamic = 'force-dynamic'

export default async function SurgicalDrillPage() {
  const uid = await getUidFromCookies()
  if (!uid) redirect('/login')

  const db = getInsforgeAdminClient()

  // Fetch all unresolved mark leaks, ordered by severity
  const leaksRes = await db.database
    .from('mark_leaks')
    .select('id, subject, chapter_name, lost_marks, severity_score, leak_type, mock_attempt_id')
    .eq('student_profile_id', uid)
    .eq('is_resolved', false)
    .order('severity_score', { ascending: false })
    .limit(20)

  type LeakRow = { id: string; subject: string; chapter_name: string; lost_marks: number; severity_score: number; leak_type: string; mock_attempt_id: string | null }
  const allLeaks: ActiveLeak[] = ((leaksRes.data ?? []) as LeakRow[]).map(r => ({
    id: r.id,
    subject: r.subject,
    chapterName: r.chapter_name,
    lostMarks: r.lost_marks,
    severityScore: r.severity_score,
    leakType: r.leak_type,
    mockAttemptId: r.mock_attempt_id,
  }))

  const activeLeak = allLeaks[0] ?? null

  // Fetch recent practice sessions
  const sessionsRes = await db.database
    .from('practice_sessions')
    .select('id, title, mode, status, accuracy_pct, created_at, completed_at, linked_mark_leak_id, session_meta_json')
    .eq('student_profile_id', uid)
    .order('created_at', { ascending: false })
    .limit(10)

  type SessionRow = { id: string; title: string; mode: string; status: string; accuracy_pct: number | null; created_at: string; completed_at: string | null; linked_mark_leak_id: string | null; session_meta_json: Record<string, unknown> }
  const recentSessions: DrillSession[] = ((sessionsRes.data ?? []) as SessionRow[]).map(r => ({
    id: r.id,
    title: r.title,
    mode: r.mode as DrillSession['mode'],
    status: r.status as DrillSession['status'],
    accuracyPct: r.accuracy_pct,
    createdAt: r.created_at,
    completedAt: r.completed_at,
    linkedMarkLeakId: r.linked_mark_leak_id,
    sessionMeta: (r.session_meta_json ?? {}) as DrillSession['sessionMeta'],
  }))

  // Compute stats
  const today = new Date().toISOString().split('T')[0]
  const completedToday = recentSessions.filter(
    s => s.status === 'completed' && s.completedAt?.startsWith(today)
  ).length
  const completedAll = recentSessions.filter(s => s.status === 'completed')
  const avgAccuracy = completedAll.length > 0
    ? Math.round(completedAll.reduce((sum, s) => sum + (s.accuracyPct ?? 0), 0) / completedAll.length)
    : 0
  const sealedCount = recentSessions.filter(
    s => s.sessionMeta?.leak_outcome === 'sealed'
  ).length

  // Fetch candidate name
  const profileRes = await db.database
    .from('student_profiles')
    .select('full_name')
    .eq('user_id', uid)
    .single()
  const candidateName = (profileRes.data as { full_name: string } | null)?.full_name ?? 'Student'

  return (
    <DrillHubShell
      activeLeak={activeLeak}
      allLeaks={allLeaks}
      recentSessions={recentSessions}
      completedToday={completedToday}
      avgAccuracy={avgAccuracy}
      sealedCount={sealedCount}
      candidateName={candidateName}
    />
  )
}
