import { redirect } from 'next/navigation'
import { getUidFromCookies } from '@/lib/session'
import SurgicalDrillClient from './SurgicalDrillClient'

export default async function SurgicalDrillPage() {
  const uid = await getUidFromCookies()
  if (!uid) redirect('/login')

  return <SurgicalDrillClient />
}
