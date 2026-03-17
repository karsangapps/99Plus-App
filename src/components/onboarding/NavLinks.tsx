'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { NAV_ITEMS, STORE_NAV_ITEM, type NavItem } from '@/lib/navConfig'

type Props = { onNavigate?: () => void; className?: string }

const base = 'flex items-center gap-3 px-4 py-3 rounded-[12px] text-sm font-medium transition-colors border'
const active = 'text-[#6366F1] bg-[#6366F1]/10 border-[#6366F1]/30'
const inactive = 'text-[#9CA3AF] hover:bg-[#F8FAFC] border-transparent'

function NavIcon({ icon, on }: { icon: NavItem['icon']; on: boolean }) {
  const c = on ? '#6366F1' : '#9CA3AF'
  const sw = '2'
  switch (icon) {
    case 'compass': return <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke={c} strokeWidth={sw}><circle cx="12" cy="12" r="10"/><polygon points="16.24,7.76 14.12,14.12 7.76,16.24 9.88,9.88" fill={on ? c : 'none'} stroke={c}/></svg>
    case 'clipboard': return <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke={c} strokeWidth={sw}><path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2" strokeLinecap="round"/><rect x="9" y="3" width="6" height="4" rx="1"/><path d="M9 12h6M9 16h4" strokeLinecap="round"/></svg>
    case 'rectangle-list': return <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke={c} strokeWidth={sw}><rect x="3" y="5" width="18" height="14" rx="2"/><path d="M7 9h2M7 13h2M7 17h2M13 9h4M13 13h4M13 17h2" strokeLinecap="round"/></svg>
    case 'file-lines': return <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke={c} strokeWidth={sw}><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" strokeLinecap="round"/><polyline points="14,2 14,8 20,8"/><path d="M8 13h8M8 17h5" strokeLinecap="round"/></svg>
    case 'circle-dot': return <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke={c} strokeWidth={sw}><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="3" fill={on ? c : 'none'} stroke={c}/></svg>
    case 'chart-bar': return <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke={c} strokeWidth={sw}><path d="M3 3v18h18" strokeLinecap="round"/><path d="M7 16V10M12 16V6M17 16V12" strokeLinecap="round"/></svg>
    case 'building': return <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke={c} strokeWidth={sw}><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" strokeLinecap="round"/><polyline points="9,22 9,12 15,12 15,22"/></svg>
    case 'pen': return <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke={c} strokeWidth={sw}><circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M4.22 4.22l2.12 2.12M17.66 17.66l2.12 2.12M2 12h3M19 12h3M4.22 19.78l2.12-2.12M17.66 6.34l2.12-2.12" strokeLinecap="round"/></svg>
    case 'store': return <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke={c} strokeWidth={sw}><path d="M3 9l1-5h16l1 5v1a2 2 0 01-4 0 2 2 0 01-4 0 2 2 0 01-4 0 2 2 0 01-4 0V9z" strokeLinecap="round"/><path d="M5 21V11M19 21V11M9 21v-5a2 2 0 014 0v5" strokeLinecap="round"/></svg>
    default: return <span className="w-4 h-4 flex-shrink-0" style={{ color: c }}>○</span>
  }
}

export function NavLinks({ onNavigate, className = '' }: Props) {
  const pathname = usePathname()
  return (
    <nav className={`flex-1 flex flex-col px-4 py-6 space-y-2 ${className}`} aria-label="Main navigation">
      {NAV_ITEMS.map(item => {
        const on = pathname === item.href || pathname.startsWith(item.href + '/')
        return (
          <Link key={item.href} href={item.href} onClick={onNavigate}
            className={`${base} ${on ? active : inactive}`} aria-current={on ? 'page' : undefined}>
            <NavIcon icon={item.icon} on={on} />
            <span>{item.label}</span>
          </Link>
        )
      })}
      <div className="pt-4 mt-auto">
        <div className="border-t border-[#E5E7EB] mb-4" />
        {(() => {
          const on = pathname === STORE_NAV_ITEM.href
          return (
            <Link href={STORE_NAV_ITEM.href} onClick={onNavigate}
              className={`${base} ${on ? active : inactive}`} aria-current={on ? 'page' : undefined}>
              <NavIcon icon={STORE_NAV_ITEM.icon} on={on} />
              <span>{STORE_NAV_ITEM.label}</span>
            </Link>
          )
        })()}
      </div>
    </nav>
  )
}
