'use client'

import Link from 'next/link'
import { useState } from 'react'

type SelectionHubClientProps = {
  isEligibilityLocked: boolean
  hasProPass: boolean
  accountState: string
  targetUniversity: string | null
  targetProgram: string | null
}

type CollegePreference = {
  id: string
  rank: number
  university: string
  program: string
  category: string
  lastYearCutoff: number
  yourProjected: number
  gap: number
  gapDirection: 'above' | 'below' | 'at'
}

// Placeholder data — seeded once real mock/drill data flows in
const DEMO_PREFERENCES: CollegePreference[] = [
  {
    id: '1', rank: 1,
    university: 'SRCC, University of Delhi', program: 'B.Com (Hons)',
    category: 'General', lastYearCutoff: 98.5, yourProjected: 96.2,
    gap: -2.3, gapDirection: 'below',
  },
  {
    id: '2', rank: 2,
    university: 'LSR, University of Delhi', program: 'B.A. Political Science (Hons)',
    category: 'General', lastYearCutoff: 97.0, yourProjected: 96.2,
    gap: -0.8, gapDirection: 'below',
  },
  {
    id: '3', rank: 3,
    university: 'Gargi College, University of Delhi', program: 'B.Com (Hons)',
    category: 'General', lastYearCutoff: 94.0, yourProjected: 96.2,
    gap: 2.2, gapDirection: 'above',
  },
]

const ALLOTMENT_ROUNDS = [
  { round: 1, status: 'upcoming', date: 'Jul 10, 2026', label: 'Round 1 — Initial Allotment' },
  { round: 2, status: 'upcoming', date: 'Jul 24, 2026', label: 'Round 2 — Spot Allotment' },
  { round: 3, status: 'upcoming', date: 'Aug 5, 2026', label: 'Round 3 — Final Allotment' },
]

