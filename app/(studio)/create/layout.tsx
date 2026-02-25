/**
 * © 2026 Mountain Jewels LLC. All rights reserved.
 * Proprietary and confidential.
 */

export default function CreateV2Layout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div
      className="h-full w-full max-w-full overflow-hidden min-h-0 min-w-0"
      style={{
        backgroundColor: '#F9FAFB',
        color: '#111827',
      }}
    >
      {children}
    </div>
  )
}
