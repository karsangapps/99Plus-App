import Link from 'next/link'
import { getUidFromCookies } from '@/lib/session'
import { redirect } from 'next/navigation'

const navItems = [
  { href: '/command-center',  icon: 'fa-gauge-high',       label: 'Command Center' },
  { href: '/pre-test',        icon: 'fa-clipboard-check',  label: 'Pre-Test' },
  { href: '/nta-test',        icon: 'fa-desktop',          label: 'NTA Test' },
  { href: '/diagnosis',       icon: 'fa-stethoscope',      label: 'Diagnosis',    active: true },
  { href: '/surgical-drill',  icon: 'fa-crosshairs',       label: 'Surgical Drill' },
  { href: '/selection-hub',   icon: 'fa-building-columns', label: 'Selection Hub' },
]

export default async function DiagnosisLayout({ children }: { children: React.ReactNode }) {
  const uid = await getUidFromCookies()
  if (!uid) redirect('/login')

  return (
    <>
      {/* Sidebar */}
      <nav className="fixed left-0 top-0 h-screen w-64 bg-gradient-to-b from-[#0F172A] to-[#1E293B] border-r border-gray-700 flex flex-col shadow-lg z-50">
        {/* Logo */}
        <div className="p-6 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/15 flex items-center justify-center">
              <i className="fa-solid fa-square-check text-indigo-400 text-lg" />
            </div>
            <div>
              <span className="text-sm font-bold text-white">99Plus</span>
              <span className="block text-[10px] uppercase tracking-widest text-white/40 font-mono">CUET 2026</span>
            </div>
          </div>
        </div>

        {/* Nav */}
        <div className="flex-1 overflow-y-auto py-6 px-4">
          <div className="space-y-1">
            {navItems.map(item => (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-sm transition-all duration-200 ${
                  item.active
                    ? 'bg-indigo-500 text-white'
                    : 'text-slate-400 hover:bg-[#1E293B] hover:text-white'
                }`}
              >
                <i className={`fa-solid ${item.icon} w-5 text-center`} />
                <span>{item.label}</span>
              </Link>
            ))}
          </div>
        </div>

        {/* User footer */}
        <div className="p-4 border-t border-white/10">
          <div className="flex items-center gap-3 px-3.5 py-3 rounded-2xl bg-[#1E293B] border border-[#334155] cursor-pointer hover:border-indigo-500/40 transition-all">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500 to-yellow-400 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
              S
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-white truncate">CUET Aspirant</p>
              <p className="text-[10px] text-slate-400 truncate">CUET 2026</p>
            </div>
          </div>
        </div>
      </nav>

      {/* Page content */}
      {children}
    </>
  )
}
