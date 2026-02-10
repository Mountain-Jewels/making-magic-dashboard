'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const modules = [
  { href: '/', label: 'Home', icon: '🏠', exact: true },
  { href: '/create', label: 'CREATE', icon: '🎬', exact: false },
  { href: '/preview', label: 'PREVIEW', icon: '👁️', exact: false },
]

export function Sidebar() {
  const pathname = usePathname()

  const isActive = (item: typeof modules[0]) => {
    if (item.exact) return pathname === item.href
    return pathname.startsWith(item.href)
  }

  return (
    <aside className="w-64 bg-gray-900 border-r border-gray-800 min-h-screen p-4 flex flex-col">
      <div className="mb-8">
        <h1 className="text-xl font-bold text-[#D4AF37]">The Studio</h1>
        <p className="text-xs text-gray-500">Mountain Jewels</p>
      </div>
      <nav className="space-y-1 flex-1">
        {modules.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
              isActive(item)
                ? 'bg-[#D4AF37]/20 text-[#D4AF37]'
                : 'text-gray-400 hover:bg-gray-800 hover:text-white'
            }`}
          >
            <span>{item.icon}</span>
            <span className="font-medium">{item.label}</span>
          </Link>
        ))}
      </nav>
      <div className="pt-4 border-t border-gray-800 mt-4">
        <p className="text-xs text-gray-600">v2.0 — Phase 2</p>
      </div>
    </aside>
  )
}
