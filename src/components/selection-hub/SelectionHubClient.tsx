'use client'

import Link from 'next/link'
import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { useCallback } from 'react'

// ── Types exported for the server component ────────────────────────────────

export type GapStatus = 'safe' | 'possible' | 'close' | 'reach'

export type CutoffRow = {
  id: string
  rank: number
  college: string
  program: string
  category: string
  cutoffScore: number
  cutoffPercentile: number
  scoreGap: number
  percentileGap: number
  gapStatus: GapStatus
}

export type StudentStats = {
  projectedScore: number
  projectedPercentile: number
  creditBalance: number
  lastUpdated: string
}

type SelectionHubClientProps = {
  isEligibilityLocked: boolean
  hasProPass: boolean
  accountState: string
  targetUniversity: string | null
  targetProgram: string | null
  studentStats: StudentStats
  cutoffRows: CutoffRow[]
}

// PRD §11.3 status config
const STATUS_CONFIG: Record<GapStatus, { label: string; color: string; bg: string; bar: string }> = {
  safe:     { label: 'Safe',     color: '#059669', bg: '#ECFDF5', bar: '#059669' },
  possible: { label: 'Possible', color: '#6366F1', bg: '#EEF2FF', bar: '#6366F1' },
  close:    { label: 'Close',    color: '#D97706', bg: '#FEF3C7', bar: '#D97706' },
  reach:    { label: 'Reach',    color: '#EF4444', bg: '#FEF2F2', bar: '#EF4444' },
}

const ALLOTMENT_ROUNDS = [
  { round: 1, status: 'upcoming', date: 'Jul 10, 2026', label: 'Round 1 — Initial Allotment' },
  { round: 2, status: 'upcoming', date: 'Jul 24, 2026', label: 'Round 2 — Spot Allotment' },
  { round: 3, status: 'upcoming', date: 'Aug 5, 2026',  label: 'Round 3 — Final Allotment' },
]

