export type TargetUniversitiesSelectorProps = {
  selected: string[]
  onChange: (next: string[]) => void
  submitAttempted: boolean
  error?: string
}

const OPTIONS = [
  { code: 'DU', label: 'Delhi University' },
  { code: 'JNU', label: 'JNU' },
  { code: 'BHU', label: 'BHU' },
  { code: 'JAMIA', label: 'Jamia Millia' },
  { code: 'ALLAHABAD', label: 'Allahabad Univ.' },
  { code: 'OTHER', label: 'Other Central' }
] as const

export function TargetUniversitiesSelector(props: TargetUniversitiesSelectorProps) {
  const { selected, onChange, submitAttempted, error } = props

  function toggle(code: string) {
    onChange(
      selected.includes(code) ? selected.filter((c) => c !== code) : [...selected, code]
    )
  }

  return (
    <div>
      <label className="block text-xs font-semibold mb-2 text-[#0F172A]">
        Target Universities{' '}
        <span className="font-normal text-[#9CA3AF]">(select all that apply)</span>
      </label>
      <div className="flex flex-wrap gap-2">
        {OPTIONS.map((u) => {
          const isSelected = selected.includes(u.code)
          return (
            <button
              key={u.code}
              type="button"
              onClick={() => toggle(u.code)}
              className={[
                'inline-flex items-center gap-2 h-9 px-3 rounded-full border text-xs font-semibold transition-all',
                isSelected
                  ? 'border-[#6366F1] bg-[#EEF2FF] text-[#3730A3]'
                  : 'border-[#E5E7EB] bg-white text-[#0F172A] hover:border-[#C7D2FE]'
              ].join(' ')}
              aria-pressed={isSelected}
            >
              <span
                className={[
                  'w-4 h-4 rounded-full border flex items-center justify-center text-[10px]',
                  isSelected
                    ? 'border-[#6366F1] bg-[#6366F1] text-white'
                    : 'border-[#E5E7EB] bg-white text-transparent'
                ].join(' ')}
                aria-hidden
              >
                ✓
              </span>
              {u.label}
            </button>
          )
        })}
      </div>
      {submitAttempted && error ? (
        <p className="text-xs mt-2 text-red-600">{error}</p>
      ) : null}
    </div>
  )
}

