'use client'

import Link from 'next/link'
import { useState } from 'react'
import { AuthTwoColumnLayout } from '@/components/auth/AuthTwoColumnLayout'
import { AuthBrand } from '@/components/auth/AuthBrand'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [isWorking, setIsWorking] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [sent, setSent] = useState(false)

  async function onSubmit() {
    if (isWorking) return
    setError(null)
    setIsWorking(true)
    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ email })
      })
      const json = (await res.json()) as { ok?: boolean; error?: string }
      if (!res.ok || !json.ok) throw new Error(json.error || 'Request failed')
      setSent(true)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Request failed')
    } finally {
      setIsWorking(false)
    }
  }

  return (
    <AuthTwoColumnLayout
      left={
        <div>
          <AuthBrand subtitle="Secure account recovery" />
          <div className="mt-7">
            <h2 className="text-xl font-extrabold text-[#0F172A] mb-2">
              Reset your password
            </h2>
            <p className="text-sm text-[#64748B]">
              We’ll email you a secure link to set a new password.
            </p>
          </div>
        </div>
      }
      right={
        <div className="space-y-6">
          <div className="flex items-center justify-center md:hidden">
            <AuthBrand subtitle="Password reset" />
          </div>

          <div>
            <h1 className="text-2xl font-extrabold tracking-tight text-center text-[#0F172A]">
              Forgot password
            </h1>
            <p className="mt-2 text-sm text-center text-[#9CA3AF]">
              Enter the email you used to sign up.
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold mb-2 text-[#0F172A]">
                Email Address
              </label>
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full h-11 rounded-xl border border-[#E5E7EB] px-4 text-sm outline-none focus:border-[#6366F1]"
                placeholder="you@example.com"
                autoComplete="email"
                type="email"
                disabled={sent}
              />
            </div>

            {sent ? (
              <div className="rounded-xl border border-[#059669]/20 bg-[#059669]/5 px-4 py-3">
                <p className="text-sm text-[#0F172A] font-semibold">
                  Check your inbox.
                </p>
                <p className="text-xs text-[#64748B] mt-1">
                  If an account exists for <strong>{email.trim()}</strong>, we sent a reset link.
                </p>
              </div>
            ) : null}

            {error ? <p className="text-xs text-red-600">{error}</p> : null}

            <button
              type="button"
              disabled={isWorking || sent || !email.trim()}
              onClick={onSubmit}
              className={[
                'w-full h-12 rounded-xl text-white text-sm font-bold transition-all',
                isWorking || sent || !email.trim()
                  ? 'bg-[#6366F1]/50 cursor-not-allowed'
                  : 'bg-[#6366F1] hover:bg-[#4F46E5] active:bg-[#4338CA]'
              ].join(' ')}
            >
              {isWorking ? 'Sending…' : 'Send reset link'}
            </button>

            <p className="text-xs text-[#9CA3AF] text-center">
              Remembered your password?{' '}
              <Link className="text-[#6366F1] font-semibold underline" href="/login">
                Back to sign in
              </Link>
            </p>
          </div>
        </div>
      }
    />
  )
}

