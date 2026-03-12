'use client'

import { useMemo, useState } from 'react'

type Stream = 'Science' | 'Commerce' | 'Humanities'

const UNIVERSITY_OPTIONS = [
  'University of Delhi (DU)',
  'Jawaharlal Nehru University (JNU)',
  'Banaras Hindu University (BHU)',
  'Jamia Millia Islamia',
  'Aligarh Muslim University (AMU)',
  'Allahabad University',
  'Central University of Hyderabad'
] as const

const COLLEGE_OPTIONS = [
  'Hindu College',
  "St. Stephen's College",
  'Miranda House',
  'Shri Ram College of Commerce',
  'Lady Shri Ram College',
  'Hansraj College',
  'Kirori Mal College',
  'Ramjas College'
] as const

const COURSE_OPTIONS = [
  'B.Sc (Hons.) Physics',
  'B.Sc (Hons.) Chemistry',
  'B.Sc (Hons.) Mathematics',
  'B.A (Hons.) Economics',
  'B.A (Hons.) English',
  'B.Com (Hons.)',
  'B.A (Hons.) Political Science',
  'B.A (Hons.) History'
] as const

export default function OnboardingDreamTargetClient() {
  const [stream, setStream] = useState<Stream>('Science')
  const [targetUniversity, setTargetUniversity] = useState<string>(
    UNIVERSITY_OPTIONS[0]
  )
  const [dreamCollege, setDreamCollege] = useState<string>('')
  const [dreamCourse, setDreamCourse] = useState<string>('')

  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [saved, setSaved] = useState(false)

  const canSubmit = useMemo(() => {
    return (
      stream.length > 0 &&
      targetUniversity.length > 0 &&
      dreamCollege.length > 0 &&
      dreamCourse.length > 0
    )
  }, [dreamCollege.length, dreamCourse.length, stream.length, targetUniversity])

  async function onSubmit() {
    if (!canSubmit || isSaving) return
    setError(null)
    setSaved(false)
    setIsSaving(true)

    try {
      const res = await fetch('/api/student-profiles/dream-target', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          class12Stream: stream,
          targetUniversity,
          dreamCollege,
          dreamCourse
        })
      })

      const json = (await res.json()) as { ok?: boolean; error?: string }
      if (!res.ok || !json.ok) {
        throw new Error(json.error || 'Failed to save')
      }

      setSaved(true)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to save')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="min-h-dvh pattern-bg">
      <div className="flex min-h-dvh">
        {/* Sidebar (hidden on mobile) */}
        <aside className="hidden lg:flex w-64 shrink-0 border-r border-[#E5E7EB] bg-white shadow-sm">
          <div className="flex w-full flex-col">
            <div className="p-6 border-b border-[#E5E7EB]">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-[#EEF2FF] flex items-center justify-center">
                  <div className="w-4 h-4 rounded bg-[#6366F1]" />
                </div>
                <span className="text-sm font-bold text-[#0F172A]">99Plus</span>
              </div>
            </div>

            <nav className="flex-1 px-4 py-6 space-y-2">
              <div className="flex items-center gap-3 px-4 py-3 rounded-[12px] text-sm font-medium text-[#0F172A] bg-[#6366F1] bg-opacity-10 border border-[#6366F1] border-opacity-30">
                <span className="text-[#6366F1]">◎</span>
                <span>Command Center</span>
              </div>
              <div className="flex items-center gap-3 px-4 py-3 rounded-[12px] text-sm font-medium text-[#9CA3AF]">
                <span>○</span>
                <span>Pre-Test</span>
              </div>
              <div className="flex items-center gap-3 px-4 py-3 rounded-[12px] text-sm font-medium text-[#9CA3AF]">
                <span>○</span>
                <span>NTA Test</span>
              </div>
              <div className="flex items-center gap-3 px-4 py-3 rounded-[12px] text-sm font-medium text-[#9CA3AF]">
                <span>○</span>
                <span>Diagnosis</span>
              </div>
              <div className="flex items-center gap-3 px-4 py-3 rounded-[12px] text-sm font-medium text-[#9CA3AF]">
                <span>○</span>
                <span>Surgical Drill</span>
              </div>
              <div className="flex items-center gap-3 px-4 py-3 rounded-[12px] text-sm font-medium text-[#9CA3AF]">
                <span>○</span>
                <span>Analytics</span>
              </div>
              <div className="flex items-center gap-3 px-4 py-3 rounded-[12px] text-sm font-medium text-[#9CA3AF]">
                <span>○</span>
                <span>Selection Hub</span>
              </div>
              <div className="flex items-center gap-3 px-4 py-3 rounded-[12px] text-sm font-medium text-[#9CA3AF]">
                <span>○</span>
                <span>Settings</span>
              </div>
            </nav>

            <div className="p-4 border-t border-[#E5E7EB]">
              <div
                className="flex items-center gap-3 px-4 py-3.5 rounded-2xl bg-[#F8FAFC] border border-[#E5E7EB]"
                style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}
              >
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#6366F1] to-[#FACC15] flex items-center justify-center shrink-0">
                  <span className="text-white text-sm font-bold">A</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-[#0F172A] truncate">
                    Aspirant
                  </p>
                  <p className="text-xs text-[#9CA3AF] truncate">
                    CUET 2026
                  </p>
                </div>
              </div>
            </div>
          </div>
        </aside>

        {/* Main */}
        <div className="flex-1 min-w-0">
          {/* Top bar */}
          <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-[#E5E7EB]">
            <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
              <div>
                <h1 className="text-lg font-bold text-[#0F172A] tracking-tight">
                  Command Center
                </h1>
                <p className="text-xs text-[#9CA3AF]">
                  Set your surgical target — Step 1 of 3
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-[#9CA3AF] hidden sm:inline">
                  CUET 2026
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#059669]/10 text-[#059669] text-xs font-semibold">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#059669] animate-pulse" />
                  Live
                </span>
              </div>
            </div>
          </header>

          <main className="max-w-4xl mx-auto px-6 py-8">
            {/* Progress Stepper */}
            <div className="fade-in-1 mb-10">
              <div className="flex items-center justify-center gap-0">
                <div className="flex items-center gap-2.5">
                  <div
                    className="w-9 h-9 rounded-full bg-[#6366F1] flex items-center justify-center shadow-md"
                    style={{ boxShadow: '0 4px 12px rgba(99,102,241,0.3)' }}
                  >
                    <span className="text-white text-xs font-bold">1</span>
                  </div>
                  <span className="text-sm font-semibold text-[#0F172A] hidden sm:inline">
                    Dream Target
                  </span>
                </div>
                <div className="w-12 sm:w-20 h-0.5 bg-[#E5E7EB] mx-2 rounded-full overflow-hidden" />
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-full bg-[#E5E7EB] flex items-center justify-center">
                    <span className="text-[#9CA3AF] text-xs font-bold">2</span>
                  </div>
                  <span className="text-sm font-medium text-[#9CA3AF] hidden sm:inline">
                    Eligibility
                  </span>
                </div>
                <div className="w-12 sm:w-20 h-0.5 bg-[#E5E7EB] mx-2 rounded-full" />
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-full bg-[#E5E7EB] flex items-center justify-center">
                    <span className="text-[#9CA3AF] text-xs font-bold">3</span>
                  </div>
                  <span className="text-sm font-medium text-[#9CA3AF] hidden sm:inline">
                    Confirm
                  </span>
                </div>
              </div>
            </div>

            {/* Hero */}
            <div className="fade-in-2 text-center mb-10">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#6366F1]/5 border border-[#6366F1]/15 mb-5">
                <span className="text-[#6366F1] text-xs">⌖</span>
                <span className="text-xs font-semibold text-[#6366F1] tracking-wide uppercase">
                  Surgical Selection Engine
                </span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0F172A] tracking-tight leading-tight mb-3">
                Where do you want to <span className="text-[#6366F1]">study</span>?
              </h2>
              <p className="text-sm sm:text-base text-[#9CA3AF] max-w-lg mx-auto leading-relaxed">
                Define your dream college and course. We&apos;ll reverse-engineer the
                exact score you need and build your surgical prep path.
              </p>
            </div>

            {/* Form card */}
            <section
              className="fade-in-3 bg-white rounded-[12px] border border-[#E5E7EB] p-6 sm:p-8 mb-6"
              style={{ boxShadow: '0px 4px 8px rgba(0,0,0,0.06)' }}
            >
              {/* Stream */}
              <div className="mb-7">
                <label className="flex items-center gap-2 text-sm font-semibold text-[#0F172A] mb-3">
                  <span className="w-6 h-6 rounded-md bg-[#6366F1]/10 flex items-center justify-center">
                    <span className="text-[#6366F1] text-xs">🎓</span>
                  </span>
                  Class 12 Stream
                </label>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {(['Science', 'Commerce', 'Humanities'] as const).map((s) => {
                    const active = s === stream
                    return (
                      <label
                        key={s}
                        className={[
                          'select-card cursor-pointer rounded-[12px] border-2 p-4 flex items-center gap-3',
                          active
                            ? 'border-[#6366F1] bg-[#6366F1]/5'
                            : 'border-[#E5E7EB] bg-white hover:border-[#6366F1]'
                        ].join(' ')}
                      >
                        <input
                          type="radio"
                          name="stream"
                          className="sr-only"
                          checked={active}
                          onChange={() => setStream(s)}
                        />
                        <div
                          className={[
                            'w-10 h-10 rounded-[10px] flex items-center justify-center shrink-0',
                            s === 'Science'
                              ? active
                                ? 'bg-[#6366F1]'
                                : 'bg-[#6366F1]/10'
                              : s === 'Commerce'
                                ? 'bg-[#059669]/10'
                                : 'bg-[#FACC15]/15'
                          ].join(' ')}
                        >
                          <span
                            className={[
                              'text-sm',
                              s === 'Science'
                                ? active
                                  ? 'text-white'
                                  : 'text-[#6366F1]'
                                : s === 'Commerce'
                                  ? 'text-[#059669]'
                                  : 'text-[#D97706]'
                            ].join(' ')}
                          >
                            {s === 'Science'
                              ? '⚗'
                              : s === 'Commerce'
                                ? '📈'
                                : '📚'}
                          </span>
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-[#0F172A]">{s}</p>
                          <p className="text-xs text-[#9CA3AF]">
                            {s === 'Science'
                              ? 'PCM / PCB'
                              : s === 'Commerce'
                                ? 'Accounts / Eco'
                                : 'History / Pol Sci'}
                          </p>
                        </div>
                        {active ? (
                          <span className="ml-auto text-[#6366F1]">✔</span>
                        ) : null}
                      </label>
                    )
                  })}
                </div>
              </div>

              <div className="border-t border-dashed border-[#E5E7EB] my-7" />

              {/* University */}
              <div className="mb-7">
                <label className="flex items-center gap-2 text-sm font-semibold text-[#0F172A] mb-3">
                  <span className="w-6 h-6 rounded-md bg-[#059669]/10 flex items-center justify-center">
                    <span className="text-[#059669] text-xs">🏛</span>
                  </span>
                  Target University
                </label>
                <div className="relative">
                  <select
                    value={targetUniversity}
                    onChange={(e) => setTargetUniversity(e.target.value)}
                    className="w-full rounded-[12px] border-2 border-[#E5E7EB] bg-white px-4 py-3.5 pr-10 text-sm text-[#0F172A] font-medium focus:outline-none focus:border-[#6366F1] transition-all cursor-pointer"
                  >
                    {UNIVERSITY_OPTIONS.map((u) => (
                      <option key={u} value={u}>
                        {u}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="mt-2.5 flex items-center gap-2 px-1">
                  <span className="text-[#6366F1] text-xs">i</span>
                  <span className="text-xs text-[#9CA3AF]">
                    North Campus colleges require higher CUET percentiles
                  </span>
                </div>
              </div>

              {/* College + Course */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="flex items-center gap-2 text-sm font-semibold text-[#0F172A] mb-3">
                    <span className="w-6 h-6 rounded-md bg-[#FACC15]/15 flex items-center justify-center">
                      <span className="text-[#D97706] text-xs">🏫</span>
                    </span>
                    Dream College
                  </label>
                  <select
                    value={dreamCollege}
                    onChange={(e) => setDreamCollege(e.target.value)}
                    className="w-full rounded-[12px] border-2 border-[#E5E7EB] bg-white px-4 py-3.5 pr-10 text-sm text-[#0F172A] font-medium focus:outline-none focus:border-[#6366F1] transition-all cursor-pointer"
                  >
                    <option value="" disabled>
                      Choose college...
                    </option>
                    {COLLEGE_OPTIONS.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="flex items-center gap-2 text-sm font-semibold text-[#0F172A] mb-3">
                    <span className="w-6 h-6 rounded-md bg-[#EF4444]/10 flex items-center justify-center">
                      <span className="text-[#EF4444] text-xs">📜</span>
                    </span>
                    Dream Course
                  </label>
                  <select
                    value={dreamCourse}
                    onChange={(e) => setDreamCourse(e.target.value)}
                    className="w-full rounded-[12px] border-2 border-[#E5E7EB] bg-white px-4 py-3.5 pr-10 text-sm text-[#0F172A] font-medium focus:outline-none focus:border-[#6366F1] transition-all cursor-pointer"
                  >
                    <option value="" disabled>
                      Choose course...
                    </option>
                    {COURSE_OPTIONS.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </section>

            {/* CTA */}
            <section className="fade-in-5 flex flex-col sm:flex-row items-center justify-between gap-4 mb-12">
              <p className="text-xs text-[#9CA3AF] flex items-center gap-1.5">
                <span className="text-[10px]">🔒</span>
                Your data stays private. We never share it.
              </p>

              <div className="w-full sm:w-auto flex flex-col items-stretch gap-2">
                <button
                  type="button"
                  disabled={!canSubmit || isSaving}
                  onClick={onSubmit}
                  className={[
                    'cta-btn w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-4 rounded-[12px] text-white text-sm font-bold tracking-wide shadow-lg focus:outline-none focus:ring-4 focus:ring-[#6366F1]/25',
                    !canSubmit || isSaving
                      ? 'bg-[#6366F1]/50 cursor-not-allowed'
                      : 'bg-[#6366F1] hover:bg-[#4F46E5] active:bg-[#4338CA]'
                  ].join(' ')}
                  style={{ boxShadow: '0 4px 14px rgba(99,102,241,0.3)' }}
                >
                  <span>{isSaving ? 'Saving…' : 'Map My Journey'}</span>
                  <span className="text-xs">→</span>
                </button>

                {error ? (
                  <p className="text-xs text-red-600 max-w-[360px]">{error}</p>
                ) : saved ? (
                  <p className="text-xs text-[#059669] max-w-[360px]">
                    Saved to your profile.
                  </p>
                ) : null}
              </div>
            </section>
          </main>
        </div>
      </div>
    </div>
  )
}

