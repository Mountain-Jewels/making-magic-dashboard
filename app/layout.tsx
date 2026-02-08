import type { Metadata } from 'next'
import './globals.css'
import { Shell } from '@/components/layout/Shell'

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
    <html lang="en">
      <body className="bg-gray-950 text-white min-h-screen">
        <Shell>{children}</Shell>
      </body>
    </html>
  )
}
