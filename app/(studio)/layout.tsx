/**
 * © 2026 Mountain Jewels LLC. All rights reserved.
 * Proprietary and confidential.
 */

export default function StudioLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="h-[100dvh] w-full overflow-hidden">
      <div className="h-full w-full min-h-0 min-w-0">{children}</div>
    </div>
  )
}
