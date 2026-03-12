import { redirect } from 'next/navigation'
import { getInsforgeAdminClient } from '@/lib/insforgeAdmin'
import { getUidFromCookies } from '@/lib/session'
import { GuardianConsentClient } from '@/components/guardian/GuardianConsentClient'

export default async function GuardianConsentPage() {
  const uid = await getUidFromCookies()
  if (!uid) redirect('/login')

  const insforge = getInsforgeAdminClient()
  const profileRes = await insforge.database
    .from('student_profiles')
    .select('full_name, dob, is_minor')
    .eq('user_id', uid)
    .limit(1)

  const name =
    (profileRes.data?.[0] as { full_name?: string } | undefined)?.full_name ||
    'Student'

  return <GuardianConsentClient studentName={name} />
}

