const mockCosts = {
  total_mtd: 1247.50,
  budget_limit: 5000,
  by_provider: [
    { name: 'Replicate', amount: 523.20 },
    { name: 'ElevenLabs', amount: 312.80 },
    { name: 'Runway', amount: 289.50 },
    { name: 'Mux', amount: 122.00 },
  ],
  by_moment_type: [
    { type: 'birthday', count: 45, amount: 450.00 },
    { type: 'anniversary', count: 32, amount: 480.00 },
    { type: 'milestone', count: 18, amount: 270.00 },
  ],
}

export default function CostsPage() {
  const percentUsed = (mockCosts.total_mtd / mockCosts.budget_limit) * 100
  
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[#D4AF37]">Budget & Costs</h1>
        <p className="text-gray-400 mt-1">Month-to-date spend tracking</p>
      </div>
      
      <div className="bg-gray-900 border border-gray-800 rounded-lg p-6 mb-6">
        <div className="flex justify-between items-end mb-4">
          <div>
            <p className="text-sm text-gray-400">Total Spend (MTD)</p>
            <p className="text-3xl font-bold text-white">${mockCosts.total_mtd.toFixed(2)}</p>
          </div>
          <p className="text-gray-400">of ${mockCosts.budget_limit} budget</p>
        </div>
        <div className="w-full bg-gray-800 rounded-full h-3">
          <div
            className="bg-[#D4AF37] h-3 rounded-full"
            style={{ width: `${percentUsed}%` }}
          />
        </div>
      </div>
      
      <div className="grid gap-6 md:grid-cols-2">
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-white mb-4">By Provider</h2>
          <div className="space-y-3">
            {mockCosts.by_provider.map((p) => (
              <div key={p.name} className="flex justify-between">
                <span className="text-gray-400">{p.name}</span>
                <span className="text-white">${p.amount.toFixed(2)}</span>
              </div>
            ))}
          </div>
        </div>
        
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-white mb-4">By Moment Type</h2>
          <div className="space-y-3">
            {mockCosts.by_moment_type.map((m) => (
              <div key={m.type} className="flex justify-between">
                <span className="text-gray-400 capitalize">{m.type} ({m.count})</span>
                <span className="text-white">${m.amount.toFixed(2)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
