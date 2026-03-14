'use client'

import type { Language } from './types'

interface NtaLanguageToggleProps {
  language: Language
  onToggle: (lang: Language) => void
}

export function NtaLanguageToggle({ language, onToggle }: NtaLanguageToggleProps) {
  return (
    <div className="flex items-center gap-0 rounded overflow-hidden border border-gray-400 text-sm font-medium">
      <button
        onClick={() => onToggle('en')}
        className={`px-3 py-1 transition-colors ${
          language === 'en'
            ? 'bg-[#1a3c6e] text-white'
            : 'bg-white text-gray-600 hover:bg-gray-100'
        }`}
        aria-pressed={language === 'en'}
      >
        English
      </button>
      <button
        onClick={() => onToggle('hi')}
        className={`px-3 py-1 transition-colors border-l border-gray-400 ${
          language === 'hi'
            ? 'bg-[#1a3c6e] text-white'
            : 'bg-white text-gray-600 hover:bg-gray-100'
        }`}
        aria-pressed={language === 'hi'}
      >
        हिंदी
      </button>
    </div>
  )
}
