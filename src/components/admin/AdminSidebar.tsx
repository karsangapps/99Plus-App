'use client'

import Link from 'next/link'

const navItems = [
  { href: '/admin', label: 'Command Hub', icon: 'tower-broadcast' },
  { href: '/admin/users', label: 'User Management', icon: 'users' },
  { href: '/admin/questions', label: 'Question Bank', icon: 'database' },
  { href: '/admin/mocks', label: 'Mock Tests', icon: 'flask-vial' },
  { href: '/admin/analytics', label: 'Analytics', icon: 'chart-line' },
  { href: '/admin/revenue', label: 'Revenue', icon: 'indian-rupee-sign' },
  { href: '/admin/security', label: 'Security & Logs', icon: 'shield-halved' }
]

export function AdminSidebar() {
  return (
    <aside className="w-64 flex-shrink-0 flex flex-col bg-gradient-to-b from-[#0F172A] to-[#1E293B] text-white min-h-screen">
      <div className="p-5 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg flex items-center justify-center bg-[#6366F1]">
            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </div>
          <div>
            <span className="text-base font-bold tracking-tight">99Plus</span>
            <span className="block text-[10px] uppercase tracking-widest text-white/50 font-mono">Admin Console</span>
          </div>
        </div>
      </div>
      <div className="px-3 pt-4 pb-2">
        <div className="flex items-center justify-between px-3 mb-3">
          <span className="text-[10px] uppercase tracking-widest text-white/30 font-semibold">Admin Hub</span>
          <span className="flex items-center gap-1 px-2 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider bg-red-500/15 text-red-200 border border-red-500/25">
            Restricted
          </span>
        </div>
        <div className="mx-3 mb-3 border-t border-white/10" />
      </div>
      <nav className="flex-1 px-3 space-y-1 overflow-y-auto">
        {navItems.map((item, i) => (
          <Link
            key={item.href}
            href={item.href}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
              i === 0 ? 'bg-[#6366F1]/15 text-white border-l-2 border-[#6366F1]' : 'text-white/60 hover:bg-white/10'
            }`}
          >
            <span className="w-5 text-center">
              {item.icon === 'tower-broadcast' && '📡'}
              {item.icon === 'users' && '👥'}
              {item.icon === 'database' && '🗄'}
              {item.icon === 'flask-vial' && '🧪'}
              {item.icon === 'chart-line' && '📈'}
              {item.icon === 'indian-rupee-sign' && '₹'}
              {item.icon === 'shield-halved' && '🛡'}
            </span>
            <span>{item.label}</span>
          </Link>
        ))}
      </nav>
      <div className="p-4 border-t border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-[#6366F1] text-xs">⛓</div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold truncate">Founder</p>
            <p className="text-[10px] text-white/40 font-mono">SUPERADMIN</p>
          </div>
        </div>
      </div>
    </aside>
  )
}
