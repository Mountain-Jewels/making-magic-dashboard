export default function CreatePage() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-[#D4AF37] mb-2">CREATE</h1>
      <p className="text-gray-400 mb-8">Build scenes, direct avatars, compose singing performances</p>
      <div className="grid grid-cols-2 gap-4">
        <a href="/create/scenes" className="bg-gray-900 border border-gray-800 rounded-lg p-6 hover:border-[#D4AF37]/50 transition-colors">
          <h3 className="font-semibold text-white mb-1">Scene Builder</h3>
          <p className="text-sm text-gray-500">Backgrounds, cameras, lighting, jewelry placement</p>
        </a>
        <a href="/create/avatars" className="bg-gray-900 border border-gray-800 rounded-lg p-6 hover:border-[#D4AF37]/50 transition-colors">
          <h3 className="font-semibold text-white mb-1">Avatar Director</h3>
          <p className="text-sm text-gray-500">Select avatars, set tone, generate scripts</p>
        </a>
        <a href="/create/singing" className="bg-gray-900 border border-gray-800 rounded-lg p-6 hover:border-[#D4AF37]/50 transition-colors">
          <h3 className="font-semibold text-white mb-1">Singing Avatars + Playlist</h3>
          <p className="text-sm text-gray-500">Lyrics, singing voice, playlist builder</p>
        </a>
        <a href="/create/queue" className="bg-gray-900 border border-gray-800 rounded-lg p-6 hover:border-[#D4AF37]/50 transition-colors">
          <h3 className="font-semibold text-white mb-1">Content Queue</h3>
          <p className="text-sm text-gray-500">Track content in progress</p>
        </a>
      </div>
    </div>
  )
}
