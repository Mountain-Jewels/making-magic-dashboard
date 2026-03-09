/**
 * TypeScript interfaces for Studio Engine V1 API
 */

export interface Transform {
  location: { x: number; y: number; z: number }
  rotation: { pitch: number; yaw: number; roll: number }
  scale: { x: number; y: number; z: number }
}

export interface ActorEntry {
  asset_path: string
  type: string
  transform: Transform
}

export interface RecipeJson {
  map: string
  camera: {
    transform: Transform
    focal_length_mm: number
    sensor_width_mm: number
  }
  lighting: {
    sun_azimuth_deg: number
    sun_elevation_deg: number
    intensity: number
    warmth: number
  }
  atmosphere: {
    fog_density: number
    fog_height: number
    mist: number
  }
  actors: ActorEntry[]
}

export interface CandidatePreview {
  image_url: string
  type: 'reference' | 'placeholder'
}

export interface CandidateResponse {
  recipe_id: string
  scene_id: string
  mode: string
  recipe_json: RecipeJson
  preview: CandidatePreview
}

export interface CandidateSetResponse {
  candidate_set_id: string
  scene_id: string
  candidates: CandidateResponse[]
}

export interface ReferenceImageUploadResponse {
  reference_image_id: string
  url: string
  width?: number | null
  height?: number | null
}

export interface ProposeRequest {
  scene_id: string
  mode: 'strict' | 'vibe'
  reference_image_id?: string
  constraints?: Record<string, unknown>
  count?: number
}

export interface RegenerateLocks {
  camera: boolean
  lighting: boolean
  atmosphere: boolean
  assets: boolean
  imports: boolean
}

export interface RegenerateRequest {
  based_on_recipe_id: string
  count?: number
  locks: RegenerateLocks
}

export interface PatchRecipeResponse {
  recipe_id: string
  preview_job_id: string
}

export interface JsonPatchOp {
  op: 'add' | 'remove' | 'replace' | 'move' | 'copy' | 'test'
  path: string
  value?: unknown
  from?: string
}

export interface AssetSearchResult {
  asset_path: string
  asset_type: string
  tags: string[]
  thumbnail_url: string | null
}

export interface AssetSearchResponse {
  results: AssetSearchResult[]
  count: number
}

export interface CreateRenderRequest {
  recipe_id: string
  type: 'preview' | 'still' | 'loop' | 'cinematic' | 'turntable'
}

export interface RenderJobResponse {
  render_id: string
  recipe_id: string
  type: string
  status: string
  progress: number
  output_json: Record<string, unknown> | null
  created_at: string
  updated_at: string
}
