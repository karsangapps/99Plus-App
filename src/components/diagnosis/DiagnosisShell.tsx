'use client'

import { PercentileGauge } from './PercentileGauge'
import { LeakBanner } from './LeakBanner'
import { CollegeHeatmapTable } from './CollegeHeatmapTable'
import { GapAnalysisCard } from './GapAnalysisCard'
import { RecoveryPathCard } from './RecoveryPathCard'
import type { DiagnosisPayload } from '@/app/diagnosis/[attemptId]/actions'

interface DiagnosisShellProps {
  payload: DiagnosisPayload
}

function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${m}:${s.toString().padStart(2, '0')}`
}

function formatAvgTime(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return m > 0 ? `${m}:${s.toString().padStart(2, '0')} min` : `${s}s`
}

export function DiagnosisShell({ payload }: DiagnosisShellProps) {
  const { attempt, markLeaks, seatHeatmap, topLeak, prescription, candidateName } = payload
  const totalLeakedMarks = markLeaks.reduce((s, l) => s + l.lostMarks, 0)
  const closestSeat = seatHeatmap.find(r => r.seatStatus === 'close')
    ?? seatHeatmap.find(r => r.seatStatus === 'possible')
    ?? seatHeatmap[0]
  const completedDate = new Date(attempt.completedAt).toLocaleDateString('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
  })

  return (
    <div className="lg:ml-64 min-h-screen bg-[#F8FAFC] pb-20">

      {/* ── Header ────────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-30 bg-[#F8FAFC]/90 backdrop-blur-md border-b border-gray-200 px-4 sm:px-8 py-4 sm:py-5">
        <div className="flex items-center justify-between gap-2">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-semibold tracking-widest uppercase text-indigo-500">
                Post-Test Diagnosis
              </span>
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-600">
                LIVE
              </span>
            </div>
            <h1 className="text-lg sm:text-2xl font-extrabold text-gray-900 tracking-tight">
              College Heatmap &amp; Gap Analysis
            </h1>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <div className="text-right hidden sm:block">
              <p className="text-xs text-gray-400 truncate max-w-[200px]">{attempt.mockTestTitle}</p>
              <p className="text-xs text-gray-400">Completed: {completedDate}</p>
            </div>
            <div className="w-9 h-9 rounded-xl bg-indigo-500/10 flex items-center justify-center flex-shrink-0">
              <i className="fa-solid fa-stethoscope text-indigo-500 text-sm" />
            </div>
          </div>
        </div>
      </header>

      <div className="px-4 sm:px-8 py-6 sm:py-8 space-y-6 sm:space-y-8">

        {/* ── Row 1: Percentile Gauge + Stats ───────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

          {/* Percentile Gauge */}
          <div className="lg:col-span-5 bg-white rounded-xl border border-gray-200 shadow-sm">
            <PercentileGauge percentile={attempt.simulatedPercentile} />
          </div>

          {/* Quick Stats 2×2 */}
          <div className="lg:col-span-7 grid grid-cols-2 gap-4">

            {/* Raw Score */}
            <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-[10px] bg-indigo-500/10 flex items-center justify-center">
                  <i className="fa-solid fa-bullseye text-indigo-500" />
                </div>
                <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Raw Score</span>
              </div>
              <p className="text-3xl font-extrabold text-gray-900">
                {attempt.rawScore}
                <span className="text-lg font-medium text-gray-400">/{attempt.totalMarks}</span>
              </p>
              <p className="text-xs text-gray-400 mt-1">
                {attempt.correctCount}✓ &nbsp; {attempt.wrongCount}✗ &nbsp; {attempt.unattemptedCount} skipped
              </p>
            </div>

            {/* Accuracy */}
            <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-[10px] bg-emerald-500/10 flex items-center justify-center">
                  <i className="fa-solid fa-check-double text-emerald-500" />
                </div>
                <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Accuracy</span>
              </div>
              <p className="text-3xl font-extrabold text-gray-900">
                {attempt.accuracyPct.toFixed(1)}
                <span className="text-lg font-medium text-gray-400">%</span>
              </p>
              <p className="text-xs text-emerald-500 mt-1">
                {attempt.negativeMksTotal > 0
                  ? <><i className="fa-solid fa-minus text-[10px] mr-1" />−{attempt.negativeMksTotal} negative marks</>
                  : 'Zero negative marks'}
              </p>
            </div>

            {/* Avg Time */}
            <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-[10px] bg-yellow-400/15 flex items-center justify-center">
                  <i className="fa-solid fa-clock text-yellow-600" />
                </div>
                <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Avg. Time/Q</span>
              </div>
              <p className="text-3xl font-extrabold text-gray-900">
                {formatAvgTime(attempt.avgTimeSeconds)}
              </p>
              <p className="text-xs text-gray-400 mt-1">
                Total: {formatDuration(attempt.durationSecondsUsed)}
              </p>
            </div>

            {/* Mark Leaks — pulsing red */}
            <div
              className="bg-white rounded-xl border-2 border-red-400/30 p-5 relative shadow-sm"
              style={{ boxShadow: '0 4px 12px rgba(239,68,68,0.12)', animation: 'leakPulse 2.5s infinite' }}
            >
              <style>{`
                @keyframes leakPulse {
                  0%, 100% { box-shadow: 0 4px 12px rgba(239,68,68,0.12); }
                  50%       { box-shadow: 0 4px 20px rgba(239,68,68,0.28); }
                }
              `}</style>
              {totalLeakedMarks > 0 && (
                <div className="absolute top-3 right-3">
                  <span
                    className="inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-black text-white tracking-wider uppercase"
                    style={{ background: 'linear-gradient(135deg, #EF4444 0%, #DC2626 100%)' }}
                  >
                    Critical
                  </span>
                </div>
              )}
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-[10px] bg-red-500/10 flex items-center justify-center">
                  <i className="fa-solid fa-triangle-exclamation text-red-500" />
                </div>
                <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Mark Leaks</span>
              </div>
              <p className="text-3xl font-extrabold text-red-500">
                {totalLeakedMarks}
                <span className="text-lg font-medium text-gray-400"> marks</span>
              </p>
              {closestSeat && (
                <p className="text-xs text-red-500 mt-1 font-semibold">
                  The gap to {closestSeat.collegeName}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* ── Row 2: Leak Banner ─────────────────────────────────────── */}
        {topLeak && totalLeakedMarks > 0 && (
          <LeakBanner topLeak={topLeak} seatHeatmap={seatHeatmap} />
        )}

        {/* ── Row 3: College Heatmap ────────────────────────────────── */}
        {seatHeatmap.length > 0 && (
          <section>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 rounded-[10px] bg-indigo-500/10 flex items-center justify-center">
                <i className="fa-solid fa-map text-indigo-500 text-sm" />
              </div>
              <h2 className="text-lg font-bold text-gray-900">College Heatmap Matrix</h2>
              <span className="text-xs text-gray-400 ml-auto">
                Based on 2025 DU cutoff trends · Your predicted {attempt.simulatedPercentile.toFixed(1)} %ile
              </span>
            </div>
            <CollegeHeatmapTable rows={seatHeatmap} />
          </section>
        )}

        {/* ── Row 4: Gap Analysis + Recovery Path ──────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

          {/* Gap Analysis */}
          <div className="lg:col-span-7">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 rounded-[10px] bg-red-500/10 flex items-center justify-center">
                <i className="fa-solid fa-stethoscope text-red-500 text-sm" />
              </div>
              <h2 className="text-lg font-bold text-gray-900">Gap Analysis Alert</h2>
              {markLeaks[0] && (
                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-black bg-red-500 text-white uppercase tracking-wider ml-2">
                  {markLeaks[0].subject}
                </span>
              )}
            </div>
            <GapAnalysisCard leaks={markLeaks} />
          </div>

          {/* Recovery Path */}
          <div className="lg:col-span-5">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 rounded-[10px] bg-indigo-500/10 flex items-center justify-center">
                <i className="fa-solid fa-crosshairs text-indigo-500 text-sm" />
              </div>
              <h2 className="text-lg font-bold text-gray-900">Recovery Path</h2>
            </div>
            <RecoveryPathCard
              prescription={prescription}
              currentPercentile={attempt.simulatedPercentile}
              seatHeatmap={seatHeatmap}
            />
          </div>
        </div>

      </div>
    </div>
  )
}
