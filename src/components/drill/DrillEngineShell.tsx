'use client'

import { useReducer, useEffect, useRef, useCallback, useState } from 'react'
import { ConceptualBridge } from './ConceptualBridge'
import { DrillSummaryScreen } from './DrillSummaryScreen'
import type {
  DrillQuestion, DrillEngineState, DrillEngineAction, ConceptualBridgePayload,
} from './types'

type Language = 'en' | 'hi'

interface DrillEngineShellProps {
  sessionId: string
  sessionTitle: string
  linkedAttemptId: string | null
  questions: DrillQuestion[]
  markLeakId: string | null
}

// ── Reducer ──────────────────────────────────────────────────────────────────

function drillReducer(state: DrillEngineState, action: DrillEngineAction): DrillEngineState {
  switch (action.type) {
    case 'START':
      return { ...state, phase: 'answering', questionStartedAt: Date.now() }

    case 'SELECT': {
      // Optimistic local select — the API call runs separately
      return { ...state }
    }

    case 'SHOW_FEEDBACK': {
      const timeSpent = Math.round((Date.now() - state.questionStartedAt) / 1000)
      return {
        ...state,
        phase: 'feedback',
        responses: {
          ...state.responses,
          [action.questionBankId]: {
            selectedAnswer: null,  // already captured when SELECT fired
            isCorrect: action.isCorrect,
            timeSpentSeconds: timeSpent,
            conceptualBridge: action.bridge,
          },
        },
      }
    }

    case 'NEXT': {
      const nextIdx = state.currentIdx + 1
      if (nextIdx >= Object.keys(state.responses).length + 1) {
        return state // guard
      }
      return {
        ...state,
        phase: 'answering',
        currentIdx: nextIdx,
        questionStartedAt: Date.now(),
      }
    }

    case 'SUBMIT_START':
      return { ...state, isSubmitting: true }

    case 'SUBMIT_DONE':
      return { ...state, phase: 'completed', isSubmitting: false, result: action.result }

    default:
      return state
  }
}

function buildInitialState(questions: DrillQuestion[]): DrillEngineState {
  const responses: DrillEngineState['responses'] = {}
  for (const q of questions) {
    responses[q.questionBankId] = {
      selectedAnswer: null, isCorrect: null, timeSpentSeconds: 0, conceptualBridge: null,
    }
  }
  return {
    phase: 'answering',
    currentIdx: 0,
    responses,
    startedAt: Date.now(),
    questionStartedAt: Date.now(),
    isSubmitting: false,
    result: null,
  }
}

// ── Component ────────────────────────────────────────────────────────────────

