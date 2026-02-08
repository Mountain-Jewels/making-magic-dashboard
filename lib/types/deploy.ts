// ─── Shopify Deploy ───

export type DeployStatus = 'pending' | 'deploying' | 'live' | 'failed' | 'rolled_back'

export interface ProductVideoMapping {
  id: string
  product_id: string
  product_title: string
  product_sku: string
  video_id: string
  video_title: string
  mux_playback_id: string
  deploy_status: DeployStatus
  deployed_at?: string
  shopify_product_url?: string
  metafields_synced: boolean
}

// ─── Email Queue ───

export type EmailDeliveryStatus = 'queued' | 'scheduled' | 'sending' | 'delivered' | 'failed' | 'cancelled'

export interface EmailDelivery {
  id: string
  template_id: string
  moment_type: string
  recipient_name: string
  recipient_email: string
  sender_name: string
  subject: string
  scheduled_at?: string
  sent_at?: string
  status: EmailDeliveryStatus
  provider: 'postmark' | 'klaviyo'
  opens: number
  clicks: number
  video_attached: boolean
  gift_card_attached: boolean
}

// ─── Gift Cards ───

export type GiftCardStatus = 'draft' | 'message_pending' | 'ready' | 'delivered' | 'redeemed' | 'expired'

export interface GiftCardMoment {
  id: string
  moment_type: string
  recipient_name: string
  recipient_email: string
  sender_name: string
  amount: number
  currency: string
  message: string
  message_status: 'draft' | 'ai_generated' | 'edited' | 'approved'
  video_id?: string
  video_title?: string
  shopify_gift_card_id?: string
  shopify_gift_card_code?: string
  status: GiftCardStatus
  created_at: string
  delivered_at?: string
}

// ─── Liquid Generator ───

export type LiquidSnippetType = 'video_player' | 'gift_card_banner' | 'moment_badge' | 'product_story' | 'email_embed'

export interface LiquidSnippet {
  id: string
  type: LiquidSnippetType
  name: string
  description: string
  code: string
  variables: { name: string; description: string; example: string }[]
  preview_html?: string
}
