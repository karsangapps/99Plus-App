'use client'

export type SubjectRow = {
  name: string
  section: string
  tag: 'Mandatory' | 'Alternative' | 'Recommended'
  locked: boolean
}

type Props = {
  universityName: string
  collegeName: string
  programName: string
  ruleRef: string
  subjects: SubjectRow[]
  verifiedCount: number
  selected?: Set<string>
  onToggle?: (subject: string, checked: boolean) => void
  isLocked?: boolean
}

const TAG_STYLES: Record<SubjectRow['tag'], string> = {
  Mandatory: 'bg-[#EF4444]/10 text-[#EF4444]',
  Alternative: 'bg-[#F59E0B]/10 text-[#D97706]',
  Recommended: 'bg-[#6366F1]/10 text-[#6366F1]',
}

const SUBJECT_ICONS: Record<string, string> = {
  English: '🔤',
  Mathematics: '📐',
  Accountancy: '🧮',
  Economics: '📈',
  'Political Science': '🏛',
  History: '📜',
  Sociology: '🤝',
  Geography: '🗺',
  Psychology: '🧠',
  'General Test': '⚙️',
}

export function EligibilityRuleCard({
  universityName,
  collegeName,
  programName,
  ruleRef,
  subjects,
  verifiedCount,
  selected,
  onToggle,
  isLocked = false,
}: Props) {
  const selectedCount = selected ? selected.size : verifiedCount

  return (
    <div
      className="rounded-[12px] bg-white border border-[#E5E7EB] overflow-hidden"
      style={{ boxShadow: '0px 4px 8px rgba(0,0,0,0.06)' }}
    >
      {/* Card header */}
      <div className="px-7 py-5 border-b border-[#E5E7EB] flex items-center justify-between">
        <div className="flex items-center gap-3">
          <svg
            className="w-4 h-4 text-[#059669]"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z"
            />
          </svg>
          <h3 className="font-bold text-[#0F172A] text-base">
            Required CUET Subjects — Hard-Locked
          </h3>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#059669]/10">
          <div className="w-2 h-2 rounded-full bg-[#059669] animate-pulse" />
          <span className="text-[#059669] text-xs font-semibold">
            {selectedCount}/{subjects.length} Verified
          </span>
        </div>
      </div>

      {/* Mandate banner */}
      <div className="px-7 py-4 bg-[#0F172A] flex items-center gap-4">
        <div className="w-10 h-10 rounded-[10px] bg-white/10 flex items-center justify-center flex-shrink-0 border border-white/10 text-lg">
          🏛
        </div>
        <div>
          <p className="text-white font-semibold text-sm">{universityName}</p>
          <p className="text-white/50 text-xs mt-0.5">
            {programName} — {collegeName}
          </p>
          <p className="text-white/30 text-[10px] mt-1 font-mono">{ruleRef}</p>
        </div>
      </div>

      {/* Subject rows */}
      <div className="divide-y divide-[#E5E7EB]">
        {subjects.map((s) => {
          const isChecked = s.locked || (selected?.has(s.name) ?? false)
          const isInteractive = !s.locked && !isLocked && onToggle !== undefined

          return (
            <div
              key={s.name}
              onClick={() => {
                if (isInteractive) onToggle(s.name, !isChecked)
              }}
              className={[
                'px-7 py-5 flex items-center justify-between transition-colors group',
                isInteractive ? 'cursor-pointer hover:bg-[#F8FAFC]' : '',
                isChecked && !s.locked ? 'bg-[#F0FDF4]' : '',
              ]
                .filter(Boolean)
                .join(' ')}
            >
              <div className="flex items-center gap-4">
                <div className="w-11 h-11 rounded-[12px] bg-[#F8FAFC] border border-[#E5E7EB] flex items-center justify-center text-xl">
                  {SUBJECT_ICONS[s.name] ?? '📚'}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-[#0F172A] text-sm">{s.name}</span>
                    <span
                      className={`px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${TAG_STYLES[s.tag]}`}
                    >
                      {s.tag}
                    </span>
                  </div>
                  <p className="text-xs text-[#9CA3AF] mt-0.5 font-mono">{s.section}</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {s.locked ? (
                  /* Mandatory = permanently locked */
                  <>
                    <span className="text-xs text-[#059669] font-medium bg-[#059669]/5 px-2.5 py-1 rounded-md">
                      Locked
                    </span>
                    <svg
                      className="w-4 h-4 text-[#059669]"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={2}
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z"
                      />
                    </svg>
                  </>
                ) : isLocked ? (
                  /* Post-lock: show final state read-only */
                  isChecked ? (
                    <span className="text-xs text-[#059669] font-medium bg-[#059669]/5 px-2.5 py-1 rounded-md flex items-center gap-1.5">
                      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                      </svg>
                      Selected
                    </span>
                  ) : (
                    <span className="text-xs text-[#9CA3AF] bg-[#F1F5F9] px-2.5 py-1 rounded-md">
                      Not selected
                    </span>
                  )
                ) : (
                  /* Interactive checkbox */
                  <div
                    className={[
                      'w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all flex-shrink-0',
                      isChecked
                        ? 'bg-[#059669] border-[#059669]'
                        : 'border-[#D1D5DB] bg-white group-hover:border-[#059669]/50',
                    ].join(' ')}
                  >
                    {isChecked && (
                      <svg
                        className="w-3 h-3 text-white"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={3}
                        stroke="currentColor"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                      </svg>
                    )}
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
