import { KillSwitch } from '@/components/controls/KillSwitch'

const killSwitches = [
  { name: 'All Pipelines', description: 'Stop all content generation', initialState: false },
  { name: 'Social Publishing', description: 'Stop all social media posts', initialState: false },
  { name: 'Video Generation', description: 'Stop Runway video generation', initialState: false },
  { name: 'Voice Synthesis', description: 'Stop ElevenLabs voice generation', initialState: false },
  { name: 'Gift Card Delivery', description: 'Stop Shopify gift card creation', initialState: false },
]

export default function ControlsPage() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[#D4AF37]">Emergency Controls</h1>
        <p className="text-gray-400 mt-1">Kill switches for immediate service shutdown</p>
      </div>
      <div className="space-y-4 max-w-2xl">
        {killSwitches.map((ks) => (
          <KillSwitch key={ks.name} {...ks} />
        ))}
      </div>
    </div>
  )
}