export function SelectionHubClient({
  isEligibilityLocked,
  hasProPass,
  accountState,
  targetUniversity,
  targetProgram,
  studentStats,
  cutoffRows,
}: SelectionHubClientProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const rawTab = searchParams.get('tab')
  const activeTab: 'heatmap' | 'preferences' | 'allotment' =
    rawTab === 'preferences' || rawTab === 'allotment' ? rawTab : 'heatmap'

  const setActiveTab = useCallback(
    (tab: 'heatmap' | 'preferences' | 'allotment') => {
      const params = new URLSearchParams(searchParams.toString())
      params.set('tab', tab)
      router.push(`${pathname}?${params.toString()}`, { scroll: false })
    },
    [router, pathname, searchParams]
  )

  const topTarget = cutoffRows[0] ?? null

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden">
      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <header
        className="h-16 min-h-[64px] flex items-center justify-between px-8 bg-white border-b flex-shrink-0"
        style={{ borderColor: '#E5E7EB' }}
      >
        <div>
          <h1 className="text-xl font-bold tracking-tight" style={{ color: '#0F172A' }}>
            Selection Hub
          </h1>
          <p className="text-xs" style={{ color: '#9CA3AF' }}>
            Admissions OS · CUET 2026 · Score-Gap Engine active
          </p>
        </div>
        <div className="flex items-center gap-3">
          {hasProPass && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold"
              style={{ background: '#FEF3C7', color: '#D97706' }}>
              ★ Pro Pass Active
            </span>
          )}
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold capitalize"
            style={{
              background: isEligibilityLocked ? 'rgba(5,150,105,0.1)' : 'rgba(99,102,241,0.1)',
              color: isEligibilityLocked ? '#059669' : '#6366F1',
            }}>
            <span className="w-1.5 h-1.5 rounded-full animate-pulse"
              style={{ background: isEligibilityLocked ? '#059669' : '#6366F1' }} />
            {accountState.replace(/_/g, ' ')}
          </span>
        </div>
      </header>

      {/* ── Eligibility gate ───────────────────────────────────────────────── */}
      {!isEligibilityLocked && (
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="max-w-md text-center p-10 bg-white rounded-2xl border"
            style={{ borderColor: '#E5E7EB', boxShadow: '0 4px 24px rgba(0,0,0,0.06)' }}>
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-5"
              style={{ background: '#EEF2FF' }}>
              <LockSvg />
            </div>
            <h2 className="text-xl font-extrabold mb-2" style={{ color: '#0F172A' }}>
              Complete Eligibility Lock First
            </h2>
            <p className="text-sm mb-6" style={{ color: '#9CA3AF' }}>
              The Selection Hub and Score-Gap Engine activate after you lock your subject eligibility.
            </p>
            <Link href="/onboarding/eligibility"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold text-white"
              style={{ background: '#6366F1' }}>
              Go to Eligibility Guardian →
            </Link>
          </div>
        </div>
      )}

      {/* ── Main content ───────────────────────────────────────────────────── */}
      {isEligibilityLocked && (
        <div className="flex-1 overflow-y-auto" style={{ scrollbarWidth: 'thin' }}>
          <div className="max-w-5xl mx-auto px-8 py-6 space-y-6">

            {/* Mission banner */}
            <div className="p-5 relative overflow-hidden" style={{
              background: 'linear-gradient(135deg, #6366F1, #818CF8)',
              borderRadius: '16px',
            }}>
              <div className="relative z-10 flex items-center justify-between flex-wrap gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="px-2.5 py-1 bg-white/20 text-white text-xs font-bold uppercase tracking-wider backdrop-blur-sm"
                      style={{ borderRadius: '6px' }}>
                      PRD §11 · Score-Gap Engine
                    </span>
                  </div>
                  <h2 className="text-xl font-extrabold text-white mb-1">
                    {targetProgram ?? 'Your Dream Program'} · {targetUniversity ?? 'Target University'}
                  </h2>
                  <p className="text-sm text-white/70">
                    {studentStats.lastUpdated}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <StatChip label="Projected" value={`${studentStats.projectedPercentile}%ile`} />
                  <StatChip label="Benchmarks" value={String(cutoffRows.length)} />
                </div>
              </div>
            </div>

            {/* Distance-to-Seat metric cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <MetricCard
                label="Projected Percentile"
                value={`${studentStats.projectedPercentile}`}
                unit="%ile"
                color="#6366F1" bg="#EEF2FF"
                note={`Score: ${studentStats.projectedScore}/200`}
              />
              <MetricCard
                label="Dream College Cutoff"
                value={topTarget ? `${topTarget.cutoffPercentile}` : '—'}
                unit="%ile"
                color="#EF4444" bg="#FEF2F2"
                note={topTarget ? `${topTarget.college} Gen 2025` : 'Loading…'}
              />
              <MetricCard
                label="Distance to Seat"
                value={topTarget ? `${topTarget.percentileGap > 0 ? '+' : ''}${topTarget.percentileGap.toFixed(1)}` : '—'}
                unit="%ile"
                color={topTarget ? STATUS_CONFIG[topTarget.gapStatus].color : '#9CA3AF'}
                bg={topTarget ? STATUS_CONFIG[topTarget.gapStatus].bg : '#F1F5F9'}
                note={topTarget ? STATUS_CONFIG[topTarget.gapStatus].label : '—'}
              />
            </div>

            {/* Tabs */}
            <div className="flex items-center gap-1 bg-white border rounded-xl p-1"
              role="tablist"
              aria-label="Selection Hub sections"
              style={{ borderColor: '#E5E7EB' }}>
              {(['heatmap', 'preferences', 'allotment'] as const).map(tab => (
                <button key={tab}
                  onClick={() => setActiveTab(tab)}
                  role="tab"
                  aria-selected={activeTab === tab}
                  aria-controls={`panel-${tab}`}
                  id={`tab-${tab}`}
                  className="flex-1 py-2.5 rounded-lg text-sm font-semibold capitalize transition-all"
                  style={activeTab === tab
                    ? { background: '#6366F1', color: '#FFFFFF' }
                    : { color: '#9CA3AF' }}>
                  {tab === 'heatmap' ? '🌡 Distance Heatmap' : tab === 'preferences' ? 'My Preferences' : 'Allotment Tracker'}
                </button>
              ))}
            </div>

            {/* ── Tab: Distance-to-Seat Heatmap (PRD §11) ───────────────────── */}
            {activeTab === 'heatmap' && (
              <div className="space-y-3">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs font-bold uppercase tracking-widest" style={{ color: '#9CA3AF' }}>
                    Score-Gap Heatmap · CUET 2025 · General Category
                  </p>
                  <div className="flex items-center gap-2 text-xs" style={{ color: '#9CA3AF' }}>
                    {(['safe', 'possible', 'close', 'reach'] as GapStatus[]).map(s => (
                      <span key={s} className="flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full inline-block"
                          style={{ background: STATUS_CONFIG[s].color }} />
                        {STATUS_CONFIG[s].label}
                      </span>
                    ))}
                  </div>
                </div>

                {cutoffRows.map(row => <HeatmapRow key={row.id} row={row} studentStats={studentStats} />)}

                <div className="mt-4 p-4 rounded-xl flex items-start gap-3"
                  style={{ background: '#EEF2FF' }}>
                  <InfoSvg />
                  <div>
                    <p className="text-xs font-semibold mb-1" style={{ color: '#4338CA' }}>
                      How the Score-Gap is computed (PRD §11.2)
                    </p>
                    <p className="text-xs" style={{ color: '#6366F1' }}>
                      <strong>score_gap</strong> = your projected score − college cutoff score. 
                      <strong> percentile_gap</strong> = your percentile − cutoff percentile. 
                      Thresholds: Safe ≥+15, Possible +1 to +14, Close −1 to −10, Reach &lt;−10.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* ── Tab: Preferences ───────────────────────────────────────────── */}
            {activeTab === 'preferences' && (
              <div className="space-y-3">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-xs font-bold uppercase tracking-widest" style={{ color: '#9CA3AF' }}>
                    Ranked Preference List
                  </p>
                  {!hasProPass && <ProGate feature="Preference Optimiser" />}
                </div>
                {cutoffRows.slice(0, 3).map((row, i) => (
                  <div key={row.id}
                    className="flex items-center justify-between p-5 bg-white border rounded-xl hover:shadow-sm transition-all"
                    style={{ borderColor: '#E5E7EB', opacity: !hasProPass ? 0.65 : 1 }}>
                    <div className="flex items-center gap-4">
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm flex-shrink-0"
                        style={{ background: '#EEF2FF', color: '#6366F1' }}>
                        {i + 1}
                      </div>
                      <div>
                        <p className="text-sm font-bold" style={{ color: '#0F172A' }}>{row.college}</p>
                        <p className="text-xs" style={{ color: '#9CA3AF' }}>{row.program} · {row.category}</p>
                      </div>
                    </div>
                    <GapPill gap={row.percentileGap} status={row.gapStatus} />
                  </div>
                ))}
                <button
                  className="w-full mt-2 py-3 rounded-xl text-sm font-bold border-2 border-dashed transition-all"
                  style={{ borderColor: '#6366F1', color: '#6366F1' }}
                  disabled={!hasProPass}>
                  {hasProPass ? '+ Add College Preference' : '🔒 Unlock with Pro Pass'}
                </button>
              </div>
            )}

            {/* ── Tab: Allotment Tracker ─────────────────────────────────────── */}
            {activeTab === 'allotment' && (
              <div className="space-y-3">
                <p className="text-xs font-bold uppercase tracking-widest mb-4"
                  style={{ color: '#9CA3AF' }}>
                  CSAS 2026 — Seat Allotment Rounds
                </p>
                {ALLOTMENT_ROUNDS.map(r => (
                  <div key={r.round}
                    className="flex items-center justify-between p-5 bg-white border rounded-xl"
                    style={{ borderColor: '#E5E7EB' }}>
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center font-black text-lg flex-shrink-0"
                        style={{ background: '#EEF2FF', color: '#6366F1' }}>
                        {r.round}
                      </div>
                      <div>
                        <p className="text-sm font-bold" style={{ color: '#0F172A' }}>{r.label}</p>
                        <p className="text-xs" style={{ color: '#9CA3AF' }}>Expected: {r.date}</p>
                      </div>
                    </div>
                    <span className="px-3 py-1.5 rounded-full text-xs font-bold uppercase"
                      style={{ background: '#F1F5F9', color: '#64748B' }}>
                      Upcoming
                    </span>
                  </div>
                ))}
              </div>
            )}

          </div>
        </div>
      )}
    </div>
  )
}

