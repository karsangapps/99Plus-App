'use client'

/**
 * StorePricingCards — 3-column pricing grid (PRD §16.1)
 *
 * Products:
 *   Sachet      ₹25  / 1 credit  → sachet_mock
 *   Pack of 5   ₹100 / 5 credits → sachet_drill_pack
 *   Pro Pass    ₹999 / unlimited → pro_pass_seasonal
 *
 * Flow: user clicks Buy → POST /api/payments/order (creates payment_orders row)
 * → Razorpay webhook (payment.captured) → grants surgical_credits (PRD §16.4)
 */

import { useState } from 'react'

type StorePricingCardsProps = {
  studentId: string
  proPassActive: boolean
}

type ProductId = 'sachet_mock' | 'sachet_drill_pack' | 'pro_pass_seasonal'

const PRODUCT_PRICES: Record<ProductId, number> = {
  sachet_mock: 2500,         // ₹25 in paise
  sachet_drill_pack: 10000,  // ₹100 in paise
  pro_pass_seasonal: 99900,  // ₹999 in paise
}

export function StorePricingCards({ proPassActive }: StorePricingCardsProps) {
  const [loading, setLoading] = useState<ProductId | null>(null)
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null)

  function showToast(msg: string, type: 'success' | 'error' = 'success') {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 4000)
  }

  async function handleBuy(productId: ProductId) {
    setLoading(productId)
    try {
      const res = await fetch('/api/payments/order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          product_type: productId,
          amount_paise: PRODUCT_PRICES[productId],
        }),
      })
      const data = await res.json()
      if (!res.ok || !data.ok) {
        showToast(data.error ?? 'Order creation failed. Please try again.', 'error')
        return
      }
      // Order created successfully — in production this would open Razorpay checkout.
      // The webhook (payment.captured) grants credits once payment is confirmed.
      showToast(
        `Order #${data.orderId.slice(0, 8).toUpperCase()} created! ` +
        `Complete payment via Razorpay to unlock credits.`,
        'success'
      )
    } catch {
      showToast('Network error. Please check your connection.', 'error')
    } finally {
      setLoading(null)
    }
  }

  return (
    <div className="relative max-w-5xl mx-auto">
      {/* Toast */}
      {toast && (
        <div
          className="fixed top-6 right-6 z-50 px-5 py-3 rounded-xl text-sm font-semibold shadow-lg transition-all max-w-xs"
          style={{
            background: toast.type === 'success' ? '#0F172A' : '#EF4444',
            color: '#FFFFFF',
          }}
          role="status"
          aria-live="polite"
        >
          {toast.msg}
        </div>
      )}

      {/* 3-column grid */}
      <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        {/* ── Card 1: Sachet ── */}
        <div
          className="flex flex-col bg-white border-2 overflow-hidden transition-all hover:shadow-lg hover:-translate-y-1"
          style={{ borderColor: '#E5E7EB', borderRadius: '12px', boxShadow: '0 4px 8px rgba(0,0,0,0.06)' }}
        >
          <div className="h-1.5 w-full" style={{ background: '#6366F1' }} />
          <div className="flex flex-col flex-1 p-7">
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center mb-5 flex-shrink-0"
              style={{ background: '#EEF2FF' }}
            >
              <SyringeIcon />
            </div>
            <h3 className="text-lg font-bold mb-1" style={{ color: '#0F172A' }}>
              Surgical X-Ray Sachet
            </h3>
            <p className="text-sm mb-5" style={{ color: '#9CA3AF' }}>
              A single-use precision dose for targeted practice.
            </p>
            <div className="flex items-baseline gap-1 mb-5">
              <span className="text-4xl font-extrabold tracking-tight" style={{ color: '#0F172A' }}>₹25</span>
              <span className="text-sm font-medium" style={{ color: '#9CA3AF' }}>one-time</span>
            </div>
            <ul className="flex-1 space-y-3">
              <FeatureItem color="#059669" bg="#ECFDF5">1 Full Mock Test</FeatureItem>
              <FeatureItem color="#059669" bg="#ECFDF5">3 Surgical Drills</FeatureItem>
              <FeatureItem color="#059669" bg="#ECFDF5">Detailed Score Report</FeatureItem>
            </ul>
            <button
              onClick={() => handleBuy('sachet_mock')}
              disabled={loading === 'sachet_mock' || proPassActive}
              className="w-full mt-7 py-3 rounded-xl text-sm font-bold border-2 transition-all hover:shadow-md active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ borderColor: '#6366F1', color: '#6366F1', background: 'white' }}
            >
              {loading === 'sachet_mock' ? 'Processing…' : proPassActive ? 'Pro Active' : 'Buy 1 Credit'}
            </button>
          </div>
        </div>

        {/* ── Card 2: Pack of 5 ── */}
        <div
          className="flex flex-col bg-white border-2 overflow-hidden transition-all hover:shadow-lg hover:-translate-y-1"
          style={{ borderColor: '#E5E7EB', borderRadius: '12px', boxShadow: '0 4px 8px rgba(0,0,0,0.06)' }}
        >
          <div className="h-1.5 w-full" style={{ background: '#059669' }} />
          <div className="flex flex-col flex-1 p-7">
            <div className="flex items-start justify-between mb-5">
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center"
                style={{ background: '#ECFDF5' }}
              >
                <CubesIcon />
              </div>
              <span
                className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold"
                style={{ background: '#ECFDF5', color: '#059669' }}
              >
                Save ₹25
              </span>
            </div>
            <h3 className="text-lg font-bold mb-1" style={{ color: '#0F172A' }}>
              Pack of 5 Credits
            </h3>
            <p className="text-sm mb-5" style={{ color: '#9CA3AF' }}>
              The smart bulk buy for consistent practice.
            </p>
            <div className="flex items-baseline gap-1 mb-1">
              <span className="text-4xl font-extrabold tracking-tight" style={{ color: '#0F172A' }}>₹100</span>
              <span className="text-sm font-medium" style={{ color: '#9CA3AF' }}>one-time</span>
            </div>
            <p className="text-xs mb-5" style={{ color: '#059669' }}>₹20 per credit instead of ₹25</p>
            <ul className="flex-1 space-y-3">
              <FeatureItem color="#059669" bg="#ECFDF5">5 Full Mock Tests</FeatureItem>
              <FeatureItem color="#059669" bg="#ECFDF5">15 Surgical Drills</FeatureItem>
              <FeatureItem color="#059669" bg="#ECFDF5">Priority Analytics</FeatureItem>
            </ul>
            <button
              onClick={() => handleBuy('sachet_drill_pack')}
              disabled={loading === 'sachet_drill_pack' || proPassActive}
              className="w-full mt-7 py-3 rounded-xl text-sm font-bold border-2 transition-all hover:shadow-md active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ borderColor: '#059669', color: 'white', background: '#059669' }}
            >
              {loading === 'sachet_drill_pack' ? 'Processing…' : proPassActive ? 'Pro Active' : 'Buy 5 Credits'}
            </button>
          </div>
        </div>

        {/* ── Card 3: Pro Pass ── */}
        <div
          className="flex flex-col border-2 overflow-hidden transition-all hover:shadow-xl hover:-translate-y-1 relative"
          style={{
            borderColor: '#FACC15',
            borderRadius: '12px',
            boxShadow: '0 4px 16px rgba(250,204,21,0.2)',
            background: 'linear-gradient(180deg, #FFFBEB 0%, #FFFFFF 40%)',
          }}
        >
          {/* Gold shimmer top bar */}
          <div
            className="h-2 w-full"
            style={{
              background: 'linear-gradient(90deg, #FACC15 0%, #FDE68A 25%, #FACC15 50%, #FDE68A 75%, #FACC15 100%)',
              backgroundSize: '200% auto',
              animation: 'shimmer 3s linear infinite',
            }}
          />

          {/* Floating badge */}
          <div className="absolute left-1/2 -translate-x-1/2 translate-y-3 z-10" style={{ top: 0 }}>
            <span
              className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-extrabold uppercase tracking-wider shadow-lg"
              style={{ background: 'linear-gradient(135deg, #FACC15, #F59E0B)', color: '#78350F' }}
            >
              ★ Most Popular
            </span>
          </div>

          <div className="flex flex-col flex-1 p-7 pt-10">
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center mb-5"
              style={{ background: '#FEF3C7' }}
            >
              <GemIcon />
            </div>
            <h3 className="text-lg font-bold mb-1" style={{ color: '#0F172A' }}>
              Surgical Pro — Unlimited Pass
            </h3>
            <p className="text-sm mb-5" style={{ color: '#9CA3AF' }}>
              Full Access until June 30, 2026.
            </p>
            <div className="flex items-baseline gap-1 mb-1">
              <span className="text-4xl font-extrabold tracking-tight" style={{ color: '#0F172A' }}>₹999</span>
              <span className="text-sm font-medium" style={{ color: '#9CA3AF' }}>until Jun 2026</span>
            </div>
            <p className="text-xs mb-5" style={{ color: '#D97706' }}>
              Less than ₹3/day for unlimited access
            </p>
            <ul className="flex-1 space-y-3">
              <FeatureItem color="#D97706" bg="#FEF3C7">Unlimited Mocks & Drills</FeatureItem>
              <FeatureItem color="#D97706" bg="#FEF3C7">Full Admissions OS Access</FeatureItem>
              <FeatureItem color="#D97706" bg="#FEF3C7">Valid until June 30, 2026</FeatureItem>
            </ul>

            {proPassActive ? (
              <div
                className="w-full mt-7 py-3.5 rounded-xl text-sm font-extrabold text-center"
                style={{ background: '#ECFDF5', color: '#059669' }}
              >
                ✓ Pro Pass Active
              </div>
            ) : (
              <button
                onClick={() => handleBuy('pro_pass_seasonal')}
                disabled={loading === 'pro_pass_seasonal'}
                className="w-full mt-7 py-3.5 rounded-xl text-sm font-extrabold border-2 transition-all hover:shadow-lg active:scale-[0.98] disabled:opacity-50"
                style={{
                  borderColor: '#D97706',
                  color: 'white',
                  background: 'linear-gradient(135deg, #F59E0B, #D97706)',
                }}
              >
                {loading === 'pro_pass_seasonal' ? 'Processing…' : '⚡ Get Unlimited Access'}
              </button>
            )}

            <p className="text-xs text-center mt-4 leading-relaxed" style={{ color: '#9CA3AF' }}>
              Pass expires automatically at the end of the 2026 Admission Cycle.
            </p>
          </div>
        </div>
      </div>

      {/* Inline CSS for gold shimmer animation */}
      <style>{`
        @keyframes shimmer {
          0% { background-position: -200% center; }
          100% { background-position: 200% center; }
        }
      `}</style>
    </div>
  )
}

