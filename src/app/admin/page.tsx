import { redirect } from 'next/navigation'
import { getUidFromCookies } from '@/lib/session'
import AdminDashboardClient from './AdminDashboardClient'

export default async function AdminPage() {
  const uid = await getUidFromCookies()
  if (!uid) redirect('/login')

  // TODO: Add role check - redirect non-admin to /onboarding
  return <AdminDashboardClient />
}
