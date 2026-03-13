'use client'

import { NtaTimer } from './NtaTimer'
import type { Language } from './types'

interface NtaHeaderProps {
  testTitle: string
  candidateName: string
  timeRemainingSeconds: number
  language: Language
  onSubmit: () => void
  isSubmitting: boolean
}

export function NtaHeader({
  testTitle,
  candidateName,
  timeRemainingSeconds,
  language,
  onSubmit,
  isSubmitting,
}: NtaHeaderProps) {
  return (
    <header className="flex items-center justify-between bg-[#1a3c6e] text-white px-4 py-2 shadow-md">
      {/* Left: Logo + Title */}
      <div className="flex items-center gap-3">
        <div className="bg-white rounded px-2 py-1">
          <span className="text-[#1a3c6e] font-black text-sm tracking-wide">NTA</span>
        </div>
        <div>
          <p className="text-[11px] text-blue-200 leading-tight">National Testing Agency</p>
          <p className="text-sm font-semibold leading-tight truncate max-w-[280px]">{testTitle}</p>
        </div>
      </div>

      {/* Right: Candidate info + Timer + Submit */}
      <div className="flex items-center gap-4">
        <div className="text-right hidden sm:block">
          <p className="text-[11px] text-blue-200 leading-tight">
            {language === 'en' ? 'Candidate' : 'अभ्यर्थी'}
          </p>
          <p className="text-sm font-medium leading-tight truncate max-w-[160px]">{candidateName}</p>
        </div>

        <NtaTimer seconds={timeRemainingSeconds} />

        <button
          onClick={onSubmit}
          disabled={isSubmitting}
          className="bg-[#e8832a] hover:bg-[#d4741f] disabled:opacity-60 text-white font-bold text-sm px-4 py-2 rounded transition-colors"
          aria-label="Submit test"
        >
          {isSubmitting
            ? (language === 'en' ? 'Submitting…' : 'सबमिट हो रहा है…')
            : (language === 'en' ? 'Submit' : 'सबमिट करें')}
        </button>
      </div>
    </header>
  )
}
