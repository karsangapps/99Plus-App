import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: '404 — 99Plus' }

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: '#F8FAFC' }}>
      <div className="text-center px-6 max-w-sm">
        <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6"
          style={{ background: '#EEF2FF' }}>
          <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="#6366F1" strokeWidth="1.5">
            <path d="M12 9v4M12 17h.01" strokeLinecap="round" />
            <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <p className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: '#6366F1' }}>
          99Plus
        </p>
        <h1 className="text-2xl font-extrabold mb-2" style={{ color: '#0F172A' }}>
          Page Not Found
        </h1>
        <p className="text-sm mb-6" style={{ color: '#9CA3AF' }}>
          This page doesn&apos;t exist yet — it may be part of an upcoming phase.
        </p>
        <Link href="/"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white transition-all hover:shadow-md"
          style={{ background: '#6366F1' }}>
          ← Back to Home
        </Link>
      </div>
    </div>
  )
}
