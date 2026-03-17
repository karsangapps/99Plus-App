import { ComingSoonPage } from '@/components/ComingSoonPage'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Analytics — 99Plus' }

export default function AnalyticsPage() {
  return (
    <ComingSoonPage
      title="Analytics Dashboard"
      subtitle="Full score trajectory, percentile trends, and cohort comparison."
      phase="3"
      icon={<svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="#6366F1" strokeWidth="1.5"><path d="M3 3v18h18" strokeLinecap="round" strokeLinejoin="round"/><path d="M7 16l4-6 4 4 4-8" strokeLinecap="round" strokeLinejoin="round"/></svg>}
      features={["Percentile trend graph","Time-per-question heatmap","Subject mastery by chapter","Cohort score comparison","Guessing risk indicator"]}
    />
  )
}
