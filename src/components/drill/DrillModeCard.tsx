'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import type { DrillMode, ActiveLeak } from './types'

interface DrillModeCardProps {
  mode: DrillMode
  leak: ActiveLeak | null
}

const modeConfig = {
  gap_remedy: {
    label: 'Mode A',
    title: 'Gap-Remedy Drill',
    color: 'indigo',
    icon: 'fa-crosshairs',
    iconBg: 'from-indigo-500 to-indigo-400',
    borderClass: 'border-2 border-yellow-300',
    topBarClass: 'bg-gradient-to-r from-yellow-300 to-yellow-400',
    badge: { text: 'Recommended', bg: 'bg-indigo-500 text-white', icon: 'fa-star' },
    proBadge: null,
    free: false,
    cta: 'Start Drill →',
    ctaClass: 'bg-gradient-to-r from-indigo-600 to-indigo-500 text-white hover:from-indigo-700 hover:to-indigo-600',
    boxShadow: '0 4px 20px rgba(250,204,21,0.15)',
  },
  topic_mastery: {
    label: 'Mode B',
    title: 'Topic Mastery',
    color: 'emerald',
    icon: 'fa-book-open',
    iconBg: 'from-emerald-600 to-emerald-400',
    borderClass: 'border border-gray-200 hover:border-emerald-400/40',
    topBarClass: 'bg-gradient-to-r from-emerald-600 to-emerald-400',
    badge: { text: 'Free to Browse', bg: 'bg-emerald-50 text-emerald-600 border border-emerald-200', icon: 'fa-unlock' },
    proBadge: null,
    free: true,
    cta: 'Explore Syllabus',
    ctaClass: 'bg-white border-2 border-emerald-600 text-emerald-600 hover:bg-emerald-600 hover:text-white',
    boxShadow: undefined,
  },
  pyq: {
    label: 'Mode C',
    title: 'Past Question Papers',
    color: 'yellow',
    icon: 'fa-scroll',
    iconBg: 'from-yellow-500 to-yellow-400',
    borderClass: 'border border-gray-200 hover:border-yellow-400/40',
    topBarClass: 'bg-gradient-to-r from-yellow-500 to-yellow-400',
    badge: { text: 'Free to Browse', bg: 'bg-yellow-50 text-yellow-800 border border-yellow-200', icon: 'fa-unlock' },
    proBadge: null,
    free: true,
    cta: 'Browse Papers',
    ctaClass: 'bg-white border-2 border-yellow-500 text-yellow-800 hover:bg-yellow-500 hover:text-white',
    boxShadow: undefined,
  },
  full_mock: {
    label: 'Mode D',
    title: 'Mock Tests',
    color: 'red',
    icon: 'fa-stopwatch',
    iconBg: 'from-red-500 to-red-400',
    borderClass: 'border-2 border-yellow-300',
    topBarClass: 'bg-gradient-to-r from-yellow-300 to-yellow-400',
    badge: null,
    proBadge: { text: 'PRO', bg: 'from-yellow-300 to-yellow-400 text-yellow-900' },
    free: false,
    cta: 'Unlock with Pro',
    ctaClass: 'bg-gradient-to-r from-yellow-300 to-yellow-400 text-yellow-900 font-extrabold',
    boxShadow: '0 4px 20px rgba(250,204,21,0.15)',
  },
}

