import { getInsforgeAdminClient } from '@/lib/insforgeAdmin'

/**
 * Resolve auth user id (from cookie) to student_profile_id.
 * Returns null if not found.
 */
export async function getStudentProfileId(authUserId: string): Promise<string | null> {
  const db = getInsforgeAdminClient()
  const res = await db.database
    .from('student_profiles')
    .select('id')
    .eq('user_id', authUserId)
    .limit(1)
    .single()
  if (res.error || !res.data) return null
  return (res.data as { id: string }).id
}
