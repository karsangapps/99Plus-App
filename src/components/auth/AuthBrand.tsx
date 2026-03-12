'use client'

type Props = {
  subtitle?: string
}

export function AuthBrand({ subtitle }: Props) {
  return (
    <div className="flex items-center gap-3">
      <div className="w-10 h-10 rounded-[10px] bg-[#6366F1] flex items-center justify-center">
        <span className="text-white font-extrabold">99</span>
        <span className="text-[#FACC15] font-extrabold -ml-0.5">+</span>
      </div>
      <div>
        <span className="font-bold text-xl tracking-tight text-[#0F172A]">
          99Plus
        </span>
        {subtitle ? (
          <p className="text-[11px] font-medium text-[#9CA3AF] mt-0.5">
            {subtitle}
          </p>
        ) : null}
      </div>
    </div>
  )
}

