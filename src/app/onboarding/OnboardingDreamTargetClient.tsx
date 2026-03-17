'use client'

import { useState } from 'react'
import { OnboardingSidebar } from '@/components/onboarding/OnboardingSidebar'
import { OnboardingDreamTargetMain } from '@/components/onboarding/OnboardingDreamTargetMain'
import { MobileHeaderBar } from '@/components/onboarding/MobileHeaderBar'
import { MobileNavDrawer } from '@/components/onboarding/MobileNavDrawer'

export default function OnboardingDreamTargetClient() {
  const [drawerOpen, setDrawerOpen] = useState(false)

  return (
    <div className="min-h-dvh pattern-bg flex flex-col">
      <MobileHeaderBar
        open={drawerOpen}
        onToggle={() => setDrawerOpen((o) => !o)}
        title="Command Center"
        subtitle="Set your surgical target — Step 1 of 3"
      />

      <div className="flex flex-1 min-h-0">
        <OnboardingSidebar />
        <div className="flex-1 min-w-0 overflow-auto">
          <OnboardingDreamTargetMain />
        </div>
      </div>

      <MobileNavDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} />
    </div>
  )
}
