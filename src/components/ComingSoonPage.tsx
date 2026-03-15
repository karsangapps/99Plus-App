/**
 * Shared "Coming Soon" stub for Phase 2/3 routes.
 * Renders a branded holding page that maintains sidebar context.
 */

import Link from 'next/link'

type Phase = '2' | '3' | '4' | '5'

const PHASE_LABELS: Record<Phase, string> = {
  '2': 'Phase 2 — NTA-Mirror Engine',
  '3': 'Phase 3 — Surgical Drill System',
  '4': 'Phase 4 — Monetization & Selection Hub',
  '5': 'Phase 5 — Admin Console',
}

type ComingSoonPageProps = {
  title: string
  subtitle: string
  icon: React.ReactNode
  phase: Phase
  features: string[]
}

export function ComingSoonPage({ title, subtitle, icon, phase, features }: ComingSoonPageProps) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center p-8 text-center"
      style={{ background: '#F8FAFC' }}>
      <div className="max-w-md w-full">
        {/* Icon */}
        <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-5"
          style={{ background: '#EEF2FF' }}>
          {icon}
        </div>

        {/* Phase badge */}
        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-4"
          style={{ background: 'rgba(99,102,241,0.1)', color: '#6366F1' }}>
          {PHASE_LABELS[phase]}
        </span>

        <h1 className="text-2xl font-extrabold tracking-tight mb-2" style={{ color: '#0F172A' }}>
          {title}
        </h1>
        <p className="text-sm mb-6" style={{ color: '#9CA3AF' }}>{subtitle}</p>

        {/* Feature preview list */}
        <div className="bg-white border rounded-2xl p-5 mb-6 text-left"
          style={{ borderColor: '#E5E7EB' }}>
          <p className="text-xs font-bold uppercase tracking-widest mb-3"
            style={{ color: '#9CA3AF' }}>
            What&apos;s coming
          </p>
          <ul className="space-y-2">
            {features.map(f => (
              <li key={f} className="flex items-center gap-2 text-sm"
                style={{ color: '#0F172A' }}>
                <span className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                  style={{ background: '#6366F1' }} />
                {f}
              </li>
            ))}
          </ul>
        </div>

        <Link href="/"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white"
          style={{ background: '#6366F1' }}
          aria-label="Return to home page">
          ← Back to Home
        </Link>
      </div>
    </div>
  )
}
