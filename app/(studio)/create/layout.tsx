export default function CreateV2Layout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div
      className="min-h-screen h-full w-full max-w-full overflow-hidden min-w-0"
      style={{
        backgroundColor: '#F9FAFB',
        color: '#111827',
      }}
    >
      {children}
    </div>
  )
}
