/**
 * © 2026 Mountain Jewels LLC. All rights reserved.
 * Proprietary and confidential.
 */

import { create } from 'zustand'
import type { PreviewVideo, ShopifyProduct, EmailTemplate } from '@/lib/types/preview'

interface PreviewStore {
  // Videos
  videos: PreviewVideo[]
  selectedVideo: PreviewVideo | null
  compareVideo: PreviewVideo | null
  setSelectedVideo: (video: PreviewVideo | null) => void
  setCompareVideo: (video: PreviewVideo | null) => void
  // Shopify
  products: ShopifyProduct[]
  selectedProduct: ShopifyProduct | null
  setSelectedProduct: (product: ShopifyProduct | null) => void
  // Email
  emailTemplates: EmailTemplate[]
  selectedTemplate: EmailTemplate | null
  setSelectedTemplate: (template: EmailTemplate | null) => void
}

const MOCK_VIDEOS: PreviewVideo[] = [
  {
    id: 'vid-001',
    title: 'Sarah Anniversary — Jewelry Studio',
    source: 'scene_render',
    source_id: 'scene-001',
    mux_playback_id: 'placeholder-mux-001',
    duration_seconds: 45,
    resolution: '1920x1080',
    file_size_mb: 28.4,
    status: 'ready',
    created_at: '2026-02-06T12:00:00Z',
    metadata: { background: 'jewelry_studio', camera: 'rotating_360', lighting: 'warm_golden', sku: 'MJ-RING-1042' },
  },
  {
    id: 'vid-002',
    title: 'Ten Years of Us — Singing Performance',
    source: 'singing_avatar',
    source_id: 'track-001',
    mux_playback_id: 'placeholder-mux-002',
    duration_seconds: 90,
    resolution: '1920x1080',
    file_size_mb: 54.1,
    status: 'ready',
    created_at: '2026-02-06T14:00:00Z',
    metadata: { voice: 'soprano_warm', genre: 'pop_ballad', avatar: 'Isabella' },
  },
  {
    id: 'vid-003',
    title: 'Alex Graduation — Garden Scene',
    source: 'scene_render',
    source_id: 'scene-002',
    duration_seconds: 30,
    resolution: '1920x1080',
    file_size_mb: 18.2,
    status: 'processing',
    created_at: '2026-02-07T16:00:00Z',
    metadata: { background: 'garden_terrace', camera: 'medium_shot', lighting: 'sunset_glow' },
  },
  {
    id: 'vid-004',
    title: 'Mom Gratitude — A Mother\'s Love',
    source: 'singing_avatar',
    source_id: 'track-003',
    duration_seconds: 75,
    resolution: '1920x1080',
    file_size_mb: 0,
    status: 'processing',
    created_at: '2026-02-07T17:00:00Z',
    metadata: { voice: 'alto_rich', genre: 'classical_aria', avatar: 'Aria' },
  },
]

const MOCK_PRODUCTS: ShopifyProduct[] = [
  {
    id: 'prod-001',
    title: 'Eternal Promise Diamond Ring',
    handle: 'eternal-promise-diamond-ring',
    vendor: 'Mountain Jewels',
    product_type: 'Ring',
    price: 4250.00,
    compare_at_price: 5000.00,
    currency: 'USD',
    images: [],
    description: 'A stunning solitaire diamond ring, symbolizing a love that endures through every season. Set in 18k white gold with a 1.2ct brilliant-cut diamond.',
    sku: 'MJ-RING-1042',
    metafields: [
      { key: 'video_playback_id', value: 'placeholder-mux-001', namespace: 'mountain_jewels' },
      { key: 'moment_type', value: 'anniversary', namespace: 'mountain_jewels' },
      { key: 'emotional_tone', value: 'romantic', namespace: 'mountain_jewels' },
    ],
  },
  {
    id: 'prod-002',
    title: 'Sapphire Celebration Pendant',
    handle: 'sapphire-celebration-pendant',
    vendor: 'Mountain Jewels',
    product_type: 'Necklace',
    price: 2180.00,
    currency: 'USD',
    images: [],
    description: 'A vibrant blue sapphire pendant on a delicate 18k gold chain. The perfect way to mark a milestone achievement.',
    sku: 'MJ-NECK-2087',
    metafields: [
      { key: 'moment_type', value: 'graduation', namespace: 'mountain_jewels' },
      { key: 'emotional_tone', value: 'celebratory', namespace: 'mountain_jewels' },
    ],
  },
  {
    id: 'prod-003',
    title: 'Pearl Gratitude Earrings',
    handle: 'pearl-gratitude-earrings',
    vendor: 'Mountain Jewels',
    product_type: 'Earrings',
    price: 890.00,
    currency: 'USD',
    images: [],
    description: 'Classic freshwater pearl earrings set in sterling silver. A timeless expression of gratitude and love.',
    sku: 'MJ-EAR-3015',
    metafields: [
      { key: 'moment_type', value: 'gratitude', namespace: 'mountain_jewels' },
      { key: 'emotional_tone', value: 'grateful', namespace: 'mountain_jewels' },
    ],
  },
]

