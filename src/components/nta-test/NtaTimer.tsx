'use client'

interface NtaTimerProps {
  seconds: number
  isWarning?: boolean
}

export function NtaTimer({ seconds, isWarning }: NtaTimerProps) {
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = seconds % 60

  const display = [
    h.toString().padStart(2, '0'),
    m.toString().padStart(2, '0'),
    s.toString().padStart(2, '0'),
  ].join(':')

  const isRed = seconds < 300  // last 5 minutes

  return (
    <div
      className={`font-mono text-lg font-bold px-3 py-1 rounded border-2 ${
        isRed
          ? 'text-red-600 border-red-400 bg-red-50 animate-pulse'
          : 'text-gray-800 border-gray-400 bg-white'
      }`}
      aria-label={`Time remaining: ${h} hours ${m} minutes ${s} seconds`}
      aria-live="polite"
      aria-atomic="true"
    >
      ⏱ {display}
    </div>
  )
}