export function DrillEngineShell({
  sessionId, sessionTitle, linkedAttemptId, questions, markLeakId,
}: DrillEngineShellProps) {
  const [state, dispatch] = useReducer(drillReducer, questions, buildInitialState)
  const [language, setLanguage] = useState<Language>('en')
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null)
  const [bridgeData, setBridgeData] = useState<{ isCorrect: boolean; correctAnswer: string; bridge: ConceptualBridgePayload } | null>(null)
  const [timeRemaining, setTimeRemaining] = useState(1200)
  const submittingRef = useRef(false)

  const currentQ = questions[state.currentIdx]
  const totalQ = questions.length
  const answeredCount = Object.values(state.responses).filter(r => r.isCorrect !== null).length
  const isLastQuestion = state.currentIdx === questions.length - 1

  // Countdown timer
  useEffect(() => {
    if (state.phase === 'completed') return
    const interval = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          handleComplete()
          return 0
        }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(interval)
  }, [state.phase])

  const handleAnswerSelect = useCallback(async (answer: string) => {
    if (state.phase !== 'answering' || !currentQ) return
    setSelectedAnswer(answer)

    const timeSpent = Math.round((Date.now() - state.questionStartedAt) / 1000)

    try {
      const res = await fetch(`/api/drill/${sessionId}/answer`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question_bank_id: currentQ.questionBankId,
          selected_answer: answer,
          time_spent_seconds: timeSpent,
        }),
      })
      const data = await res.json() as {
        ok: boolean; is_correct: boolean; correct_answer: string
        conceptual_bridge: {
          logic_fix: string; pattern: string; ncert_ref: string
          ncert_page: number | null; chapter_name: string; subject: string
        }
      }

      if (data.ok) {
        const bridge: ConceptualBridgePayload = {
          logicFix: data.conceptual_bridge.logic_fix,
          pattern: data.conceptual_bridge.pattern,
          ncertRef: data.conceptual_bridge.ncert_ref,
          ncertPage: data.conceptual_bridge.ncert_page,
          chapterName: data.conceptual_bridge.chapter_name,
          subject: data.conceptual_bridge.subject,
        }
        setBridgeData({ isCorrect: data.is_correct, correctAnswer: data.correct_answer, bridge })
        dispatch({
          type: 'SHOW_FEEDBACK',
          questionBankId: currentQ.questionBankId,
          isCorrect: data.is_correct,
          bridge,
        })
      }
    } catch {
      // If API fails, still show something
      setBridgeData(null)
      dispatch({
        type: 'SHOW_FEEDBACK',
        questionBankId: currentQ.questionBankId,
        isCorrect: false,
        bridge: {
          logicFix: `The correct answer is not "${answer}". Review this topic carefully.`,
          pattern: `Build stronger foundations in ${currentQ?.chapterName ?? 'this chapter'}.`,
          ncertRef: currentQ?.ncertBook ?? '',
          ncertPage: currentQ?.ncertPageStart ?? null,
          chapterName: currentQ?.chapterName ?? '',
          subject: currentQ?.subject ?? '',
        },
      })
    }
  }, [state.phase, state.questionStartedAt, currentQ, sessionId])

  const handleNext = useCallback(() => {
    setSelectedAnswer(null)
    setBridgeData(null)

    if (isLastQuestion) {
      handleComplete()
    } else {
      dispatch({ type: 'NEXT' })
    }
  }, [isLastQuestion])

  const handleComplete = useCallback(async () => {
    if (submittingRef.current) return
    submittingRef.current = true
    dispatch({ type: 'SUBMIT_START' })

    try {
      const res = await fetch(`/api/drill/${sessionId}/complete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      })
      const data = await res.json() as {
        ok: boolean; accuracy_pct: number; correct_count: number; wrong_count: number
        total_questions: number; leak_outcome: string; leak_message: string; linked_attempt_id: string | null
      }
      if (data.ok) {
        dispatch({
          type: 'SUBMIT_DONE',
          result: {
            accuracyPct: data.accuracy_pct,
            correctCount: data.correct_count,
            wrongCount: data.wrong_count,
            totalQuestions: data.total_questions,
            leakOutcome: (data.leak_outcome as 'sealed' | 'reduced' | 'unchanged') ?? 'unchanged',
            leakMessage: data.leak_message,
            linkedAttemptId: data.linked_attempt_id ?? linkedAttemptId,
          },
        })
      }
    } catch {
      submittingRef.current = false
    }
  }, [sessionId, linkedAttemptId])

  const formatTime = (s: number) => `${Math.floor(s / 60).toString().padStart(2, '0')}:${(s % 60).toString().padStart(2, '0')}`

  // ── Completed Screen ───────────────────────────────────────────────────────
  if (state.phase === 'completed' && state.result) {
    return (
      <div className="flex flex-col min-h-screen">
        {/* Collapsed header */}
        <header className="sticky top-0 z-50 bg-white border-b border-gray-200 px-5 py-3 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center">
            <i className="fa-solid fa-crosshairs text-indigo-500 text-sm" />
          </div>
          <div>
            <p className="text-xs text-gray-400">Surgical Drill · Mode A</p>
            <p className="text-sm font-bold text-gray-900">{sessionTitle}</p>
          </div>
        </header>
        <DrillSummaryScreen result={state.result} sessionTitle={sessionTitle} />
      </div>
    )
  }

  if (!currentQ) return null

  // ── Active Drill ───────────────────────────────────────────────────────────
  const options = currentQ.optionsJson ?? []
  const isAnswering = state.phase === 'answering'

  return (
    <div className="flex flex-col min-h-screen bg-[#F8FAFC]">

      {/* ── Drill Header (S19 collapsed) ─────────────────────── */}
      <header className="sticky top-0 z-50 bg-white border-b border-gray-200"
        style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
        <div className="px-4 sm:px-5 py-3 flex items-center justify-between gap-4">

          {/* Left: breadcrumb */}
          <div className="flex items-center gap-3 min-w-0">
            <div className="flex-shrink-0">
              <div className="flex items-center gap-1.5 mb-1">
                <span className="text-[11px] font-medium text-gray-400">Surgical Drill</span>
                <i className="fa-solid fa-chevron-right text-[8px] text-gray-400" />
                <span className="text-[11px] font-semibold text-indigo-500">Mode A: Gap-Remedy</span>
                <i className="fa-solid fa-chevron-right text-[8px] text-gray-400 hidden sm:inline" />
                <span className="text-[11px] font-semibold text-gray-900 hidden sm:inline">{currentQ.subject}</span>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-sm font-bold text-gray-900 truncate max-w-[160px] sm:max-w-none">{currentQ.chapterName}</h1>
                {currentQ.ncertBook && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-100 hidden sm:inline-flex">
                    <i className="fa-solid fa-book-open text-[9px]" />
                    {currentQ.ncertBook}
                    {currentQ.ncertPageStart ? `, pg.${currentQ.ncertPageStart}` : ''}
                  </span>
                )}
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold bg-yellow-50 text-yellow-800 border border-yellow-100">
                  <i className="fa-solid fa-tag text-[9px]" />
                  Mark Leak
                </span>
              </div>
            </div>
          </div>

          {/* Center: timer */}
          <div className="flex flex-col items-center flex-shrink-0">
            <div className="text-[10px] font-bold uppercase tracking-wider mb-1 text-gray-400">
              Q {state.currentIdx + 1} of {totalQ}
            </div>
            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-xl ${timeRemaining < 120 ? 'bg-red-50 border border-red-200' : 'bg-gray-50 border border-gray-200'}`}>
              <i className={`fa-solid fa-clock text-xs ${timeRemaining < 120 ? 'text-red-500 animate-pulse' : 'text-gray-500'}`} />
              <span className={`font-mono text-base font-medium tracking-wider ${timeRemaining < 120 ? 'text-red-600' : 'text-gray-700'}`}>
                {formatTime(timeRemaining)}
              </span>
            </div>
            <div className="w-20 mt-1.5">
              <div className="bg-gray-200 h-1 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-indigo-500 to-indigo-400 rounded-full transition-all"
                  style={{ width: `${((state.currentIdx + (state.phase === 'feedback' ? 1 : 0)) / totalQ) * 100}%` }}
                />
              </div>
            </div>
          </div>

          {/* Right: marks + difficulty */}
          <div className="flex items-center gap-3 sm:gap-4 flex-shrink-0">
            <div className="text-right hidden sm:block">
              <div className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">Marks</div>
              <div className="flex items-center gap-1 mt-0.5">
                <span className="text-xs font-bold text-emerald-600">+5</span>
                <span className="text-gray-200">/</span>
                <span className="text-xs font-bold text-red-500">−1</span>
              </div>
            </div>
            <div className="text-right">
              <div className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 hidden sm:block">Level</div>
              <div className="flex items-center gap-0.5">
                {[...Array(5)].map((_, i) => (
                  <i
                    key={i}
                    className={`fa-solid fa-bolt text-[10px] ${i < (currentQ.difficulty ?? 3) ? 'text-yellow-400' : 'text-gray-200'}`}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* ── Main content ─────────────────────────────────────── */}
      <main className="flex-1 overflow-y-auto pb-24 px-4 sm:px-6 pt-6">
        <div className="max-w-3xl mx-auto">

          {/* Question card */}
          <div className="bg-white p-5 sm:p-7 rounded-xl border border-gray-200 shadow-sm">

            {/* NCERT tag */}
            {currentQ.ncertBook && (
              <div className="flex items-center gap-2 mb-4 flex-wrap">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-100">
                  <i className="fa-solid fa-book-open text-[10px]" />
                  {currentQ.ncertBook}{currentQ.ncertPageStart ? ` — Pg.${currentQ.ncertPageStart}` : ''}
                </span>
              </div>
            )}

            {/* Question body */}
            <div className="mb-6">
              <p className="text-sm font-medium text-indigo-500 mb-2 font-mono">Q.{state.currentIdx + 1}</p>
              <div
                className="text-base font-semibold leading-relaxed text-gray-900"
                dangerouslySetInnerHTML={{
                  __html: currentQ.questionBodyJson?.[language] ?? currentQ.questionBodyJson?.en ?? '',
                }}
              />
            </div>

            {/* Options */}
            <div className="space-y-3">
              {options.map(opt => {
                const isSelected = selectedAnswer === opt.key
                const response = state.responses[currentQ.questionBankId]
                const isWrong = state.phase === 'feedback' && isSelected && response?.isCorrect === false
                const isCorrectReveal = state.phase === 'feedback' && response?.isCorrect !== undefined && opt.key === (bridgeData?.correctAnswer)

                let classes = 'w-full flex items-center gap-4 p-4 text-left border-2 rounded-xl transition-all duration-200 '
                if (isWrong) {
                  classes += 'border-red-400 bg-red-50'
                } else if (isCorrectReveal) {
                  classes += 'border-emerald-400 bg-emerald-50'
                } else if (isSelected && state.phase === 'answering') {
                  classes += 'border-indigo-400 bg-indigo-50'
                } else if (state.phase === 'feedback') {
                  classes += 'border-gray-200 bg-white opacity-50 pointer-events-none'
                } else {
                  classes += 'border-gray-200 bg-white hover:border-indigo-400 hover:bg-indigo-50 cursor-pointer'
                }

                const labelClasses = isWrong
                  ? 'bg-red-500 text-white'
                  : isCorrectReveal
                    ? 'bg-emerald-500 text-white'
                    : isSelected && state.phase === 'answering'
                      ? 'bg-indigo-500 text-white'
                      : 'bg-gray-100 text-gray-700'

                return (
                  <button
                    key={opt.key}
                    className={classes}
                    onClick={() => isAnswering && handleAnswerSelect(opt.key)}
                    disabled={!isAnswering}
                  >
                    <span className={`w-9 h-9 rounded-lg flex items-center justify-center font-bold text-sm flex-shrink-0 transition-all ${labelClasses}`}>
                      {opt.key}
                    </span>
                    <span
                      className="text-sm font-medium text-gray-900 text-left"
                      dangerouslySetInnerHTML={{ __html: opt[language] ?? opt.en }}
                    />
                    {isWrong && <i className="fa-solid fa-xmark ml-auto text-red-500 text-sm" />}
                    {isCorrectReveal && <i className="fa-solid fa-check ml-auto text-emerald-600 text-sm" />}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Conceptual Bridge — slides in after answer */}
          {state.phase === 'feedback' && bridgeData && (
            <ConceptualBridge
              isCorrect={bridgeData.isCorrect}
              correctAnswer={bridgeData.correctAnswer}
              bridge={bridgeData.bridge}
            />
          )}

        </div>
      </main>

      {/* ── Bottom action bar ────────────────────────────────── */}
      <footer className="sticky bottom-0 z-50 bg-white border-t border-gray-200"
        style={{ boxShadow: '0 -2px 8px rgba(0,0,0,0.04)' }}>
        <div className="max-w-3xl mx-auto px-6 py-3.5 flex items-center justify-between">

          {/* Skip / answered count */}
          {state.phase === 'answering' ? (
            <button
              onClick={handleNext}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-gray-400 border border-gray-200 hover:bg-gray-50 transition-colors"
            >
              <i className="fa-solid fa-forward-step text-xs" />
              Skip
            </button>
          ) : (
            <span className="text-xs text-gray-400 font-medium">
              {answeredCount}/{totalQ} answered
            </span>
          )}

          {/* Progress dots */}
          <div className="flex items-center gap-1.5">
            {questions.map((q, idx) => {
              const r = state.responses[q.questionBankId]
              const isCurrent = idx === state.currentIdx
              const isDone = r?.isCorrect !== null && r?.isCorrect !== undefined
              const isRight = r?.isCorrect === true
              const isWrong = r?.isCorrect === false

              let dotClass = 'rounded-full transition-all '
              if (isCurrent) dotClass += 'w-4 h-4 border-2 flex items-center justify-center bg-red-50 border-red-400'
              else if (isRight) dotClass += 'w-3 h-3 bg-emerald-500 shadow-[0_0_0_2px_rgba(5,150,105,0.2)]'
              else if (isWrong) dotClass += 'w-3 h-3 bg-red-500 shadow-[0_0_0_2px_rgba(239,68,68,0.2)]'
              else dotClass += 'w-3 h-3 bg-gray-200'

              return (
                <div key={q.questionBankId} className={dotClass}>
                  {isCurrent && <span className="text-[7px] font-bold text-red-600">{idx + 1}</span>}
                </div>
              )
            })}
          </div>

          {/* Next / Finish */}
          {state.phase === 'feedback' && (
            <button
              onClick={handleNext}
              disabled={state.isSubmitting}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold bg-indigo-500 hover:bg-indigo-600 text-white transition-all disabled:opacity-60"
              style={{ boxShadow: '0 4px 12px rgba(99,102,241,0.3)' }}
            >
              {state.isSubmitting ? (
                <><i className="fa-solid fa-circle-notch fa-spin text-xs" />Finishing…</>
              ) : isLastQuestion ? (
                <>Finish Drill <i className="fa-solid fa-flag-checkered text-xs" /></>
              ) : (
                <>Next Question <i className="fa-solid fa-arrow-right text-xs" /></>
              )}
            </button>
          )}
          {state.phase === 'answering' && (
            <div className="w-24 text-right">
              <span className="text-[10px] text-gray-400">Select an answer</span>
            </div>
          )}
        </div>
      </footer>

    </div>
  )
}

