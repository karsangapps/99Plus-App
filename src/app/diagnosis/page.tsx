/**
 * /diagnosis base — finds the most recent submitted attempt and redirects.
 * Falls back to /pre-test if no submitted attempt exists.
 */
import { redirect } from 'next/navigation'
import { getUidFromCookies } from '@/lib/session'
import { getInsforgeAdminClient } from '@/lib/insforgeAdmin'

export default async function DiagnosisBasePage() {
  const uid = await getUidFromCookies()
  if (!uid) redirect('/login')

  const db = getInsforgeAdminClient()

  const { data: attempts } = await db.database
    .from('mock_attempts')
    .select('id')
    .eq('student_profile_id', uid)
    .eq('status', 'submitted')
    .order('submitted_at', { ascending: false })
    .limit(1)

  const latest = (attempts as Array<{ id: string }> | null)?.[0]
  if (latest) redirect(`/diagnosis/${latest.id}`)
  redirect('/pre-test')
}
