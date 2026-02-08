export default function GovernancePage() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-[#D4AF37] mb-2">GOVERNANCE</h1>
      <p className="text-gray-400 mb-8">Review moments, manage safety, track costs</p>
      <div className="grid grid-cols-2 gap-4">
        <a href="/governance/queue" className="bg-gray-900 border border-gray-800 rounded-lg p-6 hover:border-[#D4AF37]/50 transition-colors">
          <h3 className="font-semibold text-white mb-1">MomentIntent Queue</h3>
          <p className="text-sm text-gray-500">Review pending moments</p>
        </a>
        <a href="/governance/health" className="bg-gray-900 border border-gray-800 rounded-lg p-6 hover:border-[#D4AF37]/50 transition-colors">
          <h3 className="font-semibold text-white mb-1">System Health</h3>
          <p className="text-sm text-gray-500">Provider status, circuit breakers</p>
        </a>
        <a href="/governance/controls" className="bg-gray-900 border border-gray-800 rounded-lg p-6 hover:border-[#D4AF37]/50 transition-colors">
          <h3 className="font-semibold text-white mb-1">Emergency Controls</h3>
          <p className="text-sm text-gray-500">Kill switches</p>
        </a>
        <a href="/governance/costs" className="bg-gray-900 border border-gray-800 rounded-lg p-6 hover:border-[#D4AF37]/50 transition-colors">
          <h3 className="font-semibold text-white mb-1">Budget & Costs</h3>
          <p className="text-sm text-gray-500">MTD spend tracking</p>
        </a>
        <a href="/governance/settings" className="bg-gray-900 border border-gray-800 rounded-lg p-6 hover:border-[#D4AF37]/50 transition-colors">
          <h3 className="font-semibold text-white mb-1">Settings</h3>
          <p className="text-sm text-gray-500">Connected accounts, webhooks</p>
        </a>
      </div>
    </div>
  )
}
