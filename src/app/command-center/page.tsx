import { redirect } from 'next/navigation'
import { getUidFromCookies } from '@/lib/session'
import CommandCenterClient from './CommandCenterClient'

export default async function CommandCenterPage() {
  const uid = await getUidFromCookies()
  if (!uid) redirect('/login')

  return <CommandCenterClient />
}
