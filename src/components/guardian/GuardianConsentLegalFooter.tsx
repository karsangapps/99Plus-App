'use client'

export function GuardianConsentLegalFooter() {
  return (
    <>
      <div className="mt-8 p-6 bg-[#F8FAFC] border border-[#E5E7EB] rounded-xl">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-lg bg-[#6366F1]/10 flex items-center justify-center shrink-0 mt-0.5">
            <span className="text-[#6366F1] text-[13px] font-bold">§</span>
          </div>
          <div>
            <p className="text-[10px] font-bold tracking-[0.08em] text-[#9CA3AF] uppercase mb-1">
              Legal Compliance Notice
            </p>
            <p className="text-[12px] text-[#9CA3AF] leading-relaxed">
              This action generates a <strong className="text-[#0F172A]">tamper-proof Consent Artefact</strong>{' '}
              (timestamped &amp; IP logged) for compliance under the{' '}
              <strong className="text-[#0F172A]">Digital Personal Data Protection Act, 2023</strong>.
            </p>
            <div className="flex items-center gap-4 mt-3 pt-3 border-t border-[#E5E7EB]">
              <span className="text-[10px] text-[#9CA3AF] font-mono">IP Logged</span>
              <span className="text-[10px] text-[#9CA3AF] font-mono">Timestamped</span>
              <span className="text-[10px] text-[#9CA3AF] font-mono">AES-256 Encrypted</span>
            </div>
          </div>
        </div>
      </div>

      <div className="text-center mt-5">
        <p className="text-[11px] text-[#9CA3AF]">
          For erasure requests or complaints, contact our Grievance Officer at{' '}
          <strong className="text-[#0F172A]">privacy@99plus.in</strong>
        </p>
      </div>
    </>
  )
}

