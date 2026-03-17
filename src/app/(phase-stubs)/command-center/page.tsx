import { ComingSoonPage } from '@/components/ComingSoonPage'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Command Center — 99Plus' }

export default function CommandCenterPage() {
  return (
    <ComingSoonPage
      title="Command Center"
      subtitle="Your mission control dashboard — score trends, mark-leak heatmap, and drill recommendations."
      phase="2"
      icon={<svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="#6366F1" strokeWidth="1.5"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>}
      features={["Distance-to-Seat heatmap matrix","Mark leak severity bars","Per-subject drill recommendations","Weekly score trend graph"]}
    />
  )
}
