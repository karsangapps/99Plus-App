'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

type MockTest = {
  id: string; title: string; subject: string
  duration_seconds: number; total_questions: number
  marks_correct: number; marks_wrong: number
}

export default function PreTestClient({ mockTests }: { mockTests: MockTest[] }) {
  const router = useRouter()
  const [selectedTest, setSelectedTest] = useState(mockTests[0]?.id ?? '')
  const [language, setLanguage] = useState<'en' | 'hi'>('en')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleStart() {
    if (!selectedTest) { setError('Please select a mock test.'); return }
    setLoading(true); setError(null)
    try {
      const res = await fetch('/api/mock-attempts/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mock_test_id: selectedTest, language }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error ?? 'Failed to start mock.'); return }
      router.push(`/nta-test/${data.attempt_id}`)
    } catch { setError('Network error. Please retry.') }
    finally { setLoading(false) }
  }

  const selected = mockTests.find(t => t.id === selectedTest)

  return (
    <div className="min-h-dvh flex flex-col" style={{ background: '#F8FAFC' }}>
      <header className="border-b px-4 sm:px-8 py-4 flex items-center gap-3 bg-white" style={{ borderColor: '#E5E7EB' }}>
        <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: '#6366F1' }}>
          <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
            <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2" strokeLinecap="round"/>
            <rect x="9" y="3" width="6" height="4" rx="1"/>
          </svg>
        </div>
        <div>
          <span className="font-extrabold text-sm" style={{ color: '#0F172A' }}>99<span style={{ color: '#6366F1' }}>Plus</span></span>
          <span className="block text-[10px] font-bold uppercase tracking-widest" style={{ color: '#6366F1' }}>CUET 2026</span>
        </div>
        <Link href="/command-center" className="ml-auto text-sm font-medium hover:underline" style={{ color: '#6366F1' }}>← Dashboard</Link>
      </header>

      <main className="flex-1 flex items-start justify-center p-4 sm:p-8">
        <div className="w-full max-w-xl space-y-4">
          <div>
            <h2 className="text-2xl font-extrabold tracking-tight" style={{ color: '#0F172A' }}>Pre-Test Setup</h2>
            <p className="text-sm mt-1" style={{ color: '#6B7280' }}>Configure your CUET 2026 mock before entering the NTA-Mirror engine.</p>
          </div>

          {mockTests.length === 0 ? (
            <div className="bg-white rounded-2xl border p-6 text-center" style={{ borderColor: '#E5E7EB' }}>
              <p className="text-sm" style={{ color: '#9CA3AF' }}>No mock tests available yet.</p>
              <Link href="/command-center" className="mt-4 inline-block text-sm font-bold" style={{ color: '#6366F1' }}>Return to Dashboard</Link>
            </div>
          ) : (
            <>
              <div className="bg-white rounded-2xl border p-5" style={{ borderColor: '#E5E7EB' }}>
                <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: '#9CA3AF' }}>SELECT MOCK TEST</p>
                {mockTests.map(t => (
                  <label key={t.id} className="flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all mb-2"
                    style={{ borderColor: selectedTest === t.id ? '#6366F1' : '#E5E7EB', background: selectedTest === t.id ? '#EEF2FF' : 'white' }}>
                    <input type="radio" name="mock_test" value={t.id} checked={selectedTest === t.id}
                      onChange={() => setSelectedTest(t.id)} className="mt-0.5 accent-indigo-500" />
                    <div>
                      <p className="text-sm font-semibold" style={{ color: '#0F172A' }}>{t.title}</p>
                      <p className="text-xs mt-0.5" style={{ color: '#6B7280' }}>
                        {t.subject} · {Math.round(t.duration_seconds / 60)} min · {t.total_questions} Qs · +{t.marks_correct}/−{t.marks_wrong}
                      </p>
                    </div>
                  </label>
                ))}
              </div>

              <div className="bg-white rounded-2xl border p-5" style={{ borderColor: '#E5E7EB' }}>
                <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: '#9CA3AF' }}>LANGUAGE</p>
                <div className="flex gap-3">
                  {(['en', 'hi'] as const).map(lang => (
                    <button key={lang} onClick={() => setLanguage(lang)} aria-pressed={language === lang}
                      className="flex-1 py-2.5 rounded-xl border text-sm font-bold transition-all"
                      style={{ borderColor: language === lang ? '#6366F1' : '#E5E7EB', background: language === lang ? '#6366F1' : 'white', color: language === lang ? 'white' : '#374151' }}>
                      {lang === 'en' ? 'English' : 'हिन्दी'}
                    </button>
                  ))}
                </div>
              </div>

              {selected && (
                <div className="rounded-2xl p-5" style={{ background: '#EEF2FF' }}>
                  <p className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: '#6366F1' }}>TEST SUMMARY</p>
                  <div className="grid grid-cols-3 gap-4 text-center">
                    {[
                      [Math.round(selected.duration_seconds / 60), 'Minutes'],
                      [selected.total_questions, 'Questions'],
                      [`+${selected.marks_correct}/−${selected.marks_wrong}`, 'Marking'],
                    ].map(([val, lbl]) => (
                      <div key={String(lbl)}>
                        <p className="text-xl font-extrabold" style={{ color: '#0F172A' }}>{val}</p>
                        <p className="text-xs" style={{ color: '#6B7280' }}>{lbl}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {error && <p className="text-sm font-medium px-1" style={{ color: '#EF4444' }} role="alert">{error}</p>}

              <button onClick={handleStart} disabled={loading || !selectedTest}
                className="w-full py-3.5 rounded-2xl text-sm font-extrabold uppercase tracking-widest text-white transition-all disabled:opacity-50"
                style={{ background: '#6366F1' }} aria-label="Start NTA mock test">
                {loading ? 'Starting…' : 'Enter NTA-Mirror Engine →'}
              </button>
            </>
          )}
        </div>
      </main>
    </div>
  )
}
