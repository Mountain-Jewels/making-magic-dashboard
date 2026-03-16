// © 2026 Mountain Jewels LLC. All rights reserved.

'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const NAV = [
  { href: '/scraper', label: 'Dashboard', exact: true },
  { href: '/scraper/run-builder', label: 'Run Builder' },
  { href: '/scraper/history', label: 'History' },
  { href: '/scraper/safety', label: 'Safety' },
  { href: '/scraper/sources', label: 'Sources' },
  { href: '/scraper/templates', label: 'Templates' },
  { href: '/scraper/plans', label: 'Plans' },
]

export default function ScraperLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  return (
    <div className="flex flex-col h-full overflow-hidden">
      <nav className="flex-shrink-0 flex items-center gap-1 px-4 py-2 border-b border-[#2A2A35] bg-[#111118] overflow-x-auto">
        {NAV.map((item) => {
          const isActive = item.exact ? pathname === item.href : pathname.startsWith(item.href)
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`px-3 py-1.5 rounded-md text-sm font-medium whitespace-nowrap transition-colors ${
                isActive ? 'bg-[#D4AF37]/15 text-[#D4AF37]' : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              {item.label}
            </Link>
          )
        })}
      </nav>
      <div className="flex-1 overflow-auto p-6">{children}</div>
    </div>
  )
}
