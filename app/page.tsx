const modules = [
  {
    name: 'CREATE',
    href: '/create',
    icon: '🎬',
    description: 'Build scenes, direct avatars, compose singing performances',
    status: 'Phase 3',
    color: 'border-purple-500/30',
  },
  {
    name: 'INTELLIGENCE',
    href: '/intelligence',
    icon: '🔍',
    description: 'Direct intelligence gathering, review detected signals',
    status: 'Phase 4',
    color: 'border-blue-500/30',
  },
  {
    name: 'PREVIEW',
    href: '/preview',
    icon: '👁️',
    description: 'Review content before publishing',
    status: 'Phase 5',
    color: 'border-green-500/30',
  },
  {
    name: 'DEPLOY',
    href: '/deploy',
    icon: '🚀',
    description: 'Publish to Shopify, email, gift cards',
    status: 'Phase 6',
    color: 'border-orange-500/30',
  },
  {
    name: 'GOVERNANCE',
    href: '/governance',
    icon: '🛡️',
    description: 'Review moments, manage safety, track costs',
    status: 'Live',
    color: 'border-[#D4AF37]/30',
  },
]

export default function HomePage() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[#D4AF37]">The Studio</h1>
        <p className="text-gray-400 mt-1">Mountain Jewels Content Production Console</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {modules.map((mod) => (
          <a
            key={mod.name}
            href={mod.href}
            className={`bg-gray-900 border ${mod.color} rounded-lg p-6 hover:bg-gray-800 transition-colors group`}
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-2xl">{mod.icon}</span>
              <span className={`text-xs px-2 py-1 rounded ${
                mod.status === 'Live'
                  ? 'bg-[#D4AF37]/20 text-[#D4AF37]'
                  : 'bg-gray-800 text-gray-500'
              }`}>
                {mod.status}
              </span>
            </div>
            <h2 className="text-lg font-bold text-white group-hover:text-[#D4AF37] transition-colors">
              {mod.name}
            </h2>
            <p className="text-sm text-gray-500 mt-1">{mod.description}</p>
          </a>
        ))}
      </div>
    </div>
  )
}
