'use client'

import type { Language } from './types'

interface NtaActionBarProps {
  language: Language
  hasAnswer: boolean
  onMarkForReview: () => void
  onClearResponse: () => void
  onSaveAndNext: () => void
  isSubmitting: boolean
}

export function NtaActionBar({
  language,
  hasAnswer,
  onMarkForReview,
  onClearResponse,
  onSaveAndNext,
  isSubmitting,
}: NtaActionBarProps) {
  const labels =
    language === 'en'
      ? {
          markReview: 'Mark for Review & Next',
          clear: 'Clear Response',
          save: 'Save & Next',
        }
      : {
          markReview: 'समीक्षा के लिए चिह्नित करें & अगला',
          clear: 'उत्तर हटाएं',
          save: 'सहेजें & अगला',
        }

  return (
    <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200 bg-[#eef2f7]">
      {/* Left: Mark for Review */}
      <button
        onClick={onMarkForReview}
        disabled={isSubmitting}
        className="px-4 py-2 rounded text-sm font-semibold bg-purple-600 hover:bg-purple-700 text-white disabled:opacity-50 transition-colors"
        aria-label={labels.markReview}
      >
        {labels.markReview}
      </button>

      {/* Right: Clear + Save & Next */}
      <div className="flex items-center gap-3">
        <button
          onClick={onClearResponse}
          disabled={isSubmitting || !hasAnswer}
          className="px-4 py-2 rounded text-sm font-semibold border-2 border-gray-400 bg-white hover:bg-gray-100 text-gray-700 disabled:opacity-40 transition-colors"
          aria-label={labels.clear}
        >
          {labels.clear}
        </button>

        <button
          onClick={onSaveAndNext}
          disabled={isSubmitting}
          className="px-5 py-2 rounded text-sm font-bold bg-[#1a3c6e] hover:bg-[#15306e] text-white disabled:opacity-50 transition-colors"
          aria-label={labels.save}
        >
          {labels.save}
        </button>
      </div>
    </div>
  )
}
