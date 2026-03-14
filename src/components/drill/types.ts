export type DrillMode = 'gap_remedy' | 'topic_mastery' | 'pyq' | 'full_mock'
export type DrillStatus = 'assigned' | 'started' | 'completed' | 'abandoned'
export type LeakOutcome = 'sealed' | 'reduced' | 'unchanged'

export interface ActiveLeak {
  id: string
  subject: string
  chapterName: string
  lostMarks: number
  severityScore: number
  leakType: string
  mockAttemptId: string | null
}

export interface DrillSession {
  id: string
  title: string
  mode: DrillMode
  status: DrillStatus
  accuracyPct: number | null
  createdAt: string
  completedAt: string | null
  linkedMarkLeakId: string | null
  sessionMeta: { correct_count?: number; total_questions?: number; leak_outcome?: string }
}

export interface DrillQuestion {
  sessionItemId: string
  questionBankId: string
  displayOrder: number
  questionCode: string
  subject: string
  chapterName: string
  difficulty: number
  questionBodyJson: { en: string; hi: string }
  optionsJson: Array<{ key: string; en: string; hi: string }>
  ncertBook: string | null
  ncertPageStart: number | null
  ncertPageEnd: number | null
}

export interface ConceptualBridgePayload {
  logicFix: string
  pattern: string
  ncertRef: string
  ncertPage: number | null
  chapterName: string
  subject: string
}

export interface DrillEngineState {
  phase: 'intro' | 'answering' | 'feedback' | 'completed'
  currentIdx: number
  responses: Record<string, {
    selectedAnswer: string | null
    isCorrect: boolean | null
    timeSpentSeconds: number
    conceptualBridge: ConceptualBridgePayload | null
  }>
  startedAt: number
  questionStartedAt: number
  isSubmitting: boolean
  result: {
    accuracyPct: number
    correctCount: number
    wrongCount: number
    totalQuestions: number
    leakOutcome: LeakOutcome
    leakMessage: string
    linkedAttemptId: string | null
  } | null
}

export type DrillEngineAction =
  | { type: 'START' }
  | { type: 'SELECT'; answer: string }
  | { type: 'SHOW_FEEDBACK'; questionBankId: string; isCorrect: boolean; bridge: ConceptualBridgePayload }
  | { type: 'NEXT' }
  | { type: 'SUBMIT_START' }
  | { type: 'SUBMIT_DONE'; result: DrillEngineState['result'] }
