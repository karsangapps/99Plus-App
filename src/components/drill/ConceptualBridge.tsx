'use client'

import type { ConceptualBridgePayload } from './types'

interface ConceptualBridgeProps {
  isCorrect: boolean
  correctAnswer: string
  bridge: ConceptualBridgePayload
}

export function ConceptualBridge({ isCorrect, correctAnswer, bridge }: ConceptualBridgeProps) {
  return (
    <div
      className="mt-5 rounded-xl overflow-hidden border-[1.5px] border-yellow-300"
      style={{
        boxShadow: '0 4px 24px rgba(250,204,21,0.15), 0 1px 3px rgba(0,0,0,0.06)',
        animation: 'slideUpFeedback 0.45s cubic-bezier(0.16,1,0.3,1) forwards',
      }}
    >
      <style>{`
        @keyframes slideUpFeedback {
          from { opacity: 0; transform: translateY(24px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>

      {/* Gold header bar */}
      <div className="bg-gradient-to-r from-yellow-100 via-yellow-200 to-yellow-300 px-5 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg flex items-center justify-center bg-black/10">
            <i className="fa-solid fa-stethoscope text-xs text-gray-900" />
          </div>
          <span className="text-xs font-extrabold uppercase tracking-wider text-gray-900">
            Conceptual Bridge
          </span>
        </div>
        <div className="flex items-center gap-2">
          {isCorrect ? (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[10px] font-bold bg-emerald-500 text-white uppercase">
              <i className="fa-solid fa-check text-[9px]" />Correct
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[10px] font-bold bg-red-500 text-white uppercase">
              <i className="fa-solid fa-xmark text-[9px]" />Wrong
            </span>
          )}
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-black/10 text-gray-900 uppercase">
            <i className="fa-solid fa-gem text-[9px]" />Surgical Fix
          </span>
        </div>
      </div>

      {/* Body */}
      <div className="bg-white px-5 py-5 space-y-4">

        {/* Not correct — show what correct answer was */}
        {!isCorrect && (
          <div className="flex items-center gap-2 p-3 bg-emerald-50 border border-emerald-200 rounded-xl">
            <i className="fa-solid fa-circle-check text-emerald-600 text-sm flex-shrink-0" />
            <p className="text-sm text-emerald-800 font-semibold">
              Correct answer: <span className="font-extrabold text-emerald-700">{correctAnswer}</span>
            </p>
          </div>
        )}

        {/* One-line logic fix */}
        <div className="flex gap-3 items-start">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5 bg-indigo-50">
            <i className="fa-solid fa-lightbulb text-sm text-indigo-600" />
          </div>
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider mb-1.5 text-gray-400">
              One-Line Logic Fix
            </p>
            <p className="text-sm font-semibold leading-relaxed text-gray-900">
              {bridge.logicFix}
            </p>
          </div>
        </div>

        <div className="border-t border-dashed border-gray-200" />

        {/* Pattern to remember */}
        <div className="flex gap-3 items-start">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5 bg-yellow-50">
            <i className="fa-solid fa-brain text-sm text-yellow-600" />
          </div>
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider mb-1.5 text-gray-400">
              Pattern to Remember
            </p>
            <p className="text-sm font-medium leading-relaxed text-gray-600">
              {bridge.pattern}
            </p>
          </div>
        </div>

        <div className="border-t border-dashed border-gray-200" />

        {/* Bottom: behavioural tag + NCERT ref */}
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-yellow-400" />
            <span className="text-[11px] font-semibold text-gray-400">
              <i className="fa-solid fa-chart-line mr-1 text-[10px]" />
              {bridge.subject} · {bridge.chapterName}
            </span>
          </div>
          {bridge.ncertRef && (
            <span className="font-mono text-[10px] font-medium px-2.5 py-1 rounded-md bg-gray-50 text-gray-500 border border-gray-100">
              {bridge.ncertRef}
            </span>
          )}
        </div>

      </div>
    </div>
  )
}
