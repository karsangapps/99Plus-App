'use client'

import { useEffect, useState } from 'react'
import { StudentDashboardLayout } from '@/components/layout/StudentDashboardLayout'
import type { CommandCenterData } from '@/app/api/command-center/route'

function SkeletonStat() {
  return (
    <div className="bg-white rounded-[12px] border border-[#E5E7EB] p-5 animate-pulse">
      <div className="h-4 w-24 bg-[#E5E7EB] rounded mb-3" />
      <div className="h-8 w-16 bg-[#E5E7EB] rounded" />
    </div>
  )
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { bg: string; text: string; label: string }> = {
    safe: { bg: 'bg-[#059669]', text: 'text-white', label: 'SAFE' },
    possible: { bg: 'bg-[#34D399]', text: 'text-white', label: 'POSSIBLE' },
    close: { bg: 'bg-[#FACC15]', text: 'text-[#0F172A]', label: 'CLOSE' },
    reach: { bg: 'bg-[#EF4444]', text: 'text-white', label: 'REACH' }
  }
  const s = map[status.toLowerCase()] ?? map.reach
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold ${s.bg} ${s.text}`}>
      {s.label}
    </span>
  )
}

export default function CommandCenterClient() {
  const [data, setData] = useState<CommandCenterData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/command-center')
      .then((r) => r.json())
      .then((json) => {
        if (json.ok) setData(json.data)
        else setError(json.error ?? 'Failed to load')
      })
      .catch(() => setError('Failed to load'))
      .finally(() => setLoading(false))
  }, [])

  return (
    <StudentDashboardLayout
      title="Command Center"
      subtitle={data ? 'Surgical Intelligence refreshed' : 'Loading…'}
    >
      <div className="p-4 sm:p-6 lg:p-8 overflow-y-auto">
        {error && (
          <div className="mb-6 rounded-[12px] bg-[#FEF2F2] border border-[#EF4444]/20 px-4 py-3 text-sm text-[#EF4444]">
            {error}
          </div>
        )}

        {loading ? (
          <>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-5 mb-6 lg:mb-8">
              {[1, 2, 3, 4].map((i) => (
                <SkeletonStat key={i} />
              ))}
            </div>
            <div className="bg-white rounded-[12px] border border-[#E5E7EB] p-6 animate-pulse">
              <div className="h-6 w-48 bg-[#E5E7EB] rounded mb-4" />
              <div className="h-32 bg-[#F1F5F9] rounded" />
            </div>
          </>
        ) : data ? (
          <>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-5 mb-6 lg:mb-8">
              <div className="bg-white rounded-[12px] border border-[#E5E7EB] p-5 hover:shadow-lg hover:shadow-[#6366F1]/5 transition-all">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-medium text-[#9CA3AF] uppercase tracking-wider">Predicted Percentile</span>
                  <div className="w-8 h-8 rounded-lg bg-[#6366F1]/10 flex items-center justify-center">
                    <span className="text-[#6366F1] text-sm font-bold">%</span>
                  </div>
                </div>
                <div className="flex items-end gap-2">
                  <span className="text-2xl lg:text-3xl font-extrabold text-[#0F172A]">{data.stats.predictedPercentile.toFixed(1) || '—'}</span>
                </div>
                <div className="mt-2 h-1.5 bg-[#F1F5F9] rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-[#6366F1] to-[#818CF8] rounded-full" style={{ width: `${Math.min(100, data.stats.predictedPercentile)}%` }} />
                </div>
              </div>

              <div className="bg-white rounded-[12px] border border-[#E5E7EB] p-5 hover:shadow-lg hover:shadow-[#059669]/5 transition-all">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-medium text-[#9CA3AF] uppercase tracking-wider">Leaks Sealed</span>
                  <div className="w-8 h-8 rounded-lg bg-[#059669]/10 flex items-center justify-center">
                    <span className="text-[#059669] text-sm">✓</span>
                  </div>
                </div>
                <div className="flex items-end gap-2">
                  <span className="text-2xl lg:text-3xl font-extrabold text-[#0F172A]">{data.stats.leaksSealed}</span>
                  <span className="text-sm text-[#9CA3AF] mb-1">of {data.stats.leaksTotal} critical</span>
                </div>
                <div className="mt-2 h-1.5 bg-[#F1F5F9] rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-[#059669] to-[#34D399] rounded-full" style={{ width: data.stats.leaksTotal ? `${(data.stats.leaksSealed / data.stats.leaksTotal) * 100}%` : '0%' }} />
                </div>
              </div>

              <div className="bg-white rounded-[12px] border border-[#E5E7EB] p-5 hover:shadow-lg hover:shadow-[#FACC15]/5 transition-all">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-medium text-[#9CA3AF] uppercase tracking-wider">Drills Completed</span>
                  <div className="w-8 h-8 rounded-lg bg-[#FACC15]/10 flex items-center justify-center">
                    <span className="text-[#FACC15] text-sm">◆</span>
                  </div>
                </div>
                <div className="flex items-end gap-2">
                  <span className="text-2xl lg:text-3xl font-extrabold text-[#0F172A]">{data.stats.drillsCompleted}</span>
                  <span className="text-sm text-[#9CA3AF] mb-1">sessions</span>
                </div>
              </div>

              <div className="bg-white rounded-[12px] border border-[#E5E7EB] p-5 hover:shadow-lg hover:shadow-[#6366F1]/5 transition-all">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-medium text-[#9CA3AF] uppercase tracking-wider">Credits</span>
                  <div className="w-8 h-8 rounded-lg bg-[#FACC15]/10 flex items-center justify-center">
                    <span className="text-[#FACC15] text-sm">¢</span>
                  </div>
                </div>
                <div className="flex items-end gap-2">
                  <span className="text-2xl lg:text-3xl font-extrabold text-[#0F172A]">{data.stats.creditsBalance}</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
              <div className="lg:col-span-2 bg-white rounded-[12px] border border-[#E5E7EB] overflow-hidden">
                <div className="px-6 py-5 border-b border-[#E5E7EB]">
                  <h2 className="text-base font-bold text-[#0F172A]">College Heatmap Matrix</h2>
                  <p className="text-xs text-[#9CA3AF] mt-0.5">Admission probability based on projected scores</p>
                </div>
                <div className="p-4 overflow-x-auto">
                  {data.heatmap.length === 0 ? (
                    <p className="text-sm text-[#9CA3AF] py-8 text-center">No targets yet. Set your dream target and take a mock to see your heatmap.</p>
                  ) : (
                    <table className="w-full min-w-[400px]">
                      <thead>
                        <tr className="text-xs font-semibold text-[#9CA3AF] uppercase tracking-wider">
                          <th className="text-left pb-4">College</th>
                          <th className="text-center pb-4">Gap</th>
                          <th className="text-center pb-4">Status</th>
                          <th className="text-right pb-4">Prob</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#F1F5F9]">
                        {data.heatmap.slice(0, 10).map((row, i) => (
                          <tr key={i} className="hover:bg-[#F8FAFC] transition-colors">
                            <td className="py-4">
                              <div>
                                <p className="text-sm font-semibold text-[#0F172A]">{row.targetName}</p>
                                <p className="text-xs text-[#9CA3AF]">{row.program}</p>
                              </div>
                            </td>
                            <td className="text-center">
                              <span className={`text-xs font-bold ${row.scoreGap >= 0 ? 'text-[#059669]' : 'text-[#EF4444]'}`}>
                                {row.scoreGap >= 0 ? '+' : ''}{row.scoreGap.toFixed(1)}
                              </span>
                            </td>
                            <td className="text-center">
                              <StatusBadge status={row.seatStatus} />
                            </td>
                            <td className="text-right">
                              <span className="text-sm font-semibold">{row.probabilityPct}%</span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              </div>

              <div className="bg-white rounded-[12px] border border-[#E5E7EB] overflow-hidden">
                <div className="px-6 py-5 border-b border-[#E5E7EB]">
                  <h2 className="text-base font-bold text-[#0F172A]">Subject Proficiency</h2>
                  <p className="text-xs text-[#9CA3AF] mt-0.5">Accuracy by subject from mocks</p>
                </div>
                <div className="p-4 space-y-4">
                  {data.proficiency.length === 0 ? (
                    <p className="text-sm text-[#9CA3AF] py-4 text-center">No mock data yet</p>
                  ) : (
                    data.proficiency.slice(0, 6).map((p, i) => (
                      <div key={i}>
                        <div className="flex justify-between text-xs mb-1">
                          <span className="font-medium text-[#0F172A]">{p.subject}</span>
                          <span className="text-[#9CA3AF]">{p.accuracyPct}% ({p.attemptedCount} q)</span>
                        </div>
                        <div className="h-2 bg-[#F1F5F9] rounded-full overflow-hidden">
                          <div className="h-full bg-[#6366F1] rounded-full" style={{ width: `${p.accuracyPct}%` }} />
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            <div className="bg-white rounded-[12px] border border-[#E5E7EB] overflow-hidden">
              <div className="px-6 py-5 border-b border-[#E5E7EB]">
                <h2 className="text-base font-bold text-[#0F172A]">Mastery Trend</h2>
                <p className="text-xs text-[#9CA3AF] mt-0.5">Simulated percentile over attempts</p>
              </div>
              <div className="p-6">
                {data.masteryTrend.length === 0 ? (
                  <p className="text-sm text-[#9CA3AF] py-4 text-center">Complete mocks to see your trend</p>
                ) : (
                  <div className="flex flex-wrap gap-4">
                    {[...data.masteryTrend].reverse().map((m, i) => (
                      <div key={i} className="flex flex-col items-center">
                        <span className="text-2xl font-bold text-[#6366F1]">{m.simulatedPercentile.toFixed(1)}</span>
                        <span className="text-xs text-[#9CA3AF]">Attempt {m.attemptNumber}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </>
        ) : null}
      </div>
    </StudentDashboardLayout>
  )
}
