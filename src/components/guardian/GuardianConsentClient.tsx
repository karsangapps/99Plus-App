'use client'

import { GuardianConsentCard } from '@/components/guardian/GuardianConsentCard'
import { GuardianConsentFrame } from '@/components/guardian/GuardianConsentFrame'
import { GuardianConsentHero } from '@/components/guardian/GuardianConsentHero'

type Props = {
  studentName: string
  studentAgeLabel?: string
}

export function GuardianConsentClient({ studentName, studentAgeLabel }: Props) {
  return (
    <GuardianConsentFrame>
      <GuardianConsentHero studentName={studentName} studentAgeLabel={studentAgeLabel} />
      <GuardianConsentCard studentName={studentName} />
    </GuardianConsentFrame>
  )
}

