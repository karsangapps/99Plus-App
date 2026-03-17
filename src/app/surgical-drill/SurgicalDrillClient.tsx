'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { StudentDashboardLayout } from '@/components/layout/StudentDashboardLayout'
import type { SurgicalDrillData } from '@/app/api/surgical-drill/route'

function SkeletonBanner() {
  return (
    <div className="mb-8 p-6 bg-[#F1F5F9] rounded-[16px] animate-pulse">
      <div className="h-4 w-32 bg-[#E5E7EB] rounded mb-3" />
      <div className="h-8 w-64 bg-[#E5E7EB] rounded" />
    </div>
  )
}

export default function SurgicalDrillClient() {
  const router = useRouter()
  const [data, setData] = useState<SurgicalDrillData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [starting, setStarting] = useState(false)

  useEffect(() => {
    fetch('/api/surgical-drill')
      .then((r) => r.json())
      .then((json) => {
        if (json.ok) setData(json.data)
        else setError(json.error ?? 'Failed to load')
      })
      .catch(() => setError('Failed to load'))
      .finally(() => setLoading(false))
  }, [])

  async function handleGapRemedyStart() {
    const leakId = data?.topLeak?.id
    if (!leakId) return
    setStarting(true)
    try {
      const res = await fetch('/api/practice-sessions/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mode: 'gap_remedy', linkedMarkLeakId: leakId })
      })
      const json = await res.json()
      if (json.ok && json.sessionId) {
        router.push(`/surgical-drill/session/${json.sessionId}`)
      } else {
        setError(json.error ?? 'Failed to start')
      }
    } catch {
      setError('Failed to start drill')
    } finally {
      setStarting(false)
    }
  }

  return (
    <StudentDashboardLayout
      title="Surgical Drill Center"
      subtitle="20-min precision sets targeting your mark leaks"
    >
      <div className="p-4 sm:p-6 lg:p-8 overflow-y-auto">
        {error && (
          <div className="mb-6 rounded-[12px] bg-[#FEF2F2] border border-[#EF4444]/20 px-4 py-3 text-sm text-[#EF4444]">
            {error}
          </div>
        )}

        {loading ? (
          <SkeletonBanner />
        ) : data?.topLeak ? (
          <div className="mb-8 p-6 bg-gradient-to-r from-[#312E81] via-[#4338CA] to-[#6366F1] rounded-[16px] relative overflow-hidden">
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-[10px] font-bold text-[#A5B4FC] uppercase tracking-widest">Active Target</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-[#C7D2FE] font-medium mb-2">
                <span>{data.topLeak.subject}</span>
                <span className="text-[#FBBF24] font-semibold">→ {data.topLeak.chapterTitle}</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
                {data.topLeak.lostMarks}-Mark Leak Detected
              </h2>
              <p className="text-xs text-[#C7D2FE] mt-2 max-w-lg">
                Surgical intervention required — Targeted drills for {data.topLeak.chapterTitle} have been queued based on your latest mock diagnosis.
              </p>
              <div className="flex flex-wrap items-center gap-2 mt-4">
                <span className="px-3 py-1.5 bg-[#FBBF24]/20 border border-[#FBBF24]/30 text-[#FBBF24] text-[10px] font-bold uppercase tracking-wider rounded-lg">
                  Priority: Critical
                </span>
              </div>
            </div>
          </div>
        ) : (
          <div className="mb-8 p-6 bg-[#F8FAFC] border border-[#E5E7EB] rounded-[16px]">
            <h2 className="text-lg font-bold text-[#0F172A]">No Leaks Detected Yet</h2>
            <p className="text-sm text-[#9CA3AF] mt-2">
              Take a mock to get personalized drill recommendations based on your mark leaks.
            </p>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-white rounded-[16px] border border-[#E5E7EB] p-6 hover:shadow-lg transition-all">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-xl bg-[#6366F1]/10 flex items-center justify-center">
                <span className="text-[#6366F1] text-xl">◆</span>
              </div>
              <div>
                <h3 className="font-bold text-[#0F172A]">Mode A — Gap-Remedy</h3>
                <p className="text-xs text-[#9CA3AF]">15 questions · ~20 min</p>
              </div>
            </div>
            <p className="text-sm text-[#6B7280] mb-4">
              Shortest path to recover a specific mark leak. Auto-generated from your diagnosis.
            </p>
            <button
              type="button"
              disabled={!data?.topLeak || starting}
              onClick={handleGapRemedyStart}
              className="w-full py-3 px-4 rounded-[12px] bg-[#6366F1] text-white font-semibold text-sm hover:bg-[#4F46E5] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {starting ? 'Starting…' : data?.topLeak ? 'Start' : 'No Leak — Take a Mock First'}
            </button>
          </div>

          <div className="bg-white rounded-[16px] border border-[#E5E7EB] p-6 opacity-75">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-xl bg-[#059669]/10 flex items-center justify-center">
                <span className="text-[#059669] text-xl">□</span>
              </div>
              <div>
                <h3 className="font-bold text-[#0F172A]">Mode B — Topic Mastery</h3>
                <p className="text-xs text-[#9CA3AF]">Coming soon</p>
              </div>
            </div>
            <p className="text-sm text-[#6B7280] mb-4">
              Chapter-based focused learning. Drill entire NCERT hierarchy.
            </p>
            <button type="button" disabled className="w-full py-3 px-4 rounded-[12px] bg-[#E5E7EB] text-[#9CA3AF] font-semibold text-sm cursor-not-allowed">
              Coming Soon
            </button>
          </div>

          <div className="bg-white rounded-[16px] border border-[#E5E7EB] p-6 opacity-75">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-xl bg-[#FACC15]/10 flex items-center justify-center">
                <span className="text-[#FACC15] text-xl">◇</span>
              </div>
              <div>
                <h3 className="font-bold text-[#0F172A]">Mode C — PYQs</h3>
                <p className="text-xs text-[#9CA3AF]">Coming soon</p>
              </div>
            </div>
            <p className="text-sm text-[#6B7280] mb-4">
              Official previous year paper archive filtered by year/subject.
            </p>
            <button type="button" disabled className="w-full py-3 px-4 rounded-[12px] bg-[#E5E7EB] text-[#9CA3AF] font-semibold text-sm cursor-not-allowed">
              Coming Soon
            </button>
          </div>
        </div>

        {(data?.drillsCompleted ?? 0) > 0 && (
          <div className="mt-8 flex flex-wrap gap-3">
            <span className="px-4 py-2 bg-[#ECFDF5] border border-[#059669]/20 text-[#059669] text-xs font-semibold rounded-xl">
              {data?.drillsCompleted} drills completed
            </span>
            <span className="px-4 py-2 bg-[#FEFCE8] border border-[#FACC15]/30 text-[#92400E] text-xs font-semibold rounded-xl">
              {data?.marksRecovered} marks recovered
            </span>
            <span className="px-4 py-2 border-2 border-dashed border-[#E5E7EB] bg-[#FEFCE8] text-xs font-bold rounded-xl">
              Credits: {data?.creditsBalance ?? 0}
            </span>
          </div>
        )}
      </div>
    </StudentDashboardLayout>
  )
}
