'use client'

import { AuthBrand } from '@/components/auth/AuthBrand'

type Language = 'en' | 'hi'

type Props = {
  lang: Language
  onLangChange: (l: Language) => void
}

export function SignupHeader({ lang, onLangChange }: Props) {
  return (
    <>
      <div className="flex items-center justify-center gap-2.5 md:hidden">
        <AuthBrand />
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-[#6366F1]" />
          <span className="w-2.5 h-2.5 rounded-full bg-[#E5E7EB]" />
          <span className="w-2.5 h-2.5 rounded-full bg-[#E5E7EB]" />
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs font-medium text-[#9CA3AF]">Step 1 of 3</span>
          <div className="w-px h-4 bg-[#E5E7EB]" />
          <div className="flex items-center bg-[#F8FAFC] border border-[#E5E7EB] rounded-[7px] p-[3px] gap-1">
            <button
              type="button"
              onClick={() => onLangChange('en')}
              className={[
                'px-3 py-1 rounded-[5px] text-[11px] font-semibold transition-all',
                lang === 'en' ? 'bg-[#6366F1] text-white' : 'bg-transparent text-[#9CA3AF]'
              ].join(' ')}
            >
              English
            </button>
            <button
              type="button"
              onClick={() => onLangChange('hi')}
              className={[
                'px-3 py-1 rounded-[5px] text-[11px] font-semibold transition-all',
                lang === 'hi' ? 'bg-[#6366F1] text-white' : 'bg-transparent text-[#9CA3AF]'
              ].join(' ')}
            >
              हिन्दी
            </button>
          </div>
        </div>
      </div>

      <div>
        <h1 className="text-2xl font-extrabold tracking-tight text-center text-[#0F172A]">
          Create your account
        </h1>
        <p className="mt-2 text-sm text-center text-[#9CA3AF]">
          Begin your surgical prep journey. Takes under 2 minutes.
        </p>
      </div>
    </>
  )
}

