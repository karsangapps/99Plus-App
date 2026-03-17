'use client'

type Props = {
  open: boolean
  onToggle: () => void
  title?: string
  subtitle?: string
}

export function MobileHeaderBar({
  open,
  onToggle,
  title = 'Command Center',
  subtitle = 'Set your surgical target — Step 1 of 3',
}: Props) {
  return (
    <header className="lg:hidden sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-[#E5E7EB]">
      <div className="flex items-center justify-between px-4 py-4">
        <div className="flex items-center gap-3 min-w-0">
          <button
            type="button"
            onClick={onToggle}
            aria-expanded={open}
            aria-label={open ? 'Close navigation menu' : 'Open navigation menu'}
            className="w-10 h-10 rounded-[12px] border border-[#E5E7EB] flex items-center justify-center text-[#0F172A] hover:bg-[#F8FAFC] active:bg-[#EEF2FF] shrink-0 transition-colors"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              aria-hidden
            >
              {open ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
                />
              )}
            </svg>
          </button>
          <div className="min-w-0">
            <h1 className="text-lg font-bold text-[#0F172A] tracking-tight truncate">
              {title}
            </h1>
            <p className="text-xs text-[#9CA3AF] truncate">{subtitle}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-xs font-medium text-[#9CA3AF] hidden sm:inline">
            CUET 2026
          </span>
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#059669]/10 text-[#059669] text-xs font-semibold">
            <span
              className="w-1.5 h-1.5 rounded-full bg-[#059669] animate-pulse"
              aria-hidden
            />
            Live
          </span>
        </div>
      </div>
    </header>
  )
}
