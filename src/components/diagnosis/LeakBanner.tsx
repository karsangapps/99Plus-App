import type { SeatRow, MarkLeak } from '@/app/diagnosis/[attemptId]/actions'

interface LeakBannerProps {
  topLeak: MarkLeak
  seatHeatmap: SeatRow[]
}

export function LeakBanner({ topLeak, seatHeatmap }: LeakBannerProps) {
  // Find the closest seat that the student can still reach (smallest positive marksAway)
  const closestReach = seatHeatmap.find(r => r.seatStatus === 'close')
    ?? seatHeatmap.find(r => r.seatStatus === 'possible')

  const totalLeakedMarks = topLeak.lostMarks
  const targetCollege = closestReach?.collegeName ?? seatHeatmap[0]?.collegeName ?? 'your target college'

  return (
    <div className="relative bg-gradient-to-r from-[#7F1D1D] via-[#991B1B] to-[#7F1D1D] rounded-xl p-6 overflow-hidden shadow-lg shadow-red-900/25">
      {/* Diagonal stripe overlay */}
      <div
        className="absolute inset-0 opacity-[0.04]"
        style={{ backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 20px, white 20px, white 21px)' }}
      />
      <div className="relative flex items-center justify-between gap-4">
        <div className="flex items-center gap-5">
          <div className="w-16 h-16 rounded-[14px] bg-white/10 backdrop-blur-sm flex items-center justify-center border border-white/20 flex-shrink-0">
            <span className="text-3xl font-black text-white">{totalLeakedMarks}</span>
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <i className="fa-solid fa-triangle-exclamation text-red-300 text-sm" />
              <span className="text-xs font-black text-red-300 uppercase tracking-[0.15em]">
                Mark Leak Detected
              </span>
            </div>
            <p className="text-lg font-bold text-white">
              You are exactly{' '}
              <span className="text-yellow-300 underline underline-offset-4 decoration-2 decoration-yellow-300/60">
                {totalLeakedMarks} mark{totalLeakedMarks !== 1 ? 's' : ''}
              </span>{' '}
              away from a seat at{' '}
              <span className="text-yellow-300">{targetCollege}</span>
            </p>
            <p className="text-sm text-red-300/80 mt-1">
              Marks leaked from{' '}
              <span className="font-semibold text-white">{topLeak.chapterName}</span>
              {' '}in {topLeak.subject}. This is surgically fixable.
            </p>
          </div>
        </div>
        <div className="flex-shrink-0 ml-4 text-center hidden sm:block">
          <div className="text-4xl font-black text-white/20">→</div>
          <span className="text-[10px] font-bold text-red-300/60 uppercase tracking-wider">Fixable</span>
        </div>
      </div>
    </div>
  )
}
