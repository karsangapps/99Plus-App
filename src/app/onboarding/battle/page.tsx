export default function BattlePlanPage() {
  return (
    <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center px-6">
      <div className="max-w-md w-full text-center">

        <div className="w-16 h-16 rounded-[20px] bg-[#6366F1]/10 flex items-center justify-center mx-auto mb-6">
          <svg className="w-8 h-8 text-[#6366F1]" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
          </svg>
        </div>

        <h1 className="text-2xl font-bold text-[#0F172A] tracking-tight">
          Welcome to your Battle Plan
        </h1>
        <p className="text-[#6B7280] mt-3 text-base leading-relaxed">
          Your seats are locked. The Battle Plan engine is coming soon — it will map your score gaps and prescribe surgical drills.
        </p>

        <div className="mt-8 rounded-[12px] bg-white border border-[#E5E7EB] px-6 py-5 text-left"
          style={{ boxShadow: '0px 4px 8px rgba(0,0,0,0.04)' }}>
          <p className="text-xs font-semibold text-[#9CA3AF] uppercase tracking-widest mb-3">
            Coming Next
          </p>
          <ul className="space-y-2.5">
            {[
              'NTA Mock Simulator',
              'Mark-Leak Diagnosis',
              'Surgical Drill Queue',
              'Distance-to-Seat Heatmap',
            ].map((item) => (
              <li key={item} className="flex items-center gap-3 text-sm text-[#374151]">
                <span className="w-1.5 h-1.5 rounded-full bg-[#6366F1] flex-shrink-0" />
                {item}
              </li>
            ))}
          </ul>
        </div>

      </div>
    </div>
  )
}
