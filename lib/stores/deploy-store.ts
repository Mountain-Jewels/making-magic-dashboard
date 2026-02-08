import { create } from 'zustand'
import type {
  ProductVideoMapping,
  EmailDelivery,
  GiftCardMoment,
  LiquidSnippet,
} from '@/lib/types/deploy'

interface DeployStore {
  // Shopify
  mappings: ProductVideoMapping[]
  addMapping: (mapping: ProductVideoMapping) => void
  updateMapping: (id: string, updates: Partial<ProductVideoMapping>) => void
  deployMapping: (id: string) => void
  // Email
  emailQueue: EmailDelivery[]
  addEmailDelivery: (delivery: EmailDelivery) => void
  updateEmailDelivery: (id: string, updates: Partial<EmailDelivery>) => void
  cancelEmailDelivery: (id: string) => void
  // Gift Cards
  giftCards: GiftCardMoment[]
  addGiftCard: (card: GiftCardMoment) => void
  updateGiftCard: (id: string, updates: Partial<GiftCardMoment>) => void
  // Liquid
  snippets: LiquidSnippet[]
}

const MOCK_MAPPINGS: ProductVideoMapping[] = [
  {
    id: 'map-001',
    product_id: 'prod-001',
    product_title: 'Eternal Promise Diamond Ring',
    product_sku: 'MJ-RING-1042',
    video_id: 'vid-001',
    video_title: 'Sarah Anniversary — Jewelry Studio',
    mux_playback_id: 'placeholder-mux-001',
    deploy_status: 'live',
    deployed_at: '2026-02-07T10:00:00Z',
    shopify_product_url: 'https://mountainjewels.com/products/eternal-promise-diamond-ring',
    metafields_synced: true,
  },
  {
    id: 'map-002',
    product_id: 'prod-002',
    product_title: 'Sapphire Celebration Pendant',
    product_sku: 'MJ-NECK-2087',
    video_id: 'vid-003',
    video_title: 'Alex Graduation — Garden Scene',
    mux_playback_id: '',
    deploy_status: 'pending',
    metafields_synced: false,
  },
  {
    id: 'map-003',
    product_id: 'prod-003',
    product_title: 'Pearl Gratitude Earrings',
    product_sku: 'MJ-EAR-3015',
    video_id: 'vid-004',
    video_title: 'Mom Gratitude — A Mother\'s Love',
    mux_playback_id: '',
    deploy_status: 'pending',
    metafields_synced: false,
  },
]

const MOCK_EMAIL_QUEUE: EmailDelivery[] = [
  {
    id: 'del-001',
    template_id: 'email-anniversary',
    moment_type: 'anniversary',
    recipient_name: 'Sarah',
    recipient_email: 's****@email.com',
    sender_name: 'Colin',
    subject: 'Celebrating Your Love Story, Sarah',
    scheduled_at: '2026-02-14T09:00:00Z',
    status: 'scheduled',
    provider: 'postmark',
    opens: 0,
    clicks: 0,
    video_attached: true,
    gift_card_attached: false,
  },
  {
    id: 'del-002',
    template_id: 'email-graduation',
    moment_type: 'graduation',
    recipient_name: 'Alex',
    recipient_email: 'a****@email.com',
    sender_name: 'Colin',
    subject: 'You Did It, Alex! 🎓',
    status: 'queued',
    provider: 'postmark',
    opens: 0,
    clicks: 0,
    video_attached: true,
    gift_card_attached: true,
  },
  {
    id: 'del-003',
    template_id: 'email-gratitude',
    moment_type: 'gratitude',
    recipient_name: 'Mom',
    recipient_email: 'm****@email.com',
    sender_name: 'Colin',
    subject: 'Thank You, Mom ❤️',
    sent_at: '2026-02-05T12:00:00Z',
    status: 'delivered',
    provider: 'klaviyo',
    opens: 3,
    clicks: 1,
    video_attached: true,
    gift_card_attached: false,
  },
]

