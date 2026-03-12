import { redirect } from 'next/navigation'
import { getInsforgeAdminClient } from '@/lib/insforgeAdmin'
import { getUidFromCookies } from '@/lib/session'
import { EligibilityShell } from '@/components/eligibility/EligibilityShell'
import { EligibilityRuleCard, type SubjectRow } from '@/components/eligibility/EligibilityRuleCard'

type RuleRow = {
  id: string
  mandatory_subjects_json: string[]
  optional_subject_groups_json: { name: string; subjects: string[]; min_required: number }[]
  recommended_subjects_json: string[]
  min_domain_count: number | null
  programs: { name: string; colleges: { name: string; universities: { name: string; short_code: string } } }
}

function buildSubjectRows(rule: RuleRow): SubjectRow[] {
  const rows: SubjectRow[] = []

  for (const s of rule.mandatory_subjects_json) {
    rows.push({ name: s, section: 'Section IA — Language / Mandatory', tag: 'Mandatory', locked: true })
  }

  for (const group of rule.optional_subject_groups_json) {
    for (const s of group.subjects) {
      rows.push({ name: s, section: `Section II — Domain (pick ${group.min_required} of ${group.subjects.length})`, tag: 'Alternative', locked: false })
    }
  }

  for (const s of rule.recommended_subjects_json) {
    rows.push({ name: s, section: 'Section III — Recommended', tag: 'Recommended', locked: false })
  }

  return rows
}

export default async function EligibilityPage() {
  const uid = await getUidFromCookies()
  if (!uid) redirect('/login')

  const db = getInsforgeAdminClient()

  // Load the student's first target program to look up matching rules
  const targetRes = await db.database
    .from('user_targets')
    .select('university_id')
    .eq('student_profile_id', uid)
    .limit(1)

  const universityId = (targetRes.data as { university_id: string }[] | null)?.[0]?.university_id

  // Fallback to DU seed data if no target set yet
  const duId = '00000001-0000-0000-0000-000000000001'

  const rulesRes = await db.database
    .from('eligibility_rules')
    .select(`
      id,
      mandatory_subjects_json,
      optional_subject_groups_json,
      recommended_subjects_json,
      min_domain_count,
      programs ( name, colleges ( name, universities ( name, short_code ) ) )
    `)
    .eq('university_id', universityId ?? duId)
    .eq('is_active', true)
    .eq('exam_year', 2026)

  const rules = (rulesRes.data ?? []) as unknown as RuleRow[]

  if (!rules.length) {
    return (
      <EligibilityShell>
        <div className="rounded-[12px] bg-white border border-[#E5E7EB] px-7 py-12 text-center">
          <p className="text-[#9CA3AF] text-sm">No eligibility rules found for your target. Contact support.</p>
        </div>
      </EligibilityShell>
    )
  }

  return (
    <EligibilityShell>
      <div className="space-y-6">
        {rules.map((rule) => {
          const subjects = buildSubjectRows(rule)
          const lockedCount = subjects.filter((s) => s.locked).length
          const uni = rule.programs?.colleges?.universities
          const college = rule.programs?.colleges

          return (
            <EligibilityRuleCard
              key={rule.id}
              universityName={uni?.name ?? 'Delhi University'}
              collegeName={college?.name ?? '—'}
              programName={rule.programs?.name ?? '—'}
              ruleRef={`REQ-2026-${uni?.short_code ?? 'DU'}-${rule.id.slice(0, 6).toUpperCase()}`}
              subjects={subjects}
              verifiedCount={lockedCount}
            />
          )
        })}

        {/* Hard-lock CTA — wired in next sprint */}
        <div className="rounded-[12px] bg-gradient-to-r from-[#059669] to-[#047857] p-6 flex items-center justify-between"
          style={{ boxShadow: '0px 4px 20px rgba(5,150,105,0.25)' }}>
          <div>
            <p className="text-white font-bold text-base">Confirm & Lock My Eligibility</p>
            <p className="text-white/60 text-sm mt-0.5">
              This action is tamper-proof. Changes after locking require re-verification.
            </p>
          </div>
          <button
            disabled
            className="px-6 py-3 rounded-xl bg-white text-[#059669] font-bold text-sm opacity-50 cursor-not-allowed"
          >
            Lock Eligibility →
          </button>
        </div>
      </div>
    </EligibilityShell>
  )
}
