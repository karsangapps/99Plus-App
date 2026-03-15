/**
 * /selection-hub — Selection Hub (PRD §4.8 Admissions Layer, Phase 4)
 *
 * The Admissions OS gateway. Students use this screen to:
 *   1. Review their locked eligibility and current Distance-to-Seat status.
 *   2. Build and rank their college preference list (CUET counselling prep).
 *   3. Track cutoffs vs. their projected percentile.
 *   4. Monitor seat allotment rounds (CSAS).
 *
 * Account state guard: requires `eligibility_locked` or beyond.
 * Pro Pass or credits gate: full preference optimiser requires Pro access.
 */

import { redirect } from 'next/navigation'
import { getUidFromCookies } from '@/lib/session'
import { getInsforgeAdminClient } from '@/lib/insforgeAdmin'
import { SelectionHubClient } from '@/components/selection-hub/SelectionHubClient'
import { StoreSidebar } from '@/components/store/StoreSidebar'

type StudentSnapshot = {
  account_state: string
  dream_university: string | null
  dream_program: string | null
}

type SubscriptionRow = {
  status: string
  ends_at: string
}

type TargetRow = {
  universities: { name: string; short_code: string } | null
  programs: { name: string } | null
}

export default async function SelectionHubPage() {
  const uid = await getUidFromCookies()
  if (!uid) redirect('/login')

  const db = getInsforgeAdminClient()

  // Load student profile
  const { data: profiles } = await db.database
    .from('student_profiles')
    .select('account_state, dream_university, dream_program')
    .eq('id', uid)
    .limit(1)

  const profile = (profiles as StudentSnapshot[] | null)?.[0]
  if (!profile) redirect('/login')

  // Gate: must have at least reached `eligibility_locked` state
  const LOCKED_STATES = [
    'eligibility_locked', 'baseline_pending', 'diagnosed',
    'drill_active', 'preference_ready', 'seat_secured',
  ]
  const isEligibilityLocked = LOCKED_STATES.includes(profile.account_state)

  // Check active Pro Pass
  const { data: activeSubs } = await db.database
    .from('subscriptions')
    .select('status, ends_at')
    .eq('student_profile_id', uid)
    .eq('status', 'active')
    .gte('ends_at', new Date().toISOString())
    .limit(1)

  const hasProPass = !!((activeSubs as SubscriptionRow[] | null)?.[0])

  // Load primary target
  const { data: targets } = await db.database
    .from('user_targets')
    .select(`
      universities ( name, short_code ),
      programs ( name )
    `)
    .eq('student_profile_id', uid)
    .limit(1)

  const target = (targets as TargetRow[] | null)?.[0] ?? null

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: '#F8FAFC' }}>
      <StoreSidebar activePath="/selection-hub" />
      <SelectionHubClient
        isEligibilityLocked={isEligibilityLocked}
        hasProPass={hasProPass}
        accountState={profile.account_state}
        targetUniversity={target?.universities?.name ?? null}
        targetProgram={target?.programs?.name ?? null}
      />
    </div>
  )
}
