import type { MarkLeak } from '@/app/diagnosis/[attemptId]/actions'

interface GapAnalysisCardProps {
  leaks: MarkLeak[]
}

const leakTypeLabel: Record<string, string> = {
  guessing:    'Wild Guessing',
  careless:    'Careless Error',
  conceptual:  'Conceptual Gap',
  application: 'Application Error',
  speed:       'Time Pressure',
  stamina:     'Stamina Loss',
  pattern_gap: 'Pattern Gap',
}

const leakTypeColor: Record<string, string> = {
  guessing:    'text-orange-600',
  careless:    'text-yellow-600',
  conceptual:  'text-red-600',
  application: 'text-red-500',
  speed:       'text-purple-600',
  stamina:     'text-gray-500',
  pattern_gap: 'text-blue-600',
}

const dotColor: Record<string, string> = {
  guessing:    'bg-orange-500',
  careless:    'bg-yellow-500',
  conceptual:  'bg-red-600',
  application: 'bg-red-500',
  speed:       'bg-purple-500',
  stamina:     'bg-gray-400',
  pattern_gap: 'bg-blue-500',
}

export function GapAnalysisCard({ leaks }: GapAnalysisCardProps) {
  if (leaks.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm text-center">
        <i className="fa-solid fa-circle-check text-emerald-500 text-2xl mb-2" />
        <p className="text-sm font-semibold text-gray-700">No mark leaks detected</p>
        <p className="text-xs text-gray-400 mt-1">All answers were correct. Excellent work!</p>
      </div>
    )
  }

  const totalLost = leaks.reduce((sum, l) => sum + l.lostMarks, 0)
  const primarySubject = leaks[0]?.subject ?? 'Unknown'
  const topChapter = leaks[0]?.chapterName ?? 'Unknown'

  // Group by chapter for breakdown display
  const byChapter: Record<string, { lostMarks: number; leakType: string; count: number }> = {}
  for (const l of leaks) {
    const key = `${l.subject} — ${l.chapterName}`
    if (!byChapter[key]) {
      byChapter[key] = { lostMarks: 0, leakType: l.leakType, count: 0 }
    }
    byChapter[key].lostMarks += l.lostMarks
    byChapter[key].count += 1
  }

  const chapterEntries = Object.entries(byChapter)
    .sort(([,a],[,b]) => b.lostMarks - a.lostMarks)
    .slice(0, 4)

  // Detect behavioral flags
  const guessingCount = leaks.filter(l => l.leakType === 'guessing').length
  const fastLeaks = leaks.filter(l => l.timeSpentSeconds < 15)

  return (
    <div className="bg-white rounded-xl border-2 border-red-200/50 overflow-hidden shadow-sm">
      {/* Red accent top bar */}
      <div className="h-1.5 bg-gradient-to-r from-red-500 via-red-400 to-red-500" />

      <div className="p-6">
        {/* Header */}
        <div className="flex items-start gap-4 mb-5">
          <div className="w-12 h-12 rounded-xl bg-red-50 flex items-center justify-center flex-shrink-0 mt-0.5">
            <i className="fa-solid fa-triangle-exclamation text-red-500 text-xl" />
          </div>
          <div>
            <h3 className="text-base font-bold text-gray-900 mb-1">
              Critical Mark Leak Detected
            </h3>
            <p className="text-sm text-gray-500 leading-relaxed">
              You lost{' '}
              <span className="font-bold text-red-500">{totalLost} mark{totalLost !== 1 ? 's' : ''}</span>
              {' '}across{' '}
              <span className="font-bold text-gray-900">{leaks.length} question{leaks.length !== 1 ? 's' : ''}</span>.
              {chapterEntries.length === 1 && (
                <> Primary leak from <span className="font-bold text-gray-900">{topChapter}</span> in {primarySubject}.</>
              )}
            </p>
          </div>
        </div>

        {/* Chapter breakdown */}
        <div className="bg-red-50 rounded-xl p-4 mb-5">
          <p className="text-xs font-bold text-red-500 uppercase tracking-wider mb-3">Leak Breakdown</p>
          <div className="space-y-3">
            {chapterEntries.map(([chapter, info]) => (
              <div key={chapter} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full flex-shrink-0 ${dotColor[info.leakType] ?? 'bg-red-500'}`} />
                  <span className="text-sm text-gray-900">{chapter}</span>
                  <span className={`text-[10px] font-semibold ml-1 ${leakTypeColor[info.leakType] ?? 'text-red-500'}`}>
                    ({leakTypeLabel[info.leakType] ?? info.leakType})
                  </span>
                </div>
                <span className="text-sm font-bold text-red-500 ml-4">−{info.lostMarks} mark{info.lostMarks !== 1 ? 's' : ''}</span>
              </div>
            ))}
          </div>
          <div className="mt-3 pt-3 border-t border-red-200/60 flex items-center justify-between">
            <span className="text-xs font-bold text-red-900 uppercase tracking-wider">Total Leak</span>
            <span className="text-base font-black text-red-500">−{totalLost} marks</span>
          </div>
        </div>

        {/* Behavioral flag */}
        {guessingCount > 0 && (
          <div className="flex items-center gap-3 bg-yellow-50 rounded-xl p-4">
            <i className="fa-solid fa-brain text-yellow-600 flex-shrink-0" />
            <div>
              <p className="text-xs font-bold text-yellow-600 uppercase tracking-wider">Behavioral Flag</p>
              <p className="text-sm text-yellow-900 mt-0.5">
                Wild guessing detected on{' '}
                <span className="font-bold">{guessingCount} question{guessingCount !== 1 ? 's' : ''}</span>
                {fastLeaks.length > 0 && (
                  <> (avg. {Math.round(fastLeaks.reduce((s,l) => s + l.timeSpentSeconds, 0) / fastLeaks.length)}s/question)</>
                )}
                . Negative marking risk identified.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