export function SelectionHubClient({
  isEligibilityLocked,
  hasProPass,
  accountState,
  targetUniversity,
  targetProgram,
}: SelectionHubClientProps) {
  const [activeTab, setActiveTab] = useState<'preferences' | 'cutoffs' | 'allotment'>('preferences')

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden">
      {/* Header */}
      <header
        className="h-16 min-h-[64px] flex items-center justify-between px-8 bg-white border-b flex-shrink-0"
        style={{ borderColor: '#E5E7EB' }}
      >
        <div>
          <h1 className="text-xl font-bold tracking-tight" style={{ color: '#0F172A' }}>
            Selection Hub
          </h1>
          <p className="text-xs" style={{ color: '#9CA3AF' }}>Admissions OS · CUET 2026</p>
        </div>
        <div className="flex items-center gap-3">
          {hasProPass && (
            <span
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold"
              style={{ background: '#FEF3C7', color: '#D97706' }}
            >
              ★ Pro Pass Active
            </span>
          )}
          <span
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold capitalize"
            style={{
              background: isEligibilityLocked ? 'rgba(5,150,105,0.1)' : 'rgba(99,102,241,0.1)',
              color: isEligibilityLocked ? '#059669' : '#6366F1',
            }}
          >
            <span
              className="w-1.5 h-1.5 rounded-full animate-pulse"
              style={{ background: isEligibilityLocked ? '#059669' : '#6366F1' }}
            />
            {accountState.replace(/_/g, ' ')}
          </span>
        </div>
      </header>

      {/* Eligibility not locked — gate screen */}
      {!isEligibilityLocked && (
        <div className="flex-1 flex items-center justify-center p-8">
          <div
            className="max-w-md text-center p-10 bg-white rounded-2xl border"
            style={{ borderColor: '#E5E7EB', boxShadow: '0 4px 24px rgba(0,0,0,0.06)' }}
          >
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-5"
              style={{ background: '#EEF2FF' }}
            >
              <LockIcon />
            </div>
            <h2 className="text-xl font-extrabold mb-2" style={{ color: '#0F172A' }}>
              Complete Eligibility Lock First
            </h2>
            <p className="text-sm mb-6" style={{ color: '#9CA3AF' }}>
              The Selection Hub activates after you lock your subject eligibility. This ensures your preference list is curated to programs you actually qualify for.
            </p>
            <Link
              href="/onboarding/eligibility"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold text-white transition-all hover:shadow-md"
              style={{ background: '#6366F1' }}
            >
              Go to Eligibility Guardian →
            </Link>
          </div>
        </div>
      )}

      {/* Main content — eligibility locked */}
      {isEligibilityLocked && (
        <div className="flex-1 overflow-y-auto" style={{ scrollbarWidth: 'thin' }}>
          <div className="max-w-5xl mx-auto px-8 py-6 space-y-6">

            {/* Mission banner */}
            <div
              className="p-5 relative overflow-hidden"
              style={{
                background: 'linear-gradient(135deg, #6366F1, #818CF8)',
                borderRadius: '16px',
              }}
            >
              <div className="absolute top-0 right-0 opacity-10 text-white" style={{ fontSize: 120 }}>
                🏛
              </div>
              <div className="relative z-10 flex items-center justify-between flex-wrap gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span
                      className="px-2.5 py-1 bg-white/20 text-white text-xs font-bold uppercase tracking-wider backdrop-blur-sm"
                      style={{ borderRadius: '6px' }}
                    >
                      Phase 4 · Admissions OS
                    </span>
                  </div>
                  <h2 className="text-xl font-extrabold text-white mb-1">
                    {targetProgram ?? 'Your Dream Program'} ·{' '}
                    {targetUniversity ?? 'Target University'}
                  </h2>
                  <p className="text-sm text-white/70">
                    Build your preference list, compare cutoffs, and track seat allotment rounds.
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <StatChip label="Preferences" value={DEMO_PREFERENCES.length} />
                  <StatChip label="Rounds" value={ALLOTMENT_ROUNDS.length} />
                </div>
              </div>
            </div>

            {/* Distance-to-Seat card */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <SeatMetricCard
                icon={<TargetIcon />}
                label="Projected Percentile"
                value="96.2"
                unit="%ile"
                color="#6366F1"
                bg="#EEF2FF"
                note="Based on last mock"
              />
              <SeatMetricCard
                icon={<CutoffIcon />}
                label="Dream College Cutoff"
                value="98.5"
                unit="%ile"
                color="#EF4444"
                bg="#FEF2F2"
                note="SRCC 2025 — Gen"
              />
              <SeatMetricCard
                icon={<GapIcon />}
                label="Distance to Seat"
                value="-2.3"
                unit="%ile"
                color="#D97706"
                bg="#FEF3C7"
                note="Gap to close"
              />
            </div>

            {/* Tabs */}
            <div className="flex items-center gap-1 bg-white border rounded-xl p-1" style={{ borderColor: '#E5E7EB' }}>
              {(['preferences', 'cutoffs', 'allotment'] as const).map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className="flex-1 py-2.5 rounded-lg text-sm font-semibold capitalize transition-all"
                  style={
                    activeTab === tab
                      ? { background: '#6366F1', color: '#FFFFFF' }
                      : { color: '#9CA3AF' }
                  }
                >
                  {tab === 'preferences' ? 'My Preferences' : tab === 'cutoffs' ? 'Cutoff Analysis' : 'Allotment Tracker'}
                </button>
              ))}
            </div>

            {/* Tab: Preferences */}
            {activeTab === 'preferences' && (
              <div className="space-y-3">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: '#9CA3AF' }}>
                    Ranked Preference List
                  </p>
                  {!hasProPass && (
                    <ProGate feature="Preference Optimiser" />
                  )}
                </div>
                {DEMO_PREFERENCES.map(pref => (
                  <PreferenceRow key={pref.id} pref={pref} locked={!hasProPass} />
                ))}
                <button
                  className="w-full mt-2 py-3 rounded-xl text-sm font-bold border-2 border-dashed transition-all hover:border-solid"
                  style={{ borderColor: '#6366F1', color: '#6366F1' }}
                  disabled={!hasProPass}
                >
                  {hasProPass ? '+ Add College Preference' : '🔒 Unlock with Pro Pass to add preferences'}
                </button>
              </div>
            )}

            {/* Tab: Cutoff Analysis */}
            {activeTab === 'cutoffs' && (
              <div className="bg-white border rounded-xl overflow-hidden" style={{ borderColor: '#E5E7EB' }}>
                <div className="px-6 py-4 border-b flex items-center justify-between" style={{ borderColor: '#E5E7EB' }}>
                  <p className="text-sm font-bold" style={{ color: '#0F172A' }}>Cutoff vs. Projected Percentile</p>
                  <span className="text-xs px-2.5 py-1 rounded-full font-semibold" style={{ background: '#EEF2FF', color: '#6366F1' }}>CUET 2025 Data</span>
                </div>
                <div className="divide-y" style={{ borderColor: '#E5E7EB' }}>
                  {DEMO_PREFERENCES.map(pref => (
                    <div key={pref.id} className="px-6 py-4 flex items-center justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold truncate" style={{ color: '#0F172A' }}>{pref.university}</p>
                        <p className="text-xs" style={{ color: '#9CA3AF' }}>{pref.program} · {pref.category}</p>
                      </div>
                      <div className="flex items-center gap-6 text-right flex-shrink-0">
                        <div>
                          <p className="text-xs" style={{ color: '#9CA3AF' }}>Cutoff</p>
                          <p className="text-sm font-bold" style={{ color: '#0F172A' }}>{pref.lastYearCutoff}%ile</p>
                        </div>
                        <div>
                          <p className="text-xs" style={{ color: '#9CA3AF' }}>Yours</p>
                          <p className="text-sm font-bold" style={{ color: '#6366F1' }}>{pref.yourProjected}%ile</p>
                        </div>
                        <GapBadge gap={pref.gap} direction={pref.gapDirection} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Tab: Allotment Tracker */}
            {activeTab === 'allotment' && (
              <div className="space-y-3">
                <p className="text-xs font-semibold uppercase tracking-widest mb-4" style={{ color: '#9CA3AF' }}>
                  CSAS 2026 — Seat Allotment Rounds
                </p>
                {ALLOTMENT_ROUNDS.map(round => (
                  <div
                    key={round.round}
                    className="flex items-center justify-between p-5 bg-white border rounded-xl"
                    style={{ borderColor: '#E5E7EB' }}
                  >
                    <div className="flex items-center gap-4">
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center font-black text-lg flex-shrink-0"
                        style={{ background: '#EEF2FF', color: '#6366F1' }}
                      >
                        {round.round}
                      </div>
                      <div>
                        <p className="text-sm font-bold" style={{ color: '#0F172A' }}>{round.label}</p>
                        <p className="text-xs" style={{ color: '#9CA3AF' }}>Expected: {round.date}</p>
                      </div>
                    </div>
                    <span
                      className="px-3 py-1.5 rounded-full text-xs font-bold uppercase"
                      style={{ background: '#F1F5F9', color: '#64748B' }}
                    >
                      Upcoming
                    </span>
                  </div>
                ))}

                <div
                  className="mt-4 p-4 rounded-xl flex items-start gap-3"
                  style={{ background: '#FEFCE8' }}
                >
                  <svg className="w-4 h-4 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="10" stroke="#D97706" strokeWidth="1.5" />
                    <path d="M12 8v4M12 16h.01" stroke="#D97706" strokeWidth="1.5" strokeLinecap="round" />
                  </svg>
                  <p className="text-xs font-medium" style={{ color: '#92400E' }}>
                    Allotment round dates are indicative. Check the official NTA/CSAS portal for confirmed schedules. 99Plus will push notifications when rounds open.
                  </p>
                </div>
              </div>
            )}

          </div>
        </div>
      )}
    </div>
  )
}

