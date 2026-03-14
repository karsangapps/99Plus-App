import { notFound, redirect } from 'next/navigation'
import { getInsforgeAdminClient } from '@/lib/insforgeAdmin'
import { getUidFromCookies } from '@/lib/session'
import { DrillEngineShell } from '@/components/drill/DrillEngineShell'
import type { DrillQuestion } from '@/components/drill/types'

export const dynamic = 'force-dynamic'

interface PageProps {
  params: Promise<{ sessionId: string }>
}

export default async function DrillSessionPage({ params }: PageProps) {
  const { sessionId } = await params
  const uid = await getUidFromCookies()
  if (!uid) redirect('/login')

  const db = getInsforgeAdminClient()

  // Fetch the session
  const sessionRes = await db.database
    .from('practice_sessions')
    .select('id, title, status, mode, linked_mark_leak_id, linked_mock_attempt_id')
    .eq('id', sessionId)
    .eq('student_profile_id', uid)
    .single()

  if (sessionRes.error || !sessionRes.data) notFound()

  const session = sessionRes.data as {
    id: string; title: string; status: string; mode: string
    linked_mark_leak_id: string | null; linked_mock_attempt_id: string | null
  }

  if (session.status === 'completed') {
    redirect(`/surgical-drill`)
  }

  // Fetch session items + question bank data (including Conceptual Bridge fields)
  const itemsRes = await db.database
    .from('practice_session_items')
    .select(`
      id, question_bank_id, display_order,
      question_bank (
        id, question_code, subject, chapter_name, difficulty,
        question_body_json, options_json, correct_answer_json,
        logic_fix_text, pattern_text,
        ncert_book, ncert_page_start, ncert_page_end
      )
    `)
    .eq('practice_session_id', sessionId)
    .order('display_order', { ascending: true })

  if (itemsRes.error || !itemsRes.data || (itemsRes.data as unknown[]).length === 0) notFound()

  type ItemRow = {
    id: string; question_bank_id: string; display_order: number
    question_bank: {
      id: string; question_code: string; subject: string; chapter_name: string
      difficulty: number; question_body_json: { en: string; hi: string }
      options_json: Array<{ key: string; en: string; hi: string }>
      correct_answer_json: { answer: string }
      logic_fix_text: string | null; pattern_text: string | null
      ncert_book: string | null; ncert_page_start: number | null; ncert_page_end: number | null
    } | null
  }

  const questions: DrillQuestion[] = (itemsRes.data as unknown as ItemRow[])
    .filter(row => row.question_bank !== null)
    .map(row => {
      const q = Array.isArray(row.question_bank) ? row.question_bank[0] : row.question_bank!
      return {
        sessionItemId: row.id,
        questionBankId: row.question_bank_id,
        displayOrder: row.display_order,
        questionCode: q.question_code,
        subject: q.subject,
        chapterName: q.chapter_name,
        difficulty: q.difficulty,
        questionBodyJson: q.question_body_json,
        optionsJson: q.options_json,
        ncertBook: q.ncert_book,
        ncertPageStart: q.ncert_page_start,
        ncertPageEnd: q.ncert_page_end,
      }
    })

  if (questions.length === 0) notFound()

  return (
    <DrillEngineShell
      sessionId={sessionId}
      sessionTitle={session.title}
      linkedAttemptId={session.linked_mock_attempt_id}
      questions={questions}
      markLeakId={session.linked_mark_leak_id}
    />
  )
}