const MOCK_GIFT_CARDS: GiftCardMoment[] = [
  {
    id: 'gc-001',
    moment_type: 'graduation',
    recipient_name: 'Alex',
    recipient_email: 'a****@email.com',
    sender_name: 'Colin',
    amount: 250,
    currency: 'USD',
    message: 'Congratulations on your graduation, Alex! This gift card is a small token of how proud I am of everything you\'ve accomplished. Use it to pick something special from Mountain Jewels.',
    message_status: 'ai_generated',
    video_id: 'vid-003',
    video_title: 'Alex Graduation — Garden Scene',
    status: 'message_pending',
    created_at: '2026-02-07T14:00:00Z',
  },
  {
    id: 'gc-002',
    moment_type: 'birthday',
    recipient_name: 'Jessica',
    recipient_email: 'j****@email.com',
    sender_name: 'Colin',
    amount: 150,
    currency: 'USD',
    message: '',
    message_status: 'draft',
    status: 'draft',
    created_at: '2026-02-08T00:00:00Z',
  },
  {
    id: 'gc-003',
    moment_type: 'gratitude',
    recipient_name: 'Mom',
    recipient_email: 'm****@email.com',
    sender_name: 'Colin',
    amount: 500,
    currency: 'USD',
    message: 'Mom, thank you for everything. You\'ve given me so much, and I wanted to give you something back. Pick any piece from Mountain Jewels — you deserve it.',
    message_status: 'approved',
    video_id: 'vid-004',
    video_title: 'Mom Gratitude — A Mother\'s Love',
    shopify_gift_card_id: 'giftcard_12345',
    shopify_gift_card_code: 'MJ-GIFT-XXXX',
    status: 'ready',
    created_at: '2026-02-06T10:00:00Z',
  },
]

const MOCK_SNIPPETS: LiquidSnippet[] = [
  {
    id: 'snip-video-player',
    type: 'video_player',
    name: 'Mux Video Player',
    description: 'Embeds a Mux video player on a product page. Reads the playback ID from product metafields.',
    code: `{% if product.metafields.mountain_jewels.video_playback_id %}
<div class="mj-video-player" style="position:relative;padding-top:56.25%;background:#000;border-radius:8px;overflow:hidden;">
  <mux-player
    playback-id="{{ product.metafields.mountain_jewels.video_playback_id }}"
    metadata-video-title="{{ product.title }}"
    accent-color="#D4AF37"
    style="position:absolute;top:0;left:0;width:100%;height:100%;"
  ></mux-player>
</div>
<script src="https://cdn.jsdelivr.net/npm/@mux/mux-player@latest"></script>
{% endif %}`,
    variables: [
      { name: 'video_playback_id', description: 'Mux playback ID stored in product metafield', example: 'abc123xyz' },
    ],
  },
  {
    id: 'snip-gift-card-banner',
    type: 'gift_card_banner',
    name: 'Gift Card Banner',
    description: 'Displays a personalized gift card banner with sender message and video link.',
    code: `{% if gift_card %}
<div class="mj-gift-banner" style="background:linear-gradient(135deg,#1a1a1a,#2a2a2a);border:1px solid #D4AF37;border-radius:12px;padding:32px;text-align:center;margin:24px 0;">
  <p style="color:#D4AF37;font-size:14px;letter-spacing:2px;margin-bottom:8px;">MOUNTAIN JEWELS</p>
  <h2 style="color:#fff;font-size:24px;margin-bottom:16px;">A Gift For You</h2>
  <p style="color:#ccc;font-size:16px;line-height:1.6;max-width:480px;margin:0 auto 24px;">
    {{ gift_card.message }}
  </p>
  <div style="background:#D4AF37;color:#000;display:inline-block;padding:12px 32px;border-radius:6px;font-weight:bold;">
    {{ gift_card.code }} — {{ gift_card.initial_value | money }}
  </div>
</div>
{% endif %}`,
    variables: [
      { name: 'gift_card.message', description: 'Personalized sender message', example: 'Happy Birthday!' },
      { name: 'gift_card.code', description: 'Shopify gift card code', example: 'MJ-GIFT-ABCD' },
      { name: 'gift_card.initial_value', description: 'Gift card value in cents', example: '25000' },
    ],
  },
  {
    id: 'snip-moment-badge',
    type: 'moment_badge',
    name: 'Moment Type Badge',
    description: 'Displays a small badge showing the moment type (anniversary, birthday, etc.) on a product card.',
    code: `{% if product.metafields.mountain_jewels.moment_type %}
<span class="mj-moment-badge" style="display:inline-block;background:#D4AF37;color:#000;font-size:11px;font-weight:600;padding:2px 8px;border-radius:4px;text-transform:uppercase;letter-spacing:1px;">
  {{ product.metafields.mountain_jewels.moment_type }}
</span>
{% endif %}`,
    variables: [
      { name: 'moment_type', description: 'Type of moment from metafield', example: 'anniversary' },
    ],
  },
  {
    id: 'snip-product-story',
    type: 'product_story',
    name: 'Product Story Section',
    description: 'A rich content section that combines the video, emotional tone, and product narrative.',
    code: `{% assign tone = product.metafields.mountain_jewels.emotional_tone %}
{% assign video_id = product.metafields.mountain_jewels.video_playback_id %}
<section class="mj-product-story" style="padding:48px 0;border-top:1px solid #eee;">
  <div style="max-width:640px;margin:0 auto;text-align:center;">
    <p style="color:#D4AF37;font-size:12px;letter-spacing:3px;text-transform:uppercase;">The Story Behind This Piece</p>
    <h3 style="font-size:28px;margin:16px 0;">{{ product.title }}</h3>
    {% if tone == 'romantic' %}
      <p style="color:#666;line-height:1.8;">A symbol of enduring love, crafted for moments that last forever.</p>
    {% elsif tone == 'celebratory' %}
      <p style="color:#666;line-height:1.8;">Celebrate life's greatest achievements with a piece as remarkable as the milestone.</p>
    {% elsif tone == 'grateful' %}
      <p style="color:#666;line-height:1.8;">A heartfelt expression of gratitude, given form in precious metal and stone.</p>
    {% else %}
      <p style="color:#666;line-height:1.8;">Every piece tells a story. This one was made for a moment worth remembering.</p>
    {% endif %}
    {% if video_id %}
    <div style="margin-top:24px;">
      <mux-player playback-id="{{ video_id }}" accent-color="#D4AF37" style="width:100%;border-radius:8px;"></mux-player>
    </div>
    {% endif %}
  </div>
</section>`,
    variables: [
      { name: 'emotional_tone', description: 'Emotional tone metafield', example: 'romantic' },
      { name: 'video_playback_id', description: 'Mux playback ID', example: 'abc123xyz' },
    ],
  },
  {
    id: 'snip-email-embed',
    type: 'email_embed',
    name: 'Email Video Thumbnail',
    description: 'An email-safe thumbnail with play button overlay that links to the video landing page.',
    code: `<div style="text-align:center;margin:24px 0;">
  <a href="{{ video_landing_url }}" style="display:inline-block;position:relative;text-decoration:none;">
    <img src="{{ video_thumbnail_url }}" alt="Watch your personalized video" style="width:100%;max-width:560px;border-radius:8px;display:block;" />
    <div style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);width:64px;height:64px;background:rgba(212,175,55,0.9);border-radius:50%;display:flex;align-items:center;justify-content:center;">
      <div style="width:0;height:0;border-top:12px solid transparent;border-bottom:12px solid transparent;border-left:20px solid #000;margin-left:4px;"></div>
    </div>
  </a>
  <p style="color:#999;font-size:12px;margin-top:8px;">Click to watch your personalized video</p>
</div>`,
    variables: [
      { name: 'video_landing_url', description: 'URL to the video landing page', example: 'https://mountainjewels.com/gift/abc123' },
      { name: 'video_thumbnail_url', description: 'URL to the video thumbnail image', example: 'https://image.mux.com/abc123/thumbnail.jpg' },
    ],
  },
]

