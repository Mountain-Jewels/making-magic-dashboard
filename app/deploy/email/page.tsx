'use client'

import { useState } from 'react'
import { useDeployStore } from '@/lib/stores/deploy-store'

const STATUS_DISPLAY: Record<string, { label: string; color: string; icon: string }> = {
  queued: { label: 'Queued', color: 'bg-gray-700 text-gray-300', icon: '📬' },
  scheduled: { label: 'Scheduled', color: 'bg-blue-900 text-blue-300', icon: '📅' },
  sending: { label: 'Sending', color: 'bg-yellow-900 text-yellow-300', icon: '✉️' },
  delivered: { label: 'Delivered', color: 'bg-green-900 text-green-300', icon: '✅' },
  failed: { label: 'Failed', color: 'bg-red-900 text-red-300', icon: '❌' },
  cancelled: { label: 'Cancelled', color: 'bg-gray-700 text-gray-400', icon: '🚫' },
}

const PROVIDER_LABELS: Record<string, string> = {
  postmark: 'Postmark (transactional)',
  klaviyo: 'Klaviyo (lifecycle)',
}

export default function EmailQueuePage() {
  const { emailQueue, updateEmailDelivery, cancelEmailDelivery } = useDeployStore()
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [confirmCancel, setConfirmCancel] = useState<string | null>(null)

  const queuedCount = emailQueue.filter((e) => e.status === 'queued' || e.status === 'scheduled').length
  const deliveredCount = emailQueue.filter((e) => e.status === 'delivered').length

  const handleSendNow = (id: string) => {
    updateEmailDelivery(id, { status: 'sending' })
    setTimeout(() => {
      updateEmailDelivery(id, { status: 'delivered', sent_at: new Date().toISOString() })
    }, 1500)
  }

  const handleCancel = (id: string) => {
    cancelEmailDelivery(id)
    setConfirmCancel(null)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white">Email Queue</h1>
          <p className="text-sm text-gray-500">Manage pending email deliveries</p>
        </div>
        <div className="flex gap-4 text-xs">
          <span className="text-blue-400">{queuedCount} pending</span>
          <span className="text-green-400">{deliveredCount} delivered</span>
        </div>
      </div>

      <div className="space-y-2">
        {emailQueue.map((delivery) => {
          const status = STATUS_DISPLAY[delivery.status]
          const isExpanded = expandedId === delivery.id
          const canAct = delivery.status === 'queued' || delivery.status === 'scheduled'

          return (
            <div key={delivery.id} className="bg-gray-900 border border-gray-800 rounded-lg">
              <button
                onClick={() => setExpandedId(isExpanded ? null : delivery.id)}
                className="w-full text-left p-4 flex items-center gap-4"
              >
                <span className="text-lg">{status.icon}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-1">
                    <h3 className="text-sm font-medium text-white">{delivery.subject}</h3>
                    <span className={`text-xs px-2 py-0.5 rounded ${status.color}`}>{status.label}</span>
                  </div>
                  <p className="text-xs text-gray-500">
                    To: {delivery.recipient_name} ({delivery.recipient_email}) · From: {delivery.sender_name}
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-xs text-gray-400 capitalize">{delivery.moment_type}</p>
                  <p className="text-xs text-gray-600">{PROVIDER_LABELS[delivery.provider]}</p>
                </div>
                <span className="text-gray-600">{isExpanded ? '▼' : '▶'}</span>
              </button>

              {isExpanded && (
                <div className="px-4 pb-4 border-t border-gray-800 pt-3">
                  <div className="grid grid-cols-4 gap-4 mb-3">
                    <div>
                      <p className="text-xs text-gray-400">Scheduled</p>
                      <p className="text-sm text-white">{delivery.scheduled_at ? new Date(delivery.scheduled_at).toLocaleString() : 'ASAP'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400">Sent</p>
                      <p className="text-sm text-white">{delivery.sent_at ? new Date(delivery.sent_at).toLocaleString() : '—'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400">Opens / Clicks</p>
                      <p className="text-sm text-white">{delivery.opens} / {delivery.clicks}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400">Attachments</p>
                      <p className="text-sm text-white">
                        {delivery.video_attached && '🎬 Video '}
                        {delivery.gift_card_attached && '💳 Gift Card'}
                        {!delivery.video_attached && !delivery.gift_card_attached && 'None'}
                      </p>
                    </div>
                  </div>

                  {canAct && (
                    <div className="flex gap-2 mt-2">
                      <button
                        onClick={() => handleSendNow(delivery.id)}
                        className="px-4 py-1.5 bg-[#D4AF37] hover:bg-[#C4A030] text-black rounded text-xs font-medium"
                      >
                        Send Now
                      </button>
                      <a
                        href={`/preview/email`}
                        className="px-4 py-1.5 bg-gray-700 hover:bg-gray-600 rounded text-xs font-medium"
                      >
                        Preview
                      </a>
                      {confirmCancel === delivery.id ? (
                        <>
                          <button
                            onClick={() => handleCancel(delivery.id)}
                            className="px-4 py-1.5 bg-red-600 hover:bg-red-700 rounded text-xs font-medium"
                          >
                            Confirm Cancel
                          </button>
                          <button
                            onClick={() => setConfirmCancel(null)}
                            className="px-4 py-1.5 bg-gray-700 hover:bg-gray-600 rounded text-xs font-medium"
                          >
                            Keep
                          </button>
                        </>
                      ) : (
                        <button
                          onClick={() => setConfirmCancel(delivery.id)}
                          className="px-4 py-1.5 bg-gray-800 hover:bg-gray-700 rounded text-xs font-medium text-red-400"
                        >
                          Cancel Delivery
                        </button>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
