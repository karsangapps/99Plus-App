'use client'

type Props = {
  studentName: string
  studentAgeLabel?: string
}

export function GuardianConsentHero({ studentName, studentAgeLabel }: Props) {
  return (
    <>
      <div className="flex justify-center mb-8">
        <div className="inline-flex items-center gap-2.5 px-6 py-2.5 rounded-full bg-[#6366F1]/5 border border-[#6366F1]/15">
          <span className="text-[11px] font-bold tracking-[0.20em] text-[#6366F1] font-mono">
            DPDP 2023 SECURE VERIFICATION
          </span>
        </div>
      </div>

      <div className="text-center mb-9">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-[#6366F1]/10 to-[#059669]/10 mb-5">
          <div className="w-8 h-8 rounded-xl bg-[#6366F1]/15" />
        </div>
        <h1 className="text-[28px] font-black tracking-tight text-[#0F172A] leading-tight">
          Authorize Surgical Prep for
          <br />
          <span className="text-[#6366F1]">{studentName}</span>
        </h1>
        <p className="text-[14px] text-[#9CA3AF] leading-relaxed max-w-[520px] mx-auto mt-3">
          Your <span className="font-semibold text-[#059669]">1-click approval</span> will secure their data and unlock the
          full North Campus Battle Plan.
        </p>
      </div>

      <div className="bg-[#F8FAFC] border border-[#E5E7EB] rounded-xl px-5 py-4 mb-7 flex items-center gap-4">
        <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#6366F1] to-[#818CF8] text-white flex items-center justify-center font-extrabold">
          {studentName
            .split(' ')
            .slice(0, 2)
            .map((x) => x[0])
            .join('')
            .toUpperCase()}
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-[14px] font-bold text-[#0F172A] truncate">{studentName}</div>
          <div className="text-[11px] text-[#9CA3AF] font-mono">
            {studentAgeLabel || 'CUET 2026 Aspirant · Minor'}
          </div>
        </div>
        <div className="flex items-center gap-2 bg-[#FACC15]/10 rounded-md px-3 py-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-[#FACC15]" />
          <span className="text-[10px] font-semibold text-[#B45309] font-mono">CALIBRATING</span>
        </div>
      </div>
    </>
  )
}

