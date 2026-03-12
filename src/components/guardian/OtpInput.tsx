'use client'

import { useMemo, useRef } from 'react'

type Props = {
  value: string
  onChange: (next: string) => void
  length?: number
  disabled?: boolean
  idPrefix?: string
}

function clampDigits(raw: string) {
  return raw.replace(/\D/g, '')
}

export function OtpInput({
  value,
  onChange,
  length = 6,
  disabled,
  idPrefix = 'otp'
}: Props) {
  const inputsRef = useRef<Array<HTMLInputElement | null>>([])
  const digits = useMemo(() => {
    const cleaned = clampDigits(value).slice(0, length)
    return Array.from({ length }, (_, i) => cleaned[i] || '')
  }, [length, value])

  return (
    <div className="flex gap-2.5 justify-center">
      {digits.map((d, idx) => (
        <input
          key={idx}
          ref={(el) => {
            inputsRef.current[idx] = el
          }}
          id={`${idPrefix}-${idx}`}
          className="w-12 h-14 rounded-[10px] border border-[#E5E7EB] text-center text-[22px] font-bold font-mono text-[#0F172A] outline-none focus:border-[#6366F1] focus:ring-4 focus:ring-[#6366F1]/10 disabled:opacity-50 disabled:cursor-not-allowed"
          inputMode="numeric"
          autoComplete="one-time-code"
          pattern="[0-9]*"
          maxLength={1}
          disabled={disabled}
          value={d}
          onChange={(e) => {
            const nextDigit = clampDigits(e.target.value).slice(-1)
            const next = digits.map((x, i) => (i === idx ? nextDigit : x)).join('')
            onChange(next)
            if (nextDigit && idx < length - 1) {
              inputsRef.current[idx + 1]?.focus()
            }
          }}
          onKeyDown={(e) => {
            if (e.key === 'Backspace') {
              if (digits[idx]) {
                const next = digits.map((x, i) => (i === idx ? '' : x)).join('')
                onChange(next)
                return
              }
              if (idx > 0) {
                inputsRef.current[idx - 1]?.focus()
              }
            }
            if (e.key === 'ArrowLeft' && idx > 0) inputsRef.current[idx - 1]?.focus()
            if (e.key === 'ArrowRight' && idx < length - 1) inputsRef.current[idx + 1]?.focus()
          }}
          onPaste={(e) => {
            const pasted = clampDigits(e.clipboardData.getData('text')).slice(0, length)
            if (!pasted) return
            e.preventDefault()
            onChange(pasted)
            const nextIndex = Math.min(pasted.length, length - 1)
            inputsRef.current[nextIndex]?.focus()
          }}
        />
      ))}
    </div>
  )
}

