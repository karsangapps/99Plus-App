'use client'

import { useEffect, useCallback } from 'react'
import { NavLinks } from './NavLinks'

type Props = {
  open: boolean
  onClose: () => void
}

export function MobileNavDrawer({ open, onClose }: Props) {
  const handleEscape = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    },
    [onClose]
  )

  useEffect(() => {
    if (open) {
      document.addEventListener('keydown', handleEscape)
      document.body.style.overflow = 'hidden'
    }
    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = ''
    }
  }, [open, handleEscape])

  return (
    <>
      {/* Backdrop - lg:hidden so only on mobile */}
      <div
        role="button"
        tabIndex={-1}
        aria-hidden={!open}
        onClick={onClose}
        onKeyDown={(e) => e.key === 'Enter' && onClose()}
        className={`lg:hidden fixed inset-0 z-40 bg-black/30 transition-opacity duration-300 ${
          open ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        style={{ touchAction: 'none' }}
      />

      {/* Drawer panel - slides from left */}
      <aside
        role="dialog"
        aria-label="Navigation menu"
        aria-modal="true"
        aria-hidden={!open}
        className={`lg:hidden fixed top-0 left-0 h-full z-50 flex flex-col bg-white border-r border-[#E5E7EB] shadow-xl transition-transform duration-300 ease-out ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
        style={{
          width: 'min(260px, 85vw)',
        }}
      >
        <div className="p-6 border-b border-[#E5E7EB]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#EEF2FF] flex items-center justify-center">
              <div className="w-4 h-4 rounded bg-[#6366F1]" />
            </div>
            <span className="text-sm font-bold text-[#0F172A]">99Plus</span>
          </div>
        </div>

        <NavLinks onNavigate={onClose} />

        <div className="p-4 border-t border-[#E5E7EB] shrink-0">
          <div
            className="flex items-center gap-3 px-4 py-3.5 rounded-2xl bg-[#F8FAFC] border border-[#E5E7EB]"
            style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}
          >
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#6366F1] to-[#FACC15] flex items-center justify-center shrink-0">
              <span className="text-white text-sm font-bold">A</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-[#0F172A] truncate">Aspirant</p>
              <p className="text-xs text-[#9CA3AF] truncate">CUET 2026</p>
            </div>
          </div>
        </div>
      </aside>
    </>
  )
}
