'use client'

import type { Stream } from '@/components/onboarding/dreamTargetOptions'
import {
  COLLEGE_OPTIONS,
  COURSE_OPTIONS,
  UNIVERSITY_OPTIONS
} from '@/components/onboarding/dreamTargetOptions'

type Props = {
  stream: Stream
  onStreamChange: (s: Stream) => void
  targetUniversity: string
  onTargetUniversityChange: (u: string) => void
  dreamCollege: string
  onDreamCollegeChange: (c: string) => void
  dreamCourse: string
  onDreamCourseChange: (c: string) => void
}

export function DreamTargetFormCard({
  stream,
  onStreamChange,
  targetUniversity,
  onTargetUniversityChange,
  dreamCollege,
  onDreamCollegeChange,
  dreamCourse,
  onDreamCourseChange
}: Props) {
  return (
    <section
      className="fade-in-3 bg-white rounded-[12px] border border-[#E5E7EB] p-6 sm:p-8 mb-6"
      style={{ boxShadow: '0px 4px 8px rgba(0,0,0,0.06)' }}
    >
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
                  onChange={() => onStreamChange(s)}
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
                    {s === 'Science' ? '⚗' : s === 'Commerce' ? '📈' : '📚'}
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
                {active ? <span className="ml-auto text-[#6366F1]">✔</span> : null}
              </label>
            )
          })}
        </div>
      </div>

      <div className="border-t border-dashed border-[#E5E7EB] my-7" />

      <div className="mb-7">
        <label className="flex items-center gap-2 text-sm font-semibold text-[#0F172A] mb-3">
          <span className="w-6 h-6 rounded-md bg-[#059669]/10 flex items-center justify-center">
            <span className="text-[#059669] text-xs">🏛</span>
          </span>
          Target University
        </label>
        <select
          value={targetUniversity}
          onChange={(e) => onTargetUniversityChange(e.target.value)}
          className="w-full rounded-[12px] border-2 border-[#E5E7EB] bg-white px-4 py-3.5 pr-10 text-sm text-[#0F172A] font-medium focus:outline-none focus:border-[#6366F1] transition-all cursor-pointer"
        >
          {UNIVERSITY_OPTIONS.map((u) => (
            <option key={u} value={u}>
              {u}
            </option>
          ))}
        </select>
        <div className="mt-2.5 flex items-center gap-2 px-1">
          <span className="text-[#6366F1] text-xs">i</span>
          <span className="text-xs text-[#9CA3AF]">
            North Campus colleges require higher CUET percentiles
          </span>
        </div>
      </div>

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
            onChange={(e) => onDreamCollegeChange(e.target.value)}
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
            onChange={(e) => onDreamCourseChange(e.target.value)}
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
  )
}

