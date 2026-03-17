/**
 * Store layout — auth guard that runs BEFORE the loading.tsx Suspense boundary.
 * This ensures unauthenticated users receive a server-side 307 redirect rather
 * than the streaming skeleton-then-meta-refresh pattern.
 */
import { redirect } from 'next/navigation'
import { getUidFromCookies } from '@/lib/session'

export default async function StoreLayout({ children }: { children: React.ReactNode }) {
  const uid = await getUidFromCookies()
  if (!uid) redirect('/login')
  return <>{children}</>
}
