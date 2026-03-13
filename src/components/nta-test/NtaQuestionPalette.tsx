'use client'

import { NtaPaletteLegend } from './NtaPaletteLegend'
import { paletteColor } from './types'
import type { SectionGroup, ResponseState, Language } from './types'

interface NtaQuestionPaletteProps {
  sections: SectionGroup[]
  currentSectionIdx: number
  currentQuestionIdx: number
  responses: Record<string, ResponseState>
  language: Language
  candidateName: string
  onNavigate: (sectionIdx: number, questionIdx: number) => void
}

export function NtaQuestionPalette({
  sections,
  currentSectionIdx,
  currentQuestionIdx,
  responses,
  language,
  candidateName,
  onNavigate,
}: NtaQuestionPaletteProps) {
  // Aggregate counts across all questions
  let totalAnswered = 0
  let totalNotAnswered = 0
  let totalMarked = 0
  let totalAnsweredAndMarked = 0
  let totalNotVisited = 0

  for (const section of sections) {
    for (const q of section.questions) {
      const r = responses[q.question_bank_id]
      if (!r || r.questionState === 'not_visited') totalNotVisited++
      else if (r.questionState === 'not_answered') totalNotAnswered++
      else if (r.questionState === 'answered') totalAnswered++
      else if (r.questionState === 'marked_for_review') totalMarked++
      else if (r.questionState === 'answered_and_marked') totalAnsweredAndMarked++
    }
  }

  return (
    <aside className="flex flex-col h-full overflow-y-auto bg-[#f5f7fa] border-l border-gray-300">
      {/* Candidate profile */}
      <div className="p-3 border-b border-gray-300 bg-white">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-full bg-[#1a3c6e] text-white flex items-center justify-center font-bold text-sm shrink-0">
            {candidateName.charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="text-xs text-gray-500 leading-none mb-0.5">
              {language === 'en' ? 'Candidate' : 'अभ्यर्थी'}
            </p>
            <p className="text-sm font-semibold text-gray-800 truncate max-w-[140px]">
              {candidateName}
            </p>
          </div>
        </div>
      </div>

      {/* Section palette */}
      {sections.map((section, sIdx) => (
        <div key={section.label} className="p-3 border-b border-gray-200">
          <p className="text-[11px] font-bold text-gray-600 uppercase tracking-wide mb-2">
            {section.label}
          </p>
          <div className="grid grid-cols-5 gap-1.5">
            {section.questions.map((q, qIdx) => {
              const r = responses[q.question_bank_id]
              const state = r?.questionState ?? 'not_visited'
              const isCurrent = sIdx === currentSectionIdx && qIdx === currentQuestionIdx
              const globalNum =
                sections
                  .slice(0, sIdx)
                  .reduce((acc, s) => acc + s.questions.length, 0) + qIdx + 1

              return (
                <button
                  key={q.id}
                  onClick={() => onNavigate(sIdx, qIdx)}
                  aria-label={`Question ${globalNum}, state: ${state.replace(/_/g, ' ')}`}
                  aria-current={isCurrent ? 'true' : undefined}
                  className={`w-8 h-8 rounded text-xs font-bold transition-all ${paletteColor(
                    state,
                    isCurrent
                  )}`}
                >
                  {globalNum}
                </button>
              )
            })}
          </div>
        </div>
      ))}

      {/* Legend */}
      <div className="p-3">
        <NtaPaletteLegend
          language={language}
          totalAnswered={totalAnswered}
          totalNotAnswered={totalNotAnswered}
          totalMarked={totalMarked}
          totalAnsweredAndMarked={totalAnsweredAndMarked}
          totalNotVisited={totalNotVisited}
        />
      </div>
    </aside>
  )
}
