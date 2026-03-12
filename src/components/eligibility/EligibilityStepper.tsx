type Step = 'dream' | 'eligibility' | 'battle'

type Props = {
  active: Step
}

const STEPS: { key: Step; label: string; index: number }[] = [
  { key: 'dream', label: 'Dream Mapping', index: 1 },
  { key: 'eligibility', label: 'Eligibility Lock', index: 2 },
  { key: 'battle', label: 'Battle Plan', index: 3 },
]

export function EligibilityStepper({ active }: Props) {
  const activeIdx = STEPS.findIndex((s) => s.key === active)

  return (
    <div className="flex items-center justify-center">
      {STEPS.map((step, i) => {
        const isDone = i < activeIdx
        const isCurrent = step.key === active

        return (
          <div key={step.key} className="flex items-center">
            <div className="flex items-center gap-3">
              <div
                className={[
                  'w-10 h-10 rounded-full flex items-center justify-center shadow-md text-sm font-bold transition-all',
                  isDone
                    ? 'bg-[#6366F1] text-white'
                    : isCurrent
                    ? 'bg-[#059669] text-white ring-4 ring-[#059669]/20'
                    : 'bg-[#E5E7EB] text-[#9CA3AF]',
                ].join(' ')}
              >
                {isDone ? (
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                  </svg>
                ) : (
                  <span>{step.index}</span>
                )}
              </div>
              <span
                className={[
                  'text-sm font-semibold',
                  isDone ? 'text-[#6366F1]' : isCurrent ? 'text-[#059669]' : 'text-[#9CA3AF] font-medium',
                ].join(' ')}
              >
                {step.label}
              </span>
            </div>

            {i < STEPS.length - 1 && (
              <div
                className={[
                  'w-16 h-0.5 mx-3 rounded-full',
                  i < activeIdx ? 'bg-[#6366F1]' : 'bg-[#E5E7EB]',
                ].join(' ')}
              />
            )}
          </div>
        )
      })}
    </div>
  )
}
