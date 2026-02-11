export default function CreateV2Layout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div
      className="h-screen w-screen overflow-hidden"
      style={{
        backgroundColor: '#F9FAFB',
        color: '#111827',
      }}
    >
      {children}
    </div>
  )
}
