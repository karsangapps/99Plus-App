'use client'

import { NavLinks } from './NavLinks'

export function OnboardingSidebar() {
  return (
    <aside className="hidden lg:flex w-64 min-w-0 shrink-0 border-r border-[#E5E7EB] bg-white shadow-sm flex-col">
      <div className="p-6 border-b border-[#E5E7EB]">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-[#EEF2FF] flex items-center justify-center">
            <div className="w-4 h-4 rounded bg-[#6366F1]" />
          </div>
          <span className="text-sm font-bold text-[#0F172A]">99Plus</span>
        </div>
      </div>

      <NavLinks />

      <div className="p-4 border-t border-[#E5E7EB] shrink-0">
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
    </aside>
  )
}
