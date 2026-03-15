import Link from 'next/link'

type StoreSidebarProps = {
  activePath: string
}

const NAV_ITEMS = [
  { href: '/command-center', label: 'Command Center', icon: CommandCenterIcon },
  { href: '/onboarding/battle', label: 'Pre-Test', icon: PreTestIcon },
  { href: '/mock', label: 'NTA Test', icon: NTATestIcon },
  { href: '/diagnosis', label: 'Diagnosis', icon: DiagnosisIcon },
  { href: '/drill', label: 'Surgical Drill', icon: DrillIcon },
  { href: '/analytics', label: 'Analytics', icon: AnalyticsIcon },
  { href: '/selection-hub', label: 'Selection Hub', icon: SelectionHubIcon },
  { href: '/settings', label: 'Settings', icon: SettingsIcon },
]

export function StoreSidebar({ activePath }: StoreSidebarProps) {
  return (
    <aside
      className="w-[260px] min-w-[260px] h-full flex flex-col justify-between border-r bg-white flex-shrink-0"
      style={{ borderColor: '#E5E7EB' }}
    >
      <div>
        {/* Logo */}
        <div className="px-6 py-6 border-b" style={{ borderColor: '#E5E7EB' }}>
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ background: '#EEF2FF' }}
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24">
                <rect x="3" y="3" width="18" height="18" rx="3" stroke="#6366F1" strokeWidth="1.5" />
                <path d="M9 12l2 2 4-4" stroke="#6366F1" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <span className="text-lg font-extrabold tracking-tight" style={{ color: '#0F172A' }}>
              99Plus
            </span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="px-3 py-4 flex flex-col gap-1">
          {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
            const isActive = activePath === href
            return (
              <Link
                key={href}
                href={href}
                className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all hover:bg-gray-50"
                style={{ color: isActive ? '#6366F1' : '#9CA3AF' }}
              >
                <Icon active={isActive} />
                {label}
              </Link>
            )
          })}

          <div className="my-1 border-t" style={{ borderColor: '#E5E7EB' }} />

          {/* 99Plus Store — active highlight */}
          <Link
            href="/store"
            className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all"
            style={
              activePath === '/store'
                ? { background: '#6366F1', color: '#FFFFFF' }
                : { color: '#9CA3AF' }
            }
          >
            <StoreIcon active={activePath === '/store'} />
            99Plus Store
          </Link>
        </nav>
      </div>

      {/* User footer */}
      <div className="px-4 pb-5">
        <div
          className="flex items-center gap-3 px-3.5 py-3.5 rounded-2xl border bg-white hover:border-gray-300 transition-colors cursor-pointer"
          style={{ borderColor: '#E5E7EB', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}
        >
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ring-2 ring-gray-100"
            style={{ background: 'linear-gradient(135deg, #6366F1, #FACC15)' }}
          >
            <span className="text-white text-sm font-bold">A</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold truncate" style={{ color: '#0F172A' }}>
              Aspirant
            </p>
            <p className="text-xs" style={{ color: '#9CA3AF' }}>CUET 2026</p>
          </div>
          <button className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors flex-shrink-0">
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="#9CA3AF" strokeWidth="2">
              <path d="M12 5v.01M12 12v.01M12 19v.01" strokeLinecap="round" />
            </svg>
          </button>
        </div>
      </div>
    </aside>
  )
}

// Icon components — inline SVGs matching the screen mockup style
function CommandCenterIcon({ active }: { active: boolean }) {
  return (
    <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke={active ? '#6366F1' : '#9CA3AF'} strokeWidth="1.5">
      <rect x="3" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" />
      <rect x="14" y="14" width="7" height="7" rx="1" />
    </svg>
  )
}
function PreTestIcon({ active }: { active: boolean }) {
  return (
    <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke={active ? '#6366F1' : '#9CA3AF'} strokeWidth="1.5">
      <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" strokeLinecap="round" />
      <path d="M9 12l2 2 4-4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}
function NTATestIcon({ active }: { active: boolean }) {
  return (
    <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke={active ? '#6366F1' : '#9CA3AF'} strokeWidth="1.5">
      <rect x="2" y="3" width="20" height="14" rx="2" />
      <path d="M8 21h8M12 17v4" strokeLinecap="round" />
    </svg>
  )
}
function DiagnosisIcon({ active }: { active: boolean }) {
  return (
    <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke={active ? '#6366F1' : '#9CA3AF'} strokeWidth="1.5">
      <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2" strokeLinecap="round" />
      <path d="M12 11v6M9 14h6" strokeLinecap="round" />
    </svg>
  )
}
function DrillIcon({ active }: { active: boolean }) {
  return (
    <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke={active ? '#6366F1' : '#9CA3AF'} strokeWidth="1.5">
      <circle cx="12" cy="12" r="3" />
      <path d="M12 2v3M12 19v3M4.22 4.22l2.12 2.12M17.66 17.66l2.12 2.12M2 12h3M19 12h3M4.22 19.78l2.12-2.12M17.66 6.34l2.12-2.12" strokeLinecap="round" />
    </svg>
  )
}
function AnalyticsIcon({ active }: { active: boolean }) {
  return (
    <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke={active ? '#6366F1' : '#9CA3AF'} strokeWidth="1.5">
      <path d="M3 3v18h18" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M7 16l4-6 4 4 4-8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}
function SelectionHubIcon({ active }: { active: boolean }) {
  return (
    <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke={active ? '#6366F1' : '#9CA3AF'} strokeWidth="1.5">
      <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M9 22V12h6v10" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}
function SettingsIcon({ active }: { active: boolean }) {
  return (
    <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke={active ? '#6366F1' : '#9CA3AF'} strokeWidth="1.5">
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" />
    </svg>
  )
}
function StoreIcon({ active }: { active: boolean }) {
  return (
    <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke={active ? '#FFFFFF' : '#9CA3AF'} strokeWidth="1.5">
      <path d="M3 9l1-5h16l1 5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M3 9v11a1 1 0 001 1h16a1 1 0 001-1V9" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M9 9v3a3 3 0 006 0V9" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}
