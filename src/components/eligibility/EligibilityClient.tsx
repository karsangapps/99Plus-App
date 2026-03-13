'use client'

import { useState, useMemo, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { EligibilityRuleCard, type SubjectRow } from './EligibilityRuleCard'

type OptionalGroup = {
  name: string
  subjects: string[]
  min_required: number
}

export type ClientRule = {
  id: string
  mandatory_subjects_json: string[]
  optional_subject_groups_json: OptionalGroup[]
  recommended_subjects_json: string[]
  min_domain_count: number | null
  programs: {
    name: string
    colleges: {
      name: string
      universities: { name: string; short_code: string }
    }
  }
}

type Props = {
  rules: ClientRule[]
}

function buildSubjectRows(rule: ClientRule): SubjectRow[] {
  const rows: SubjectRow[] = []

  for (const s of rule.mandatory_subjects_json) {
    rows.push({
      name: s,
      section: 'Section IA — Language / Mandatory',
      tag: 'Mandatory',
      locked: true,
    })
  }

  for (const group of rule.optional_subject_groups_json) {
    for (const s of group.subjects) {
      rows.push({
        name: s,
        section: `Section II — Domain (pick ${group.min_required} of ${group.subjects.length})`,
        tag: 'Alternative',
        locked: false,
      })
    }
  }

  for (const s of rule.recommended_subjects_json) {
    rows.push({
      name: s,
      section: 'Section III — Recommended',
      tag: 'Recommended',
      locked: false,
    })
  }

  return rows
}

function isCTAEnabled(rule: ClientRule, selected: Set<string>): boolean {
  // All mandatory subjects pre-selected (they're always in), check optional groups
  for (const group of rule.optional_subject_groups_json) {
    const chosen = group.subjects.filter((s) => selected.has(s))
    if (chosen.length < group.min_required) return false
  }
  return true
}

type RuleState = {
  selected: Set<string>
}

export function EligibilityClient({ rules }: Props) {
  const router = useRouter()

  // Per-rule subject selection state — mandatory subjects are pre-seeded
  const [ruleStates, setRuleStates] = useState<Record<string, RuleState>>(() => {
    const init: Record<string, RuleState> = {}
    for (const rule of rules) {
      init[rule.id] = {
        selected: new Set(rule.mandatory_subjects_json),
      }
    }
    return init
  })

  const [status, setStatus] = useState<'idle' | 'loading' | 'locked' | 'error'>('idle')
  const [mismatches, setMismatches] = useState<string[]>([])
  const [lockHash, setLockHash] = useState<string | null>(null)

  const handleToggle = useCallback((ruleId: string, subject: string, checked: boolean) => {
    setRuleStates((prev) => {
      const current = new Set(prev[ruleId]?.selected ?? [])
      if (checked) current.add(subject)
      else current.delete(subject)
      return { ...prev, [ruleId]: { selected: current } }
    })
  }, [])

  // CTA is enabled only when ALL rules have their minimums satisfied
  const allRulesReady = useMemo(
    () => rules.every((rule) => isCTAEnabled(rule, ruleStates[rule.id]?.selected ?? new Set())),
    [rules, ruleStates]
  )

  async function handleLock() {
    if (!allRulesReady || status !== 'idle') return
    setStatus('loading')
    setMismatches([])

    try {
      // Validate each rule sequentially (usually just 1-2 rules)
      for (const rule of rules) {
        const selected = ruleStates[rule.id]?.selected ?? new Set<string>()
        const res = await fetch('/api/eligibility/validate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            rule_id: rule.id,
            selected_subjects: Array.from(selected),
          }),
        })
        const data = (await res.json()) as {
          ok: boolean
          mismatches?: string[]
          lock_hash?: string
          error?: string
        }

        if (!data.ok) {
          setMismatches(data.mismatches ?? [data.error ?? 'Validation failed.'])
          setStatus('error')
          return
        }

        if (data.lock_hash) setLockHash(data.lock_hash)
      }

      setStatus('locked')
      setTimeout(() => router.push('/onboarding/battle'), 2500)
    } catch {
      setMismatches(['A network error occurred. Please try again.'])
      setStatus('error')
    }
  }

  return (
    <div className="space-y-6">
      {rules.map((rule) => {
        const subjects = buildSubjectRows(rule)
        const uni = rule.programs?.colleges?.universities
        const college = rule.programs?.colleges
        const selected = ruleStates[rule.id]?.selected ?? new Set<string>()

        return (
          <EligibilityRuleCard
            key={rule.id}
            universityName={uni?.name ?? 'Delhi University'}
            collegeName={college?.name ?? '—'}
            programName={rule.programs?.name ?? '—'}
            ruleRef={`REQ-2026-${uni?.short_code ?? 'DU'}-${rule.id.slice(0, 6).toUpperCase()}`}
            subjects={subjects}
            verifiedCount={subjects.filter((s) => s.locked || selected.has(s.name)).length}
            selected={selected}
            onToggle={(subject, checked) => handleToggle(rule.id, subject, checked)}
            isLocked={status === 'locked'}
          />
        )
      })}

      {/* Mismatch error banner */}
      {status === 'error' && mismatches.length > 0 && (
        <div className="rounded-[12px] border border-[#FCA5A5] bg-[#FEF2F2] px-6 py-4">
          <p className="text-[#DC2626] font-semibold text-sm mb-2">Subject combination invalid:</p>
          <ul className="list-disc list-inside space-y-1">
            {mismatches.map((m, i) => (
              <li key={i} className="text-[#DC2626] text-sm">
                {m}
              </li>
            ))}
          </ul>
          <button
            onClick={() => setStatus('idle')}
            className="mt-3 text-xs text-[#DC2626] underline underline-offset-2"
          >
            Dismiss and try again
          </button>
        </div>
      )}

      {/* Lock-confirmed banner */}
      {status === 'locked' && lockHash && (
        <div
          className="rounded-[12px] border border-[#059669] bg-[#F0FDF4] px-6 py-5 flex items-start gap-4"
          style={{ boxShadow: '0px 4px 20px rgba(5,150,105,0.15)' }}
        >
          <div className="w-10 h-10 rounded-full bg-[#059669] flex items-center justify-center flex-shrink-0">
            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
            </svg>
          </div>
          <div>
            <p className="text-[#059669] font-bold text-base">Eligibility Locked Successfully</p>
            <p className="text-[#065F46] text-sm mt-0.5">
              Your subject combination is sealed. Redirecting to Battle Plan...
            </p>
            <p className="text-[#9CA3AF] text-[10px] mt-2 font-mono break-all">
              LOCK: {lockHash.slice(0, 32)}...
            </p>
          </div>
        </div>
      )}

      {/* Hard-lock CTA */}
      {status !== 'locked' && (
        <div
          className={[
            'rounded-[12px] p-6 flex items-center justify-between transition-all',
            allRulesReady
              ? 'bg-gradient-to-r from-[#059669] to-[#047857]'
              : 'bg-[#F1F5F9] border border-[#E5E7EB]',
          ].join(' ')}
          style={allRulesReady ? { boxShadow: '0px 4px 20px rgba(5,150,105,0.25)' } : {}}
        >
          <div>
            <p
              className={`font-bold text-base ${allRulesReady ? 'text-white' : 'text-[#9CA3AF]'}`}
            >
              Confirm &amp; Lock My Eligibility
            </p>
            <p
              className={`text-sm mt-0.5 ${allRulesReady ? 'text-white/60' : 'text-[#9CA3AF]'}`}
            >
              {allRulesReady
                ? 'This action is tamper-proof. Changes after locking require re-verification.'
                : 'Select the required subjects above to unlock this action.'}
            </p>
          </div>
          <button
            onClick={handleLock}
            disabled={!allRulesReady || status === 'loading'}
            className={[
              'px-6 py-3 rounded-xl font-bold text-sm transition-all flex items-center gap-2 flex-shrink-0',
              allRulesReady
                ? 'bg-white text-[#059669] hover:bg-[#F0FDF4] active:scale-95'
                : 'bg-[#E5E7EB] text-[#9CA3AF] cursor-not-allowed opacity-50',
            ].join(' ')}
          >
            {status === 'loading' ? (
              <>
                <svg
                  className="w-4 h-4 animate-spin"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                  />
                </svg>
                Verifying...
              </>
            ) : (
              'Lock Eligibility →'
            )}
          </button>
        </div>
      )}
    </div>
  )
}