// ── HeatmapRow component ───────────────────────────────────────────────────

function HeatmapRow({ row, studentStats }: { row: CutoffRow; studentStats: StudentStats }) {
  const cfg = STATUS_CONFIG[row.gapStatus]
  // Bar width: 0–100% representing how close the student is to the cutoff
  // 100% = student score ≥ cutoff, proportionally reduced below
  const barPct = Math.min(100, Math.max(4,
    (studentStats.projectedScore / row.cutoffScore) * 100
  ))

  return (
    <div className="bg-white border rounded-xl overflow-hidden transition-all hover:shadow-md"
      style={{ borderColor: '#E5E7EB' }}>
      <div className="px-5 pt-4 pb-3">
        <div className="flex items-start justify-between gap-4 mb-3">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs flex-shrink-0"
              style={{ background: cfg.bg, color: cfg.color }}>
              {row.rank}
            </div>
            <div>
              <p className="text-sm font-bold" style={{ color: '#0F172A' }}>{row.college}</p>
              <p className="text-xs" style={{ color: '#9CA3AF' }}>{row.program}</p>
            </div>
          </div>

          <div className="flex items-center gap-4 flex-shrink-0 text-right">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: '#9CA3AF' }}>Cutoff</p>
              <p className="text-sm font-bold" style={{ color: '#0F172A' }}>{row.cutoffPercentile}%ile</p>
              <p className="text-xs" style={{ color: '#9CA3AF' }}>Score: {row.cutoffScore}</p>
            </div>
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: '#9CA3AF' }}>Yours</p>
              <p className="text-sm font-bold" style={{ color: '#6366F1' }}>{studentStats.projectedPercentile}%ile</p>
              <p className="text-xs" style={{ color: '#9CA3AF' }}>Score: {studentStats.projectedScore}</p>
            </div>
            <GapPill gap={row.percentileGap} status={row.gapStatus} />
          </div>
        </div>

        {/* Score bar — visual distance indicator */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] font-semibold" style={{ color: '#9CA3AF' }}>
              Score Gap: {row.scoreGap > 0 ? '+' : ''}{row.scoreGap} marks
            </span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full"
              style={{ background: cfg.bg, color: cfg.color }}>
              {cfg.label}
            </span>
          </div>
          <div className="h-2 rounded-full overflow-hidden" style={{ background: '#F1F5F9' }}>
            <div
              className="h-full rounded-full transition-all"
              style={{ width: `${barPct}%`, background: cfg.bar }}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Sub-components ─────────────────────────────────────────────────────────

