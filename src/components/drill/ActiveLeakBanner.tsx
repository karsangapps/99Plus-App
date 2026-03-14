import Link from 'next/link'
import type { ActiveLeak } from './types'

interface ActiveLeakBannerProps {
  leak: ActiveLeak | null
  pendingCount: number
}

export function ActiveLeakBanner({ leak, pendingCount }: ActiveLeakBannerProps) {
  if (!leak) {
    return (
      <div className="mb-8 p-6 bg-gradient-to-r from-emerald-800 to-emerald-600 rounded-2xl relative overflow-hidden">
        <div className="relative z-10">
          <p className="text-emerald-200 text-sm font-semibold mb-1">No Active Leaks</p>
          <h2 className="text-2xl font-extrabold text-white tracking-tight">All Mark Leaks Resolved ✓</h2>
          <p className="text-xs text-emerald-200 mt-2">Take a mock test to generate new diagnostics.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="mb-8 p-6 bg-gradient-to-r from-[#312E81] via-[#4338CA] to-[#6366F1] relative overflow-hidden rounded-2xl"
      style={{ boxShadow: '0 8px 32px rgba(99,102,241,0.3)' }}>
      {/* Background crosshair watermark */}
      <div className="absolute top-0 right-0 w-64 h-64 opacity-10 pointer-events-none">
        <i className="fa-solid fa-crosshairs text-white" style={{ fontSize: 200, transform: 'translate(40px,-40px)' }} />
      </div>

      <div className="relative z-10">
        {/* Breadcrumb */}
        <div className="flex items-center gap-1 mb-3">
          <span className="text-[10px] font-bold text-indigo-300 uppercase tracking-widest">Active Target</span>
        </div>
        <div className="flex items-center gap-1.5 text-sm text-indigo-200 font-medium mb-2">
          <span>{leak.subject}</span>
          <i className="fa-solid fa-chevron-right text-[8px] text-indigo-400" />
          <span className="text-yellow-300 font-semibold">{leak.chapterName}</span>
        </div>

        {/* Headline */}
        <h2 className="text-2xl font-extrabold text-white tracking-tight">
          {leak.lostMarks}-Mark Leak Detected
        </h2>
        <p className="text-xs text-indigo-200 mt-2 max-w-lg leading-relaxed">
          Surgical intervention required — targeted drills for {leak.chapterName} questions have been
          queued based on your latest mock diagnosis.
        </p>

        {/* Badges + CTA */}
        <div className="flex items-center gap-3 mt-4 flex-wrap">
          <span className="px-3 py-1.5 bg-yellow-400/20 border border-yellow-400/30 text-yellow-300 text-[10px] font-bold uppercase tracking-wider rounded-lg">
            <i className="fa-solid fa-triangle-exclamation mr-1.5" />
            Priority: {leak.severityScore >= 3 ? 'Critical' : 'Medium'}
          </span>
          <span className="px-3 py-1.5 bg-white/10 border border-white/20 text-white text-[10px] font-bold uppercase tracking-wider rounded-lg">
            <i className="fa-solid fa-bolt mr-1.5" />
            From Latest Diagnosis
          </span>
          {pendingCount > 1 && (
            <span className="px-3 py-1.5 bg-white/10 border border-white/20 text-white text-[10px] font-bold uppercase tracking-wider rounded-lg">
              <i className="fa-solid fa-list-check mr-1.5" />
              {pendingCount - 1} more leaks pending
            </span>
          )}
        </div>
      </div>
    </div>
  )
}
