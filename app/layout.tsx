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
import { LayoutSwitcher } from '@/components/layout/LayoutSwitcher'

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
  title: 'The Studio — Mountain Jewels',
  description: 'Content Production Console',
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
            <LayoutSwitcher>{children}</LayoutSwitcher>
            <Toaster position="top-right" richColors closeButton />
          </AuthProvider>
        </QueryProvider>
      </body>
    </html>
  )
}
