import { NextResponse } from 'next/server'
import { createHash } from 'crypto'
import { getInsforgeAdminClient } from '@/lib/insforgeAdmin'
import { getUidFromCookies } from '@/lib/session'

type OptionalGroup = {
  name: string
  subjects: string[]
  min_required: number
}

type EligibilityRule = {
  id: string
  mandatory_subjects_json: string[]
  optional_subject_groups_json: OptionalGroup[]
  recommended_subjects_json: string[]
  min_domain_count: number | null
  is_hard_lock: boolean
  programs: {
    id: string
    name: string
    colleges: {
      id: string
      name: string
      universities: { id: string; name: string; short_code: string }
    }
  }
}

type RequestBody = {
  rule_id: string
  selected_subjects: string[]
}

function validateSubjects(
  rule: EligibilityRule,
  selected: string[]
): { valid: boolean; mismatches: string[] } {
  const selectedSet = new Set(selected)
  const mismatches: string[] = []

  // 1. All mandatory subjects must be present
  for (const subj of rule.mandatory_subjects_json) {
    if (!selectedSet.has(subj)) {
      mismatches.push(`Mandatory subject missing: ${subj}`)
    }
  }

  // 2. Each optional group must meet its min_required count
  for (const group of rule.optional_subject_groups_json) {
    const chosen = group.subjects.filter((s) => selectedSet.has(s))
    if (chosen.length < group.min_required) {
      mismatches.push(
        `"${group.name}": need at least ${group.min_required} subject(s), you selected ${chosen.length}`
      )
    }
  }

  return { valid: mismatches.length === 0, mismatches }
}

export async function POST(req: Request) {
  try {
    const uid = await getUidFromCookies()
    if (!uid) {
      return NextResponse.json({ ok: false, error: 'Not signed in.' }, { status: 401 })
    }

    const body = (await req.json()) as RequestBody
    const { rule_id, selected_subjects } = body

    if (!rule_id || !Array.isArray(selected_subjects) || selected_subjects.length === 0) {
      return NextResponse.json(
        { ok: false, error: 'rule_id and selected_subjects are required.' },
        { status: 400 }
      )
    }

    const db = getInsforgeAdminClient()

    // Fetch the rule
    const ruleRes = await db.database
      .from('eligibility_rules')
      .select(`
        id, mandatory_subjects_json, optional_subject_groups_json,
        recommended_subjects_json, min_domain_count, is_hard_lock,
        programs ( id, name, colleges ( id, name, universities ( id, name, short_code ) ) )
      `)
      .eq('id', rule_id)
      .eq('is_active', true)
      .single()

    if (ruleRes.error || !ruleRes.data) {
      return NextResponse.json({ ok: false, error: 'Eligibility rule not found.' }, { status: 404 })
    }

    const rule = ruleRes.data as unknown as EligibilityRule

    // Run the rule engine
    const { valid, mismatches } = validateSubjects(rule, selected_subjects)

    if (!valid) {
      return NextResponse.json({ ok: false, mismatches }, { status: 400 })
    }

    // Generate tamper-proof lock hash
    const sortedSubjects = [...selected_subjects].sort().join(',')
    const lockHash = createHash('sha256')
      .update(`${rule_id}:${uid}:${sortedSubjects}:${Date.now()}`)
      .digest('hex')

    const validationResult = {
      rule_id,
      rule_version: 'v1',
      program: rule.programs?.name,
      college: rule.programs?.colleges?.name,
      university: rule.programs?.colleges?.universities?.name,
      validated_at: new Date().toISOString(),
      subjects_validated: selected_subjects,
      mandatory_subjects: rule.mandatory_subjects_json,
      optional_groups: rule.optional_subject_groups_json,
    }

    // Insert lock snapshot
    const snapshotRes = await db.database
      .from('eligibility_lock_snapshots')
      .insert({
        student_profile_id: uid,
        eligibility_rule_id: rule_id,
        locked_subjects_json: selected_subjects,
        validation_result_json: validationResult,
        lock_hash: lockHash,
        status: 'locked',
      })
      .select('id')
      .single()

    if (snapshotRes.error || !snapshotRes.data) {
      return NextResponse.json(
        { ok: false, error: 'Failed to create lock snapshot.' },
        { status: 500 }
      )
    }

    const snapshotId = (snapshotRes.data as { id: string }).id

    // Insert one row per subject into student_subject_locks
    const subjectRows = selected_subjects.map((subjectName) => {
      let section = 'Section III — Recommended'
      let tag = 'Recommended'

      if (rule.mandatory_subjects_json.includes(subjectName)) {
        section = 'Section IA — Language / Mandatory'
        tag = 'Mandatory'
      } else {
        for (const group of rule.optional_subject_groups_json) {
          if (group.subjects.includes(subjectName)) {
            section = `Section II — Domain (pick ${group.min_required} of ${group.subjects.length})`
            tag = 'Alternative'
            break
          }
        }
      }

      return {
        student_profile_id: uid,
        snapshot_id: snapshotId,
        subject_name: subjectName,
        section,
        tag,
      }
    })

    await db.database.from('student_subject_locks').insert(subjectRows)

    // Update student_profiles account_state
    await db.database
      .from('student_profiles')
      .update({ account_state: 'eligibility_locked' })
      .eq('user_id', uid)

    return NextResponse.json({ ok: true, lock_hash: lockHash, snapshot_id: snapshotId })
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Unknown server error'
    return NextResponse.json({ ok: false, error: msg }, { status: 500 })
  }
}
