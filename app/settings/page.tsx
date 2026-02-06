const mockAccounts = [
  { platform: 'Instagram', connected: true, username: '@mountainjewels' },
  { platform: 'TikTok', connected: true, username: '@mountainjewels' },
  { platform: 'YouTube', connected: false, username: null },
  { platform: 'Facebook', connected: true, username: 'Mountain Jewels' },
]

const mockWebhooks = [
  { url: 'https://api.example.com/webhook', events: ['moment.approved', 'moment.completed'], active: true },
]

export default function SettingsPage() {
  return (
    <div className="max-w-4xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[#D4AF37]">Settings</h1>
        <p className="text-gray-400 mt-1">Connected accounts and integrations</p>
      </div>
      
      <div className="bg-gray-900 border border-gray-800 rounded-lg p-6 mb-6">
        <h2 className="text-lg font-semibold text-white mb-4">Connected Accounts</h2>
        <div className="space-y-3">
          {mockAccounts.map((account) => (
            <div key={account.platform} className="flex justify-between items-center">
              <div>
                <p className="text-white">{account.platform}</p>
                {account.username && <p className="text-sm text-gray-400">{account.username}</p>}
              </div>
              <span className={`px-3 py-1 rounded text-sm ${
                account.connected ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-gray-400'
              }`}>
                {account.connected ? 'Connected' : 'Not Connected'}
              </span>
            </div>
          ))}
        </div>
      </div>
      
      <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
        <h2 className="text-lg font-semibold text-white mb-4">Webhooks</h2>
        {mockWebhooks.map((webhook, i) => (
          <div key={i} className="text-sm">
            <p className="text-white font-mono">{webhook.url}</p>
            <p className="text-gray-400">Events: {webhook.events.join(', ')}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
