/**
 * Generation API — DALL-E, Runway, HeyGen, Luma, Suno, dialogue
 */

import { apiGet, apiPost } from './client'
import type {
  GenerateImageRequest,
  GenerateImageResponse,
  GenerateVideoRequest,
  GenerateVideoResponse,
  GenerateVideoStatusResponse,
  GenerateVideoResultResponse,
  GenerateAvatarRequest,
  GenerateAvatarResponse,
  Generate3DRequest,
  Generate3DResponse,
  Generate3DStatusResponse,
  GenerateMusicRequest,
  GenerateMusicResponse,
  GenerateMusicStatusResponse,
  GenerateDialogueRequest,
  GenerateDialogueResponse,
  PostprocessUpscaleRequest,
  PostprocessRemoveBgRequest,
  PostprocessStyleTransferRequest,
  PostprocessResponse,
} from './types'

// ─── Image (DALL-E 3) ───
export async function generateImage(
  request: GenerateImageRequest
): Promise<GenerateImageResponse> {
  return apiPost<GenerateImageResponse>('/generate/image', request)
}

// ─── Video (Runway Gen-3) ───
export async function generateVideo(
  request: GenerateVideoRequest
): Promise<GenerateVideoResponse> {
  return apiPost<GenerateVideoResponse>('/generate/video', request)
}

export async function getVideoStatus(jobId: string): Promise<GenerateVideoStatusResponse> {
  return apiGet<GenerateVideoStatusResponse>(`/generate/video/${jobId}/status`)
}

export async function getVideoResult(jobId: string): Promise<GenerateVideoResultResponse> {
  return apiGet<GenerateVideoResultResponse>(`/generate/video/${jobId}/result`)
}

// ─── Avatar (HeyGen) ───
export async function generateAvatar(
  request: GenerateAvatarRequest
): Promise<GenerateAvatarResponse> {
  return apiPost<GenerateAvatarResponse>('/generate/avatar', request)
}

// ─── 3D (Luma / Unreal) ───
export async function generate3D(
  request: Generate3DRequest
): Promise<Generate3DResponse> {
  return apiPost<Generate3DResponse>('/generate/3d', request)
}

export async function get3DStatus(jobId: string): Promise<Generate3DStatusResponse> {
  return apiGet<Generate3DStatusResponse>(`/generate/3d/${jobId}/status`)
}

export async function getUnrealStatus(jobId: string): Promise<Generate3DStatusResponse> {
  return apiGet<Generate3DStatusResponse>(`/render/unreal/${jobId}/status`)
}

// ─── Music (Suno) ───
export async function generateMusic(
  request: GenerateMusicRequest
): Promise<GenerateMusicResponse> {
  return apiPost<GenerateMusicResponse>('/generate/music', request)
}

export async function getMusicStatus(jobId: string): Promise<GenerateMusicStatusResponse> {
  return apiGet<GenerateMusicStatusResponse>(`/generate/music/${jobId}/status`)
}

// ─── Dialogue (OpenAI + ElevenLabs) ───
export async function generateDialogue(
  request: GenerateDialogueRequest
): Promise<GenerateDialogueResponse> {
  return apiPost<GenerateDialogueResponse>('/generate', request)
}

// ─── Post-process (Replicate) ───
export async function upscaleImage(
  request: PostprocessUpscaleRequest
): Promise<PostprocessResponse> {
  return apiPost<PostprocessResponse>('/postprocess/upscale', request)
}

export async function removeBackground(
  request: PostprocessRemoveBgRequest
): Promise<PostprocessResponse> {
  return apiPost<PostprocessResponse>('/postprocess/remove-bg', request)
}

export async function styleTransfer(
  request: PostprocessStyleTransferRequest
): Promise<PostprocessResponse> {
  return apiPost<PostprocessResponse>('/postprocess/style-transfer', request)
}
