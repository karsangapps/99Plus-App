'use client'

import Link from 'next/link'
import type { DrillEngineState } from './types'

interface DrillSummaryScreenProps {
  result: NonNullable<DrillEngineState['result']>
  sessionTitle: string
}

export function DrillSummaryScreen({ result, sessionTitle }: DrillSummaryScreenProps) {
  const { accuracyPct, correctCount, wrongCount, totalQuestions, leakOutcome, leakMessage, linkedAttemptId } = result

  const outcomeConfig = {
    sealed: {
      icon: 'fa-shield-check',
      headline: 'Mark Leak — Sealed',
      color: 'text-emerald-600',
      bg: 'bg-emerald-50 border-emerald-200',
      badge: 'bg-emerald-600 text-white',
    },
    reduced: {
      icon: 'fa-arrow-trend-down',
      headline: 'Mark Leak — Reduced 50%',
      color: 'text-yellow-600',
      bg: 'bg-yellow-50 border-yellow-200',
      badge: 'bg-yellow-400 text-yellow-900',
    },
    unchanged: {
      icon: 'fa-rotate',
      headline: 'Keep Practising',
      color: 'text-red-600',
      bg: 'bg-red-50 border-red-200',
      badge: 'bg-red-500 text-white',
    },
  }

  const cfg = outcomeConfig[leakOutcome]

  return (
    <div className="flex-1 flex flex-col items-center justify-center px-6 py-10 max-w-lg mx-auto text-center">

      {/* Result icon */}
      <div className={`w-20 h-20 rounded-3xl flex items-center justify-center mb-6 border-2 ${cfg.bg}`}>
        <i className={`fa-solid ${cfg.icon} text-3xl ${cfg.color}`} />
      </div>

      {/* Headline */}
      <h1 className="text-2xl font-extrabold text-gray-900 mb-2 tracking-tight">{cfg.headline}</h1>
      <p className="text-sm text-gray-500 mb-6 leading-relaxed">{leakMessage}</p>

      {/* Score breakdown */}
      <div className="w-full bg-white border border-gray-200 rounded-2xl p-6 mb-6">
        <p className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-4">Session Summary</p>
        <div className="text-4xl font-black text-gray-900 mb-1">{accuracyPct}%</div>
        <p className="text-xs text-gray-400 mb-4">accuracy</p>

        <div className="grid grid-cols-3 gap-3">
          <div className="p-3 bg-emerald-50 rounded-xl text-center">
            <div className="text-xl font-bold text-emerald-600">{correctCount}</div>
            <div className="text-[10px] text-emerald-500 font-semibold mt-0.5">Correct</div>
          </div>
          <div className="p-3 bg-red-50 rounded-xl text-center">
            <div className="text-xl font-bold text-red-500">{wrongCount}</div>
            <div className="text-[10px] text-red-400 font-semibold mt-0.5">Wrong</div>
          </div>
          <div className="p-3 bg-gray-50 rounded-xl text-center">
            <div className="text-xl font-bold text-gray-700">{totalQuestions}</div>
            <div className="text-[10px] text-gray-400 font-semibold mt-0.5">Total Qs</div>
          </div>
        </div>

        {/* Progress bar */}
        <div className="mt-4 w-full bg-gray-100 rounded-full h-2">
          <div
            className={`h-2 rounded-full transition-all ${
              accuracyPct >= 70 ? 'bg-emerald-500' : accuracyPct >= 40 ? 'bg-yellow-400' : 'bg-red-500'
            }`}
            style={{ width: `${accuracyPct}%` }}
          />
        </div>
        <div className="flex justify-between mt-1">
          <span className="text-[10px] text-gray-400">0%</span>
          <span className="text-[10px] font-bold text-indigo-500">70% = Sealed</span>
          <span className="text-[10px] text-gray-400">100%</span>
        </div>
      </div>

      {/* CTAs */}
      <div className="w-full space-y-3">
        {linkedAttemptId && (
          <Link
            href={`/diagnosis/${linkedAttemptId}`}
            className="w-full flex items-center justify-center gap-2 py-3 bg-indigo-500 hover:bg-indigo-600 text-white font-bold text-sm rounded-xl transition-colors"
          >
            <i className="fa-solid fa-stethoscope" />
            View Updated Diagnosis
          </Link>
        )}
        <Link
          href="/surgical-drill"
          className="w-full flex items-center justify-center gap-2 py-3 bg-white border-2 border-gray-200 hover:border-indigo-300 text-gray-700 font-semibold text-sm rounded-xl transition-colors"
        >
          <i className="fa-solid fa-arrow-left" />
          Back to Drill Center
        </Link>
      </div>

    </div>
  )
}
