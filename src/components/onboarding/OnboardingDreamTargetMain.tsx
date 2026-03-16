'use client'

import { useMemo, useState } from 'react'
import type { Stream } from '@/components/onboarding/dreamTargetOptions'
import { UNIVERSITY_OPTIONS } from '@/components/onboarding/dreamTargetOptions'
import { DreamTargetFormCard } from '@/components/onboarding/DreamTargetFormCard'

export function OnboardingDreamTargetMain() {
  const [stream, setStream] = useState<Stream>('Science')
  const [targetUniversity, setTargetUniversity] = useState<string>(UNIVERSITY_OPTIONS[0])
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
      if (!res.ok || !json.ok) throw new Error(json.error || 'Failed to save')
      setSaved(true)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to save')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="flex-1 min-w-0">
      <header className="hidden lg:block sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-[#E5E7EB]">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold text-[#0F172A] tracking-tight">Command Center</h1>
            <p className="text-xs text-[#9CA3AF]">Set your surgical target — Step 1 of 3</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-[#9CA3AF] hidden sm:inline">CUET 2026</span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#059669]/10 text-[#059669] text-xs font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-[#059669] animate-pulse" />
              Live
            </span>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-8">
        <div className="fade-in-1 mb-10">
          <div className="flex items-center justify-center gap-0">
            <div className="flex items-center gap-2.5">
              <div
                className="w-9 h-9 rounded-full bg-[#6366F1] flex items-center justify-center shadow-md"
                style={{ boxShadow: '0 4px 12px rgba(99,102,241,0.3)' }}
              >
                <span className="text-white text-xs font-bold">1</span>
              </div>
              <span className="text-sm font-semibold text-[#0F172A] hidden sm:inline">Dream Target</span>
            </div>
            <div className="w-12 sm:w-20 h-0.5 bg-[#E5E7EB] mx-2 rounded-full overflow-hidden" />
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-full bg-[#E5E7EB] flex items-center justify-center">
                <span className="text-[#9CA3AF] text-xs font-bold">2</span>
              </div>
              <span className="text-sm font-medium text-[#9CA3AF] hidden sm:inline">Eligibility</span>
            </div>
            <div className="w-12 sm:w-20 h-0.5 bg-[#E5E7EB] mx-2 rounded-full" />
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-full bg-[#E5E7EB] flex items-center justify-center">
                <span className="text-[#9CA3AF] text-xs font-bold">3</span>
              </div>
              <span className="text-sm font-medium text-[#9CA3AF] hidden sm:inline">Confirm</span>
            </div>
          </div>
        </div>

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
            Define your dream college and course. We&apos;ll reverse-engineer the exact score you need and build your
            surgical prep path.
          </p>
        </div>

        <DreamTargetFormCard
          stream={stream}
          onStreamChange={setStream}
          targetUniversity={targetUniversity}
          onTargetUniversityChange={setTargetUniversity}
          dreamCollege={dreamCollege}
          onDreamCollegeChange={setDreamCollege}
          dreamCourse={dreamCourse}
          onDreamCourseChange={setDreamCourse}
        />

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
              <p className="text-xs text-[#059669] max-w-[360px]">Saved to your profile.</p>
            ) : null}
          </div>
        </section>
      </main>
    </div>
  )
}

