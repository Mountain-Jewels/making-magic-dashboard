/**
 * © 2026 Mountain Jewels LLC. All rights reserved.
 * Proprietary and confidential.
 */

'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import {
  Mountain,
  Users,
  Gem,
  Clapperboard,
  PartyPopper,
  Shirt,
  Server,
  Film,
  Radio,
  Activity,
  ArrowRight,
} from 'lucide-react'
import { useSceneStateStore } from '@/lib/stores/scene-state-store'
import { getNodes } from '@/lib/api/vm-control'
import { listJobs } from '@/lib/api/renders'
import { listSessions } from '@/lib/api/streaming'
import type { VmNode } from '@/lib/types/vm-control'
import type { JobListItem } from '@/lib/api/renders'

interface WorkspaceCard {
  label: string
  href: string
  icon: React.ElementType
  color: string
  description: string
}

const WORKSPACES: WorkspaceCard[] = [
  { label: 'Scenes', href: '/scenes', icon: Mountain, color: 'text-blue-400 bg-blue-500/10', description: 'Environments, lighting, cameras' },
  { label: 'Avatars', href: '/avatars', icon: Users, color: 'text-purple-400 bg-purple-500/10', description: 'MetaHumans, wardrobe, voice' },
  { label: 'Jewelry', href: '/jewelry', icon: Gem, color: 'text-gold bg-gold/10', description: 'Products, stone calc, configurator' },
  { label: 'Cinematics', href: '/cinematics', icon: Clapperboard, color: 'text-cyan-400 bg-cyan-500/10', description: 'Timeline, shots, camera paths' },
  { label: 'Events', href: '/events', icon: PartyPopper, color: 'text-pink-400 bg-pink-500/10', description: 'Milestone marketing videos' },
  { label: 'Fashion', href: '/fashion', icon: Shirt, color: 'text-rose-400 bg-rose-500/10', description: 'Wardrobe inventory, audits' },
]

export default function StudioHub() {
  const { scene, avatar } = useSceneStateStore()
  const [nodes, setNodes] = useState<VmNode[]>([])
  const [jobs, setJobs] = useState<JobListItem[]>([])
  const [streams, setStreams] = useState<number>(0)

  useEffect(() => {
    getNodes().then(setNodes).catch(() => {})
    listJobs().then(setJobs).catch(() => {})
    listSessions().then((s) => setStreams(s.length)).catch(() => {})
  }, [])

  const onlineNodes = nodes.filter((n) => n.azure_power_state === 'running' || n.status === 'ready').length
  const pendingJobs = jobs.filter((j) => j._state === 'pending').length
  const renderingJobs = jobs.filter((j) => j._state === 'rendering').length

  return (
    <div className="flex flex-col gap-8 p-6 max-w-7xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-white">Studio Hub</h1>
        <p className="text-sm text-white/40 mt-1">
          Making Magic — Creative production control center
        </p>
      </div>

      {/* Status row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatusCard icon={Mountain} label="Active Scene" value={scene || 'None'} accent="text-blue-400" />
        <StatusCard icon={Users} label="Active Avatar" value={avatar || 'None'} accent="text-purple-400" />
        <StatusCard icon={Server} label="VMs Online" value={`${onlineNodes} / ${nodes.length}`} accent="text-green-400" />
        <StatusCard icon={Radio} label="Active Streams" value={String(streams)} accent="text-cyan-400" />
      </div>

      {/* Render queue summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="rounded-lg border border-surface-border bg-surface-panel p-4">
          <div className="flex items-center gap-2 mb-2">
            <Film className="h-4 w-4 text-gold" />
            <span className="text-xs font-semibold text-white/50 uppercase tracking-wider">Render Queue</span>
          </div>
          <div className="flex items-baseline gap-4">
            <div>
              <span className="text-2xl font-bold text-white">{pendingJobs}</span>
              <span className="text-xs text-white/30 ml-1">pending</span>
            </div>
            <div>
              <span className="text-2xl font-bold text-gold">{renderingJobs}</span>
              <span className="text-xs text-white/30 ml-1">rendering</span>
            </div>
            <div>
              <span className="text-2xl font-bold text-white/40">{jobs.length}</span>
              <span className="text-xs text-white/30 ml-1">total</span>
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-surface-border bg-surface-panel p-4">
          <div className="flex items-center gap-2 mb-2">
            <Activity className="h-4 w-4 text-green-400" />
            <span className="text-xs font-semibold text-white/50 uppercase tracking-wider">System Health</span>
          </div>
          <div className="flex items-center gap-3">
            <span className={`h-3 w-3 rounded-full ${onlineNodes > 0 ? 'bg-green-500' : 'bg-red-500'}`} />
            <span className="text-sm text-white/70">{onlineNodes > 0 ? 'Operational' : 'No VMs Running'}</span>
          </div>
        </div>

        <div className="rounded-lg border border-surface-border bg-surface-panel p-4">
          <div className="flex items-center gap-2 mb-2">
            <Radio className="h-4 w-4 text-cyan-400" />
            <span className="text-xs font-semibold text-white/50 uppercase tracking-wider">Stream Status</span>
          </div>
          <div className="flex items-center gap-3">
            <span className={`h-3 w-3 rounded-full ${streams > 0 ? 'bg-green-500 animate-pulse' : 'bg-white/20'}`} />
            <span className="text-sm text-white/70">{streams > 0 ? `${streams} active` : 'Idle'}</span>
          </div>
        </div>
      </div>

      {/* Workspace cards */}
      <div>
        <h2 className="text-sm font-semibold text-white/50 uppercase tracking-wider mb-4">Workspaces</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {WORKSPACES.map((ws) => (
            <Link
              key={ws.href}
              href={ws.href}
              className="group flex items-start gap-4 rounded-lg border border-surface-border bg-surface-panel p-5 hover:border-white/20 hover:bg-white/[0.02] transition-all"
            >
              <div className={`rounded-lg p-2.5 ${ws.color}`}>
                <ws.icon className="h-5 w-5" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-white">{ws.label}</span>
                  <ArrowRight className="h-4 w-4 text-white/20 group-hover:text-white/50 transition-colors" />
                </div>
                <p className="text-xs text-white/40 mt-1">{ws.description}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}

function StatusCard({ icon: Icon, label, value, accent }: { icon: React.ElementType; label: string; value: string; accent: string }) {
  return (
    <div className="rounded-lg border border-surface-border bg-surface-panel p-4">
      <div className="flex items-center gap-2 mb-2">
        <Icon className={`h-4 w-4 ${accent}`} />
        <span className="text-[10px] font-semibold text-white/40 uppercase tracking-wider">{label}</span>
      </div>
      <span className="text-sm font-medium text-white truncate block">{value}</span>
    </div>
  )
}
