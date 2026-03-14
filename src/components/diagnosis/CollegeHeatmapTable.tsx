'use client'

import type { SeatRow } from '@/app/diagnosis/[attemptId]/actions'

interface CollegeHeatmapTableProps {
  rows: SeatRow[]
}

const statusConfig = {
  safe:     { label: 'Safe',     icon: 'fa-circle-check',  bg: 'bg-emerald-50',   text: 'text-emerald-600', barFrom: 'from-emerald-500',  barTo: 'to-emerald-300'  },
  possible: { label: 'Possible', icon: 'fa-bolt',          bg: 'bg-yellow-50',    text: 'text-yellow-600',  barFrom: 'from-yellow-500',   barTo: 'to-yellow-300'   },
  close:    { label: 'Close',    icon: 'fa-fire',          bg: 'bg-orange-50',    text: 'text-orange-600',  barFrom: 'from-orange-500',   barTo: 'to-orange-300'   },
  reach:    { label: 'Reach',    icon: 'fa-xmark',         bg: 'bg-red-50',       text: 'text-red-600',     barFrom: 'from-red-500',      barTo: 'to-red-300'      },
}

function ProbabilityBar({ pct, status }: { pct: number; status: SeatRow['seatStatus'] }) {
  const cfg = statusConfig[status]
  return (
    <div className="flex items-center gap-3">
      <div className="flex-1 h-3 bg-gray-100 rounded-full overflow-hidden">
        <div
          className={`h-full bg-gradient-to-r ${cfg.barFrom} ${cfg.barTo} rounded-full transition-all duration-700 ease-out`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className={`text-sm font-bold w-10 text-right ${cfg.text}`}>
        {pct.toFixed(0)}%
      </span>
    </div>
  )
}

export function CollegeHeatmapTable({ rows }: CollegeHeatmapTableProps) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
      {/* Header */}
      <div className="grid grid-cols-12 gap-4 px-6 py-3 bg-gray-50 border-b border-gray-200">
        <div className="col-span-3 text-xs font-bold text-gray-400 uppercase tracking-wider">College</div>
        <div className="col-span-2 text-xs font-bold text-gray-400 uppercase tracking-wider">Course</div>
        <div className="col-span-2 text-xs font-bold text-gray-400 uppercase tracking-wider text-center">Cutoff</div>
        <div className="col-span-3 text-xs font-bold text-gray-400 uppercase tracking-wider">Probability</div>
        <div className="col-span-2 text-xs font-bold text-gray-400 uppercase tracking-wider text-center">Status</div>
      </div>

      {rows.map((row, idx) => {
        const cfg = statusConfig[row.seatStatus]
        const rowBg = row.seatStatus === 'close' ? 'bg-yellow-50/20 hover:bg-yellow-50/40'
          : row.seatStatus === 'safe' ? 'hover:bg-emerald-50/30'
          : 'hover:bg-gray-50/50'

        return (
          <div
            key={idx}
            className={`grid grid-cols-12 gap-4 px-6 py-5 border-b border-gray-100 last:border-b-0 items-center cursor-pointer transition-all duration-150 group ${rowBg}`}
            style={{ transform: 'translateX(0)', transition: 'transform 0.2s ease' }}
            onMouseEnter={e => (e.currentTarget.style.transform = 'translateX(4px)')}
            onMouseLeave={e => (e.currentTarget.style.transform = 'translateX(0)')}
          >
            {/* College */}
            <div className="col-span-3">
              <p className="text-sm font-bold text-gray-900">{row.collegeName}</p>
              <p className="text-xs text-gray-400">{row.universityName}</p>
            </div>

            {/* Program */}
            <div className="col-span-2">
              <span className="text-xs font-medium text-gray-700">{row.programName}</span>
            </div>

            {/* Cutoff */}
            <div className="col-span-2 text-center">
              <span className="text-sm font-bold text-gray-900">
                {row.cutoffPercentile.toFixed(1)}
              </span>
              <span className="text-xs text-gray-400"> %ile</span>
            </div>

            {/* Probability bar */}
            <div className="col-span-3">
              <ProbabilityBar pct={row.probabilityPct} status={row.seatStatus} />
            </div>

            {/* Status chip */}
            <div className="col-span-2 text-center">
              {row.marksAway > 0 ? (
                <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold ${cfg.bg} ${cfg.text}`}>
                  <i className={`fa-solid ${cfg.icon} text-[10px]`} />
                  {row.marksAway} Marks Away
                </span>
              ) : (
                <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold ${cfg.bg} ${cfg.text}`}>
                  <i className={`fa-solid ${cfg.icon} text-[10px]`} />
                  {cfg.label}
                </span>
              )}
            </div>
          </div>
        )
      })}

      {/* Legend */}
      <div className="flex items-center gap-6 px-6 py-3 bg-gray-50 border-t border-gray-100">
        {[
          { color: 'bg-emerald-500', label: 'High Probability (>80%)' },
          { color: 'bg-yellow-400',  label: 'Reachable (40–80%)' },
          { color: 'bg-red-500',     label: 'Stretch (<40%)' },
        ].map(item => (
          <div key={item.label} className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${item.color}`} />
            <span className="text-xs text-gray-400">{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
