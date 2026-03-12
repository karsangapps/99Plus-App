'use client'

import { useEffect, useMemo, useState } from 'react'

type Channel = 'sms' | 'email'

export default function GuardianConsentPage() {
  const [channel, setChannel] = useState<Channel>('sms')
  const [guardianName, setGuardianName] = useState('')
  const [relationship, setRelationship] = useState('')
  const [contact, setContact] = useState('')
  const [alertsOptIn, setAlertsOptIn] = useState(true)
  const [confirmGuardian, setConfirmGuardian] = useState(false)

  const [otpSent, setOtpSent] = useState(false)
  const [otp, setOtp] = useState('')
  const [isWorking, setIsWorking] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const canRequest = useMemo(() => {
    if (!guardianName.trim()) return false
    if (!contact.trim()) return false
    if (!confirmGuardian) return false
    return true
  }, [confirmGuardian, contact, guardianName])

  const canVerify = useMemo(() => {
    return otpSent && otp.trim().length >= 4 && !success
  }, [otp, otpSent, success])

  useEffect(() => {
    setError(null)
    setOtpSent(false)
    setOtp('')
    setSuccess(false)
  }, [channel])

  async function requestOtp() {
    if (!canRequest || isWorking) return
    setError(null)
    setIsWorking(true)
    setSuccess(false)

    try {
      const res = await fetch('/api/guardian/request', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          guardianName,
          relationship: relationship || null,
          channel,
          contact,
          communicationAlertsOptIn: alertsOptIn,
          confirmGuardian
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
    if (!canVerify || isWorking) return
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

      setSuccess(true)
      window.location.href = json.next || '/onboarding'
    } catch (e) {
      setError(e instanceof Error ? e.message : 'OTP verification failed')
    } finally {
      setIsWorking(false)
    }
  }

  return (
    <main className="min-h-dvh flex items-center justify-center p-6 bg-[#F8FAFC]">
      <div className="w-full max-w-lg bg-white border border-[#E5E7EB] rounded-2xl p-6 sm:p-8">
        <h1 className="text-xl font-extrabold text-[#0F172A] tracking-tight">
          Guardian consent required
        </h1>
        <p className="text-sm text-[#64748B] mt-2">
          This student is under 18. To unlock the Command Center, a parent/guardian must verify via OTP.
        </p>

        <div className="mt-6 space-y-4">
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setChannel('sms')}
              className={[
                'h-11 rounded-xl border text-sm font-semibold transition-all',
                channel === 'sms'
                  ? 'border-[#6366F1] bg-[#EEF2FF] text-[#0F172A]'
                  : 'border-[#E5E7EB] bg-white text-[#64748B]'
              ].join(' ')}
            >
              SMS OTP
            </button>
            <button
              type="button"
              onClick={() => setChannel('email')}
              className={[
                'h-11 rounded-xl border text-sm font-semibold transition-all',
                channel === 'email'
                  ? 'border-[#6366F1] bg-[#EEF2FF] text-[#0F172A]'
                  : 'border-[#E5E7EB] bg-white text-[#64748B]'
              ].join(' ')}
            >
              Email OTP
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold mb-2 text-[#0F172A]">
                Guardian full name
              </label>
              <input
                className="w-full h-11 rounded-xl border border-[#E5E7EB] px-4 text-sm outline-none focus:border-[#6366F1]"
                value={guardianName}
                onChange={(e) => setGuardianName(e.target.value)}
                placeholder="e.g. Rajesh Sharma"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-2 text-[#0F172A]">
                Relationship (optional)
              </label>
              <input
                className="w-full h-11 rounded-xl border border-[#E5E7EB] px-4 text-sm outline-none focus:border-[#6366F1]"
                value={relationship}
                onChange={(e) => setRelationship(e.target.value)}
                placeholder="Father / Mother / Guardian"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold mb-2 text-[#0F172A]">
              {channel === 'sms' ? "Guardian mobile number" : "Guardian email address"}
            </label>
            <input
              className="w-full h-11 rounded-xl border border-[#E5E7EB] px-4 text-sm outline-none focus:border-[#6366F1]"
              value={contact}
              onChange={(e) => setContact(e.target.value)}
              placeholder={channel === 'sms' ? '+91 98xxxxxxx' : 'guardian@example.com'}
              type={channel === 'sms' ? 'tel' : 'email'}
            />
          </div>

          <label className="flex items-start gap-2 text-sm text-[#0F172A]">
            <input
              type="checkbox"
              className="mt-0.5"
              checked={confirmGuardian}
              onChange={(e) => setConfirmGuardian(e.target.checked)}
            />
            <span>
              I confirm I am the legal parent/guardian and consent to processing the student&apos;s data for CUET prep.
            </span>
          </label>

          <label className="flex items-start gap-2 text-sm text-[#0F172A]">
            <input
              type="checkbox"
              className="mt-0.5"
              checked={alertsOptIn}
              onChange={(e) => setAlertsOptIn(e.target.checked)}
            />
            <span>Opt in to exam-critical alerts (recommended).</span>
          </label>

          {error ? <p className="text-xs text-red-600">{error}</p> : null}

          {!otpSent ? (
            <button
              type="button"
              disabled={!canRequest || isWorking}
              onClick={requestOtp}
              className={[
                'w-full h-12 rounded-xl text-white text-sm font-bold transition-all',
                !canRequest || isWorking
                  ? 'bg-[#6366F1]/50 cursor-not-allowed'
                  : 'bg-[#6366F1] hover:bg-[#4F46E5] active:bg-[#4338CA]'
              ].join(' ')}
            >
              {isWorking ? 'Sending…' : 'Send OTP'}
            </button>
          ) : (
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold mb-2 text-[#0F172A]">
                  Enter OTP
                </label>
                <input
                  className="w-full h-11 rounded-xl border border-[#E5E7EB] px-4 text-sm outline-none focus:border-[#6366F1]"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  placeholder="123456"
                  inputMode="numeric"
                />
                <p className="text-xs text-[#64748B] mt-1.5">
                  OTP expires in 10 minutes.
                </p>
              </div>

              <button
                type="button"
                disabled={!canVerify || isWorking || success}
                onClick={verifyOtp}
                className={[
                  'w-full h-12 rounded-xl text-white text-sm font-bold transition-all',
                  !canVerify || isWorking || success
                    ? 'bg-[#059669]/50 cursor-not-allowed'
                    : 'bg-[#059669] hover:bg-[#047857] active:bg-[#065F46]'
                ].join(' ')}
              >
                {isWorking ? 'Verifying…' : 'Verify OTP'}
              </button>
            </div>
          )}
        </div>
      </div>
    </main>
  )
}

