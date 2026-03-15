/**
 * /store — Surgical Store (PRD §16 Razorpay Monetization)
 *
 * Screen reference: 26-screen-23.html
 * Products:
 *   - Surgical X-Ray Sachet (₹25 / 1 credit)
 *   - Pack of 5 Credits     (₹100 / 5 credits)
 *   - Surgical Pro Pass     (₹999 / unlimited until Jun 2026)
 *
 * NOTE: Payment initiation (Razorpay checkout) is wired in Phase 4 Step 2.
 *       This scaffold renders the full pricing UI and connects to the
 *       /api/payments/create-order Server Action in the next step.
 */

import { redirect } from 'next/navigation'
import { getUidFromCookies } from '@/lib/session'
import { getInsforgeAdminClient } from '@/lib/insforgeAdmin'
import { StorePricingCards } from '@/components/store/StorePricingCards'
import { StoreHeader } from '@/components/store/StoreHeader'
import { StoreSidebar } from '@/components/store/StoreSidebar'

type CreditBalance = { balance_after: number } | null

export default async function StorePage() {
  const uid = await getUidFromCookies()
  if (!uid) redirect('/login')

  const db = getInsforgeAdminClient()

  // Fetch current credit balance (latest ledger row)
  const { data: ledgerRows } = await db.database
    .from('surgical_credits')
    .select('balance_after')
    .eq('student_profile_id', uid)
    .order('created_at', { ascending: false })
    .limit(1)

  const balance = (ledgerRows as CreditBalance[] | null)?.[0]?.balance_after ?? 0

  // Check for active Pro Pass subscription
  const { data: activeSubs } = await db.database
    .from('subscriptions')
    .select('plan_code, ends_at')
    .eq('student_profile_id', uid)
    .eq('status', 'active')
    .gte('ends_at', new Date().toISOString())
    .order('ends_at', { ascending: false })
    .limit(1)

  const proPass = (activeSubs as Array<{ plan_code: string; ends_at: string }> | null)?.[0] ?? null

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: '#F8FAFC' }}>
      <StoreSidebar activePath="/store" />
      <div className="flex-1 flex flex-col h-full overflow-hidden min-w-0">
        <StoreHeader creditBalance={balance} />
        <main
          className="flex-1 overflow-y-auto p-8"
          style={{ scrollbarWidth: 'thin' }}
        >
          {/* Page intro */}
          <div className="max-w-5xl mx-auto mb-8 text-center">
            <p className="text-sm font-semibold uppercase tracking-widest mb-2" style={{ color: '#6366F1' }}>
              Invest in Precision
            </p>
            <h2 className="text-3xl font-extrabold tracking-tight mb-3" style={{ color: '#0F172A' }}>
              Choose Your Toolkit
            </h2>
            <p className="text-base max-w-xl mx-auto" style={{ color: '#9CA3AF' }}>
              Every credit unlocks targeted practice. No fluff, no filler — just the exact reps your score needs.
            </p>
          </div>

          {/* Active Pro Pass banner */}
          {proPass && (
            <div className="max-w-5xl mx-auto mb-8 p-5 rounded-2xl flex items-center gap-4"
              style={{ background: 'linear-gradient(135deg, #FFFBEB, #FEF3C7)', border: '2px solid #FACC15' }}>
              <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: '#FEF3C7' }}>
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24">
                  <path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6L12 2z" fill="#D97706" />
                </svg>
              </div>
              <div className="flex-1">
                <p className="text-sm font-bold" style={{ color: '#92400E' }}>Pro Pass Active</p>
                <p className="text-xs" style={{ color: '#B45309' }}>
                  Unlimited access until {new Date(proPass.ends_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
                </p>
              </div>
              <span className="px-3 py-1.5 rounded-full text-xs font-bold" style={{ background: '#D97706', color: '#FFFFFF' }}>
                ACTIVE
              </span>
            </div>
          )}

          {/* Pricing grid */}
          <StorePricingCards studentId={uid} proPassActive={!!proPass} />

          {/* Razorpay trust footer */}
          <div className="max-w-5xl mx-auto mt-10">
            <div className="bg-white rounded-xl border p-6" style={{ borderColor: '#E5E7EB', borderRadius: '12px' }}>
              <div className="flex flex-col items-center gap-4">
                {/* Secured by Razorpay */}
                <div className="flex items-center gap-3">
                  <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: '#9CA3AF' }}>Secured by</span>
                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg" style={{ background: '#EEF2FF' }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                      <rect width="24" height="24" rx="4" fill="#2563EB" />
                      <path d="M7 8l3 8h1l3-8M14 8h3" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    <span className="text-xs font-bold" style={{ color: '#2563EB' }}>Razorpay</span>
                  </div>
                </div>

                {/* Payment methods */}
                <div className="flex flex-wrap items-center justify-center gap-3">
                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border" style={{ borderColor: '#E5E7EB' }}>
                    <svg width="20" height="14" viewBox="0 0 40 28">
                      <rect width="40" height="28" rx="4" fill="#fff" />
                      <path d="M12 6l4 16M16 6l4 16M24 6l-4 16M28 6l-4 16" stroke="#097939" strokeWidth="2.5" strokeLinecap="round" />
                    </svg>
                    <span className="text-xs font-semibold" style={{ color: '#0F172A' }}>UPI</span>
                  </div>
                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border" style={{ borderColor: '#E5E7EB' }}>
                    <span className="text-xs font-bold" style={{ color: '#4285F4' }}>G</span>
                    <span className="text-xs font-semibold" style={{ color: '#0F172A' }}>Pay</span>
                  </div>
                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border" style={{ borderColor: '#E5E7EB' }}>
                    <svg width="18" height="18" viewBox="0 0 24 24">
                      <circle cx="12" cy="12" r="12" fill="#5F259F" />
                      <path d="M9 7v10M9 7l6 5-6 5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    <span className="text-xs font-semibold" style={{ color: '#5F259F' }}>PhonePe</span>
                  </div>
                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border" style={{ borderColor: '#E5E7EB' }}>
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="#9CA3AF" strokeWidth="1.5">
                      <rect x="2" y="5" width="20" height="14" rx="2" />
                      <path d="M2 10h20" />
                    </svg>
                    <span className="text-xs font-semibold" style={{ color: '#0F172A' }}>Cards</span>
                  </div>
                </div>

                {/* Upgrade upsell */}
                <div className="flex items-center gap-2 px-4 py-2.5 rounded-lg" style={{ background: '#FEFCE8' }}>
                  <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="10" fill="#FEF3C7" />
                    <path d="M12 8v4M12 16h.01" stroke="#D97706" strokeWidth="2" strokeLinecap="round" />
                  </svg>
                  <p className="text-xs font-medium" style={{ color: '#92400E' }}>
                    Already bought a sachet? Your ₹25 will be automatically credited toward a Pro upgrade.
                  </p>
                </div>

                {/* Security badges */}
                <div className="flex flex-wrap items-center justify-center gap-5 mt-1">
                  <div className="flex items-center gap-1.5">
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24">
                      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" fill="#ECFDF5" stroke="#059669" strokeWidth="1.5" />
                      <path d="M9 12l2 2 4-4" stroke="#059669" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    <span className="text-xs font-medium" style={{ color: '#9CA3AF' }}>256-bit SSL Encrypted</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24">
                      <rect x="5" y="11" width="14" height="10" rx="2" fill="#ECFDF5" stroke="#059669" strokeWidth="1.5" />
                      <path d="M8 11V7a4 4 0 018 0v4" stroke="#059669" strokeWidth="1.5" strokeLinecap="round" />
                    </svg>
                    <span className="text-xs font-medium" style={{ color: '#9CA3AF' }}>PCI DSS Compliant</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24">
                      <path d="M1 4v6h6M23 20v-6h-6" stroke="#059669" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      <path d="M20.49 9A9 9 0 005.64 5.64L1 10M23 14l-4.64 4.36A9 9 0 013.51 15" stroke="#059669" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    <span className="text-xs font-medium" style={{ color: '#9CA3AF' }}>Instant Refund Policy</span>
                  </div>
                </div>
              </div>
            </div>
            <p className="text-center text-xs mt-4 pb-6" style={{ color: '#9CA3AF' }}>
              © 2026 99Plus Surgical Selection Engine. All rights reserved.
            </p>
          </div>
        </main>
      </div>
    </div>
  )
}