function StatChip({ label, value }: { label: string; value: string }) {
  return (
    <div className="text-center px-5 py-3 bg-white/10 backdrop-blur-sm" style={{ borderRadius: '12px' }}>
      <p className="text-lg font-black text-white">{value}</p>
      <p className="text-[10px] text-white/60 font-semibold">{label}</p>
    </div>
  )
}

function MetricCard({ label, value, unit, color, note }: {
  label: string; value: string; unit: string
  color: string; bg?: string; note: string
}) {
  return (
    <div className="bg-white border rounded-xl p-5" style={{ borderColor: '#E5E7EB' }}>
      <p className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: '#9CA3AF' }}>{label}</p>
      <div className="flex items-baseline gap-1">
        <span className="text-3xl font-extrabold tracking-tight" style={{ color }}>{value}</span>
        <span className="text-sm font-medium" style={{ color: '#9CA3AF' }}>{unit}</span>
      </div>
      <p className="text-xs mt-1" style={{ color: '#9CA3AF' }}>{note}</p>
    </div>
  )
}

function GapPill({ gap, status }: { gap: number; status: GapStatus }) {
  const cfg = STATUS_CONFIG[status]
  return (
    <span className="px-2.5 py-1 rounded-full text-xs font-bold flex-shrink-0"
      style={{ background: cfg.bg, color: cfg.color }}>
      {gap > 0 ? '+' : ''}{gap.toFixed(1)}%ile
    </span>
  )
}

function ProGate({ feature }: { feature: string }) {
  return (
    <Link href="/store"
      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold"
      style={{ background: '#FEF3C7', color: '#D97706' }}>
      🔒 Unlock {feature} — Get Pro
    </Link>
  )
}

function LockSvg() {
  return (
    <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="#6366F1" strokeWidth="1.5">
      <rect x="5" y="11" width="14" height="10" rx="2" />
      <path d="M8 11V7a4 4 0 018 0v4" strokeLinecap="round" />
    </svg>
  )
}

function InfoSvg() {
  return (
    <svg className="w-4 h-4 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24">
      <circle cx="12" cy="12" r="10" stroke="#6366F1" strokeWidth="1.5" />
      <path d="M12 8v4M12 16h.01" stroke="#6366F1" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
}
