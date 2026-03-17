'use client'

import { useState } from 'react'
import { OnboardingSidebar } from '@/components/onboarding/OnboardingSidebar'
import { MobileHeaderBar } from '@/components/onboarding/MobileHeaderBar'
import { MobileNavDrawer } from '@/components/onboarding/MobileNavDrawer'

type Props = {
  title: string
  subtitle?: string
  children: React.ReactNode
}

export function StudentDashboardLayout({ title, subtitle, children }: Props) {
  const [drawerOpen, setDrawerOpen] = useState(false)

  return (
    <div className="min-h-dvh pattern-bg flex flex-col">
      <MobileHeaderBar
        open={drawerOpen}
        onToggle={() => setDrawerOpen((o) => !o)}
        title={title}
        subtitle={subtitle}
      />

      <div className="flex flex-1 min-h-0">
        <OnboardingSidebar />
        <div className="flex-1 min-w-0 overflow-auto">
          {children}
        </div>
      </div>

      <MobileNavDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} />
    </div>
  )
}
