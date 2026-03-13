/**
 * © 2026 Mountain Jewels LLC. All rights reserved.
 * Proprietary and confidential.
 */

import type { AssetsOverview } from '@/lib/types/asset-ingest'

function OverviewCard({
  label,
  value,
  helper,
  accent,
}: {
  label: string
  value: string
  helper?: string
  accent?: 'red' | 'green' | 'amber' | 'blue'
}) {
  const accentMap = {
    red: 'text-red-400',
    green: 'text-green-400',
    amber: 'text-amber-400',
    blue: 'text-blue-400',
  }
  const valueColor = accent ? accentMap[accent] : 'text-white'

  return (
    <div className="rounded-lg border border-[#2A2A35] bg-[#111118] p-4">
      <div className="text-xs text-white/60 uppercase tracking-wide">{label}</div>
      <div className={`mt-2 text-2xl font-semibold ${valueColor}`}>{value}</div>
      {helper ? <div className="mt-1 text-sm text-white/60">{helper}</div> : null}
    </div>
  )
}

type AssetsOverviewSectionProps = {
  data: AssetsOverview
}

export function AssetsOverviewSection({ data }: AssetsOverviewSectionProps) {
  return (
    <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      <OverviewCard
        label="Queued Jobs"
        value={data.queued_jobs.toString()}
        accent="blue"
      />
      <OverviewCard
        label="Processing"
        value={data.processing_jobs.toString()}
        accent="blue"
      />
      <OverviewCard
        label="Failed"
        value={data.failed_jobs.toString()}
        accent={data.failed_jobs > 0 ? 'red' : undefined}
      />
      <OverviewCard
        label="Complete"
        value={data.complete_jobs.toString()}
        accent="amber"
      />
      <OverviewCard
        label="Promoted"
        value={data.promoted_jobs.toString()}
        accent="green"
      />
      <OverviewCard
        label="Active Assets"
        value={data.active_assets.toString()}
        accent="green"
      />
      <OverviewCard
        label="MetaHuman Assets"
        value={data.metahuman_assets.toString()}
      />
    </section>
  )
}
