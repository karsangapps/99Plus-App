'use client'

import type { ReactNode } from 'react'

type Props = {
  children: ReactNode
}

export function GuardianConsentFrame({ children }: Props) {
  return (
    <div className="min-h-dvh bg-white flex flex-col">
      <header className="bg-white border-b border-[#E5E7EB] h-14 px-6 flex items-center justify-between sticky top-0 z-50">
        <div className="w-[100px]" />
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 rounded-[10px] bg-[#6366F1] flex items-center justify-center">
            <span className="text-white font-extrabold text-[12px]">99</span>
            <span className="text-[#FACC15] font-extrabold text-[10px] -ml-0.5">+</span>
          </div>
          <span className="font-extrabold text-[16px] text-[#0F172A]">99Plus</span>
        </div>
        <div className="flex items-center bg-[#F8FAFC] border border-[#E5E7EB] rounded-md overflow-hidden">
          <button type="button" className="px-3.5 py-1.5 text-[11px] font-semibold bg-[#6366F1] text-white">
            English
          </button>
          <button type="button" className="px-3.5 py-1.5 text-[11px] font-semibold text-[#9CA3AF]">
            हिन्दी
          </button>
        </div>
      </header>

      <main className="flex-1 w-full max-w-[680px] mx-auto px-6 py-9 pb-12">
        {children}
      </main>

      <footer className="px-6 py-4 border-t border-[#E5E7EB] flex items-center justify-center gap-6 bg-white">
        <span className="text-[10px] text-[#9CA3AF]">© 2026 99Plus</span>
        <span className="w-1 h-1 rounded-full bg-[#E5E7EB]" />
        <span className="text-[10px] text-[#9CA3AF]">DPDP 2023 Compliant</span>
        <span className="w-1 h-1 rounded-full bg-[#E5E7EB]" />
        <span className="text-[10px] text-[#9CA3AF]">Secure Portal v1.0</span>
      </footer>
    </div>
  )
}

