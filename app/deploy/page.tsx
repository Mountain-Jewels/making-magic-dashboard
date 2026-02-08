export default function DeployPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-[#D4AF37] mb-2">DEPLOY</h1>
      <p className="text-gray-400 mb-8">Publish content to Shopify, email, gift cards</p>
      <div className="grid grid-cols-2 gap-4">
        <a href="/deploy/shopify" className="bg-gray-900 border border-gray-800 rounded-lg p-6 hover:border-[#D4AF37]/50 transition-colors">
          <h3 className="font-semibold text-white mb-1">Shopify Deploy</h3>
          <p className="text-sm text-gray-500">Video-to-product, one-click deploy</p>
        </a>
        <a href="/deploy/email" className="bg-gray-900 border border-gray-800 rounded-lg p-6 hover:border-[#D4AF37]/50 transition-colors">
          <h3 className="font-semibold text-white mb-1">Email Queue</h3>
          <p className="text-sm text-gray-500">Pending deliveries, preview, send</p>
        </a>
        <a href="/deploy/gift-cards" className="bg-gray-900 border border-gray-800 rounded-lg p-6 hover:border-[#D4AF37]/50 transition-colors">
          <h3 className="font-semibold text-white mb-1">Gift Card Manager</h3>
          <p className="text-sm text-gray-500">Gift card moments, message editor</p>
        </a>
        <a href="/deploy/social" className="bg-gray-900 border border-gray-800 rounded-lg p-6 hover:border-[#D4AF37]/50 transition-colors opacity-50">
          <h3 className="font-semibold text-white mb-1">Social Queue</h3>
          <p className="text-sm text-gray-500">Coming in V2</p>
        </a>
        <a href="/deploy/liquid" className="bg-gray-900 border border-gray-800 rounded-lg p-6 hover:border-[#D4AF37]/50 transition-colors col-span-2">
          <h3 className="font-semibold text-white mb-1">Liquid Generator</h3>
          <p className="text-sm text-gray-500">Auto-generate Shopify Liquid snippets, copy-to-clipboard</p>
        </a>
      </div>
    </div>
  )
}
