'use client'

import { OnboardingSidebar } from '@/components/onboarding/OnboardingSidebar'
import { OnboardingDreamTargetMain } from '@/components/onboarding/OnboardingDreamTargetMain'

export default function OnboardingDreamTargetClient() {
  return (
    <div className="min-h-dvh pattern-bg">
      <div className="flex min-h-dvh">
        <OnboardingSidebar />
        <OnboardingDreamTargetMain />
      </div>
    </div>
  )
}