// ── Sub-components ─────────────────────────────────────────────────────────

function FeatureItem({
  color,
  bg,
  children,
}: {
  color: string
  bg: string
  children: React.ReactNode
}) {
  return (
    <li className="flex items-start gap-3">
      <div
        className="w-5 h-5 rounded-full flex items-center justify-center mt-0.5 flex-shrink-0"
        style={{ background: bg }}
      >
        <svg className="w-2.5 h-2.5" fill="none" viewBox="0 0 12 12">
          <path d="M2 6l3 3 5-5" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
      <span className="text-sm font-medium" style={{ color: '#0F172A' }}>{children}</span>
    </li>
  )
}

function SyringeIcon() {
  return (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="#6366F1" strokeWidth="1.5">
      <path d="M18 2l4 4-1 1-4-4 1-1zM14 6l4 4M3 21l4-4M7 17l3-3-1-1-3 3 1 1zM10 14l-3-3 7-7 3 3-7 7z" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function CubesIcon() {
  return (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="#059669" strokeWidth="1.5">
      <path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M3.27 6.96L12 12.01l8.73-5.05M12 22.08V12" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function GemIcon() {
  return (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="#D97706" strokeWidth="1.5">
      <path d="M6 3h12l4 6-10 13L2 9l4-6z" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M2 9h20M12 22L8 9l4-6 4 6-4 13z" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}
