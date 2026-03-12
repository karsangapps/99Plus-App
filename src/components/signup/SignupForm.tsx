'use client'

import Link from 'next/link'
import { useMemo, useState } from 'react'
import {
  GuardianConsentSection,
  type ConsentMethod
} from '@/components/signup/GuardianConsentSection'
import { TargetUniversitiesSelector } from '@/components/signup/TargetUniversitiesSelector'
import { SignupHeader } from '@/components/signup/SignupHeader'
import { SignupOAuthBlock } from '@/components/signup/SignupOAuthBlock'
import { computeAge } from '@/components/signup/signupUtils'

type Language = 'en' | 'hi'

export function SignupForm() {
  const [lang, setLang] = useState<Language>('en')
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [dob, setDob] = useState('')
  const [password, setPassword] = useState('')
  const [examYear, setExamYear] = useState(2026)
  const [class12Stream, setClass12Stream] = useState('Science')
  const [boardName, setBoardName] = useState('CBSE')
  const [targetUniversities, setTargetUniversities] = useState<string[]>([])
  const [termsAccepted, setTermsAccepted] = useState(false)
  const [consentMethod, setConsentMethod] = useState<ConsentMethod>('sms')
  const [guardianPhone, setGuardianPhone] = useState('')
  const [guardianEmail, setGuardianEmail] = useState('')

  function handleConsentMethodChange(method: ConsentMethod) {
    setConsentMethod(method)
    if (method === 'sms') setGuardianEmail('')
    if (method === 'email') setGuardianPhone('')
  }
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [submitAttempted, setSubmitAttempted] = useState(false)

  const age = useMemo(() => computeAge(dob), [dob])
  const isMinor = typeof age === 'number' && age < 18

  const fullNameError = !fullName.trim() ? 'Full name is required.' : ''
  const emailError = !email.trim() ? 'Email is required.' : ''
  const dobError = !dob.trim() ? 'Date of birth is required.' : ''
  const passwordError =
    !password || password.length < 8 ? 'Password must be at least 8 characters.' : ''
  const guardianPhoneError =
    isMinor && consentMethod === 'sms' && !guardianPhone.trim()
      ? "Parent's mobile number is required."
      : ''
  const guardianEmailError =
    isMinor && consentMethod === 'email' && !guardianEmail.trim()
      ? "Parent's email address is required."
      : ''
  const targetsError = !targetUniversities.length ? 'Pick at least one target university.' : ''
  const termsError = !termsAccepted ? 'You must accept the Terms and Privacy Policy.' : ''

  const canSubmit =
    !fullNameError &&
    !emailError &&
    !dobError &&
    !passwordError &&
    !targetsError &&
    !termsError &&
    (!isMinor || (!guardianPhoneError && !guardianEmailError))

  async function onSubmit() {
    console.log('[Signup] Form submitted')
    const validationSummary = {
      fullNameError,
      emailError,
      dobError,
      passwordError,
      guardianPhoneError,
      guardianEmailError,
      targetsError,
      termsError,
      isMinor
    }
    console.log('[Signup] Validation results:', validationSummary)

    setSubmitAttempted(true)
    if (!canSubmit || isSubmitting) {
      console.log('[Signup] Submission blocked', {
        canSubmit,
        isSubmitting
      })
      return
    }
    setError(null)
    setIsSubmitting(true)
    try {
      console.log('[Signup] Attempting to fetch /api/auth/signup')
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          fullName,
          email,
          phone,
          dob,
          password,
          preferredLanguage: lang,
          examYear,
          class12Stream,
          boardName,
          targetUniversities,
          termsAccepted,
          guardian: isMinor
            ? {
                method: consentMethod,
                phone: consentMethod === 'sms' ? guardianPhone : null,
                email: consentMethod === 'email' ? guardianEmail : null
              }
            : null
        })
      })
      const json = (await res.json()) as { ok?: boolean; error?: string; next?: string }
      console.log('[Signup] API response', { status: res.status, ok: json.ok, error: json.error, next: json.next })
      if (!res.ok || !json.ok) throw new Error(json.error || 'Signup failed')
      console.log('[Signup] Redirecting to', json.next || '/onboarding')
      window.location.href = json.next || '/onboarding'
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Signup failed')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      <SignupHeader lang={lang} onLangChange={setLang} />
      <SignupOAuthBlock onError={setError} />

      <div className="space-y-4">
        <div>
          <label className="block text-xs font-semibold mb-2 text-[#0F172A]">Full Name</label>
          <input
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="w-full h-11 rounded-xl border border-[#E5E7EB] px-4 text-sm outline-none focus:border-[#6366F1]"
            placeholder="e.g. Priya Sharma"
            autoComplete="name"
          />
          {submitAttempted && fullNameError ? <p className="mt-1 text-xs text-red-600">{fullNameError}</p> : null}
        </div>

        <div>
          <label className="block text-xs font-semibold mb-2 text-[#0F172A]">Email Address</label>
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full h-11 rounded-xl border border-[#E5E7EB] px-4 text-sm outline-none focus:border-[#6366F1]"
            placeholder="priya@example.com"
            autoComplete="email"
            type="email"
          />
          {submitAttempted && emailError ? <p className="mt-1 text-xs text-red-600">{emailError}</p> : null}
        </div>

        <div>
          <label className="block text-xs font-semibold mb-2 text-[#0F172A]">Phone Number</label>
          <input
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="w-full h-11 rounded-xl border border-[#E5E7EB] px-4 text-sm outline-none focus:border-[#6366F1]"
            placeholder="+91 98765 43210"
            autoComplete="tel"
            type="tel"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold mb-2 text-[#0F172A]">
            Date of Birth <span className="text-red-500">*</span>
          </label>
          <input
            value={dob}
            onChange={(e) => setDob(e.target.value)}
            className="w-full h-11 rounded-xl border border-[#E5E7EB] px-4 text-sm outline-none focus:border-[#6366F1]"
            type="date"
            max={new Date().toISOString().split('T')[0]}
            required
          />
          {typeof age === 'number' ? (
            <p className="text-xs mt-1.5 text-[#9CA3AF]">
              Age detected: <span className="font-semibold">{age}</span>{' '}
              {age < 18 ? '(Minor — guardian verification required)' : ''}
            </p>
          ) : null}
          {submitAttempted && dobError ? <p className="mt-1 text-xs text-red-600">{dobError}</p> : null}
        </div>

        <div>
          <label className="block text-xs font-semibold mb-2 text-[#0F172A]">Password</label>
          <input
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full h-11 rounded-xl border border-[#E5E7EB] px-4 text-sm outline-none focus:border-[#6366F1]"
            placeholder="Create a password"
            autoComplete="new-password"
            type="password"
          />
          {submitAttempted && passwordError ? (
            <p className="mt-1 text-xs text-red-600">{passwordError}</p>
          ) : (
            <p className="mt-1 text-xs text-[#9CA3AF]">
              Must be at least 8 characters
              {password.length > 0 && password.length < 8 ? (
                <span className="ml-1 font-semibold text-amber-500">
                  ({password.length}/8)
                </span>
              ) : null}
            </p>
          )}
        </div>

        <GuardianConsentSection
          isMinor={isMinor}
          consentMethod={consentMethod}
          onConsentMethodChange={handleConsentMethodChange}
          guardianPhone={guardianPhone}
          guardianEmail={guardianEmail}
          onGuardianPhoneChange={setGuardianPhone}
          onGuardianEmailChange={setGuardianEmail}
          submitAttempted={submitAttempted}
          guardianPhoneError={guardianPhoneError}
          guardianEmailError={guardianEmailError}
        />

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold mb-2 text-[#0F172A]">CUET Exam Year</label>
            <select
              value={examYear}
              onChange={(e) => setExamYear(Number(e.target.value))}
              className="w-full h-11 rounded-xl border border-[#E5E7EB] px-4 text-sm outline-none focus:border-[#6366F1] bg-white"
            >
              <option value={2026}>2026</option>
              <option value={2027}>2027</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold mb-2 text-[#0F172A]">Class 12 Stream</label>
            <select
              value={class12Stream}
              onChange={(e) => setClass12Stream(e.target.value)}
              className="w-full h-11 rounded-xl border border-[#E5E7EB] px-4 text-sm outline-none focus:border-[#6366F1] bg-white"
            >
              <option>Science</option>
              <option>Commerce</option>
              <option>Humanities</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold mb-2 text-[#0F172A]">Board Name</label>
          <input
            value={boardName}
            onChange={(e) => setBoardName(e.target.value)}
            className="w-full h-11 rounded-xl border border-[#E5E7EB] px-4 text-sm outline-none focus:border-[#6366F1]"
            placeholder="CBSE / ISC / State board..."
          />
        </div>

        <TargetUniversitiesSelector
          selected={targetUniversities}
          onChange={setTargetUniversities}
          submitAttempted={submitAttempted}
          error={targetsError}
        />

        <label className="flex items-start gap-2 text-xs text-[#0F172A]">
          <input
            type="checkbox"
            className="mt-0.5"
            checked={termsAccepted}
            onChange={(e) => setTermsAccepted(e.target.checked)}
          />
          <span className="text-[#64748B]">
            I agree to the <span className="text-[#6366F1] font-semibold underline">Terms of Service</span> and{' '}
            <span className="text-[#6366F1] font-semibold underline">Privacy Policy</span>.
          </span>
        </label>
        {submitAttempted && termsError ? <p className="text-xs text-red-600">{termsError}</p> : null}
        {error ? <p className="text-xs text-red-600">{error}</p> : null}

        <form
          onSubmit={(e) => {
            e.preventDefault()
            void onSubmit()
          }}
        >
          <button
            type="submit"
            disabled={isSubmitting}
            className={[
              'w-full h-12 rounded-xl text-white text-sm font-bold transition-all',
              !canSubmit || isSubmitting
                ? 'bg-[#6366F1]/50 cursor-not-allowed'
                : 'bg-[#6366F1] hover:bg-[#4F46E5] active:bg-[#4338CA]'
            ].join(' ')}
          >
            {isSubmitting ? 'Creating…' : 'Create account'}
          </button>
        </form>

        <p className="text-xs text-[#9CA3AF] text-center">
          Already have an account?{' '}
          <Link className="text-[#6366F1] font-semibold underline" href="/login">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}

