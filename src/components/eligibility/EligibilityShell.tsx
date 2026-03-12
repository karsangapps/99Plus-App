import { EligibilityStepper } from './EligibilityStepper'

type Props = {
  children: React.ReactNode
}

export function EligibilityShell({ children }: Props) {
  return (
    <div className="min-h-screen bg-[#F8FAFC]" style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M30 5 L52 17.5 L52 42.5 L30 55 L8 42.5 L8 17.5 Z' fill='none' stroke='%236366F1' stroke-width='0.5' opacity='0.07'/%3E%3C/svg%3E\")", backgroundSize: '60px 60px' }}>

      {/* Sticky header */}
      <div className="sticky top-0 z-30 bg-white/80 backdrop-blur-xl border-b border-[#E5E7EB]"
        style={{ boxShadow: '0px 2px 8px rgba(0,0,0,0.04)' }}>
        <div className="max-w-5xl mx-auto px-6 lg:px-8 py-5 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-[12px] bg-[#059669]/10 flex items-center justify-center"
              style={{ animation: 'shieldPulse 2.5s ease-in-out infinite' }}>
              <svg className="w-5 h-5 text-[#059669]" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
              </svg>
            </div>
            <div>
              <h1 className="text-xl font-bold text-[#0F172A] tracking-tight">Eligibility Check</h1>
              <p className="text-xs text-[#9CA3AF] mt-0.5 font-mono tracking-widest">
                HARD-LOCK VERIFICATION PROTOCOL
              </p>
            </div>
          </div>
          <span className="px-3 py-1.5 rounded-full bg-[#059669]/10 text-[#059669] text-xs font-semibold flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#059669] animate-pulse" />
            Verification Active
          </span>
        </div>
      </div>

      {/* Page body */}
      <div className="max-w-5xl mx-auto px-6 lg:px-8 py-8">

        {/* Stepper */}
        <div className="mb-10">
          <EligibilityStepper active="eligibility" />
        </div>

        {children}
      </div>

      <style>{`
        @keyframes shieldPulse {
          0%, 100% { filter: drop-shadow(0 0 4px rgba(5,150,105,0.2)); }
          50%       { filter: drop-shadow(0 0 10px rgba(5,150,105,0.5)); }
        }
      `}</style>
    </div>
  )
}
