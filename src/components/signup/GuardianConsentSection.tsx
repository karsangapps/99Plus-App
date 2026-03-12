type ConsentMethod = 'sms' | 'email'

export type GuardianConsentProps = {
  isMinor: boolean
  consentMethod: ConsentMethod
  onConsentMethodChange: (method: ConsentMethod) => void
  guardianPhone: string
  guardianEmail: string
  onGuardianPhoneChange: (value: string) => void
  onGuardianEmailChange: (value: string) => void
  submitAttempted: boolean
  guardianPhoneError?: string
  guardianEmailError?: string
}

export type { ConsentMethod }

export function GuardianConsentSection(props: GuardianConsentProps) {
  const {
    isMinor,
    consentMethod,
    onConsentMethodChange,
    guardianPhone,
    guardianEmail,
    onGuardianPhoneChange,
    onGuardianEmailChange,
    submitAttempted,
    guardianPhoneError,
    guardianEmailError
  } = props

  if (!isMinor) return null

  return (
    <div className="rounded-2xl border border-[#E5E7EB] bg-[#F8FAFC] p-4">
      <div className="flex items-center gap-2 text-sm font-semibold text-[#0F172A]">
        <span className="text-[#6366F1]">🛡</span>
        <span>Parental Consent Method</span>
      </div>
      <p className="text-xs text-[#64748B] mt-1.5">
        Since you are under 18, a parent or guardian must verify your account as per
        DPDP Act 2023.
      </p>

      <div className="grid grid-cols-2 gap-2 mt-3">
        <button
          type="button"
          onClick={() => onConsentMethodChange('sms')}
          className={[
            'h-11 rounded-xl border text-sm font-semibold transition-all',
            consentMethod === 'sms'
              ? 'border-[#6366F1] bg-white text-[#0F172A]'
              : 'border-[#E5E7EB] bg-transparent text-[#64748B]'
          ].join(' ')}
        >
          Parent&apos;s SMS OTP
        </button>
        <button
          type="button"
          onClick={() => onConsentMethodChange('email')}
          className={[
            'h-11 rounded-xl border text-sm font-semibold transition-all',
            consentMethod === 'email'
              ? 'border-[#6366F1] bg-white text-[#0F172A]'
              : 'border-[#E5E7EB] bg-transparent text-[#64748B]'
          ].join(' ')}
        >
          Parent&apos;s Email
        </button>
      </div>

      {consentMethod === 'sms' ? (
        <div className="mt-3">
          <label className="block text-xs font-semibold mb-2 text-[#0F172A]">
            Parent&apos;s Mobile Number <span className="text-red-500">*</span>
          </label>
          <input
            value={guardianPhone}
            onChange={(e) => onGuardianPhoneChange(e.target.value)}
            className="w-full h-11 rounded-xl border border-[#E5E7EB] bg-white px-4 text-sm outline-none focus:border-[#6366F1]"
            placeholder="+91 Parent's mobile number"
            type="tel"
          />
          {submitAttempted && guardianPhoneError ? (
            <p className="mt-1 text-xs text-red-600">{guardianPhoneError}</p>
          ) : null}
        </div>
      ) : (
        <div className="mt-3">
          <label className="block text-xs font-semibold mb-2 text-[#0F172A]">
            Parent&apos;s Email Address <span className="text-red-500">*</span>
          </label>
          <input
            value={guardianEmail}
            onChange={(e) => onGuardianEmailChange(e.target.value)}
            className="w-full h-11 rounded-xl border border-[#E5E7EB] bg-white px-4 text-sm outline-none focus:border-[#6366F1]"
            placeholder="parent@example.com"
            type="email"
          />
          {submitAttempted && guardianEmailError ? (
            <p className="mt-1 text-xs text-red-600">{guardianEmailError}</p>
          ) : null}
        </div>
      )}

      <div className="mt-3 rounded-xl border border-[#6366F1]/20 bg-white p-3 text-xs text-[#64748B]">
        <span className="font-semibold text-[#0F172A]">
          99Plus is DPDP 2023 compliant.
        </span>{' '}
        We will send a secure verification step to your guardian after signup.
      </div>
    </div>
  )
}

