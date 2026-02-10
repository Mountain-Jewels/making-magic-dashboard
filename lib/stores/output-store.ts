'use client'

import { create } from 'zustand'
import type {
  OutputProfile,
  OutputFormat,
  ResolutionPreset,
  DurationPreset,
  PlatformPreset,
  PlatformSpec,
  ThreeDFormat,
  PolyCount,
  TextureResolution,
  ThreeDAnimation,
  ThreeDBackground,
} from '@/lib/types/output'

const DEFAULT_PROFILE: OutputProfile = {
  format: '2d_video',
  resolution: 'web_standard',
  duration_preset: 'standard_30s',
  platform: 'website_embed',
}

const PLATFORM_SPECS: Record<PlatformPreset, PlatformSpec> = {
  shopify_pdp: {
    platform: 'shopify_pdp',
    aspect_ratios: ['1:1', '16:9', '4:5'],
    max_duration_seconds: 60,
    max_file_size_mb: 20,
    codec: 'H.264 MP4',
    embed_format: 'Liquid snippet',
    supports_3d_native: true,
  },
  instagram_feed: {
    platform: 'instagram_feed',
    aspect_ratios: ['1:1', '4:5'],
    max_duration_seconds: 60,
    max_file_size_mb: 250,
    codec: 'H.264 MP4',
    embed_format: 'Direct upload',
    supports_3d_native: false,
  },
  instagram_reels: {
    platform: 'instagram_reels',
    aspect_ratios: ['9:16'],
    max_duration_seconds: 90,
    max_file_size_mb: 250,
    codec: 'H.264 MP4',
    embed_format: 'Direct upload',
    supports_3d_native: false,
  },
  instagram_stories: {
    platform: 'instagram_stories',
    aspect_ratios: ['9:16'],
    max_duration_seconds: 15,
    max_file_size_mb: 250,
    codec: 'H.264 MP4',
    embed_format: 'Direct upload',
    supports_3d_native: false,
  },
  tiktok: {
    platform: 'tiktok',
    aspect_ratios: ['9:16'],
    max_duration_seconds: 600,
    max_file_size_mb: 287,
    codec: 'H.264 MP4',
    embed_format: 'Direct upload',
    supports_3d_native: false,
  },
  youtube: {
    platform: 'youtube',
    aspect_ratios: ['16:9'],
    max_duration_seconds: null,
    max_file_size_mb: 256000,
    codec: 'H.264/H.265 MP4',
    embed_format: 'iframe',
    supports_3d_native: false,
  },
  youtube_shorts: {
    platform: 'youtube_shorts',
    aspect_ratios: ['9:16'],
    max_duration_seconds: 60,
    max_file_size_mb: 256000,
    codec: 'H.264 MP4',
    embed_format: 'iframe',
    supports_3d_native: false,
  },
  facebook_feed: {
    platform: 'facebook_feed',
    aspect_ratios: ['1:1', '16:9', '4:5'],
    max_duration_seconds: 14400,
    max_file_size_mb: 10240,
    codec: 'H.264 MP4',
    embed_format: 'Direct upload',
    supports_3d_native: false,
  },
  facebook_stories: {
    platform: 'facebook_stories',
    aspect_ratios: ['9:16'],
    max_duration_seconds: 20,
    max_file_size_mb: 10240,
    codec: 'H.264 MP4',
    embed_format: 'Direct upload',
    supports_3d_native: false,
  },
  pinterest: {
    platform: 'pinterest',
    aspect_ratios: ['2:3', '1:1', '9:16'],
    max_duration_seconds: 900,
    max_file_size_mb: 2048,
    codec: 'H.264 MP4',
    embed_format: 'Direct upload',
    supports_3d_native: false,
  },
  website_embed: {
    platform: 'website_embed',
    aspect_ratios: ['any'],
    max_duration_seconds: null,
    max_file_size_mb: null,
    codec: 'H.264 MP4, WebM',
    embed_format: 'video tag or Mux',
    supports_3d_native: true,
  },
  apple_ar: {
    platform: 'apple_ar',
    aspect_ratios: ['N/A'],
    max_duration_seconds: null,
    max_file_size_mb: 50,
    codec: 'N/A',
    embed_format: 'USDZ file',
    supports_3d_native: true,
  },
  web_3d: {
    platform: 'web_3d',
    aspect_ratios: ['N/A'],
    max_duration_seconds: null,
    max_file_size_mb: 30,
    codec: 'N/A',
    embed_format: 'GLB + model-viewer',
    supports_3d_native: true,
  },
  custom: {
    platform: 'custom',
    aspect_ratios: ['any'],
    max_duration_seconds: null,
    max_file_size_mb: null,
    codec: 'User-defined',
    embed_format: 'User-defined',
    supports_3d_native: false,
  },
}

interface OutputStore {
  profile: OutputProfile
  setProfile: (updates: Partial<OutputProfile>) => void
  setFormat: (format: OutputFormat) => void
  setResolution: (resolution: ResolutionPreset) => void
  setDurationPreset: (preset: DurationPreset, customSeconds?: number) => void
  setPlatform: (platform: PlatformPreset) => void
  setThreeD: (three_d: OutputProfile['three_d']) => void
  getPlatformSpec: (platform: PlatformPreset) => PlatformSpec
  is3DOutput: () => boolean
}

export const useOutputStore = create<OutputStore>((set, get) => ({
  profile: DEFAULT_PROFILE,
  setProfile: (updates) =>
    set((state) => ({ profile: { ...state.profile, ...updates } })),
  setFormat: (format) =>
    set((state) => ({ profile: { ...state.profile, format } })),
  setResolution: (resolution) =>
    set((state) => ({ profile: { ...state.profile, resolution } })),
  setDurationPreset: (duration_preset, custom_duration_seconds) =>
    set((state) => ({
      profile: { ...state.profile, duration_preset, custom_duration_seconds },
    })),
  setPlatform: (platform) =>
    set((state) => ({ profile: { ...state.profile, platform } })),
  setThreeD: (three_d) =>
    set((state) => ({ profile: { ...state.profile, three_d } })),
  getPlatformSpec: (platform) => PLATFORM_SPECS[platform] ?? PLATFORM_SPECS.custom,
  is3DOutput: () => {
    const format = get().profile.format
    return format === '3d_video' || format === '3d_interactive'
  },
}))
