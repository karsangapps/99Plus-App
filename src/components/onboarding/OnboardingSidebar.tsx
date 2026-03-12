'use client'

export function OnboardingSidebar() {
  return (
    <aside className="hidden lg:flex w-64 shrink-0 border-r border-[#E5E7EB] bg-white shadow-sm">
      <div className="flex w-full flex-col">
        <div className="p-6 border-b border-[#E5E7EB]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#EEF2FF] flex items-center justify-center">
              <div className="w-4 h-4 rounded bg-[#6366F1]" />
            </div>
            <span className="text-sm font-bold text-[#0F172A]">99Plus</span>
          </div>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-2">
          <div className="flex items-center gap-3 px-4 py-3 rounded-[12px] text-sm font-medium text-[#0F172A] bg-[#6366F1] bg-opacity-10 border border-[#6366F1] border-opacity-30">
            <span className="text-[#6366F1]">◎</span>
            <span>Command Center</span>
          </div>
          {[
            'Pre-Test',
            'NTA Test',
            'Diagnosis',
            'Surgical Drill',
            'Analytics',
            'Selection Hub',
            'Settings'
          ].map((label) => (
            <div
              key={label}
              className="flex items-center gap-3 px-4 py-3 rounded-[12px] text-sm font-medium text-[#9CA3AF]"
            >
              <span>○</span>
              <span>{label}</span>
            </div>
          ))}
        </nav>

        <div className="p-4 border-t border-[#E5E7EB]">
          <div
            className="flex items-center gap-3 px-4 py-3.5 rounded-2xl bg-[#F8FAFC] border border-[#E5E7EB]"
            style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}
          >
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#6366F1] to-[#FACC15] flex items-center justify-center shrink-0">
              <span className="text-white text-sm font-bold">A</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-[#0F172A] truncate">Aspirant</p>
              <p className="text-xs text-[#9CA3AF] truncate">CUET 2026</p>
            </div>
          </div>
        </div>
      </div>
    </aside>
  )
}

