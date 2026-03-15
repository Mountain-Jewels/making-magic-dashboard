/**
 * © 2026 Mountain Jewels LLC. All rights reserved.
 * Proprietary and confidential.
 */

import type { Metadata } from 'next'
import { Inter, JetBrains_Mono } from 'next/font/google'
import { Toaster } from 'sonner'
import './globals.css'
import { AuthProvider } from '@/lib/auth/AuthProvider'
import { QueryProvider } from '@/components/providers/QueryProvider'
import { Shell } from '@/components/layout/Shell'
import { KeyboardShortcuts } from '@/components/layout/KeyboardShortcuts'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Making Magic — Mountain Jewels Studio',
  description: 'AI-Powered Creative Production Studio',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${inter.variable} ${jetbrainsMono.variable}`}>
      <body className="h-full font-sans antialiased">
        <QueryProvider>
          <AuthProvider>
            <Shell>{children}</Shell>
            <KeyboardShortcuts />
            <Toaster position="top-right" richColors closeButton />
          </AuthProvider>
        </QueryProvider>
      </body>
    </html>
  )
}