export function DrillModeCard({ mode, leak }: DrillModeCardProps) {
  const cfg = modeConfig[mode]
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  async function handleStart() {
    if (mode !== 'gap_remedy') return
    setLoading(true)
    try {
      const body: Record<string, string> = { mode: 'gap_remedy' }
      if (leak?.id) body.mark_leak_id = leak.id

      const res = await fetch('/api/drill/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      const data = await res.json() as { ok: boolean; session_id?: string }
      if (data.ok && data.session_id) {
        router.push(`/surgical-drill/${data.session_id}`)
      }
    } catch {
      setLoading(false)
    }
  }

  const lostMarks = leak?.lostMarks ?? 0
  const chapter = leak?.chapterName ?? 'Targeted Topic'

  return (
    <div
      className={`bg-white p-0 relative overflow-hidden cursor-pointer rounded-2xl transition-all duration-200 ${cfg.borderClass}`}
      style={{ boxShadow: cfg.boxShadow }}
    >
      {/* Top accent bar */}
      <div className={`h-1.5 w-full ${cfg.topBarClass}`} />

      {/* PRO badge */}
      {cfg.proBadge && (
        <div className="absolute top-4 right-4 z-20">
          <span className={`px-3 py-1.5 bg-gradient-to-r ${cfg.proBadge.bg} text-[10px] font-extrabold uppercase tracking-wider rounded-lg flex items-center gap-1.5 shadow-lg`}>
            <i className="fa-solid fa-crown text-[8px]" />
            {cfg.proBadge.text}
          </span>
        </div>
      )}

      {/* Recommended / free badge */}
      {cfg.badge && (
        <div className="absolute top-4 left-4 z-20">
          <span className={`px-2.5 py-1 text-[9px] font-bold uppercase tracking-wider rounded-md flex items-center gap-1 ${cfg.badge.bg}`}>
            <i className={`fa-solid ${cfg.badge.icon} text-[8px]`} />
            {cfg.badge.text}
          </span>
        </div>
      )}

      <div className="p-7">
        {/* Icon + title */}
        <div className="flex items-start gap-4 mb-5 mt-4">
          <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${cfg.iconBg} flex items-center justify-center shadow-lg flex-shrink-0`}>
            <i className={`fa-solid ${cfg.icon} text-white text-xl`} />
          </div>
          <div className="mt-0.5">
            <span className={`text-[10px] font-bold text-${cfg.color}-500 uppercase tracking-widest`}>{cfg.label}</span>
            <h3 className="text-lg font-extrabold text-gray-900 mt-1 tracking-tight">{cfg.title}</h3>
          </div>
        </div>

        {/* Description */}
        <p className="text-sm text-gray-500 leading-relaxed mb-5">
          {mode === 'gap_remedy' && (
            <>Fix your specific <span className="font-bold text-red-500">{lostMarks > 0 ? `${lostMarks}-mark leak` : 'mark leak'}</span> with a personalized 20-min set targeting <span className="font-semibold text-gray-800">{chapter}</span>.</>
          )}
          {mode === 'topic_mastery' && (
            <>Deep-dive into the <span className="font-bold text-emerald-600">NCERT Syllabus Explorer</span> and build mastery from the ground up with structured chapter drills.</>
          )}
          {mode === 'pyq' && (
            <>Master the <span className="font-bold text-yellow-800">NTA question language</span> with official papers from 2022–2025. Understand patterns and weightage.</>
          )}
          {mode === 'full_mock' && (
            <>Take full-length simulations to build your <span className="font-bold text-red-500">3-hour exam stamina</span>. Pixel-perfect NTA Mirror interface.</>
          )}
        </p>

        {/* Tags */}
        <div className="flex items-center gap-2 mb-5 flex-wrap">
          {mode === 'gap_remedy' && (
            <>
              <Tag icon="fa-droplet" color="red" label={`${lostMarks > 0 ? lostMarks : '?'} Marks at Risk`} />
              <Tag icon="fa-clock" color="gray" label="20 min" />
              <Tag icon="fa-circle-question" color="gray" label="Up to 8 Qs" />
            </>
          )}
          {mode === 'topic_mastery' && (
            <>
              <Tag icon="fa-layer-group" color="emerald" label="All Chapters" />
              <Tag icon="fa-sitemap" color="gray" label="NCERT Mapped" />
              <Tag icon="fa-signal" color="gray" label="Progressive" />
            </>
          )}
          {mode === 'pyq' && (
            <>
              <Tag icon="fa-calendar-days" color="yellow" label="2022–2025" />
              <Tag icon="fa-file-lines" color="gray" label="Official NTA" />
              <Tag icon="fa-chart-pie" color="gray" label="Analyzed" />
            </>
          )}
          {mode === 'full_mock' && (
            <>
              <Tag icon="fa-hourglass-half" color="red" label="3 Hours" />
              <Tag icon="fa-display" color="gray" label="NTA Mirror" />
              <Tag icon="fa-ranking-star" color="gray" label="Full Length" />
            </>
          )}
        </div>

        {/* CTA */}
        <button
          onClick={mode === 'gap_remedy' ? handleStart : undefined}
          disabled={loading}
          className={`w-full py-3 rounded-xl text-sm font-bold transition-all ${cfg.ctaClass} ${
            loading ? 'opacity-70 cursor-wait' : ''
          }`}
          style={mode === 'gap_remedy' ? { boxShadow: '0 4px 16px rgba(99,102,241,0.3)' } : undefined}
        >
          {loading ? (
            <><i className="fa-solid fa-circle-notch fa-spin mr-2" />Creating drill…</>
          ) : mode === 'full_mock' ? (
            <><i className="fa-solid fa-lock mr-2 text-xs" />{cfg.cta}</>
          ) : (
            <>{cfg.cta}</>
          )}
        </button>

        {(mode === 'topic_mastery' || mode === 'pyq') && (
          <p className="text-[9px] text-center mt-2 text-gray-400">
            <i className="fa-solid fa-info-circle mr-1" />Sprint &amp; Practice actions require credits
          </p>
        )}
      </div>
    </div>
  )
}

function Tag({ icon, color, label }: { icon: string; color: string; label: string }) {
  const colorMap: Record<string, string> = {
    red: 'bg-red-50 text-red-600',
    emerald: 'bg-emerald-50 text-emerald-700',
    yellow: 'bg-yellow-50 text-yellow-800',
    gray: 'bg-gray-100 text-gray-500',
  }
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-bold rounded-lg ${colorMap[color] ?? colorMap.gray}`}>
      <i className={`fa-solid ${icon}`} />
      {label}
    </span>
  )
}
