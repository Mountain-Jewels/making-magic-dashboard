/**
 * © 2026 Mountain Jewels LLC. All rights reserved.
 * Proprietary and confidential.
 *
 * Inspector panel — properties of selected object (position, scale, rotation, opacity).
 */

'use client'

import { useSceneStore } from '@/lib/stores/scene-store'

const inputClass =
  'w-full h-8 px-2 rounded bg-[#0A0A0F] border border-[#2A2A35] text-white text-sm focus:outline-none focus:border-[#D4AF37]/50'

function Field({
  label,
  value,
  onChange,
}: {
  label: string
  value: number
  onChange: (v: number) => void
}) {
  return (
    <div className="flex items-center gap-2 mb-2">
      <label className="w-16 text-xs text-white/60 shrink-0">{label}</label>
      <input
        type="number"
        className={inputClass}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
      />
    </div>
  )
}

function Vec3Fields({
  label,
  x,
  y,
  z,
  onChange,
}: {
  label: string
  x: number
  y: number
  z: number
  onChange: (v: { x: number; y: number; z: number }) => void
}) {
  return (
    <div className="mb-3">
      <div className="text-xs text-white/60 mb-1">{label}</div>
      <div className="grid grid-cols-3 gap-2">
        <input
          type="number"
          className={inputClass}
          placeholder="X"
          value={x}
          onChange={(e) => onChange({ x: Number(e.target.value), y, z })}
        />
        <input
          type="number"
          className={inputClass}
          placeholder="Y"
          value={y}
          onChange={(e) => onChange({ x, y: Number(e.target.value), z })}
        />
        <input
          type="number"
          className={inputClass}
          placeholder="Z"
          value={z}
          onChange={(e) => onChange({ x, y, z: Number(e.target.value) })}
        />
      </div>
    </div>
  )
}

export function InspectorPanel() {
  const { selectedObject, setSelectedObject } = useSceneStore()

  if (!selectedObject) {
    return (
      <div className="flex-1 min-h-0 overflow-auto p-3 border-b border-[#2A2A35]">
        <div className="text-xs font-medium text-white/60 uppercase tracking-wider mb-2">
          Inspector
        </div>
        <div className="text-sm text-white/40">Select an object to inspect</div>
      </div>
    )
  }

  const { position, scale, rotation, opacity } = selectedObject

  const updatePosition = (v: { x: number; y: number; z: number }) =>
    setSelectedObject({ ...selectedObject, position: v })
  const updateScale = (v: { x: number; y: number; z: number }) =>
    setSelectedObject({ ...selectedObject, scale: v })
  const updateRotation = (v: { x: number; y: number; z: number }) =>
    setSelectedObject({ ...selectedObject, rotation: v })
  const updateOpacity = (v: number) =>
    setSelectedObject({ ...selectedObject, opacity: v })

  return (
    <div className="flex-1 min-h-0 overflow-auto p-3 border-b border-[#2A2A35]">
      <div className="text-xs font-medium text-white/60 uppercase tracking-wider mb-3">
        Inspector
      </div>
      <div className="text-sm text-white/80 mb-3">{selectedObject.name}</div>
      <Vec3Fields
        label="Position"
        x={position.x}
        y={position.y}
        z={position.z}
        onChange={updatePosition}
      />
      <Vec3Fields
        label="Scale"
        x={scale.x}
        y={scale.y}
        z={scale.z}
        onChange={updateScale}
      />
      <Vec3Fields
        label="Rotation"
        x={rotation.x}
        y={rotation.y}
        z={rotation.z}
        onChange={updateRotation}
      />
      <Field label="Opacity" value={opacity} onChange={updateOpacity} />
    </div>
  )
}
