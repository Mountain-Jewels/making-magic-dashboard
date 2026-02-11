/**
 * TypeScript interfaces for Making Magic API schemas
 */

// ─── Voices ───
export interface Voice {
  id: string
  name: string
  category?: string
  labels?: Record<string, string>
}

export interface VoicePreviewResponse {
  url?: string
  audio_url?: string
  duration_seconds?: number
}

export interface CloneVoiceRequest {
  name: string
  description?: string
  sample_files: string[] // URLs or base64
}

export interface CloneVoiceResponse {
  voice_id: string
  status: 'pending' | 'ready' | 'failed'
}

// ─── Generate ───
export interface GenerateImageRequest {
  prompt: string
  size?: '1024x1024' | '1792x1024' | '1024x1792'
  quality?: 'standard' | 'hd'
  style?: 'natural' | 'vivid'
}

export interface GenerateImageResponse {
  url?: string
  image_url?: string
  revised_prompt?: string
  approval_required?: boolean
}

export interface GenerateVideoRequest {
  prompt?: string
  image_url?: string
  duration?: 5 | 10 | 15
  aspect_ratio?: '16:9' | '9:16' | '1:1'
}

export interface GenerateVideoResultResponse {
  video_url: string
  duration: number
}

export interface GenerateVideoResponse {
  job_id: string
  status: 'queued' | 'processing' | 'completed' | 'failed'
}

export interface GenerateVideoStatusResponse {
  job_id: string
  status: 'queued' | 'processing' | 'completed' | 'complete' | 'succeeded' | 'failed'
  progress?: number
  video_url?: string
  error?: string
}

export interface GenerateAvatarRequest {
  avatar_id: string
  script: string
  voice_id?: string
  duration_seconds?: number
}

export interface GenerateAvatarResponse {
  job_id: string
  status: 'queued' | 'processing' | 'completed' | 'failed'
  video_url?: string
}

export interface Generate3DRequest {
  prompt?: string
  image_url?: string
  aspect_ratio?: '16:9' | '1:1' | '9:16'
}

export interface UnrealRenderRequest {
  scene_manifest: Record<string, unknown>
}

export interface UnrealRenderResponse {
  job_id: string
  status: string
}

export interface UnrealStatusResponse {
  job_id: string
  status: string
  progress?: number
  video_url?: string
}

export interface Generate3DResponse {
  job_id: string
  status: 'queued' | 'processing' | 'completed' | 'failed'
  model_url?: string
  video_url?: string
}

export interface Generate3DStatusResponse {
  job_id: string
  status: 'queued' | 'processing' | 'completed' | 'complete' | 'succeeded' | 'failed'
  progress?: number
  model_url?: string
  video_url?: string
  error?: string
}

export interface GenerateMusicRequest {
  prompt: string
  duration?: number
  genre?: string
  mood?: string
}

export interface GenerateMusicResponse {
  job_id: string
  status: 'queued' | 'processing' | 'completed' | 'failed'
}

export interface GenerateMusicStatusResponse {
  job_id: string
  status: 'queued' | 'processing' | 'completed' | 'complete' | 'failed'
  progress?: number
  audio_url?: string
  error?: string
}

export interface MusicLibraryResponse {
  tracks: { id: string; title: string; artist: string; genre: string; duration: number; preview_url: string }[]
  categories: string[]
}

export interface GenerateDialogueRequest {
  script: string
  voice_id: string
  emotional_tone?: string
}

export interface GenerateDialogueResponse {
  audio_url: string
  file_name: string
  duration_seconds?: number
}

// ─── Post-process ───
export interface PostprocessUpscaleRequest {
  image_url: string
  scale?: 2 | 4
}

export interface PostprocessRemoveBgRequest {
  image_url: string
}

export interface PostprocessStyleTransferRequest {
  image_url: string
  style_preset: string
}

export interface PostprocessResponse {
  url?: string
  output_url?: string
  status?: string
  approval_required?: boolean
}

// ─── AI Chat ───
export interface ChatMessageRequest {
  message: string
  scene_context?: Record<string, unknown>
}

export interface ChatMessageResponse {
  content: string
  approval_required?: boolean
}

export interface SuggestionsRequest {
  scene_state?: Record<string, unknown>
  scene_context?: Record<string, unknown>
}

export interface SuggestionItem {
  type: 'lighting' | 'background' | 'jewelry' | 'avatar'
  action: string
  value: string
}

export interface SuggestionsResponse {
  suggestions: SuggestionItem[]
}

export interface GrokResponse {
  response?: string
  content?: string
  trends?: string[]
}

// ─── Assets ───
export interface Asset {
  id: string
  type: 'avatar' | 'music' | 'background' | 'generated' | 'export'
  url?: string
  filename: string
  size_bytes?: number
  created_at: string
}

export interface UploadAssetResponse {
  id: string
  url: string
  filename: string
}

// ─── Scenes ───
export interface Scene {
  id: string
  name: string
  state: Record<string, unknown>
  created_at: string
  updated_at: string
}

export interface SceneListItem {
  id: string
  name: string
  updated_at: string
}

// ─── Jewelry ───
export interface JewelryCategory {
  id: string
  name: string
  product_count: number
}

export interface JewelryProduct {
  id: string
  title: string
  handle: string
  images: { url: string; alt?: string }[]
  variants?: { id: string; title: string; price: string }[]
  category?: string
}
