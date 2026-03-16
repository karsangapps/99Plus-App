import Link from 'next/link'
import { redirect } from 'next/navigation'
import { getUidFromCookies } from '@/lib/session'

/**
 * Placeholder for drill session - full drill UI can be implemented later.
 * For now, Start redirects here; show a simple "Drill Started" state.
 */
export default async function DrillSessionPage({
  params
}: {
  params: Promise<{ id: string }>
}) {
  const uid = await getUidFromCookies()
  if (!uid) redirect('/login')

  const { id } = await params

  return (
    <div className="min-h-dvh pattern-bg flex items-center justify-center p-6">
      <div className="max-w-md w-full text-center bg-white rounded-[16px] border border-[#E5E7EB] p-8 shadow-sm">
        <div className="w-16 h-16 rounded-[20px] bg-[#6366F1]/10 flex items-center justify-center mx-auto mb-6">
          <span className="text-2xl text-[#6366F1]">◆</span>
        </div>
        <h1 className="text-xl font-bold text-[#0F172A] tracking-tight">Drill Session</h1>
        <p className="text-sm text-[#9CA3AF] mt-2">
          Session <code className="px-1.5 py-0.5 bg-[#F1F5F9] rounded text-xs">{id}</code> started.
        </p>
        <p className="text-xs text-[#9CA3AF] mt-4">
          Full drill UI (question display, timer, submit) coming in a future update.
        </p>
        <Link
          href="/surgical-drill"
          className="mt-6 inline-block px-6 py-3 rounded-[12px] bg-[#6366F1] text-white font-semibold text-sm hover:bg-[#4F46E5] transition-colors"
        >
          Back to Drill Center
        </Link>
      </div>
    </div>
  )
}
