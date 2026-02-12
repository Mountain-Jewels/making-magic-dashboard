/**
 * © 2026 Mountain Jewels LLC. All rights reserved.
 * Proprietary and confidential.
 */

// ─── Versioning & Change Model (Step 4: Asset Library & Versioning) ───

export type CapabilityState = {
  two_d: 'available' | 'not_available'
  three_d: 'available' | 'not_available'
  interactive: 'available' | 'not_available'
}

export interface AssetVersion {
  version_id: string
  asset_id: string

  /** DAG support */
  parent_version_id?: string

  /** Layered change log */
  changeset: Change[]

  /** Capability state at this version */
  capability_state: CapabilityState

  created_at: string
}

export type LayerType =
  | 'face'
  | 'hair'
  | 'body'
  | 'wardrobe'
  | 'expression'
  | 'material'
  | 'motion'
  | 'environment'
  | 'lighting'
  | 'camera'

export interface Change {
  layer: LayerType
  action: 'add' | 'modify' | 'remove'
  parameters: Record<string, unknown>
}
