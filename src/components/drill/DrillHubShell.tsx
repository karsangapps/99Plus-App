import { ActiveLeakBanner } from './ActiveLeakBanner'
import { DrillModeCard } from './DrillModeCard'
import { DrillStatsRow } from './DrillStatsRow'
import { RecentDrillList } from './RecentDrillList'
import type { ActiveLeak, DrillSession } from './types'

interface DrillHubShellProps {
  activeLeak: ActiveLeak | null
  allLeaks: ActiveLeak[]
  recentSessions: DrillSession[]
  completedToday: number
  avgAccuracy: number
  sealedCount: number
  candidateName: string
}

export function DrillHubShell({
  activeLeak,
  allLeaks,
  recentSessions,
  completedToday,
  avgAccuracy,
  sealedCount,
  candidateName,
}: DrillHubShellProps) {
  const pendingCount = allLeaks.filter(l => !l).length  // simplified — use allLeaks.length
  const leaksCount = allLeaks.length

  return (
    <div className="lg:ml-64 min-h-screen bg-[#F8FAFC] pb-20">

      {/* ── Header ─────────────────────────────────────────── */}
      <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-xl border-b border-gray-200 px-4 sm:px-8 py-4 sm:py-5 flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-400 flex items-center justify-center shadow-md flex-shrink-0"
            style={{ animation: 'pulse 2.5s ease-in-out infinite' }}>
            <i className="fa-solid fa-microscope text-white text-lg" />
          </div>
          <div>
            <h1 className="text-lg sm:text-xl font-bold text-gray-900 tracking-tight">Surgical Drill Center</h1>
            <p className="text-xs text-gray-400 mt-0.5 hidden sm:block">20-min precision sets targeting your mark leaks</p>
          </div>
        </div>

        {/* Header stats */}
        <div className="flex items-center gap-2 flex-wrap justify-end">
          <div className="flex items-center gap-2 px-3 py-2 bg-yellow-50 border border-yellow-200 text-yellow-800 text-xs font-semibold rounded-xl">
            <i className="fa-solid fa-fire text-yellow-500" />
            <span className="hidden sm:inline">Streak Active</span>
          </div>
          {sealedCount > 0 && (
            <div className="flex items-center gap-2 px-3 py-2 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold rounded-xl">
              <i className="fa-solid fa-shield-halved" />
              <span>{sealedCount} Sealed</span>
            </div>
          )}
        </div>
      </header>

      <div className="px-4 sm:px-8 py-6 sm:py-8">

        {/* ── Active Leak Banner ─────────────────────────────── */}
        <ActiveLeakBanner leak={activeLeak} pendingCount={leaksCount} />

        {/* ── Stats Row ─────────────────────────────────────── */}
        <DrillStatsRow
          pendingCount={leaksCount}
          completedToday={completedToday}
          avgAccuracy={avgAccuracy}
          sealedCount={sealedCount}
        />

        {/* ── 4 Mode Cards ──────────────────────────────────── */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-3">
              <h2 className="text-base font-bold text-gray-900">Choose Your Surgical Mode</h2>
              <span className="px-2.5 py-1 bg-indigo-50 text-indigo-600 text-[10px] font-bold uppercase tracking-wider rounded-lg">
                4 Modes
              </span>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <DrillModeCard mode="gap_remedy" leak={activeLeak} />
            <DrillModeCard mode="topic_mastery" leak={null} />
            <DrillModeCard mode="pyq" leak={null} />
            <DrillModeCard mode="full_mock" leak={null} />
          </div>
        </div>

        {/* ── Recent Activity + Leak Summary ────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <RecentDrillList sessions={recentSessions} />

          {/* Unresolved Leaks Summary */}
          <div className="bg-white border border-gray-200 p-6 rounded-2xl">
            <div className="flex items-center gap-3 mb-5">
              <h2 className="text-base font-bold text-gray-900">Open Mark Leaks</h2>
              <span className="px-2.5 py-1 bg-red-50 text-red-600 text-[10px] font-bold uppercase tracking-wider rounded-lg">
                {leaksCount} pending
              </span>
            </div>

            {allLeaks.length === 0 ? (
              <div className="text-center py-6">
                <i className="fa-solid fa-circle-check text-emerald-400 text-3xl mb-2" />
                <p className="text-sm font-semibold text-gray-700">No open leaks</p>
                <p className="text-xs text-gray-400 mt-1">Take a mock test to generate new diagnostics.</p>
              </div>
            ) : (
              <div className="space-y-2.5">
                {allLeaks.slice(0, 5).map((leak, idx) => (
                  <div key={leak.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                    <div className="w-8 h-8 rounded-lg bg-red-50 flex items-center justify-center flex-shrink-0">
                      <span className="text-[10px] font-black text-red-600">{idx + 1}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-gray-900 truncate">{leak.chapterName}</p>
                      <p className="text-[10px] text-gray-400">{leak.subject} · {leak.leakType}</p>
                    </div>
                    <span className="text-xs font-bold text-red-500 shrink-0">−{leak.lostMarks}</span>
                  </div>
                ))}
                {allLeaks.length > 5 && (
                  <p className="text-xs text-center text-gray-400 pt-1">
                    +{allLeaks.length - 5} more leaks detected
                  </p>
                )}
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  )
}
