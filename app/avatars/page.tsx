/**
 * © 2026 Mountain Jewels LLC. All rights reserved.
 * Proprietary and confidential.
 */

'use client'

import {
  listMetahumans,
  createMetahuman,
  getMetahumanPersona,
  updateMetahumanPersona,
  seedMetahumans,
  syncMetahumans,
} from '@/lib/api/metahumans'
import type { MetaHuman, PersonaProfile } from '@/lib/api/metahumans'
import { toast } from 'sonner'
import { Card } from '@/components/shared/Card'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { AvatarBrainPanel } from '@/components/studio/AvatarBrainPanel'
import { useState, useEffect, useCallback } from 'react'

const inputCls =
  'w-full px-3 py-2 bg-surface border border-surface-border rounded-md text-white text-sm placeholder:text-white/40 focus:outline-none focus:ring-1 focus:ring-gold'
const btnGoldCls =
  'px-4 py-2 bg-gold text-black font-medium text-sm rounded-md hover:bg-gold-hover disabled:opacity-50'
const btnBorderedCls =
  'px-4 py-2 border border-surface-border text-white text-sm rounded-md hover:bg-white/5 disabled:opacity-50'

export default function AvatarsPage() {
  const [metahumans, setMetahumans] = useState<MetaHuman[]>([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState<MetaHuman | null>(null)
  const [persona, setPersona] = useState<PersonaProfile | null>(null)
  const [personaLoading, setPersonaLoading] = useState(false)
  const [showRegister, setShowRegister] = useState(false)
  const [seeding, setSeeding] = useState(false)
  const [syncing, setSyncing] = useState(false)

  const refresh = useCallback(async () => {
    setLoading(true)
    try {
      const data = await listMetahumans()
      setMetahumans(data)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to load MetaHumans')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void refresh()
  }, [refresh])

  useEffect(() => {
    if (!selected) {
      setPersona(null)
      return
    }
    setPersonaLoading(true)
    getMetahumanPersona(selected.id)
      .then(setPersona)
      .catch((err) => {
        toast.error(err instanceof Error ? err.message : 'Failed to load persona')
        setPersona(null)
      })
      .finally(() => setPersonaLoading(false))
  }, [selected?.id])

  const handleSeed = useCallback(async () => {
    setSeeding(true)
    try {
      const res = await seedMetahumans()
      toast.success(`Seeded: ${res.inserted} inserted, ${res.skipped} skipped`)
      await refresh()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Seed failed')
    } finally {
      setSeeding(false)
    }
  }, [refresh])

  const handleSync = useCallback(async () => {
    setSyncing(true)
    try {
      const res = await syncMetahumans()
      toast.success(res.message ?? `Synced ${res.synced} MetaHumans`)
      await refresh()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Sync failed')
    } finally {
      setSyncing(false)
    }
  }, [refresh])

  return (
    <div className="p-6 space-y-6 max-w-[1400px] mx-auto">
      <div>
        <h1 className="text-2xl font-semibold text-white">Avatars & MetaHumans</h1>
        <p className="text-sm text-white/50 mt-1">
          Register, manage, and configure MetaHuman avatars
        </p>
      </div>

      {/* Section 1 - Actions bar */}
      <div className="flex flex-wrap gap-3">
        <button
          className={btnGoldCls}
          disabled={seeding}
          onClick={handleSeed}
        >
          {seeding ? 'Seeding…' : 'Seed Defaults'}
        </button>
        <button
          className={btnBorderedCls}
          disabled={syncing}
          onClick={handleSync}
        >
          {syncing ? 'Syncing…' : 'Sync from UE'}
        </button>
      </div>

      {/* Section 2 - MetaHuman Registry table */}
      <Card title="MetaHuman Registry">
        {loading ? (
          <div className="text-center text-white/60 py-8">Loading…</div>
        ) : metahumans.length === 0 ? (
          <div className="text-center text-white/50 py-8">No MetaHumans registered</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead>
                <tr className="text-white/50 border-b border-surface-border">
                  <th className="pb-2 pr-4 font-medium">Name</th>
                  <th className="pb-2 pr-4 font-medium">Gender</th>
                  <th className="pb-2 pr-4 font-medium">Archetype</th>
                  <th className="pb-2 pr-4 font-medium">Skeleton</th>
                  <th className="pb-2 pr-4 font-medium">Role</th>
                  <th className="pb-2 font-medium">Active</th>
                </tr>
              </thead>
              <tbody>
                {metahumans.map((mh) => (
                  <tr
                    key={mh.id}
                    onClick={() => setSelected(mh)}
                    className={`border-b border-surface-border/50 cursor-pointer transition-colors ${
                      selected?.id === mh.id
                        ? 'bg-gold/10 text-white'
                        : 'text-white/80 hover:bg-white/5'
                    }`}
                  >
                    <td className="py-2 pr-4 font-medium">{mh.name}</td>
                    <td className="py-2 pr-4">{mh.gender ?? '—'}</td>
                    <td className="py-2 pr-4">{mh.brand_archetype ?? '—'}</td>
                    <td className="py-2 pr-4">{mh.skeleton_type}</td>
                    <td className="py-2 pr-4">
                      {(mh.extra_data as Record<string, unknown> | undefined)?.role as string ?? '—'}
                    </td>
                    <td className="py-2">
                      <StatusBadge
                        status={
                          (mh.extra_data as Record<string, unknown> | undefined)?.active === true
                            ? 'active'
                            : 'idle'
                        }
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Section 3 - Selected MetaHuman detail */}
      {selected && (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card title="Info" subtitle="Blueprint, mesh, skeleton">
              <dl className="space-y-2 text-sm">
                <div>
                  <dt className="text-white/50">Blueprint path</dt>
                  <dd className="text-white font-mono text-xs break-all">{selected.unreal_blueprint_path}</dd>
                </div>
                <div>
                  <dt className="text-white/50">Mesh path</dt>
                  <dd className="text-white font-mono text-xs break-all">{selected.skeletal_mesh_path}</dd>
                </div>
                <div>
                  <dt className="text-white/50">Skeleton type</dt>
                  <dd className="text-white">{selected.skeleton_type}</dd>
                </div>
              </dl>
            </Card>

            <PersonaCard
              metahumanId={selected.id}
              persona={persona}
              personaLoading={personaLoading}
              onSaved={() => {
                if (selected) {
                  getMetahumanPersona(selected.id).then(setPersona)
                }
              }}
            />
          </div>

          {/* Avatar Brain — per-avatar autonomous intelligence */}
          <Card title={`${selected.name}'s Brain`} subtitle="Per-avatar autonomous intelligence — skills, memory, self-improvement">
            <div className="bg-surface rounded-lg border border-surface-border">
              <AvatarBrainPanel metahumanId={selected.id} metahumanName={selected.name} />
            </div>
          </Card>
        </>
      )}

      {/* Section 4 - Register New MetaHuman (collapsible) */}
      <Card>
        <button
          type="button"
          onClick={() => setShowRegister((v) => !v)}
          className="flex items-center gap-2 text-white font-medium text-base w-full text-left"
        >
          <span className="text-gold">{showRegister ? '▼' : '▶'}</span>
          Register New MetaHuman
        </button>
        {showRegister && (
          <RegisterForm
            onRegistered={() => {
              void refresh()
              setShowRegister(false)
            }}
          />
        )}
      </Card>
    </div>
  )
}

function PersonaCard({
  metahumanId,
  persona,
  personaLoading,
  onSaved,
}: {
  metahumanId: string
  persona: PersonaProfile | null
  personaLoading: boolean
  onSaved: () => void
}) {
  const [editMode, setEditMode] = useState(false)
  const [personaJson, setPersonaJson] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (persona?.has_persona && persona.persona) {
      setPersonaJson(JSON.stringify(persona.persona, null, 2))
    } else {
      setPersonaJson('{}')
    }
    setEditMode(false)
  }, [persona?.has_persona, persona?.persona])

  const handleSave = useCallback(async () => {
    let parsed: Record<string, unknown>
    try {
      parsed = JSON.parse(personaJson) as Record<string, unknown>
    } catch {
      toast.error('Invalid JSON')
      return
    }
    setSaving(true)
    try {
      await updateMetahumanPersona(metahumanId, parsed)
      toast.success('Persona updated')
      setEditMode(false)
      onSaved()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Save failed')
    } finally {
      setSaving(false)
    }
  }, [metahumanId, personaJson, onSaved])

  if (personaLoading) {
    return (
      <Card title="Persona" subtitle="Loading…">
        <div className="text-white/50 text-sm">Loading persona…</div>
      </Card>
    )
  }

  return (
    <Card title="Persona" subtitle={persona?.has_persona ? 'Configured' : 'Not configured'}>
      {persona?.has_persona && persona.persona && !editMode ? (
        <div>
          <pre className="text-xs text-white/80 bg-surface rounded-md p-3 overflow-auto max-h-64 font-mono">
            {JSON.stringify(persona.persona, null, 2)}
          </pre>
          <button
            className={`${btnGoldCls} mt-3`}
            onClick={() => setEditMode(true)}
          >
            Edit
          </button>
        </div>
      ) : (
        <div>
          {!persona?.has_persona && !editMode && (
            <p className="text-white/50 text-sm mb-3">No persona configured</p>
          )}
          <textarea
            className={`${inputCls} font-mono text-xs min-h-[160px] resize-y`}
            placeholder='{"name": "PersonaName", ...}'
            value={personaJson}
            onChange={(e) => setPersonaJson(e.target.value)}
          />
          <button
            className={`${btnGoldCls} mt-3`}
            disabled={saving}
            onClick={handleSave}
          >
            {saving ? 'Saving…' : 'Save'}
          </button>
          {editMode && (
            <button
              className={`${btnBorderedCls} mt-3 ml-3`}
              onClick={() => setEditMode(false)}
            >
              Cancel
            </button>
          )}
        </div>
      )}
    </Card>
  )
}

function RegisterForm({ onRegistered }: { onRegistered: () => void }) {
  const [name, setName] = useState('')
  const [unrealBlueprintPath, setUnrealBlueprintPath] = useState('')
  const [skeletalMeshPath, setSkeletalMeshPath] = useState('')
  const [skeletonType, setSkeletonType] = useState('metahuman')
  const [gender, setGender] = useState<string>('')
  const [ageRange, setAgeRange] = useState('')
  const [brandArchetype, setBrandArchetype] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault()
      if (!name.trim() || !unrealBlueprintPath.trim() || !skeletalMeshPath.trim()) {
        toast.error('Name, blueprint path, and mesh path are required')
        return
      }
      setSubmitting(true)
      try {
        await createMetahuman({
          name: name.trim(),
          unreal_blueprint_path: unrealBlueprintPath.trim(),
          skeletal_mesh_path: skeletalMeshPath.trim(),
          skeleton_type: skeletonType || 'metahuman',
          gender: gender || undefined,
          age_range: ageRange.trim() || undefined,
          brand_archetype: brandArchetype.trim() || undefined,
        })
        toast.success('MetaHuman registered')
        setName('')
        setUnrealBlueprintPath('')
        setSkeletalMeshPath('')
        setSkeletonType('metahuman')
        setGender('')
        setAgeRange('')
        setBrandArchetype('')
        onRegistered()
      } catch (err) {
        toast.error(err instanceof Error ? err.message : 'Registration failed')
      } finally {
        setSubmitting(false)
      }
    },
    [
      name,
      unrealBlueprintPath,
      skeletalMeshPath,
      skeletonType,
      gender,
      ageRange,
      brandArchetype,
      onRegistered,
    ]
  )

  return (
    <form onSubmit={handleSubmit} className="mt-6 space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <label className="space-y-1">
          <span className="text-xs text-white/60">Name</span>
          <input
            className={inputCls}
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="MetaHuman name"
          />
        </label>
        <label className="space-y-1">
          <span className="text-xs text-white/60">Gender</span>
          <select
            className={inputCls}
            value={gender}
            onChange={(e) => setGender(e.target.value)}
          >
            <option value="">—</option>
            <option value="male">male</option>
            <option value="female">female</option>
          </select>
        </label>
      </div>
      <label className="block space-y-1">
        <span className="text-xs text-white/60">Unreal blueprint path</span>
        <input
          className={inputCls}
          value={unrealBlueprintPath}
          onChange={(e) => setUnrealBlueprintPath(e.target.value)}
          placeholder="/Game/Path/BP_MetaHuman"
        />
      </label>
      <label className="block space-y-1">
        <span className="text-xs text-white/60">Skeletal mesh path</span>
        <input
          className={inputCls}
          value={skeletalMeshPath}
          onChange={(e) => setSkeletalMeshPath(e.target.value)}
          placeholder="/Game/Path/SKM_Mesh"
        />
      </label>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <label className="space-y-1">
          <span className="text-xs text-white/60">Skeleton type</span>
          <input
            className={inputCls}
            value={skeletonType}
            onChange={(e) => setSkeletonType(e.target.value)}
            placeholder="metahuman"
          />
        </label>
        <label className="space-y-1">
          <span className="text-xs text-white/60">Age range</span>
          <input
            className={inputCls}
            value={ageRange}
            onChange={(e) => setAgeRange(e.target.value)}
            placeholder="25-35"
          />
        </label>
      </div>
      <label className="block space-y-1">
        <span className="text-xs text-white/60">Brand archetype</span>
        <input
          className={inputCls}
          value={brandArchetype}
          onChange={(e) => setBrandArchetype(e.target.value)}
          placeholder="e.g. lead_concierge, elegant"
        />
      </label>
      <button type="submit" className={btnGoldCls} disabled={submitting}>
        {submitting ? 'Registering…' : 'Register'}
      </button>
    </form>
  )
}
