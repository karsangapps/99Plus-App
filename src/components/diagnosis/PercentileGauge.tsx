'use client'

import { useEffect, useRef } from 'react'

interface PercentileGaugeProps {
  percentile: number
  prevPercentile?: number
}

export function PercentileGauge({ percentile, prevPercentile }: PercentileGaugeProps) {
  const circleRef = useRef<SVGCircleElement>(null)

  const radius = 90
  const circumference = 2 * Math.PI * radius
  const fraction = Math.min(percentile / 100, 1)
  const dashOffset = circumference * (1 - fraction)

  useEffect(() => {
    const el = circleRef.current
    if (!el) return
    el.style.strokeDashoffset = String(circumference)
    el.style.transition = 'none'
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        el.style.transition = 'stroke-dashoffset 1.8s cubic-bezier(0.4, 0, 0.2, 1)'
        el.style.strokeDashoffset = String(dashOffset)
      })
    })
  }, [dashOffset, circumference])

  const delta = prevPercentile !== undefined ? percentile - prevPercentile : null
  const deltaPositive = delta !== null && delta > 0

  return (
    <div className="flex flex-col items-center justify-center py-4">
      <p className="text-xs font-semibold tracking-widest uppercase text-gray-400 mb-5">
        Predicted NTA Percentile
      </p>
      <div className="relative w-52 h-52 mb-5">
        <svg viewBox="0 0 200 200" className="w-full h-full -rotate-90" aria-hidden="true">
          {/* Track */}
          <circle cx="100" cy="100" r={radius} fill="none" stroke="#E5E7EB" strokeWidth="12" />
          {/* Progress */}
          <circle
            ref={circleRef}
            cx="100" cy="100" r={radius}
            fill="none"
            stroke="url(#gaugeGrad)"
            strokeWidth="12"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={circumference}
          />
          <defs>
            <linearGradient id="gaugeGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%"   stopColor="#6366F1" />
              <stop offset="60%"  stopColor="#059669" />
              <stop offset="100%" stopColor="#FACC15" />
            </linearGradient>
          </defs>
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-5xl font-black text-gray-900 tracking-tight">
            {percentile.toFixed(1)}
          </span>
          <span className="text-sm font-semibold text-indigo-500 mt-1">Percentile</span>
        </div>
      </div>
      {delta !== null && (
        <div className="flex items-center gap-2 text-sm">
          <i className={`fa-solid fa-arrow-trend-${deltaPositive ? 'up' : 'down'} ${deltaPositive ? 'text-emerald-500' : 'text-red-500'}`} />
          <span className={`font-semibold ${deltaPositive ? 'text-emerald-500' : 'text-red-500'}`}>
            {deltaPositive ? '+' : ''}{delta.toFixed(1)}
          </span>
          <span className="text-gray-400">from last mock</span>
        </div>
      )}
    </div>
  )
}
