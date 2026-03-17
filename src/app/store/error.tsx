'use client'

export default function StoreError({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <div className="flex-1 flex items-center justify-center min-h-screen" style={{ background: '#F8FAFC' }}>
      <div className="text-center p-8 max-w-sm">
        <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{ background: '#FEF2F2' }}>
          <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="#EF4444" strokeWidth="1.5">
            <path d="M12 9v4M12 17h.01" strokeLinecap="round"/>
            <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" strokeLinejoin="round"/>
          </svg>
        </div>
        <h2 className="text-lg font-bold mb-1" style={{ color: '#0F172A' }}>Store failed to load</h2>
        <p className="text-sm mb-5" style={{ color: '#9CA3AF' }}>{error.message || 'An unexpected error occurred.'}</p>
        <button onClick={reset}
          className="px-5 py-2.5 rounded-xl text-sm font-bold text-white"
          style={{ background: '#6366F1' }}
          aria-label="Retry loading the store">
          Try Again
        </button>
      </div>
    </div>
  )
}
