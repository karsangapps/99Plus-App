/**
 * /selection-hub — Selection Hub with Score-Gap Algorithm (PRD §11)
 *
 * Distance-to-Seat formula (PRD §11.2):
 *   score_gap      = student_score - cutoff_score
 *   percentile_gap = student_percentile - cutoff_percentile
 *
 * Status thresholds (PRD §11.3):
 *   safe     : score_gap >= +15
 *   possible : +1 to +14
 *   close    : -1 to -10
 *   reach    : < -10
 */

import { redirect } from 'next/navigation'
import { getUidFromCookies } from '@/lib/session'
import { getInsforgeAdminClient } from '@/lib/insforgeAdmin'
import { SelectionHubClient, type CutoffRow, type StudentStats } from '@/components/selection-hub/SelectionHubClient'
import { StoreSidebar } from '@/components/store/StoreSidebar'

// PRD §11.3 thresholds
function computeGapStatus(scoreGap: number): 'safe' | 'possible' | 'close' | 'reach' {
  if (scoreGap >= 15)  return 'safe'
  if (scoreGap >= 1)   return 'possible'
  if (scoreGap >= -10) return 'close'
  return 'reach'
}

export default async function SelectionHubPage() {
  const uid = await getUidFromCookies()
  if (!uid) redirect('/login')

  const db = getInsforgeAdminClient()

  // ── Student profile ────────────────────────────────────────────────────────
  const { data: profiles } = await db.database
    .from('student_profiles')
    .select('account_state, dream_university, dream_program')
    .eq('id', uid)
    .limit(1)

  const profile = (profiles as Array<{
    account_state: string
    dream_university: string | null
    dream_program: string | null
  }> | null)?.[0]

  if (!profile) redirect('/login')

  const LOCKED_STATES = [
    'eligibility_locked', 'baseline_pending', 'diagnosed',
    'drill_active', 'preference_ready', 'seat_secured',
  ]
  const isEligibilityLocked = LOCKED_STATES.includes(profile.account_state)

  // ── Active Pro Pass ────────────────────────────────────────────────────────
  const { data: activeSubs } = await db.database
    .from('subscriptions')
    .select('ends_at')
    .eq('student_profile_id', uid)
    .eq('status', 'active')
    .gte('ends_at', new Date().toISOString())
    .limit(1)

  const hasProPass = !!((activeSubs as Array<unknown> | null)?.[0])

  // ── Primary target ─────────────────────────────────────────────────────────
  const { data: targets } = await db.database
    .from('user_targets')
    .select('universities ( name, short_code ), programs ( name )')
    .eq('student_profile_id', uid)
    .limit(1)

  const target = (targets as Array<{
    universities: { name: string; short_code: string } | null
    programs: { name: string } | null
  }> | null)?.[0] ?? null

  // ── Credit balance → proxy for projected percentile (PRD §11.2) ──────────
  // Until mock_attempts table is populated, we use credit count as a stand-in
  // for the student's "simulated_normalized_score" to keep the UI live.
  // Replace with real mock score once mock_attempts are seeded.
  const { data: ledger } = await db.database
    .from('surgical_credits')
    .select('balance_after')
    .eq('student_profile_id', uid)
    .order('created_at', { ascending: false })
    .limit(1)

  const creditBalance = (ledger as Array<{ balance_after: number }> | null)?.[0]?.balance_after ?? 0

  // Simulated student score/percentile (placeholder until mock engine is live)
  const studentStats: StudentStats = {
    projectedScore:      183,    // replace with mock_attempts.simulated_normalized_score
    projectedPercentile: 96.2,   // replace with mock_attempts.percentile_estimate
    creditBalance,
    lastUpdated: 'No mock taken yet — using baseline estimate',
  }

  // ── Score-Gap Algorithm (PRD §11.2) ───────────────────────────────────────
  // Fetch top benchmarks for 2025 General category, ordered by cutoff (hardest first)
  const { data: benchmarks } = await db.database
    .from('cutoff_benchmarks')
    .select(`
      id,
      cutoff_score,
      cutoff_percentile,
      category,
      round,
      colleges ( name ),
      programs ( name )
    `)
    .eq('exam_year', 2025)
    .eq('category', 'General')
    .eq('round', 1)
    .eq('is_active', true)
    .order('cutoff_percentile', { ascending: false })
    .limit(6)

  type BenchmarkRow = {
    id: string
    cutoff_score: number
    cutoff_percentile: number
    category: string
    round: number
    colleges: { name: string } | { name: string }[] | null
    programs: { name: string } | { name: string }[] | null
  }

  function collegeName(c: BenchmarkRow['colleges']): string {
    if (!c) return 'Unknown'
    return Array.isArray(c) ? (c[0]?.name ?? 'Unknown') : c.name
  }
  function programName(p: BenchmarkRow['programs']): string {
    if (!p) return 'Unknown'
    return Array.isArray(p) ? (p[0]?.name ?? 'Unknown') : p.name
  }

  const cutoffRows: CutoffRow[] = ((benchmarks as unknown as BenchmarkRow[]) ?? []).map((b, idx) => {
    const scoreGap      = studentStats.projectedScore - b.cutoff_score
    const percentileGap = studentStats.projectedPercentile - b.cutoff_percentile
    return {
      id:               b.id,
      rank:             idx + 1,
      college:          collegeName(b.colleges),
      program:          programName(b.programs),
      category:         b.category,
      cutoffScore:      b.cutoff_score,
      cutoffPercentile: b.cutoff_percentile,
      scoreGap,
      percentileGap,
      gapStatus:        computeGapStatus(scoreGap),
    }
  })

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: '#F8FAFC' }}>
      <StoreSidebar activePath="/selection-hub" />
      <SelectionHubClient
        isEligibilityLocked={isEligibilityLocked}
        hasProPass={hasProPass}
        accountState={profile.account_state}
        targetUniversity={target?.universities?.name ?? null}
        targetProgram={target?.programs?.name ?? null}
        studentStats={studentStats}
        cutoffRows={cutoffRows}
      />
    </div>
  )
}
