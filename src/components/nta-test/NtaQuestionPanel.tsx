'use client'

import { NtaOptionList } from './NtaOptionList'
import { NtaLanguageToggle } from './NtaLanguageToggle'
import type { TestQuestion, ResponseState, Language } from './types'

interface NtaQuestionPanelProps {
  question: TestQuestion
  questionNumber: number
  totalInSection: number
  response: ResponseState
  language: Language
  onLanguageToggle: (lang: Language) => void
  onSelectAnswer: (answer: string) => void
  isSubmitting: boolean
}

export function NtaQuestionPanel({
  question,
  questionNumber,
  totalInSection,
  response,
  language,
  onLanguageToggle,
  onSelectAnswer,
  isSubmitting,
}: NtaQuestionPanelProps) {
  const q = question.question

  return (
    <div className="flex flex-col h-full">
      {/* Question header bar */}
      <div className="flex items-center justify-between px-4 py-2 bg-[#e8f0f8] border-b border-gray-200">
        <div className="flex items-center gap-4 text-sm">
          <span className="font-semibold text-gray-700">
            Question {questionNumber} of {totalInSection}
          </span>
          <span className="text-gray-500">|</span>
          <span className="text-gray-600">
            Marks: <span className="text-green-700 font-semibold">+{question.marks_correct}</span>
            {' / '}
            <span className="text-red-600 font-semibold">−{question.marks_wrong}</span>
          </span>
          <span className="text-gray-500">|</span>
          <span className="text-xs text-gray-500 capitalize">
            {q.question_type.replace('_', ' ')} · Difficulty {q.difficulty}/5
          </span>
        </div>
        <NtaLanguageToggle language={language} onToggle={onLanguageToggle} />
      </div>

      {/* Question body — scrollable */}
      <div className="flex-1 overflow-y-auto p-5">
        <div
          className="text-gray-900 text-base leading-relaxed mb-1"
          dangerouslySetInnerHTML={{
            __html: q.question_body_json[language] || q.question_body_json.en,
          }}
        />

        <NtaOptionList
          options={q.options_json}
          selectedAnswer={response.selectedAnswer}
          language={language}
          onSelect={onSelectAnswer}
          isSubmitting={isSubmitting}
        />
      </div>

      {/* Chapter tag */}
      <div className="px-5 py-2 border-t border-gray-100 bg-gray-50">
        <span className="text-xs text-gray-400">
          {question.section_label} · {q.chapter_name}
        </span>
      </div>
    </div>
  )
}
