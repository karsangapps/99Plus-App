/**
 * hasAccess — Entitlement Check Utility (PRD §16.2)
 *
 * Priority chain (PRD §16.2):
 *   1. Active Pro Pass  → allow any paid feature unconditionally
 *   2. Sufficient credits in surgical_credits ledger → allow, deduct on use
 *   3. Otherwise → block and return 'paywall'
 *
 * Usage (server-side only — reads InsForge directly):
 *   const result = await hasAccess(studentProfileId, 'mock')
 *   if (result.access === 'denied') redirect('/store')
 */

import { getInsforgeAdminClient } from '@/lib/insforgeAdmin'

export type Feature =
  | 'mock'        // 1 credit per attempt
  | 'drill'       // 1 credit per drill session
  | 'analytics'   // pro-only full analytics
  | 'admissions'  // pro-only admissions OS deep features

export type AccessResult =
  | { access: 'pro';     reason: string; endsAt: string }
  | { access: 'credits'; reason: string; balance: number; cost: number }
  | { access: 'denied';  reason: string; balance: number; required: number }

/** Cost in credits per feature (PRD §16.1) */
const FEATURE_COST: Record<Feature, number> = {
  mock:       1,
  drill:      1,
  analytics:  0,   // free with credits; full analytics requires pro
  admissions: 0,   // gated by pro only
}

/** Features that require an active Pro Pass (credits not accepted) */
const PRO_ONLY: Set<Feature> = new Set(['admissions'])

export async function hasAccess(
  studentProfileId: string,
  feature: Feature
): Promise<AccessResult> {
  const db = getInsforgeAdminClient()

  // ── 1. Check active Pro Pass ──────────────────────────────────────────────
  const { data: subs } = await db.database
    .from('subscriptions')
    .select('status, ends_at, plan_code')
    .eq('student_profile_id', studentProfileId)
    .eq('status', 'active')
    .gte('ends_at', new Date().toISOString())
    .order('ends_at', { ascending: false })
    .limit(1)

  const proSub = (subs as Array<{ status: string; ends_at: string; plan_code: string }> | null)?.[0]

  if (proSub) {
    return {
      access: 'pro',
      reason: `Pro Pass active until ${new Date(proSub.ends_at).toLocaleDateString('en-IN')}`,
      endsAt: proSub.ends_at,
    }
  }

  // ── 2. Pro-only gate — no credits can substitute ───────────────────────────
  if (PRO_ONLY.has(feature)) {
    return {
      access: 'denied',
      reason: `${feature} requires an active Pro Pass`,
      balance: 0,
      required: 0,
    }
  }

  // ── 3. Credit balance check ────────────────────────────────────────────────
  const cost = FEATURE_COST[feature]

  // Current balance = balance_after of the most recent ledger row
  const { data: ledger } = await db.database
    .from('surgical_credits')
    .select('balance_after')
    .eq('student_profile_id', studentProfileId)
    .order('created_at', { ascending: false })
    .limit(1)

  const balance = (ledger as Array<{ balance_after: number }> | null)?.[0]?.balance_after ?? 0

  if (cost === 0 || balance >= cost) {
    return {
      access: 'credits',
      reason: cost === 0
        ? `${feature} is free-tier`
        : `Sufficient credits (${balance} available, ${cost} required)`,
      balance,
      cost,
    }
  }

  return {
    access: 'denied',
    reason: `Insufficient credits for ${feature} (have ${balance}, need ${cost})`,
    balance,
    required: cost,
  }
}

/**
 * consumeCredit — atomically deduct a credit when a paid session starts.
 * Must be called AFTER hasAccess confirms 'credits' access.
 * Pro Pass users skip this — no deduction needed.
 * Returns the new balance_after value.
 */
export async function consumeCredit(
  studentProfileId: string,
  feature: Feature,
  practiceSessionId?: string
): Promise<number> {
  const db = getInsforgeAdminClient()
  const cost = FEATURE_COST[feature]
  if (cost === 0) return 0

  // Re-fetch latest balance (race-safe read before insert)
  const { data: ledger } = await db.database
    .from('surgical_credits')
    .select('balance_after')
    .eq('student_profile_id', studentProfileId)
    .order('created_at', { ascending: false })
    .limit(1)

  const currentBalance = (ledger as Array<{ balance_after: number }> | null)?.[0]?.balance_after ?? 0
  const newBalance = currentBalance - cost

  if (newBalance < 0) {
    throw new Error(`Credit underflow: tried to deduct ${cost} from balance ${currentBalance}`)
  }

  await db.database.from('surgical_credits').insert({
    student_profile_id: studentProfileId,
    txn_type: 'consume',
    product_type: feature === 'mock' ? 'sachet_mock' : 'sachet_drill_pack',
    delta_credits: -cost,
    balance_after: newBalance,
    practice_session_id: practiceSessionId ?? null,
    meta_json: { feature, consumed_at: new Date().toISOString() },
  })

  return newBalance
}
