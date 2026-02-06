'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const navItems = [
  { href: '/queue', label: 'MomentIntent Queue', icon: '📋' },
  { href: '/health', label: 'System Health', icon: '💚' },
  { href: '/controls', label: 'Emergency Controls', icon: '🛑' },
  { href: '/costs', label: 'Budget & Costs', icon: '💰' },
  { href: '/settings', label: 'Settings', icon: '⚙️' },
]

export function Sidebar() {
  const pathname = usePathname()
  
  return (
    <aside className="w-64 bg-gray-900 border-r border-gray-800 min-h-screen p-4">
      <div className="mb-8">
        <h1 className="text-xl font-bold text-[#D4AF37]">Making Magic</h1>
        <p className="text-xs text-gray-500">Control Console</p>
      </div>
      <nav className="space-y-2">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
              pathname.startsWith(item.href)
                ? 'bg-[#D4AF37]/20 text-[#D4AF37]'
                : 'text-gray-400 hover:bg-gray-800 hover:text-white'
            }`}
          >
            <span>{item.icon}</span>
            <span>{item.label}</span>
          </Link>
        ))}
      </nav>
    </aside>
  )
}
