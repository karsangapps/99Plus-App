'use client'

import type { QuestionOption, Language } from './types'

interface NtaOptionListProps {
  options: QuestionOption[]
  selectedAnswer: string | null
  language: Language
  onSelect: (key: string) => void
  isSubmitting: boolean
}

export function NtaOptionList({
  options,
  selectedAnswer,
  language,
  onSelect,
  isSubmitting,
}: NtaOptionListProps) {
  return (
    <div className="space-y-3 mt-4" role="radiogroup" aria-label="Answer options">
      {options.map((opt) => {
        const isSelected = selectedAnswer === opt.key
        return (
          <label
            key={opt.key}
            className={`flex items-start gap-3 p-3 rounded border-2 cursor-pointer transition-all ${
              isSelected
                ? 'border-[#1a3c6e] bg-blue-50'
                : 'border-gray-200 bg-white hover:border-[#1a3c6e] hover:bg-blue-50/40'
            } ${isSubmitting ? 'pointer-events-none opacity-70' : ''}`}
          >
            <input
              type="radio"
              name="nta-option"
              value={opt.key}
              checked={isSelected}
              onChange={() => onSelect(opt.key)}
              disabled={isSubmitting}
              className="mt-0.5 accent-[#1a3c6e] w-4 h-4 shrink-0"
              aria-label={`Option ${opt.key}`}
            />
            <span className="font-bold text-gray-700 shrink-0">{opt.key}.</span>
            <span
              className="text-gray-800 text-sm leading-relaxed"
              dangerouslySetInnerHTML={{ __html: opt[language] || opt.en }}
            />
          </label>
        )
      })}
    </div>
  )
}
