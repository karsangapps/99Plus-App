import { ComingSoonPage } from '@/components/ComingSoonPage'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Diagnosis — 99Plus' }

export default function DiagnosisPage() {
  return (
    <ComingSoonPage
      title="Diagnosis Engine"
      subtitle="Chapter-level mark leak analysis mapped to NCERT pages after every mock."
      phase="2"
      icon={<svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="#6366F1" strokeWidth="1.5"><path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2" strokeLinecap="round"/><path d="M12 11v6M9 14h6" strokeLinecap="round"/></svg>}
      features={["NCERT chapter-level leak detection","Severity scoring (conceptual/speed/silly)","Surgical drill auto-generation","Mark recovery probability"]}
    />
  )
}