const MOCK_EMAIL_TEMPLATES: EmailTemplate[] = [
  {
    id: 'email-birthday',
    moment_type: 'birthday',
    subject: 'A Special Birthday Gift Awaits You, {{recipient_name}}',
    preview_text: 'Someone who loves you has something beautiful to share...',
    header_image_url: '',
    body_html: '<h1 style="color:#D4AF37">Happy Birthday, {{recipient_name}}!</h1><p>{{sender_name}} has created something truly special just for you — a personalized video celebrating this milestone.</p><div style="background:#1a1a1a;padding:20px;border-radius:8px;text-align:center"><p style="color:#999">🎬 Your personalized video is ready</p></div><p>This gift was crafted with love, featuring a singing performance and a hand-selected piece from Mountain Jewels.</p>',
    cta_label: 'Watch Your Gift',
    cta_url: 'https://mountainjewels.com/gift/{{gift_id}}',
    personalization: { recipient_name: 'Sarah', sender_name: 'Colin', moment_date: '2026-03-15' },
  },
  {
    id: 'email-anniversary',
    moment_type: 'anniversary',
    subject: 'Celebrating Your Love Story, {{recipient_name}}',
    preview_text: 'A heartfelt anniversary surprise is waiting...',
    header_image_url: '',
    body_html: '<h1 style="color:#D4AF37">Happy Anniversary, {{recipient_name}}!</h1><p>{{sender_name}} wanted to celebrate the beautiful journey you\'ve shared together. This year marks another chapter in your incredible love story.</p><div style="background:#1a1a1a;padding:20px;border-radius:8px;text-align:center"><p style="color:#999">🎬 A personalized singing performance</p></div><p>Paired with a stunning piece from Mountain Jewels — a symbol of enduring love.</p>',
    cta_label: 'Unwrap Your Surprise',
    cta_url: 'https://mountainjewels.com/gift/{{gift_id}}',
    personalization: { recipient_name: 'Sarah', sender_name: 'Colin', moment_date: '2026-02-14', product_name: 'Eternal Promise Diamond Ring' },
  },
  {
    id: 'email-wedding',
    moment_type: 'wedding',
    subject: 'A Wedding Gift as Unique as Your Love',
    preview_text: 'Congratulations! A special gift has been created for you...',
    header_image_url: '',
    body_html: '<h1 style="color:#D4AF37">Congratulations, {{recipient_name}}!</h1><p>{{sender_name}} has created a one-of-a-kind wedding gift to honor your special day.</p><div style="background:#1a1a1a;padding:20px;border-radius:8px;text-align:center"><p style="color:#999">🎬 Your wedding celebration video</p></div><p>This personalized experience includes a cinematic video and a piece of fine jewelry chosen just for you.</p>',
    cta_label: 'View Your Wedding Gift',
    cta_url: 'https://mountainjewels.com/gift/{{gift_id}}',
    personalization: { recipient_name: 'Emily & David', sender_name: 'Colin', moment_date: '2026-06-20' },
  },
  {
    id: 'email-graduation',
    moment_type: 'graduation',
    subject: 'You Did It, {{recipient_name}}! 🎓',
    preview_text: 'A graduation celebration is waiting for you...',
    header_image_url: '',
    body_html: '<h1 style="color:#D4AF37">Congratulations, Graduate!</h1><p>{{recipient_name}}, {{sender_name}} is so proud of everything you\'ve accomplished. This milestone deserves to be celebrated in a special way.</p><div style="background:#1a1a1a;padding:20px;border-radius:8px;text-align:center"><p style="color:#999">🎬 A personalized celebration video</p></div><p>Your achievement inspired a beautiful singing performance and a meaningful gift.</p>',
    cta_label: 'Celebrate Your Achievement',
    cta_url: 'https://mountainjewels.com/gift/{{gift_id}}',
    personalization: { recipient_name: 'Alex', sender_name: 'Colin', moment_date: '2026-05-25', product_name: 'Sapphire Celebration Pendant' },
  },
  {
    id: 'email-property',
    moment_type: 'property',
    subject: 'Welcome Home, {{recipient_name}}! 🏡',
    preview_text: 'A housewarming surprise awaits...',
    header_image_url: '',
    body_html: '<h1 style="color:#D4AF37">Welcome to Your New Home!</h1><p>{{recipient_name}}, {{sender_name}} wants to celebrate this exciting new chapter with a very special housewarming gift.</p><div style="background:#1a1a1a;padding:20px;border-radius:8px;text-align:center"><p style="color:#999">🎬 A personalized celebration</p></div><p>May your new home be filled with love, laughter, and beautiful moments.</p>',
    cta_label: 'Open Your Housewarming Gift',
    cta_url: 'https://mountainjewels.com/gift/{{gift_id}}',
    personalization: { recipient_name: 'Jessica', sender_name: 'Colin', moment_date: '2026-04-10' },
  },
  {
    id: 'email-legacy',
    moment_type: 'legacy',
    subject: 'A Timeless Gift for {{recipient_name}}',
    preview_text: 'Something meaningful has been created in your honor...',
    header_image_url: '',
    body_html: '<h1 style="color:#D4AF37">A Legacy of Love</h1><p>{{recipient_name}}, {{sender_name}} has created something truly timeless — a personalized tribute to the legacy you\'ve built and the impact you\'ve had.</p><div style="background:#1a1a1a;padding:20px;border-radius:8px;text-align:center"><p style="color:#999">🎬 A tribute video</p></div><p>Paired with a piece from Mountain Jewels that will endure for generations.</p>',
    cta_label: 'Experience Your Tribute',
    cta_url: 'https://mountainjewels.com/gift/{{gift_id}}',
    personalization: { recipient_name: 'Grandma Rose', sender_name: 'Colin', moment_date: '2026-07-04' },
  },
  {
    id: 'email-gratitude',
    moment_type: 'gratitude',
    subject: 'Thank You, {{recipient_name}} ❤️',
    preview_text: 'Someone wants to say thank you in a very special way...',
    header_image_url: '',
    body_html: '<h1 style="color:#D4AF37">Thank You, {{recipient_name}}</h1><p>{{sender_name}} wants you to know how much you mean to them. Words aren\'t always enough, so they created something special.</p><div style="background:#1a1a1a;padding:20px;border-radius:8px;text-align:center"><p style="color:#999">🎬 A heartfelt singing performance</p></div><p>This personalized experience is their way of saying: you matter, you are loved, and you are appreciated.</p>',
    cta_label: 'Feel the Gratitude',
    cta_url: 'https://mountainjewels.com/gift/{{gift_id}}',
    personalization: { recipient_name: 'Mom', sender_name: 'Colin', moment_date: '2026-05-12', product_name: 'Pearl Gratitude Earrings' },
  },
]

export const usePreviewStore = create<PreviewStore>((set) => ({
  videos: MOCK_VIDEOS,
  selectedVideo: null,
  compareVideo: null,
  setSelectedVideo: (video) => set({ selectedVideo: video }),
  setCompareVideo: (video) => set({ compareVideo: video }),
  products: MOCK_PRODUCTS,
  selectedProduct: null,
  setSelectedProduct: (product) => set({ selectedProduct: product }),
  emailTemplates: MOCK_EMAIL_TEMPLATES,
  selectedTemplate: null,
  setSelectedTemplate: (template) => set({ selectedTemplate: template }),
}))
