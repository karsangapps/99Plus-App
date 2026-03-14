import Link from 'next/link'
import type { DiagnosisPayload, SeatRow } from '@/app/diagnosis/[attemptId]/actions'

interface RecoveryPathCardProps {
  prescription: DiagnosisPayload['prescription']
  currentPercentile: number
  seatHeatmap: SeatRow[]
}

export function RecoveryPathCard({
  prescription,
  currentPercentile,
  seatHeatmap,
}: RecoveryPathCardProps) {
  if (!prescription) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm text-center">
        <i className="fa-solid fa-party-horn text-indigo-500 text-2xl mb-2" />
        <p className="text-sm font-semibold text-gray-700">No recovery needed</p>
        <p className="text-xs text-gray-400 mt-1">You answered every question correctly!</p>
      </div>
    )
  }

  const closestReach = seatHeatmap.find(r => r.seatStatus === 'close')
    ?? seatHeatmap.find(r => r.seatStatus === 'possible')
    ?? seatHeatmap[0]

  const projectedPercentile = currentPercentile + prescription.projectedPercentileDelta

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
      {/* Steps */}
      <div className="space-y-4 mb-6">
        {/* Step 1 */}
        <div className="flex items-start gap-3">
          <div className="w-7 h-7 rounded-full bg-indigo-500 flex items-center justify-center flex-shrink-0 mt-0.5">
            <span className="text-xs font-bold text-white">1</span>
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-900">{prescription.drillTitle}</p>
            <p className="text-xs text-gray-400">{prescription.estimatedMinutes}-min intensive set · Targeted questions</p>
          </div>
        </div>

        {/* Step 2 */}
        <div className="flex items-start gap-3">
          <div className="w-7 h-7 rounded-full bg-emerald-500 flex items-center justify-center flex-shrink-0 mt-0.5">
            <span className="text-xs font-bold text-white">2</span>
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-900">Review {prescription.ncertReference}</p>
            <p className="text-xs text-gray-400">NCERT targeted reading · ~30 min</p>
          </div>
        </div>

        {/* Step 3 */}
        <div className="flex items-start gap-3">
          <div className="w-7 h-7 rounded-full bg-yellow-400 flex items-center justify-center flex-shrink-0 mt-0.5">
            <span className="text-xs font-bold text-gray-900">3</span>
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-900">Re-test with your next Mock</p>
            <p className="text-xs text-gray-400">Validate improvement · Full mock</p>
          </div>
        </div>
      </div>

      {/* Projected impact */}
      <div className="bg-emerald-50 rounded-xl p-4 mb-6">
        <p className="text-xs font-bold text-emerald-600 uppercase tracking-wider mb-2">
          Projected Impact
        </p>
        <p className="text-sm text-emerald-900 leading-relaxed">
          Recovering{' '}
          <span className="font-bold">{prescription.drillTitle.replace('Surgical Drill: ', '')}</span>
          {' '}leaks could push your percentile from{' '}
          <span className="font-bold">{currentPercentile.toFixed(1)}</span>
          {' '}→{' '}
          <span className="font-bold text-emerald-600">~{projectedPercentile.toFixed(1)}</span>
          {closestReach && closestReach.seatStatus !== 'safe' && (
            <>, unlocking a seat at <span className="font-bold">{closestReach.collegeName}</span></>
          )}
          .
        </p>
      </div>

      {/* CTA */}
      <Link
        href="/surgical-drill"
        className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-gradient-to-r from-indigo-700 to-indigo-500 text-white font-bold text-sm rounded-xl transition-all duration-300 hover:from-indigo-800 hover:to-indigo-600 hover:-translate-y-0.5 shadow-lg shadow-indigo-500/30 no-underline"
        aria-label="Start Gap-Remedy surgical drill"
      >
        <i className="fa-solid fa-crosshairs text-base" />
        <span>Fix Mistakes with Surgical Drill</span>
        <i className="fa-solid fa-arrow-right text-sm ml-1" />
      </Link>
    </div>
  )
}
