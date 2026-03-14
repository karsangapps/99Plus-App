export type QuestionState =
  | 'not_visited'
  | 'not_answered'
  | 'answered'
  | 'marked_for_review'
  | 'answered_and_marked'

export type Language = 'en' | 'hi'

export type TestPhase = 'instructions' | 'active' | 'submitted'

export interface QuestionBody {
  en: string
  hi: string
}

export interface QuestionOption {
  key: string
  en: string
  hi: string
}

export interface CorrectAnswer {
  answer: string
}

export interface BankQuestion {
  id: string
  question_code: string
  subject: string
  chapter_name: string
  question_type: 'mcq' | 'assertion_reason' | 'case_based' | 'passage_based'
  difficulty: number
  question_body_json: QuestionBody
  options_json: QuestionOption[]
  correct_answer_json: CorrectAnswer
  explanation_json: QuestionBody | null
}

export interface TestQuestion {
  id: string
  mock_test_id: string
  question_bank_id: string
  display_order: number
  section_label: string
  marks_correct: number
  marks_wrong: number
  question: BankQuestion
}

export interface MockTest {
  id: string
  title: string
  test_type: string
  subject_bundle_json: string[]
  total_questions: number
  total_marks: number
  duration_seconds: number
  negative_marking_enabled: boolean
  marks_correct: number
  marks_wrong: number
  instructions_json: { en: string[]; hi: string[] } | null
}

export interface AttemptPayload {
  attemptId: string
  mockTest: MockTest
  questions: TestQuestion[]
  startedAt: string
  durationSeconds: number
}

export interface ResponseState {
  questionState: QuestionState
  selectedAnswer: string | null
  timeSpentSeconds: number
  visitCount: number
  changedAnswerCount: number
}

export interface NtaState {
  phase: TestPhase
  currentSectionIdx: number
  currentQuestionIdx: number
  responses: Record<string, ResponseState>
  language: Language
  timeRemainingSeconds: number
  isSubmitting: boolean
  questionEnteredAt: number
}

export type NtaAction =
  | { type: 'START_TEST' }
  | { type: 'SET_LANGUAGE'; language: Language }
  | { type: 'NAVIGATE'; sectionIdx: number; questionIdx: number }
  | { type: 'SELECT_ANSWER'; questionId: string; answer: string }
  | { type: 'CLEAR_RESPONSE'; questionId: string }
  | { type: 'MARK_FOR_REVIEW'; questionId: string }
  | { type: 'SAVE_AND_NEXT'; questionId: string; nextSectionIdx: number; nextQuestionIdx: number }
  | { type: 'TICK' }
  | { type: 'SUBMIT_START' }
  | { type: 'SUBMIT_DONE' }

export interface SectionGroup {
  label: string
  questions: TestQuestion[]
}

export function groupBySection(questions: TestQuestion[]): SectionGroup[] {
  const map = new Map<string, TestQuestion[]>()
  for (const q of questions) {
    const label = q.section_label || 'General'
    if (!map.has(label)) map.set(label, [])
    map.get(label)!.push(q)
  }
  return Array.from(map.entries()).map(([label, qs]) => ({ label, questions: qs }))
}

export function paletteColor(state: QuestionState, isCurrent: boolean): string {
  if (isCurrent) return 'bg-blue-500 text-white ring-2 ring-blue-300'
  switch (state) {
    case 'not_visited':         return 'bg-gray-500 text-white'
    case 'not_answered':        return 'bg-red-500 text-white'
    case 'answered':            return 'bg-green-600 text-white'
    case 'marked_for_review':   return 'bg-purple-600 text-white'
    case 'answered_and_marked': return 'bg-purple-600 text-white ring-2 ring-green-400'
  }
}
