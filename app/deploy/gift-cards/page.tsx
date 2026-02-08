'use client'

import { useState } from 'react'
import { useDeployStore } from '@/lib/stores/deploy-store'

const STATUS_DISPLAY: Record<string, { label: string; color: string }> = {
  draft: { label: 'Draft', color: 'bg-gray-700 text-gray-300' },
  message_pending: { label: 'Message Pending', color: 'bg-yellow-900 text-yellow-300' },
  ready: { label: 'Ready', color: 'bg-green-900 text-green-300' },
  delivered: { label: 'Delivered', color: 'bg-blue-900 text-blue-300' },
  redeemed: { label: 'Redeemed', color: 'bg-purple-900 text-purple-300' },
  expired: { label: 'Expired', color: 'bg-red-900 text-red-300' },
}

const MESSAGE_STATUS_LABELS: Record<string, string> = {
  draft: 'No message yet',
  ai_generated: 'AI Generated — review needed',
  edited: 'Manually edited',
  approved: 'Approved ✓',
}

export default function GiftCardsPage() {
  const { giftCards, updateGiftCard } = useDeployStore()
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [editMessage, setEditMessage] = useState('')

  const selected = giftCards.find((g) => g.id === selectedId)

  const handleSelect = (id: string) => {
    const card = giftCards.find((g) => g.id === id)
    setSelectedId(id)
    setEditMessage(card?.message || '')
  }

  const handleGenerateAI = () => {
    if (!selectedId) return
    const card = giftCards.find((g) => g.id === selectedId)
    if (!card) return
    const aiMessage = `Dear ${card.recipient_name}, this Mountain Jewels gift card is a small expression of how much you mean to me. Whether it's a ring that catches the light or a pendant that sits close to your heart — choose something that makes you smile. With love, ${card.sender_name}.`
    setEditMessage(aiMessage)
    updateGiftCard(selectedId, { message: aiMessage, message_status: 'ai_generated' })
  }

  const handleSaveMessage = () => {
    if (!selectedId) return
    updateGiftCard(selectedId, { message: editMessage, message_status: 'edited' })
  }

  const handleApproveMessage = () => {
    if (!selectedId) return
    updateGiftCard(selectedId, { message: editMessage, message_status: 'approved', status: 'ready' })
  }

  const handleDeliver = () => {
    if (!selectedId) return
    updateGiftCard(selectedId, {
      status: 'delivered',
      delivered_at: new Date().toISOString(),
      shopify_gift_card_id: `giftcard_${Date.now()}`,
      shopify_gift_card_code: `MJ-GIFT-${Math.random().toString(36).substring(2, 6).toUpperCase()}`,
    })
  }

  const totalValue = giftCards.reduce((sum, g) => sum + g.amount, 0)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white">Gift Card Manager</h1>
          <p className="text-sm text-gray-500">Create and deliver personalized gift card moments</p>
        </div>
        <div className="flex gap-4 text-xs">
          <span className="text-[#D4AF37]">{giftCards.length} cards · ${totalValue.toLocaleString()} total</span>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Card List */}
        <div className="space-y-2">
          <h2 className="text-sm font-bold text-gray-400 mb-3">Gift Card Queue</h2>
          {giftCards.map((card) => {
            const status = STATUS_DISPLAY[card.status]
            return (
              <button
                key={card.id}
                onClick={() => handleSelect(card.id)}
                className={`w-full text-left p-3 border rounded-lg transition-colors ${
                  selectedId === card.id ? 'border-[#D4AF37] bg-[#D4AF37]/10' : 'border-gray-800 hover:border-gray-700'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-white">{card.recipient_name}</span>
                  <span className={`text-xs px-1.5 py-0.5 rounded ${status.color}`}>{status.label}</span>
                </div>
                <p className="text-xs text-gray-500 capitalize">{card.moment_type} · ${card.amount}</p>
              </button>
            )
          })}
        </div>

        {/* Detail + Editor */}
        <div className="col-span-2">
          {selected ? (
            <div className="space-y-4">
              {/* Card Header */}
              <div className="bg-gray-900 border border-gray-800 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-lg font-bold text-white">
                    ${selected.amount} Gift Card for {selected.recipient_name}
                  </h2>
                  <span className={`text-xs px-2 py-0.5 rounded ${STATUS_DISPLAY[selected.status].color}`}>
                    {STATUS_DISPLAY[selected.status].label}
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <p className="text-xs text-gray-400">Recipient</p>
                    <p className="text-white">{selected.recipient_name}</p>
                    <p className="text-xs text-gray-500">{selected.recipient_email}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">Sender</p>
                    <p className="text-white">{selected.sender_name}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">Moment</p>
                    <p className="text-white capitalize">{selected.moment_type}</p>
                  </div>
                </div>
                {selected.video_title && (
                  <div className="mt-3 pt-3 border-t border-gray-800">
                    <p className="text-xs text-gray-400">Video Attachment</p>
                    <p className="text-sm text-[#D4AF37]">🎬 {selected.video_title}</p>
                  </div>
                )}
              </div>

              {/* Message Editor */}
              <div className="bg-gray-900 border border-gray-800 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-bold text-gray-400">Gift Card Message</h3>
                  <span className="text-xs text-gray-500">{MESSAGE_STATUS_LABELS[selected.message_status]}</span>
                </div>
                <textarea
                  value={editMessage}
                  onChange={(e) => setEditMessage(e.target.value)}
                  rows={4}
                  placeholder="Write a personalized message for the gift card..."
                  className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-sm text-white resize-none mb-3"
                  disabled={selected.status === 'delivered' || selected.status === 'redeemed'}
                />
                <div className="flex gap-2">
                  {selected.message_status === 'draft' && (
                    <button
                      onClick={handleGenerateAI}
                      className="px-4 py-1.5 bg-purple-600 hover:bg-purple-700 rounded text-xs font-medium"
                    >
                      Generate with AI
                    </button>
                  )}
                  {(selected.message_status === 'ai_generated' || selected.message_status === 'draft') && editMessage && (
                    <button
                      onClick={handleSaveMessage}
                      className="px-4 py-1.5 bg-gray-700 hover:bg-gray-600 rounded text-xs font-medium"
                    >
                      Save Edit
                    </button>
                  )}
                  {(selected.message_status === 'ai_generated' || selected.message_status === 'edited') && (
                    <button
                      onClick={handleApproveMessage}
                      className="px-4 py-1.5 bg-green-600 hover:bg-green-700 rounded text-xs font-medium"
                    >
                      Approve Message
                    </button>
                  )}
                </div>
              </div>

              {/* Delivery */}
              {selected.status === 'ready' && (
                <div className="bg-gray-900 border border-[#D4AF37]/30 rounded-lg p-4">
                  <h3 className="text-sm font-bold text-white mb-2">Ready to Deliver</h3>
                  <p className="text-xs text-gray-500 mb-3">
                    This will create a Shopify gift card for ${selected.amount} and send it to {selected.recipient_email} with the approved message.
                  </p>
                  <button
                    onClick={handleDeliver}
                    className="px-6 py-2 bg-[#D4AF37] hover:bg-[#C4A030] text-black rounded font-medium"
                  >
                    Deliver Gift Card
                  </button>
                </div>
              )}

              {/* Delivered Info */}
              {(selected.status === 'delivered' || selected.status === 'redeemed') && (
                <div className="bg-gray-900 border border-green-800/30 rounded-lg p-4">
                  <h3 className="text-sm font-bold text-green-400 mb-2">Delivered</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-xs text-gray-400">Shopify Gift Card ID</p>
                      <p className="text-white font-mono text-xs">{selected.shopify_gift_card_id}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400">Code</p>
                      <p className="text-white font-mono">{selected.shopify_gift_card_code}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400">Delivered At</p>
                      <p className="text-white">{selected.delivered_at ? new Date(selected.delivered_at).toLocaleString() : '—'}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center justify-center h-64 bg-gray-900 border border-gray-800 rounded-lg">
              <p className="text-gray-500">Select a gift card to manage</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
