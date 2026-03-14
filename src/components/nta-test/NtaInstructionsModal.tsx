'use client'

import type { MockTest, Language } from './types'
import { NtaLanguageToggle } from './NtaLanguageToggle'

interface NtaInstructionsModalProps {
  mockTest: MockTest
  language: Language
  candidateName: string
  onLanguageToggle: (lang: Language) => void
  onStart: () => void
}

export function NtaInstructionsModal({
  mockTest,
  language,
  candidateName,
  onLanguageToggle,
  onStart,
}: NtaInstructionsModalProps) {
  const instructions = mockTest.instructions_json

  const defaultInstructions = {
    en: [
      'Read all questions carefully before answering.',
      `Each correct answer carries ${mockTest.marks_correct} marks. Each wrong answer carries a penalty of ${mockTest.marks_wrong} mark(s). Unanswered questions carry no penalty.`,
      'You can navigate between questions using the question palette on the right.',
      'You can "Mark for Review" a question and come back to it later. An answered question marked for review will still be evaluated.',
      'The timer is displayed at the top right. The test will auto-submit when time runs out.',
      'Once you click "Submit", the test cannot be resumed.',
    ],
    hi: [
      'उत्तर देने से पहले सभी प्रश्नों को ध्यानपूर्वक पढ़ें।',
      `प्रत्येक सही उत्तर के लिए ${mockTest.marks_correct} अंक मिलेंगे। प्रत्येक गलत उत्तर के लिए ${mockTest.marks_wrong} अंक काटे जाएंगे।`,
      'आप दाईं ओर प्रश्न पैलेट का उपयोग करके प्रश्नों के बीच नेविगेट कर सकते हैं।',
      'आप किसी प्रश्न को "समीक्षा के लिए चिह्नित" कर सकते हैं और बाद में वापस आ सकते हैं।',
      'टाइमर ऊपर दाईं ओर प्रदर्शित है। समय समाप्त होने पर परीक्षा स्वतः सबमिट हो जाएगी।',
      'एक बार "सबमिट" क्लिक करने के बाद परीक्षा फिर से शुरू नहीं की जा सकती।',
    ],
  }

  const lines = instructions?.[language] ?? defaultInstructions[language]

  const h = Math.floor(mockTest.duration_seconds / 3600)
  const m = Math.floor((mockTest.duration_seconds % 3600) / 60)
  const durationText =
    language === 'en'
      ? `${h > 0 ? `${h}h ` : ''}${m > 0 ? `${m}m` : ''} (${mockTest.duration_seconds}s)`
      : `${h > 0 ? `${h} घंटे ` : ''}${m > 0 ? `${m} मिनट` : ''}`

  return (
    <div className="min-h-screen bg-[#eef2f7] flex flex-col">
      {/* Header */}
      <header className="bg-[#1a3c6e] text-white px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-white rounded px-2 py-1">
            <span className="text-[#1a3c6e] font-black text-sm">NTA</span>
          </div>
          <div>
            <p className="text-[11px] text-blue-200">National Testing Agency</p>
            <p className="text-sm font-semibold">{mockTest.title}</p>
          </div>
        </div>
        <NtaLanguageToggle language={language} onToggle={onLanguageToggle} />
      </header>

      {/* Body */}
      <main className="flex-1 max-w-3xl mx-auto w-full py-8 px-4">
        {/* Candidate info */}
        <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6 flex items-center justify-between">
          <div>
            <p className="text-xs text-gray-500 mb-0.5">
              {language === 'en' ? 'Candidate Name' : 'अभ्यर्थी का नाम'}
            </p>
            <p className="font-semibold text-gray-800">{candidateName}</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-gray-500 mb-0.5">
              {language === 'en' ? 'Duration' : 'अवधि'}
            </p>
            <p className="font-semibold text-gray-800">{durationText}</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-gray-500 mb-0.5">
              {language === 'en' ? 'Questions' : 'प्रश्न'}
            </p>
            <p className="font-semibold text-gray-800">{mockTest.total_questions}</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-gray-500 mb-0.5">
              {language === 'en' ? 'Max Marks' : 'अधिकतम अंक'}
            </p>
            <p className="font-semibold text-gray-800">{mockTest.total_marks}</p>
          </div>
        </div>

        {/* Marking scheme */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-center">
            <p className="text-2xl font-black text-green-700">+{mockTest.marks_correct}</p>
            <p className="text-xs text-green-600 font-medium">
              {language === 'en' ? 'Marks for correct answer' : 'सही उत्तर के अंक'}
            </p>
          </div>
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-center">
            <p className="text-2xl font-black text-red-600">−{mockTest.marks_wrong}</p>
            <p className="text-xs text-red-500 font-medium">
              {language === 'en' ? 'Penalty for wrong answer' : 'गलत उत्तर की कटौती'}
            </p>
          </div>
        </div>

        {/* Instructions */}
        <div className="bg-white rounded-lg border border-gray-200 p-5 mb-6">
          <h2 className="font-bold text-gray-800 mb-4 text-base">
            {language === 'en' ? 'General Instructions' : 'सामान्य निर्देश'}
          </h2>
          <ol className="space-y-3">
            {lines.map((line, i) => (
              <li key={i} className="flex gap-3 text-sm text-gray-700">
                <span className="font-bold text-[#1a3c6e] shrink-0">{i + 1}.</span>
                <span>{line}</span>
              </li>
            ))}
          </ol>
        </div>

        {/* Palette legend */}
        <div className="bg-white rounded-lg border border-gray-200 p-5 mb-8">
          <h2 className="font-bold text-gray-800 mb-3 text-base">
            {language === 'en' ? 'Question Palette Guide' : 'प्रश्न पैलेट गाइड'}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
            {[
              { color: 'bg-gray-500 text-white',   ring: '', label: language === 'en' ? 'Not Visited' : 'नहीं देखा' },
              { color: 'bg-red-500',    ring: '', label: language === 'en' ? 'Not Answered' : 'उत्तर नहीं दिया' },
              { color: 'bg-green-600',  ring: '', label: language === 'en' ? 'Answered' : 'उत्तर दिया' },
              { color: 'bg-purple-600', ring: '', label: language === 'en' ? 'Marked for Review' : 'समीक्षा के लिए चिह्नित' },
              { color: 'bg-purple-600', ring: 'ring-2 ring-green-400', label: language === 'en' ? 'Answered & Marked for Review' : 'उत्तरित व चिह्नित' },
            ].map((item) => (
              <div key={item.label} className="flex items-center gap-2">
                <span className={`w-5 h-5 rounded ${item.color} ${item.ring} shrink-0`} />
                <span className="text-gray-700">{item.label}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-end">
          <button
            onClick={onStart}
            className="px-8 py-3 bg-[#e8832a] hover:bg-[#d4741f] text-white font-bold text-base rounded-lg transition-colors shadow"
          >
            {language === 'en' ? 'I am ready to begin →' : 'मैं शुरू करने के लिए तैयार हूं →'}
          </button>
        </div>
      </main>
    </div>
  )
}