// ── Sub-components ─────────────────────────────────────────────────────────

function StatChip({ label, value }: { label: string; value: number }) {
  return (
    <div className="text-center px-5 py-3 bg-white/10 backdrop-blur-sm" style={{ borderRadius: '12px' }}>
      <p className="text-2xl font-black text-white">{value}</p>
      <p className="text-xs text-white/60 font-semibold">{label}</p>
    </div>
  )
}

function SeatMetricCard({
  icon, label, value, unit, color, bg, note,
}: {
  icon: React.ReactNode
  label: string
  value: string
  unit: string
  color: string
  bg: string
  note: string
}) {
  return (
    <div className="bg-white border rounded-xl p-5" style={{ borderColor: '#E5E7EB' }}>
      <div className="flex items-start justify-between mb-3">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: bg }}>
          {icon}
        </div>
      </div>
      <p className="text-xs font-semibold uppercase tracking-widest mb-1" style={{ color: '#9CA3AF' }}>{label}</p>
      <div className="flex items-baseline gap-1">
        <span className="text-3xl font-extrabold tracking-tight" style={{ color }}>{value}</span>
        <span className="text-sm font-medium" style={{ color: '#9CA3AF' }}>{unit}</span>
      </div>
      <p className="text-xs mt-1" style={{ color: '#9CA3AF' }}>{note}</p>
    </div>
  )
}

