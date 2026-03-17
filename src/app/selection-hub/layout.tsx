/**
 * Selection Hub layout — auth guard (runs before loading.tsx Suspense boundary).
 */
import { redirect } from 'next/navigation'
import { getUidFromCookies } from '@/lib/session'

export default async function SelectionHubLayout({ children }: { children: React.ReactNode }) {
  const uid = await getUidFromCookies()
  if (!uid) redirect('/login')
  return <>{children}</>
}
