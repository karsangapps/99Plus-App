import { redirect } from 'next/navigation'
import { getInsforgeAdminClient } from '@/lib/insforgeAdmin'
import { getUidFromCookies } from '@/lib/session'
import { EligibilityShell } from '@/components/eligibility/EligibilityShell'
import { EligibilityClient, type ClientRule } from '@/components/eligibility/EligibilityClient'

type RuleRow = {
  id: string
  mandatory_subjects_json: string[]
  optional_subject_groups_json: { name: string; subjects: string[]; min_required: number }[]
  recommended_subjects_json: string[]
  min_domain_count: number | null
  programs: { name: string; colleges: { name: string; universities: { name: string; short_code: string } } }
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

  // Serialise to a plain object shape EligibilityClient expects
  const clientRules: ClientRule[] = rules.map((r) => ({
    id: r.id,
    mandatory_subjects_json: r.mandatory_subjects_json,
    optional_subject_groups_json: r.optional_subject_groups_json,
    recommended_subjects_json: r.recommended_subjects_json,
    min_domain_count: r.min_domain_count,
    programs: r.programs,
  }))

  return (
    <EligibilityShell>
      <EligibilityClient rules={clientRules} />
    </EligibilityShell>
  )
}
