import type { Metadata } from 'next'
import './globals.css'
import { QueryProvider } from '@/lib/providers/QueryProvider'

export const metadata: Metadata = {
  title: 'Making Magic Dashboard',
  description: 'Creative Command Center - If I can dream it, I can build it.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <QueryProvider>
          {children}
        </QueryProvider>
      </body>
    </html>
  )
}

