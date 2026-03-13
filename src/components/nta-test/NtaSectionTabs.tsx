'use client'

import type { SectionGroup } from './types'

interface NtaSectionTabsProps {
  sections: SectionGroup[]
  currentSectionIdx: number
  onSelect: (idx: number) => void
}

export function NtaSectionTabs({ sections, currentSectionIdx, onSelect }: NtaSectionTabsProps) {
  return (
    <nav
      className="flex bg-[#eef2f7] border-b border-gray-300 overflow-x-auto"
      aria-label="Test sections"
      role="tablist"
    >
      {sections.map((section, idx) => (
        <button
          key={section.label}
          role="tab"
          aria-selected={currentSectionIdx === idx}
          onClick={() => onSelect(idx)}
          className={`px-5 py-2 text-sm font-semibold whitespace-nowrap border-r border-gray-300 transition-colors ${
            currentSectionIdx === idx
              ? 'bg-white text-[#1a3c6e] border-b-2 border-b-[#1a3c6e] -mb-px'
              : 'text-gray-600 hover:bg-white hover:text-[#1a3c6e]'
          }`}
        >
          {section.label}
          <span className="ml-2 text-xs font-normal text-gray-500">
            ({section.questions.length})
          </span>
        </button>
      ))}
    </nav>
  )
}