export const useDeployStore = create<DeployStore>((set) => ({
  mappings: MOCK_MAPPINGS,
  addMapping: (mapping) => set((state) => ({ mappings: [...state.mappings, mapping] })),
  updateMapping: (id, updates) =>
    set((state) => ({
      mappings: state.mappings.map((m) => (m.id === id ? { ...m, ...updates } : m)),
    })),
  deployMapping: (id) =>
    set((state) => ({
      mappings: state.mappings.map((m) =>
        m.id === id
          ? { ...m, deploy_status: 'deploying' as const }
          : m
      ),
    })),
  emailQueue: MOCK_EMAIL_QUEUE,
  addEmailDelivery: (delivery) => set((state) => ({ emailQueue: [...state.emailQueue, delivery] })),
  updateEmailDelivery: (id, updates) =>
    set((state) => ({
      emailQueue: state.emailQueue.map((e) => (e.id === id ? { ...e, ...updates } : e)),
    })),
  cancelEmailDelivery: (id) =>
    set((state) => ({
      emailQueue: state.emailQueue.map((e) =>
        e.id === id ? { ...e, status: 'cancelled' as const } : e
      ),
    })),
  giftCards: MOCK_GIFT_CARDS,
  addGiftCard: (card) => set((state) => ({ giftCards: [...state.giftCards, card] })),
  updateGiftCard: (id, updates) =>
    set((state) => ({
      giftCards: state.giftCards.map((g) => (g.id === id ? { ...g, ...updates } : g)),
    })),
  snippets: MOCK_SNIPPETS,
}))
