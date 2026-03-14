import type { DrillSession } from './types'

interface RecentDrillListProps {
  sessions: DrillSession[]
}

const outcomeConfig = {
  sealed:    { label: 'Sealed',   bg: 'bg-emerald-50 text-emerald-700 border border-emerald-200' },
  reduced:   { label: 'Reduced',  bg: 'bg-yellow-50 text-yellow-700 border border-yellow-200' },
  unchanged: { label: 'Retry',    bg: 'bg-red-50 text-red-600 border border-red-200' },
}

export function RecentDrillList({ sessions }: RecentDrillListProps) {
  if (sessions.length === 0) {
    return (
      <div className="bg-white border border-gray-200 p-6 rounded-2xl text-center">
        <i className="fa-solid fa-crosshairs text-gray-300 text-3xl mb-3" />
        <p className="text-sm font-semibold text-gray-600">No drills completed yet</p>
        <p className="text-xs text-gray-400 mt-1">Start a Gap-Remedy drill to see your history here.</p>
      </div>
    )
  }

  return (
    <div className="bg-white border border-gray-200 p-6 rounded-2xl">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <h2 className="text-base font-bold text-gray-900">Recent Drill Activity</h2>
          {sessions.length > 0 && (
            <span className="px-2.5 py-1 bg-emerald-50 text-emerald-600 text-[10px] font-bold uppercase tracking-wider rounded-lg">
              {sessions.length} total
            </span>
          )}
        </div>
      </div>

      <div className="space-y-3">
        {sessions.map(session => {
          const meta = session.sessionMeta
          const outcome = (meta.leak_outcome as keyof typeof outcomeConfig) ?? 'unchanged'
          const ocfg = outcomeConfig[outcome] ?? outcomeConfig.unchanged
          const accuracy = session.accuracyPct ?? 0

          return (
            <div
              key={session.id}
              className="flex items-center gap-3 p-3 bg-gray-50 hover:bg-gray-100 transition-colors rounded-xl"
            >
              <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${
                accuracy >= 70 ? 'bg-emerald-50' : accuracy >= 40 ? 'bg-yellow-50' : 'bg-red-50'
              }`}>
                <i className={`fa-solid ${accuracy >= 70 ? 'fa-check' : accuracy >= 40 ? 'fa-minus' : 'fa-xmark'} text-xs ${
                  accuracy >= 70 ? 'text-emerald-600' : accuracy >= 40 ? 'text-yellow-600' : 'text-red-600'
                }`} />
              </div>

              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-gray-900 truncate">{session.title}</p>
                <p className="text-[10px] text-gray-400">
                  {session.mode.replace('_', ' ')} ·{' '}
                  {session.completedAt
                    ? new Date(session.completedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
                    : 'In progress'}
                </p>
              </div>

              <span className="text-sm font-bold text-gray-700 shrink-0">
                {accuracy > 0 ? `${accuracy}%` : '—'}
              </span>

              <span className={`px-2 py-1 text-[10px] font-bold rounded-md shrink-0 ${ocfg.bg}`}>
                {ocfg.label}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
