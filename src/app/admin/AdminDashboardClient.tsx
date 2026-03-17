'use client'

import { useEffect, useState } from 'react'
import { AdminSidebar } from '@/components/admin/AdminSidebar'
import type { AdminDashboardData } from '@/app/api/admin/dashboard/route'

function SkeletonCard() {
  return <div className="bg-white rounded-[12px] border border-[#E5E7EB] p-5 animate-pulse h-48" />
}

export default function AdminDashboardClient() {
  const [data, setData] = useState<AdminDashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/admin/dashboard')
      .then((r) => r.json())
      .then((json) => {
        if (json.ok) setData(json.data)
        else setError(json.error ?? 'Failed to load')
      })
      .catch(() => setError('Failed to load'))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="flex min-h-screen bg-[#F8FAFC]">
      <AdminSidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="flex-shrink-0 bg-white border-b border-[#E5E7EB] px-6 py-3.5 flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold tracking-tight text-[#0F172A]">99Plus Admin: Operations Control</h1>
            <p className="text-xs mt-0.5 text-[#9CA3AF]">Founder&apos;s Command Hub · Real-time platform oversight</p>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium bg-[#ECFDF5] text-[#059669]">
            <span className="w-2 h-2 rounded-full bg-[#059669] animate-pulse" />
            All Systems Operational
          </div>
        </header>
        <main className="flex-1 overflow-y-auto p-6 space-y-6">
          {error && (
            <div className="rounded-[12px] bg-[#FEF2F2] border border-[#EF4444]/20 px-4 py-3 text-sm text-[#EF4444]">
              {error}
            </div>
          )}

          {loading ? (
            <>
              <SkeletonCard />
              <div className="grid grid-cols-2 gap-6">
                <SkeletonCard />
                <SkeletonCard />
              </div>
            </>
          ) : data ? (
            <>
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                <div className="lg:col-span-7 bg-white rounded-[12px] border border-[#E5E7EB] p-5">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-7 h-7 rounded-lg bg-[#EEF2FF] flex items-center justify-center text-[#6366F1]">★</div>
                    <h3 className="text-sm font-bold text-[#0F172A]">North Star: Average Score Improvement</h3>
                  </div>
                  <p className="text-[11px] text-[#9CA3AF] mb-4">Cohort-wide ASI per student across all mock cycles</p>
                  <div className="flex items-center gap-6 mb-4">
                    <div>
                      <span className="text-[10px] uppercase tracking-wider font-semibold text-[#9CA3AF]">Current ASI</span>
                      <p className="text-xl font-black text-[#6366F1]">+{data.northStar.currentAsi.toFixed(1)}</p>
                    </div>
                    <div>
                      <span className="text-[10px] uppercase tracking-wider font-semibold text-[#9CA3AF]">Δ This Week</span>
                      <p className="text-sm font-bold text-[#059669]">+{data.northStar.deltaThisWeek.toFixed(1)}</p>
                    </div>
                    <div>
                      <span className="text-[10px] uppercase tracking-wider font-semibold text-[#9CA3AF]">Cohort Size</span>
                      <p className="text-sm font-bold text-[#0F172A]">{data.northStar.cohortSize.toLocaleString()}</p>
                    </div>
                  </div>
                  <div className="h-24 bg-[#F8FAFC] rounded-lg flex items-center justify-center text-[#9CA3AF] text-sm">
                    Target: +{data.northStar.targetAsi} ASI
                  </div>
                </div>

                <div className="lg:col-span-5 bg-white rounded-[12px] border border-[#E5E7EB] p-5">
                  <div className="flex items-center gap-2 mb-5">
                    <div className="w-7 h-7 rounded-lg bg-[#ECFDF5] flex items-center justify-center text-[#059669]">◆</div>
                    <h3 className="text-sm font-bold text-[#0F172A]">Seat Success Funnel</h3>
                  </div>
                  <div className="space-y-2">
                    <div className="rounded-xl p-3.5 text-center bg-gradient-to-br from-[#EEF2FF] to-[#E0E7FF]">
                      <p className="text-[10px] uppercase tracking-widest font-semibold text-[#6366F1]">Total Signups</p>
                      <p className="text-2xl font-black text-[#0F172A]">{data.funnel.signups.toLocaleString()}</p>
                    </div>
                    <div className="flex justify-center"><span className="text-[#6366F1] text-xs">↓</span></div>
                    <div className="rounded-xl p-3.5 text-center mx-4 bg-gradient-to-br from-[#F0FDF4] to-[#DCFCE7]">
                      <p className="text-[10px] uppercase tracking-widest font-semibold text-[#059669]">Baseline Completed</p>
                      <p className="text-2xl font-black text-[#0F172A]">{data.funnel.baselineCompleted.toLocaleString()}</p>
                    </div>
                    <div className="flex justify-center"><span className="text-[#059669] text-xs">↓</span></div>
                    <div className="rounded-xl p-3.5 text-center mx-8 bg-gradient-to-br from-[#FFFBEB] to-[#FEF3C7]">
                      <p className="text-[10px] uppercase tracking-widest font-semibold text-[#92400E]">Active in Drills</p>
                      <p className="text-2xl font-black text-[#0F172A]">{data.funnel.activeInDrills.toLocaleString()}</p>
                    </div>
                    <div className="flex justify-center"><span className="text-[#FACC15] text-xs">↓</span></div>
                    <div className="rounded-xl p-3.5 text-center mx-12 bg-gradient-to-br from-[#0F172A] to-[#1E293B]">
                      <p className="text-[10px] uppercase tracking-widest font-semibold text-white/70">Projected Seat Secured</p>
                      <p className="text-2xl font-black text-white">{data.funnel.projectedSecured.toLocaleString()}</p>
                    </div>
                  </div>
                  <div className="mt-4 pt-3 border-t border-[#E5E7EB] flex justify-between">
                    <span className="text-[10px] font-semibold text-[#9CA3AF]">Overall Conversion</span>
                    <span className="text-sm font-black text-[#059669]">{data.funnel.conversionPct}%</span>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-[12px] border border-[#E5E7EB] p-5">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-7 h-7 rounded-lg bg-[#FEF2F2] flex items-center justify-center text-[#EF4444]">🔥</div>
                  <div>
                    <h3 className="text-sm font-bold text-[#0F172A]">Cohort Mark Leak Heatmap</h3>
                    <p className="text-[10px] text-[#9CA3AF]">NCERT chapters · Red = &gt;50% failure rate</p>
                  </div>
                </div>
                <div className="flex gap-2 mb-3 text-[10px] font-medium text-[#9CA3AF]">
                  <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-[#DCFCE7]" />Safe</span>
                  <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-[#FEF9C3]" />At Risk</span>
                  <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-[#FEE2E2]" />Critical</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-2">
                  {data.heatmap.length === 0 ? (
                    <p className="col-span-full text-sm text-[#9CA3AF] py-8 text-center">No mark leak data yet. Students need to complete mocks.</p>
                  ) : (
                    data.heatmap.slice(0, 12).map((cell, i) => (
                      <div
                        key={i}
                        className={`p-2.5 text-center rounded-lg border transition-all ${
                          cell.severity === 'critical' ? 'bg-[#FEE2E2] border-[#EF4444]/30' : cell.severity === 'at_risk' ? 'bg-[#FEF9C3] border-[#FACC15]/30' : 'bg-[#DCFCE7] border-[#059669]/30'
                        }`}
                      >
                        <p className="text-[9px] font-bold uppercase tracking-wider text-[#6B7280]">{cell.subject}</p>
                        <p className="text-[11px] font-bold mt-1 text-[#0F172A] truncate" title={cell.chapterTitle}>{cell.chapterTitle}</p>
                        <p className="text-[10px] font-bold mt-0.5">{cell.failRatePct}% fail</p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </>
          ) : null}
        </main>
      </div>
    </div>
  )
}
