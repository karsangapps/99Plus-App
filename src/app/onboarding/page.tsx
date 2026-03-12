import { redirect } from 'next/navigation'
import { getInsforgeAdminClient } from '@/lib/insforgeAdmin'
import { getUidFromCookies } from '@/lib/session'
import OnboardingDreamTargetClient from './OnboardingDreamTargetClient'

export default async function OnboardingDreamTargetPage() {
  const uid = await getUidFromCookies()
  if (!uid) redirect('/signup')

  const insforge = getInsforgeAdminClient()
  const profileRes = await insforge.database
    .from('student_profiles')
    .select('guardian_required, account_state')
    .eq('user_id', uid)
    .limit(1)

  const profile = profileRes.data?.[0] as
    | { guardian_required: boolean; account_state: string }
    | undefined

  if (profile?.guardian_required && profile.account_state !== 'guardian_verified') {
    redirect('/guardian/consent')
  }

  return <OnboardingDreamTargetClient />
}

