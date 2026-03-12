'use client'

import type { ReactNode } from 'react'

type Props = {
  left: ReactNode
  right: ReactNode
}

export function AuthTwoColumnLayout({ left, right }: Props) {
  return (
    <div className="min-h-dvh flex items-center justify-center relative px-4 py-8 sm:px-8 sm:py-12 bg-[#F8FAFC]">
      <div className="relative z-10 w-full max-w-5xl bg-white rounded-2xl shadow-lg border border-[#E5E7EB] px-6 py-8 sm:px-10 sm:py-10">
        <div className="grid gap-8 md:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] items-start">
          <div className="hidden md:flex flex-col justify-between border-r border-[#E5E7EB] pr-8">
            {left}
          </div>
          <div className="w-full max-w-md mx-auto md:max-w-none">{right}</div>
        </div>
      </div>
    </div>
  )
}

