// Phase 2/3 stub routes share this layout — all require auth
import { redirect } from 'next/navigation'
import { getUidFromCookies } from '@/lib/session'

export default async function StubLayout({ children }: { children: React.ReactNode }) {
  const uid = await getUidFromCookies()
  if (!uid) redirect('/login')
  return <>{children}</>
}
