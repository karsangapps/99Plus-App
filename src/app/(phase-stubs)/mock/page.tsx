import { ComingSoonPage } from '@/components/ComingSoonPage'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'NTA Test — 99Plus' }

export default function MockPage() {
  return (
    <ComingSoonPage
      title="NTA-Mirror Test Engine"
      subtitle="Pixel-perfect TCS iON interface replica with Chaos Mode™ lag simulation."
      phase="2"
      icon={<svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="#6366F1" strokeWidth="1.5"><rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8M12 17v4" strokeLinecap="round"/></svg>}
      features={["5-state question palette","Section-wise timer","Countdown & auto-submit","Chaos Mode™ lag simulation","Score normalization (z-score)"]}
    />
  )
}
