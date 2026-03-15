import { ComingSoonPage } from '@/components/ComingSoonPage'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Surgical Drill — 99Plus' }

export default function DrillPage() {
  return (
    <ComingSoonPage
      title="Surgical Drill Hub"
      subtitle="4-mode drill system targeting your exact NCERT chapter-level mark leaks."
      phase="3"
      icon={<svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="#6366F1" strokeWidth="1.5"><circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M4.22 4.22l2.12 2.12M17.66 17.66l2.12 2.12M2 12h3M19 12h3M4.22 19.78l2.12-2.12M17.66 6.34l2.12-2.12" strokeLinecap="round"/></svg>}
      features={["Mode A: Gap-Remedy (Conceptual Bridge)","Mode B: Speed Drill","Mode C: PYQ Archive","Mode D: Full Syllabus Sweep","One-Line Logic Fixes after every question"]}
    />
  )
}
