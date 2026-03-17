'use client'

import { useReducer, useEffect, useCallback, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { NtaInstructionsModal } from './NtaInstructionsModal'
import { NtaHeader } from './NtaHeader'
import { NtaSectionTabs } from './NtaSectionTabs'
import { NtaQuestionPanel } from './NtaQuestionPanel'
import { NtaActionBar } from './NtaActionBar'
import { NtaQuestionPalette } from './NtaQuestionPalette'
import { groupBySection } from './types'
import type {
  AttemptPayload,
  NtaState,
  NtaAction,
  ResponseState,
  QuestionState,
  Language,
} from './types'

interface NtaTestShellProps {
  payload: AttemptPayload
  candidateName: string
}

function buildInitialResponses(
  payload: AttemptPayload
): Record<string, ResponseState> {
  const map: Record<string, ResponseState> = {}
  for (const q of payload.questions) {
    map[q.question_bank_id] = {
      questionState: 'not_visited',
      selectedAnswer: null,
      timeSpentSeconds: 0,
      visitCount: 0,
      changedAnswerCount: 0,
    }
  }
  return map
}

function ntaReducer(state: NtaState, action: NtaAction): NtaState {
  switch (action.type) {
    case 'START_TEST': {
      const firstQId = Object.keys(state.responses)[0]
      if (!firstQId) return { ...state, phase: 'active' }
      return {
        ...state,
        phase: 'active',
        responses: {
          ...state.responses,
          [firstQId]: {
            ...state.responses[firstQId],
            questionState: 'not_answered',
            visitCount: (state.responses[firstQId]?.visitCount ?? 0) + 1,
          },
        },
        questionEnteredAt: Date.now(),
      }
    }

    case 'SET_LANGUAGE':
      return { ...state, language: action.language }

    case 'NAVIGATE': {
      // Accumulate time on the question we're leaving
      const sections = [] as ReturnType<typeof groupBySection>
      // We can't call groupBySection here without payload, but we don't need it
      // The shell stores time via TICK; navigation just updates state
      const leaving = getCurrentQuestionId(state)
      const timeSpent = leaving
        ? Math.round((Date.now() - state.questionEnteredAt) / 1000)
        : 0

      const newResponses = { ...state.responses }
      if (leaving && newResponses[leaving]) {
        newResponses[leaving] = {
          ...newResponses[leaving],
          timeSpentSeconds: newResponses[leaving].timeSpentSeconds + timeSpent,
        }
      }

      // Mark arriving question as not_answered if it was not_visited
      const arriving = getQuestionIdAt(state, action.sectionIdx, action.questionIdx)
      if (arriving && newResponses[arriving]?.questionState === 'not_visited') {
        newResponses[arriving] = {
          ...newResponses[arriving],
          questionState: 'not_answered',
          visitCount: newResponses[arriving].visitCount + 1,
        }
      } else if (arriving && newResponses[arriving]) {
        newResponses[arriving] = {
          ...newResponses[arriving],
          visitCount: newResponses[arriving].visitCount + 1,
        }
      }

      return {
        ...state,
        currentSectionIdx: action.sectionIdx,
        currentQuestionIdx: action.questionIdx,
        responses: newResponses,
        questionEnteredAt: Date.now(),
      }
    }

    case 'SELECT_ANSWER': {
      const prev = state.responses[action.questionId]
      if (!prev) return state
      const hadAnswer = prev.selectedAnswer !== null
      return {
        ...state,
        responses: {
          ...state.responses,
          [action.questionId]: {
            ...prev,
            selectedAnswer: action.answer,
            questionState:
              prev.questionState === 'marked_for_review' ||
              prev.questionState === 'answered_and_marked'
                ? 'answered_and_marked'
                : 'answered',
            changedAnswerCount: hadAnswer ? prev.changedAnswerCount + 1 : prev.changedAnswerCount,
          },
        },
      }
    }

    case 'CLEAR_RESPONSE': {
      const prev = state.responses[action.questionId]
      if (!prev) return state
      return {
        ...state,
        responses: {
          ...state.responses,
          [action.questionId]: {
            ...prev,
            selectedAnswer: null,
            questionState: 'not_answered',
          },
        },
      }
    }

    case 'MARK_FOR_REVIEW': {
      const prev = state.responses[action.questionId]
      if (!prev) return state
      const newState: QuestionState =
        prev.selectedAnswer !== null ? 'answered_and_marked' : 'marked_for_review'
      return {
        ...state,
        responses: {
          ...state.responses,
          [action.questionId]: { ...prev, questionState: newState },
        },
      }
    }

    case 'SAVE_AND_NEXT': {
      // Update current question state, advance to next
      const prev = state.responses[action.questionId]
      const timeSpent = Math.round((Date.now() - state.questionEnteredAt) / 1000)
      const newResponses = { ...state.responses }

      if (prev) {
        newResponses[action.questionId] = {
          ...prev,
          timeSpentSeconds: prev.timeSpentSeconds + timeSpent,
          questionState:
            prev.selectedAnswer !== null
              ? prev.questionState === 'marked_for_review'
                ? 'answered_and_marked'
                : 'answered'
              : 'not_answered',
        }
      }

      // Mark arriving question
      const arrivingId = getQuestionIdAt(state, action.nextSectionIdx, action.nextQuestionIdx)
      if (arrivingId && newResponses[arrivingId]?.questionState === 'not_visited') {
        newResponses[arrivingId] = {
          ...newResponses[arrivingId],
          questionState: 'not_answered',
          visitCount: (newResponses[arrivingId]?.visitCount ?? 0) + 1,
        }
      } else if (arrivingId && newResponses[arrivingId]) {
        newResponses[arrivingId] = {
          ...newResponses[arrivingId],
          visitCount: newResponses[arrivingId].visitCount + 1,
        }
      }

      return {
        ...state,
        currentSectionIdx: action.nextSectionIdx,
        currentQuestionIdx: action.nextQuestionIdx,
        responses: newResponses,
        questionEnteredAt: Date.now(),
      }
    }

    case 'TICK':
      if (state.timeRemainingSeconds <= 0) return state
      return { ...state, timeRemainingSeconds: state.timeRemainingSeconds - 1 }

    case 'SUBMIT_START':
      return { ...state, isSubmitting: true }

    case 'SUBMIT_DONE':
      return { ...state, phase: 'submitted', isSubmitting: false }

    default:
      return state
  }
}

// Helpers that depend on payload (passed as closure variables)
let _sections: ReturnType<typeof groupBySection> = []

function getCurrentQuestionId(state: NtaState): string | null {
  const section = _sections[state.currentSectionIdx]
  if (!section) return null
  const q = section.questions[state.currentQuestionIdx]
  return q?.question_bank_id ?? null
}

function getQuestionIdAt(
  state: NtaState,
  sectionIdx: number,
  questionIdx: number
): string | null {
  const section = _sections[sectionIdx]
  if (!section) return null
  const q = section.questions[questionIdx]
  return q?.question_bank_id ?? null
}

export function NtaTestShell({ payload, candidateName }: NtaTestShellProps) {
  const router = useRouter()
  _sections = groupBySection(payload.questions)

  const [state, dispatch] = useReducer(ntaReducer, {
    phase: 'instructions',
    currentSectionIdx: 0,
    currentQuestionIdx: 0,
    responses: buildInitialResponses(payload),
    language: 'en',
    timeRemainingSeconds: payload.durationSeconds,
    isSubmitting: false,
    questionEnteredAt: Date.now(),
  })

  const sections = _sections
  const currentSection = sections[state.currentSectionIdx]
  const currentQuestion = currentSection?.questions[state.currentQuestionIdx]
  const currentResponse = currentQuestion
    ? state.responses[currentQuestion.question_bank_id]
    : null

  // Autosave ref
  const autosaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const persistResponse = useCallback(
    async (questionBankId: string, r: ResponseState) => {
      try {
        await fetch(`/api/mock-attempts/${payload.attemptId}/response`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            question_bank_id: questionBankId,
            selected_answer_json: r.selectedAnswer ? { answer: r.selectedAnswer } : null,
            question_state: r.questionState,
            time_spent_seconds: r.timeSpentSeconds,
            visit_count: r.visitCount,
            changed_answer_count: r.changedAnswerCount,
            marked_for_review: r.questionState === 'marked_for_review' || r.questionState === 'answered_and_marked',
          }),
        })
      } catch {
        // Silently fail — will retry on next autosave
      }
    },
    [payload.attemptId]
  )

  // Debounced autosave on response change
  useEffect(() => {
    if (state.phase !== 'active' || !currentQuestion) return
    const id = currentQuestion.question_bank_id
    const r = state.responses[id]
    if (!r) return

    if (autosaveTimer.current) clearTimeout(autosaveTimer.current)
    autosaveTimer.current = setTimeout(() => {
      persistResponse(id, r)
    }, 1200)

    return () => {
      if (autosaveTimer.current) clearTimeout(autosaveTimer.current)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.responses, currentQuestion?.question_bank_id])

  // Countdown timer
  useEffect(() => {
    if (state.phase !== 'active') return
    const interval = setInterval(() => dispatch({ type: 'TICK' }), 1000)
    return () => clearInterval(interval)
  }, [state.phase])

  // Auto-submit when timer hits 0
  useEffect(() => {
    if (state.phase === 'active' && state.timeRemainingSeconds <= 0) {
      handleSubmit(true)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.timeRemainingSeconds, state.phase])

  async function handleSubmit(autoSubmit = false) {
    if (state.isSubmitting) return
    dispatch({ type: 'SUBMIT_START' })

    // Flush all pending autosaves
    if (autosaveTimer.current) clearTimeout(autosaveTimer.current)

    try {
      const res = await fetch(`/api/mock-attempts/${payload.attemptId}/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          responses: state.responses,
          auto_submitted: autoSubmit,
          duration_seconds_used: payload.durationSeconds - state.timeRemainingSeconds,
        }),
      })
      const data = await res.json() as { ok: boolean }
      if (data.ok) {
        dispatch({ type: 'SUBMIT_DONE' })
        router.push(`/diagnosis/${payload.attemptId}`)
      }
    } catch {
      dispatch({ type: 'SUBMIT_DONE' })
      router.push(`/diagnosis/${payload.attemptId}`)
    }
  }

  function getNextPosition(): { sectionIdx: number; questionIdx: number } {
    const section = sections[state.currentSectionIdx]
    if (state.currentQuestionIdx < section.questions.length - 1) {
      return { sectionIdx: state.currentSectionIdx, questionIdx: state.currentQuestionIdx + 1 }
    }
    if (state.currentSectionIdx < sections.length - 1) {
      return { sectionIdx: state.currentSectionIdx + 1, questionIdx: 0 }
    }
    return { sectionIdx: state.currentSectionIdx, questionIdx: state.currentQuestionIdx }
  }

  // ── INSTRUCTIONS phase ──────────────────────────────────
  if (state.phase === 'instructions') {
    return (
      <NtaInstructionsModal
        mockTest={payload.mockTest}
        language={state.language}
        candidateName={candidateName}
        onLanguageToggle={(lang: Language) => dispatch({ type: 'SET_LANGUAGE', language: lang })}
        onStart={() => dispatch({ type: 'START_TEST' })}
      />
    )
  }

  // ── ACTIVE phase ────────────────────────────────────────
  if (!currentSection || !currentQuestion || !currentResponse) {
    return <div className="p-8 text-center text-gray-500">Loading questions…</div>
  }

  const globalQuestionNum =
    sections.slice(0, state.currentSectionIdx).reduce((acc, s) => acc + s.questions.length, 0) +
    state.currentQuestionIdx +
    1

  return (
    <div className="flex flex-col h-screen bg-[#eef2f7] overflow-hidden">
      <NtaHeader
        testTitle={payload.mockTest.title}
        candidateName={candidateName}
        timeRemainingSeconds={state.timeRemainingSeconds}
        language={state.language}
        onSubmit={() => handleSubmit(false)}
        isSubmitting={state.isSubmitting}
      />

      <NtaSectionTabs
        sections={sections}
        currentSectionIdx={state.currentSectionIdx}
        onSelect={(idx) =>
          dispatch({ type: 'NAVIGATE', sectionIdx: idx, questionIdx: 0 })
        }
      />

      <div className="flex flex-1 overflow-hidden">
        {/* Main question area */}
        <main className="flex flex-col flex-1 overflow-hidden bg-white border-r border-gray-200">
          <div className="flex-1 overflow-hidden">
            <NtaQuestionPanel
              question={currentQuestion}
              questionNumber={globalQuestionNum}
              totalInSection={currentSection.questions.length}
              response={currentResponse}
              language={state.language}
              onLanguageToggle={(lang: Language) =>
                dispatch({ type: 'SET_LANGUAGE', language: lang })
              }
              onSelectAnswer={(answer) =>
                dispatch({
                  type: 'SELECT_ANSWER',
                  questionId: currentQuestion.question_bank_id,
                  answer,
                })
              }
              isSubmitting={state.isSubmitting}
            />
          </div>

          <NtaActionBar
            language={state.language}
            hasAnswer={currentResponse.selectedAnswer !== null}
            onMarkForReview={() =>
              dispatch({
                type: 'MARK_FOR_REVIEW',
                questionId: currentQuestion.question_bank_id,
              })
            }
            onClearResponse={() =>
              dispatch({
                type: 'CLEAR_RESPONSE',
                questionId: currentQuestion.question_bank_id,
              })
            }
            onSaveAndNext={() => {
              const next = getNextPosition()
              dispatch({
                type: 'SAVE_AND_NEXT',
                questionId: currentQuestion.question_bank_id,
                nextSectionIdx: next.sectionIdx,
                nextQuestionIdx: next.questionIdx,
              })
            }}
            isSubmitting={state.isSubmitting}
          />
        </main>

        {/* Palette sidebar */}
        <div className="w-64 shrink-0 overflow-hidden">
          <NtaQuestionPalette
            sections={sections}
            currentSectionIdx={state.currentSectionIdx}
            currentQuestionIdx={state.currentQuestionIdx}
            responses={state.responses}
            language={state.language}
            candidateName={candidateName}
            onNavigate={(sIdx, qIdx) =>
              dispatch({ type: 'NAVIGATE', sectionIdx: sIdx, questionIdx: qIdx })
            }
          />
        </div>
      </div>
    </div>
  )
}
