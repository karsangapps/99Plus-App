import type { Language } from './types'

interface NtaPaletteLegendProps {
  language: Language
  totalAnswered: number
  totalNotAnswered: number
  totalMarked: number
  totalAnsweredAndMarked: number
  totalNotVisited: number
}

const legendItems = [
  { state: 'answered',            color: 'bg-green-600',  labelEn: 'Answered',                   labelHi: 'उत्तर दिया' },
  { state: 'not_answered',        color: 'bg-red-500',    labelEn: 'Not Answered',                labelHi: 'उत्तर नहीं दिया' },
  { state: 'not_visited',         color: 'bg-gray-300',   labelEn: 'Not Visited',                 labelHi: 'नहीं देखा' },
  { state: 'marked_for_review',   color: 'bg-purple-600', labelEn: 'Marked for Review',           labelHi: 'समीक्षा के लिए' },
  { state: 'answered_and_marked', color: 'bg-purple-600', labelEn: 'Answered & Marked for Review',labelHi: 'उत्तरित व चिह्नित' },
]

const countsMap = {
  answered: (p: NtaPaletteLegendProps) => p.totalAnswered,
  not_answered: (p: NtaPaletteLegendProps) => p.totalNotAnswered,
  not_visited: (p: NtaPaletteLegendProps) => p.totalNotVisited,
  marked_for_review: (p: NtaPaletteLegendProps) => p.totalMarked,
  answered_and_marked: (p: NtaPaletteLegendProps) => p.totalAnsweredAndMarked,
}

export function NtaPaletteLegend(props: NtaPaletteLegendProps) {
  const { language } = props

  return (
    <div className="text-xs">
      <p className="font-semibold text-gray-600 mb-2 text-[11px] uppercase tracking-wide">
        {language === 'en' ? 'Legend' : 'संकेत'}
      </p>
      <ul className="space-y-1.5">
        {legendItems.map((item) => (
          <li key={item.state} className="flex items-center gap-2">
            <span
              className={`w-5 h-5 rounded ${item.color} shrink-0 ${
                item.state === 'answered_and_marked' ? 'ring-2 ring-green-400' : ''
              }`}
            />
            <span className="text-gray-600">
              <span className="font-medium">
                {countsMap[item.state as keyof typeof countsMap](props)}
              </span>{' '}
              {language === 'en' ? item.labelEn : item.labelHi}
            </span>
          </li>
        ))}
      </ul>
    </div>
  )
}
