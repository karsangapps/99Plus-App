'use client'

import { AuthBrand } from '@/components/auth/AuthBrand'

export function SignupLeftPanel() {
  return (
    <div>
      <AuthBrand subtitle="One account for your entire CUET journey" />
      <div className="mt-7">
        <h2 className="text-xl font-extrabold text-[#0F172A] mb-2">
          One account for your entire CUET journey
        </h2>
        <p className="text-sm text-[#64748B]">
          Lock eligibility, simulate the NTA interface, and track every mark leak
          — all from a single, DPDP-compliant Command Center.
        </p>
      </div>
    </div>
  )
}

