'use client'

import Link from 'next/link'
import { useState } from 'react'
import { AuthTwoColumnLayout } from '@/components/auth/AuthTwoColumnLayout'
import { AuthBrand } from '@/components/auth/AuthBrand'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isWorking, setIsWorking] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function onSubmit() {
    if (isWorking) return
    setError(null)
    setIsWorking(true)
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ email, password })
      })
      const json = (await res.json()) as { ok?: boolean; error?: string; next?: string }
      if (!res.ok || !json.ok) throw new Error(json.error || 'Login failed')
      window.location.href = json.next || '/onboarding'
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Login failed')
    } finally {
      setIsWorking(false)
    }
  }

  return (
    <AuthTwoColumnLayout
      left={
        <div>
          <AuthBrand subtitle="Sign in to continue your CUET journey" />
          <div className="mt-7">
            <h2 className="text-xl font-extrabold text-[#0F172A] mb-2">
              Welcome back
            </h2>
            <p className="text-sm text-[#64748B]">
              Your Eligibility Guardian, drills, and Command Center are waiting.
            </p>
          </div>
        </div>
      }
      right={
        <div className="space-y-6">
          <div className="flex items-center justify-center md:hidden">
            <AuthBrand subtitle="Sign in to continue" />
          </div>

          <div>
            <h1 className="text-2xl font-extrabold tracking-tight text-center text-[#0F172A]">
              Sign in
            </h1>
            <p className="mt-2 text-sm text-center text-[#9CA3AF]">
              Use your email and password.
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
              />
            </div>

            <div>
              <label className="block text-xs font-semibold mb-2 text-[#0F172A]">
                Password
              </label>
              <input
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full h-11 rounded-xl border border-[#E5E7EB] px-4 text-sm outline-none focus:border-[#6366F1]"
                placeholder="Your password"
                autoComplete="current-password"
                type="password"
              />
            </div>

            <div className="flex items-center justify-end">
              <Link
                href="/forgot-password"
                className="text-xs font-semibold text-[#6366F1] hover:text-[#4F46E5] underline"
              >
                Forgot password?
              </Link>
            </div>

            {error ? <p className="text-xs text-red-600">{error}</p> : null}

            <button
              type="button"
              disabled={isWorking || !email.trim() || !password}
              onClick={onSubmit}
              className={[
                'w-full h-12 rounded-xl text-white text-sm font-bold transition-all',
                isWorking || !email.trim() || !password
                  ? 'bg-[#6366F1]/50 cursor-not-allowed'
                  : 'bg-[#6366F1] hover:bg-[#4F46E5] active:bg-[#4338CA]'
              ].join(' ')}
            >
              {isWorking ? 'Signing in…' : 'Sign in'}
            </button>

            <p className="text-xs text-[#9CA3AF] text-center">
              New here?{' '}
              <Link className="text-[#6366F1] font-semibold underline" href="/signup">
                Create account
              </Link>
            </p>
          </div>
        </div>
      }
    />
  )
}

