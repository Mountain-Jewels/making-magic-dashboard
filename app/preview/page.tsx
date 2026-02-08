export default function PreviewPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-[#D4AF37] mb-2">PREVIEW</h1>
      <p className="text-gray-400 mb-8">Review content before publishing</p>
      <div className="grid grid-cols-2 gap-4">
        <a href="/preview/video" className="bg-gray-900 border border-gray-800 rounded-lg p-6 hover:border-[#D4AF37]/50 transition-colors">
          <h3 className="font-semibold text-white mb-1">Video Preview</h3>
          <p className="text-sm text-gray-500">Mux player, side-by-side comparison</p>
        </a>
        <a href="/preview/playlist" className="bg-gray-900 border border-gray-800 rounded-lg p-6 hover:border-[#D4AF37]/50 transition-colors">
          <h3 className="font-semibold text-white mb-1">Playlist Manager</h3>
          <p className="text-sm text-gray-500">Browse, play, edit playlists</p>
        </a>
        <a href="/preview/shopify" className="bg-gray-900 border border-gray-800 rounded-lg p-6 hover:border-[#D4AF37]/50 transition-colors">
          <h3 className="font-semibold text-white mb-1">Shopify PDP Preview</h3>
          <p className="text-sm text-gray-500">Mock product page with video</p>
        </a>
        <a href="/preview/email" className="bg-gray-900 border border-gray-800 rounded-lg p-6 hover:border-[#D4AF37]/50 transition-colors">
          <h3 className="font-semibold text-white mb-1">Email Preview</h3>
          <p className="text-sm text-gray-500">Moment type templates, mobile/desktop</p>
        </a>
      </div>
    </div>
  )
}
