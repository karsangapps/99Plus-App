'use client'

type StoreHeaderProps = {
  creditBalance: number
}

export function StoreHeader({ creditBalance }: StoreHeaderProps) {
  return (
    <header
      className="h-16 min-h-[64px] flex items-center justify-between px-8 bg-white border-b flex-shrink-0"
      style={{ borderColor: '#E5E7EB' }}
    >
      <div>
        <h1 className="text-xl font-bold tracking-tight" style={{ color: '#0F172A' }}>
          99Plus Store
        </h1>
      </div>
      <div className="flex items-center gap-5">
        {/* Credits widget */}
        <div
          className="flex items-center gap-2 px-4 py-2 rounded-xl border-2 border-dashed"
          style={{ borderColor: '#E5E7EB', background: '#FEFCE8' }}
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="10" fill="#FEF3C7" stroke="#FACC15" strokeWidth="1.5" />
            <path
              d="M12 6v2M12 16v2M8.46 8.46l1.42 1.42M14.12 14.12l1.42 1.42M6 12h2M16 12h2M8.46 15.54l1.42-1.42M14.12 9.88l1.42-1.42"
              stroke="#D97706"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </svg>
          <span className="text-sm font-bold" style={{ color: '#0F172A' }}>
            {creditBalance} {creditBalance === 1 ? 'Credit' : 'Credits'}
          </span>
        </div>

        {/* Notification bell */}
        <button className="relative w-9 h-9 flex items-center justify-center rounded-xl hover:bg-gray-100 transition-colors">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="#9CA3AF" strokeWidth="1.5">
            <path
              d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </div>
    </header>
  )
}
