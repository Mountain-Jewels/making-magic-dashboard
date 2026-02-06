export default function MomentDetailPage({ params }: { params: { id: string } }) {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-[#D4AF37]">MomentIntent Detail</h1>
      <p className="text-gray-400 mt-2">ID: {params.id}</p>
      {/* TODO: Implement detail view */}
    </div>
  )
}
