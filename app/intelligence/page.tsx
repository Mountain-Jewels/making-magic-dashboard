export default function IntelligencePage() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-[#D4AF37] mb-2">INTELLIGENCE</h1>
      <p className="text-gray-400 mb-8">Direct intelligence gathering, review detected signals</p>
      <div className="grid grid-cols-2 gap-4">
        <a href="/intelligence/dashboard" className="bg-gray-900 border border-gray-800 rounded-lg p-6 hover:border-[#D4AF37]/50 transition-colors">
          <h3 className="font-semibold text-white mb-1">Scraper Dashboard</h3>
          <p className="text-sm text-gray-500">Engine health, active policy, recent runs</p>
        </a>
        <a href="/intelligence/sources" className="bg-gray-900 border border-gray-800 rounded-lg p-6 hover:border-[#D4AF37]/50 transition-colors">
          <h3 className="font-semibold text-white mb-1">Source Browser</h3>
          <p className="text-sm text-gray-500">View governance source matrix</p>
        </a>
        <a href="/intelligence/run-builder" className="bg-gray-900 border border-gray-800 rounded-lg p-6 hover:border-[#D4AF37]/50 transition-colors">
          <h3 className="font-semibold text-white mb-1">Run Builder</h3>
          <p className="text-sm text-gray-500">6-step governed scrape wizard</p>
        </a>
        <a href="/intelligence/history" className="bg-gray-900 border border-gray-800 rounded-lg p-6 hover:border-[#D4AF37]/50 transition-colors">
          <h3 className="font-semibold text-white mb-1">History + Safety</h3>
          <p className="text-sm text-gray-500">Run history, kill switches, circuit breakers</p>
        </a>
      </div>
    </div>
  )
}
