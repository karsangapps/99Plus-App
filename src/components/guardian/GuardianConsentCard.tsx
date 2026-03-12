'use client'

import { useEffect, useMemo, useState } from 'react'
import { OtpInput } from '@/components/guardian/OtpInput'
import { GuardianConsentLegalFooter } from '@/components/guardian/GuardianConsentLegalFooter'

type Channel = 'sms' | 'email'

type Props = {
  studentName: string
}

function maskContact(channel: Channel, contact: string) {
  const c = contact.trim()
  if (!c) return channel === 'sms' ? '+91 98XXX XXXXX' : 'parent@example.com'
  if (channel === 'email') {
    const [u, d] = c.split('@')
    if (!u || !d) return c
    const safeU = u.length <= 2 ? `${u[0] || ''}*` : `${u.slice(0, 2)}***`
    return `${safeU}@${d}`
  }
  const digits = c.replace(/\D/g, '')
  if (digits.length < 6) return c
  return `+${digits.slice(0, 2)} ${digits.slice(2, 4)}XXX XXXXX`
}

export function GuardianConsentCard({ studentName }: Props) {
  const [channel, setChannel] = useState<Channel>('sms')
  const [guardianName, setGuardianName] = useState('')
  const [relationship, setRelationship] = useState('')
  const [contact, setContact] = useState('')

  const [confirmLegalGuardian, setConfirmLegalGuardian] = useState(false)
  const [confirmAlerts, setConfirmAlerts] = useState(false)

  const [otpSent, setOtpSent] = useState(false)
  const [otp, setOtp] = useState('')
  const [isWorking, setIsWorking] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const canRequestOtp = useMemo(() => {
    if (!guardianName.trim()) return false
    if (!contact.trim()) return false
    if (!confirmLegalGuardian) return false
    return true
  }, [confirmLegalGuardian, contact, guardianName])

  const canVerifyOtp = useMemo(() => {
    return otpSent && otp.trim().length === 6
  }, [otp, otpSent])

  useEffect(() => {
    setError(null)
    setOtpSent(false)
    setOtp('')
  }, [channel])

  async function requestOtp() {
    if (!canRequestOtp || isWorking) return
    setError(null)
    setIsWorking(true)
    try {
      const res = await fetch('/api/guardian/request', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          guardianName,
          relationship: relationship || null,
          channel,
          contact,
          communicationAlertsOptIn: confirmAlerts,
          confirmGuardian: confirmLegalGuardian
        })
      })
      const json = (await res.json()) as { ok?: boolean; error?: string }
      if (!res.ok || !json.ok) throw new Error(json.error || 'Failed to send OTP')
      setOtpSent(true)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to send OTP')
    } finally {
      setIsWorking(false)
    }
  }

  async function verifyOtp() {
    if (!canVerifyOtp || isWorking) return
    setError(null)
    setIsWorking(true)
    try {
      const res = await fetch('/api/guardian/verify', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ otp })
      })
      const json = (await res.json()) as { ok?: boolean; error?: string; next?: string }
      if (!res.ok || !json.ok) throw new Error(json.error || 'OTP verification failed')
      window.location.href = json.next || '/onboarding'
    } catch (e) {
      setError(e instanceof Error ? e.message : 'OTP verification failed')
    } finally {
      setIsWorking(false)
    }
  }

  return (
    <>
      <div className="bg-white border border-[#E5E7EB] rounded-xl shadow-[0_4px_24px_rgba(0,0,0,0.04)] overflow-hidden">
        <div className="px-7 py-5 border-b border-[#E5E7EB] bg-[#F8FAFC]">
          <span className="text-[13px] font-bold text-[#0F172A] tracking-tight">
            Affirmative Consent Declaration
          </span>
          <p className="text-[11px] text-[#9CA3AF] mt-1">
            Both checkboxes are mandatory to proceed
          </p>
        </div>

        <div className="px-7 py-7">
          <button
            type="button"
            onClick={() => setConfirmLegalGuardian((v) => !v)}
            className={[
              'w-full text-left flex items-start gap-3.5 p-4 rounded-[10px] border transition-colors',
              confirmLegalGuardian
                ? 'border-[#6366F1] bg-[#6366F1]/[0.03]'
                : 'border-[#E5E7EB] bg-white hover:border-[#818CF8]'
            ].join(' ')}
          >
            <span
              className={[
                'mt-0.5 w-[22px] h-[22px] rounded-md border-2 flex items-center justify-center transition-colors',
                confirmLegalGuardian ? 'bg-[#6366F1] border-[#6366F1]' : 'bg-white border-[#E5E7EB]'
              ].join(' ')}
              aria-hidden="true"
            >
              <span className={confirmLegalGuardian ? 'text-white text-[11px] font-bold' : 'opacity-0'}>✓</span>
            </span>
            <span className="text-[13.5px] text-[#0F172A] leading-relaxed font-medium">
              I confirm I am the <strong>legal guardian</strong> of{' '}
              <strong className="text-[#6366F1]">{studentName}</strong> and consent to the processing of their academic
              performance data as per the <strong>DPDP Act 2023</strong>.
            </span>
          </button>

          <button
            type="button"
            onClick={() => setConfirmAlerts((v) => !v)}
            className={[
              'w-full text-left flex items-start gap-3.5 p-4 rounded-[10px] border transition-colors mt-3.5',
              confirmAlerts
                ? 'border-[#6366F1] bg-[#6366F1]/[0.03]'
                : 'border-[#E5E7EB] bg-white hover:border-[#818CF8]'
            ].join(' ')}
          >
            <span
              className={[
                'mt-0.5 w-[22px] h-[22px] rounded-md border-2 flex items-center justify-center transition-colors',
                confirmAlerts ? 'bg-[#6366F1] border-[#6366F1]' : 'bg-white border-[#E5E7EB]'
              ].join(' ')}
              aria-hidden="true"
            >
              <span className={confirmAlerts ? 'text-white text-[11px] font-bold' : 'opacity-0'}>✓</span>
            </span>
            <span className="text-[13.5px] text-[#0F172A] leading-relaxed font-medium">
              I authorize <strong>99Plus</strong> to send exam-critical alerts and admission notifications to my verified
              contact.
            </span>
          </button>

          <div className="h-px bg-[#E5E7EB] my-6" />

          <div className="mb-5">
            <p className="text-[11px] font-bold tracking-[0.08em] text-[#9CA3AF] uppercase mb-2.5">
              Verification Method
            </p>
            <div className="grid grid-cols-2 bg-[#F8FAFC] border border-[#E5E7EB] rounded-[10px] p-1">
              <button
                type="button"
                onClick={() => setChannel('sms')}
                className={[
                  'h-10 rounded-lg text-[12px] font-semibold flex items-center justify-center transition-all',
                  channel === 'sms'
                    ? 'bg-white text-[#0F172A] shadow-[0_1px_4px_rgba(0,0,0,0.08)]'
                    : 'bg-transparent text-[#9CA3AF]'
                ].join(' ')}
              >
                Verify via SMS OTP
              </button>
              <button
                type="button"
                onClick={() => setChannel('email')}
                className={[
                  'h-10 rounded-lg text-[12px] font-semibold flex items-center justify-center transition-all',
                  channel === 'email'
                    ? 'bg-white text-[#0F172A] shadow-[0_1px_4px_rgba(0,0,0,0.08)]'
                    : 'bg-transparent text-[#9CA3AF]'
                ].join(' ')}
              >
                Verify via Email
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
            <div>
              <label className="block text-[11px] font-semibold text-[#9CA3AF] mb-2">Guardian full name</label>
              <input
                value={guardianName}
                onChange={(e) => setGuardianName(e.target.value)}
                className="w-full h-11 rounded-xl border border-[#E5E7EB] px-4 text-[14px] outline-none focus:border-[#6366F1] focus:ring-4 focus:ring-[#6366F1]/10"
                placeholder="e.g. Rajesh Sharma"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-[#9CA3AF] mb-2">Relationship (optional)</label>
              <input
                value={relationship}
                onChange={(e) => setRelationship(e.target.value)}
                className="w-full h-11 rounded-xl border border-[#E5E7EB] px-4 text-[14px] outline-none focus:border-[#6366F1] focus:ring-4 focus:ring-[#6366F1]/10"
                placeholder="Father / Mother / Guardian"
              />
            </div>
          </div>

          <div className="mb-5">
            <label className="block text-[11px] font-semibold text-[#9CA3AF] mb-2">
              {channel === 'sms' ? "Guardian mobile number" : "Guardian email address"}
            </label>
            <input
              value={contact}
              onChange={(e) => setContact(e.target.value)}
              className="w-full h-11 rounded-xl border border-[#E5E7EB] px-4 text-[14px] outline-none focus:border-[#6366F1] focus:ring-4 focus:ring-[#6366F1]/10"
              placeholder={channel === 'sms' ? '+91 98XXXX XXXXX' : 'parent@example.com'}
              type={channel === 'sms' ? 'tel' : 'email'}
            />
          </div>

          {error ? <p className="text-xs text-[#EF4444] mb-4">{error}</p> : null}

          {!otpSent ? (
            <button
              type="button"
              disabled={!canRequestOtp || isWorking}
              onClick={requestOtp}
              className="w-full h-12 rounded-xl text-white text-[15px] font-bold flex items-center justify-center bg-gradient-to-br from-[#6366F1] to-[#818CF8] disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_4px_16px_rgba(99,102,241,0.25)]"
            >
              {isWorking ? 'Sending…' : channel === 'sms' ? 'Send SMS OTP' : 'Send Email OTP'}
            </button>
          ) : (
            <div>
              <p className="text-[12px] text-[#9CA3AF] mb-4 text-center">
                Enter the 6-digit OTP sent to{' '}
                <strong className="text-[#0F172A]">{maskContact(channel, contact)}</strong>
              </p>
              <OtpInput value={otp} onChange={setOtp} disabled={isWorking} length={6} />
              <div className="flex items-center justify-center gap-2 mt-4 mb-6 text-[11px] text-[#9CA3AF]">
                <span>OTP expires in</span>
                <strong className="text-[#0F172A] font-mono">10:00</strong>
                <button
                  type="button"
                  onClick={requestOtp}
                  disabled={isWorking}
                  className="ml-3 text-[#6366F1] font-semibold disabled:opacity-50"
                >
                  Resend OTP
                </button>
              </div>
              <button
                type="button"
                disabled={!canVerifyOtp || isWorking || !confirmLegalGuardian || !confirmAlerts}
                onClick={verifyOtp}
                className="w-full h-12 rounded-xl text-white text-[15px] font-bold flex items-center justify-center bg-gradient-to-br from-[#059669] to-[#10B981] disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_4px_16px_rgba(5,150,105,0.25)]"
              >
                {isWorking ? 'Verifying…' : 'Verify & Secure Seat'}
              </button>
            </div>
          )}
        </div>
      </div>
      <GuardianConsentLegalFooter />
    </>
  )
}