function PreferenceRow({
  pref,
  locked,
}: {
  pref: CollegePreference
  locked: boolean
}) {
  return (
    <div
      className="flex items-center justify-between p-5 bg-white border rounded-xl transition-all hover:shadow-sm"
      style={{ borderColor: '#E5E7EB', opacity: locked ? 0.6 : 1 }}
    >
      <div className="flex items-center gap-4">
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm flex-shrink-0"
          style={{ background: '#EEF2FF', color: '#6366F1' }}
        >
          {pref.rank}
        </div>
        <div>
          <p className="text-sm font-bold" style={{ color: '#0F172A' }}>{pref.university}</p>
          <p className="text-xs" style={{ color: '#9CA3AF' }}>{pref.program} · {pref.category}</p>
        </div>
      </div>
      <div className="flex items-center gap-4">
        <GapBadge gap={pref.gap} direction={pref.gapDirection} />
        {!locked && (
          <button className="w-7 h-7 rounded-full hover:bg-gray-100 flex items-center justify-center transition-colors">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="#9CA3AF" strokeWidth="1.5">
              <path d="M12 5v.01M12 12v.01M12 19v.01" strokeLinecap="round" />
            </svg>
          </button>
        )}
      </div>
    </div>
  )
}

function GapBadge({
  gap,
  direction,
}: {
  gap: number
  direction: 'above' | 'below' | 'at'
}) {
  const config = {
    above: { bg: '#ECFDF5', color: '#059669', prefix: '+' },
    below: { bg: '#FEF2F2', color: '#EF4444', prefix: '' },
    at: { bg: '#EEF2FF', color: '#6366F1', prefix: '±' },
  }[direction]

  return (
    <span
      className="px-2.5 py-1 rounded-full text-xs font-bold flex-shrink-0"
      style={{ background: config.bg, color: config.color }}
    >
      {config.prefix}{gap > 0 ? `+${gap}` : gap}%ile
    </span>
  )
}

function ProGate({ feature }: { feature: string }) {
  return (
    <Link
      href="/store"
      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all hover:shadow-sm"
      style={{ background: '#FEF3C7', color: '#D97706' }}
    >
      🔒 Unlock {feature} — Get Pro
    </Link>
  )
}

// ── Icon helpers ───────────────────────────────────────────────────────────

function LockIcon() {
  return (
    <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="#6366F1" strokeWidth="1.5">
      <rect x="5" y="11" width="14" height="10" rx="2" />
      <path d="M8 11V7a4 4 0 018 0v4" strokeLinecap="round" />
    </svg>
  )
}
function TargetIcon() {
  return (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="#6366F1" strokeWidth="1.5">
      <circle cx="12" cy="12" r="10" />
      <circle cx="12" cy="12" r="6" />
      <circle cx="12" cy="12" r="2" />
    </svg>
  )
}
function CutoffIcon() {
  return (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="#EF4444" strokeWidth="1.5">
      <path d="M3 3v18h18" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M21 9H3" strokeLinecap="round" strokeDasharray="4 2" />
    </svg>
  )
}
function GapIcon() {
  return (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="#D97706" strokeWidth="1.5">
      <path d="M12 2v20M2 12h4M18 12h4" strokeLinecap="round" />
      <path d="M8 8l4-4 4 4M8 16l4 4 4-4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}
