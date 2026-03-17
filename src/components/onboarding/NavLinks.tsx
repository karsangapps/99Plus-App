'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { NAV_ITEMS, STORE_NAV_ITEM } from '@/lib/navConfig'

type Props = {
  onNavigate?: () => void
  className?: string
}

const linkBase =
  'flex items-center gap-3 px-4 py-3 rounded-[12px] text-sm font-medium transition-colors'
const activeStyles =
  'text-[#0F172A] bg-[#6366F1]/10 border border-[#6366F1]/30 text-[#6366F1]'
const inactiveStyles = 'text-[#9CA3AF] hover:bg-[#F8FAFC] border border-transparent'

function NavIcon({ active }: { active: boolean }) {
  return (
    <span className={active ? 'text-[#6366F1]' : 'text-[#9CA3AF]'}>
      {active ? '◎' : '○'}
    </span>
  )
}

export function NavLinks({ onNavigate, className = '' }: Props) {
  const pathname = usePathname()

  return (
    <nav className={`flex-1 flex flex-col px-4 py-6 space-y-2 ${className}`}>
      {NAV_ITEMS.map((item) => {
        const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`)
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            className={`${linkBase} ${isActive ? activeStyles : inactiveStyles}`}
          >
            <NavIcon active={isActive} />
            <span>{item.label}</span>
          </Link>
        )
      })}
      <div className="pt-4 mt-auto">
        <div className="border-t border-[#E5E7EB] mb-4" />
        <Link
          href={STORE_NAV_ITEM.href}
          onClick={onNavigate}
          className={`${linkBase} ${inactiveStyles}`}
        >
          <NavIcon active={pathname === STORE_NAV_ITEM.href} />
          <span>{STORE_NAV_ITEM.label}</span>
        </Link>
      </div>
    </nav>
  )
}
