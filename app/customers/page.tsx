/**
 * © 2026 Mountain Jewels LLC. All rights reserved.
 * Proprietary and confidential.
 */

'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { useCustomerStore } from '@/lib/stores/customer-store'
import type { Customer, CustomerPreferences } from '@/lib/types/customer'
import { Card } from '@/components/shared/Card'
import { ConfirmDialog } from '@/components/shared/ConfirmDialog'
import { EmptyState } from '@/components/shared/EmptyState'

const INPUT =
  'w-full px-3 py-2 bg-surface border border-surface-border rounded-md text-white text-sm placeholder:text-white/40 focus:outline-none focus:ring-1 focus:ring-gold'
const BTN_GOLD =
  'px-4 py-2 bg-gold text-black font-medium text-sm rounded-md hover:bg-gold-hover disabled:opacity-50'
const BTN_OUTLINE =
  'px-4 py-2 border border-surface-border text-white text-sm rounded-md hover:bg-white/5 disabled:opacity-50'

export default function CustomersPage() {
  const {
    customers,
    activeCustomerId,
    setActiveCustomer,
    addCustomer,
    updateCustomer,
    updatePreferences,
    addPurchase,
    removeCustomer,
  } = useCustomerStore()

  const [showAdd, setShowAdd] = useState(false)
  const [newName, setNewName] = useState('')
  const [newEmail, setNewEmail] = useState('')
  const [newPhone, setNewPhone] = useState('')

  const selected = customers.find((c) => c.id === activeCustomerId) ?? null

  const handleAdd = () => {
    if (!newName.trim()) {
      toast.error('Name is required')
      return
    }
    const c = addCustomer(newName.trim(), newEmail.trim() || undefined, newPhone.trim() || undefined)
    setActiveCustomer(c.id)
    setNewName('')
    setNewEmail('')
    setNewPhone('')
    setShowAdd(false)
    toast.success(`Customer ${c.name} added`)
  }

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-white">Customers</h1>
          <p className="text-sm text-white/50 mt-1">
            Shared knowledge — every avatar sees customer profiles and history
          </p>
        </div>
        <button onClick={() => setShowAdd(!showAdd)} className={BTN_GOLD}>
          {showAdd ? 'Cancel' : 'Add Customer'}
        </button>
      </div>

      {showAdd && (
        <Card title="New Customer">
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-xs text-white/50 mb-1">Name *</label>
              <input
                className={INPUT}
                placeholder="Full name"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
              />
            </div>
            <div>
              <label className="block text-xs text-white/50 mb-1">Email</label>
              <input
                className={INPUT}
                placeholder="email@example.com"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-xs text-white/50 mb-1">Phone</label>
              <input
                className={INPUT}
                placeholder="+1 555-0100"
                value={newPhone}
                onChange={(e) => setNewPhone(e.target.value)}
              />
            </div>
          </div>
          <div className="mt-3">
            <button onClick={handleAdd} className={BTN_GOLD}>
              Save Customer
            </button>
          </div>
        </Card>
      )}

      <div className="grid grid-cols-[300px_1fr] gap-6">
        {/* Customer list */}
        <Card title={`Customers (${customers.length})`}>
          <div className="flex flex-col gap-1 max-h-[600px] overflow-y-auto">
            {customers.length === 0 && (
              <p className="text-xs text-white/30 px-3 py-4 text-center">
                No customers yet — add one above
              </p>
            )}
            {customers.map((c) => (
              <button
                key={c.id}
                onClick={() => setActiveCustomer(c.id)}
                className={`text-left px-3 py-2.5 rounded-md text-sm transition-colors ${
                  activeCustomerId === c.id
                    ? 'bg-gold/10 text-gold'
                    : 'text-white/60 hover:text-white hover:bg-surface/50'
                }`}
              >
                <div className="font-medium">{c.name}</div>
                {c.email && <div className="text-[10px] text-white/30">{c.email}</div>}
                <div className="text-[10px] text-white/25 mt-0.5">
                  {c.purchase_history.length} purchases · ${c.total_spent_usd.toLocaleString()}
                </div>
              </button>
            ))}
          </div>
        </Card>

        {/* Customer detail */}
        <div className="flex flex-col gap-4">
          {selected ? (
            <>
              <CustomerProfile customer={selected} onUpdate={updateCustomer} onRemove={removeCustomer} />
              <CustomerPreferencesCard customer={selected} onUpdatePrefs={updatePreferences} />
              <PurchaseHistory customer={selected} onAddPurchase={addPurchase} />
            </>
          ) : (
            <EmptyState
              title="Select a customer"
              description="Choose a customer from the list or add a new one. All avatars share this information."
            />
          )}
        </div>
      </div>
    </div>
  )
}

function CustomerProfile({
  customer,
  onUpdate,
  onRemove,
}: {
  customer: Customer
  onUpdate: (id: string, u: Partial<Customer>) => void
  onRemove: (id: string) => void
}) {
  const [editing, setEditing] = useState(false)
  const [notes, setNotes] = useState(customer.notes)
  const [confirmRemove, setConfirmRemove] = useState(false)

  return (
    <Card title={customer.name}>
      <div className="grid grid-cols-3 gap-4 text-sm">
        <div>
          <span className="text-white/40 text-xs">Email</span>
          <p className="text-white/70">{customer.email || '—'}</p>
        </div>
        <div>
          <span className="text-white/40 text-xs">Phone</span>
          <p className="text-white/70">{customer.phone || '—'}</p>
        </div>
        <div>
          <span className="text-white/40 text-xs">Total Spent</span>
          <p className="text-gold font-medium">${customer.total_spent_usd.toLocaleString()}</p>
        </div>
        <div>
          <span className="text-white/40 text-xs">First Visit</span>
          <p className="text-white/50">{new Date(customer.first_visit).toLocaleDateString()}</p>
        </div>
        <div>
          <span className="text-white/40 text-xs">Last Visit</span>
          <p className="text-white/50">{new Date(customer.last_visit).toLocaleDateString()}</p>
        </div>
        <div>
          <span className="text-white/40 text-xs">Purchases</span>
          <p className="text-white/70">{customer.purchase_history.length}</p>
        </div>
      </div>
      <div className="mt-4">
        <label className="block text-xs text-white/40 mb-1">Notes</label>
        {editing ? (
          <div className="flex gap-2">
            <textarea
              className={`${INPUT} min-h-[60px] resize-y flex-1`}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
            <button
              onClick={() => {
                onUpdate(customer.id, { notes })
                setEditing(false)
                toast.success('Notes saved')
              }}
              className={BTN_GOLD}
            >
              Save
            </button>
          </div>
        ) : (
          <p
            onClick={() => setEditing(true)}
            className="text-sm text-white/50 cursor-pointer hover:text-white/70 transition-colors min-h-[24px]"
          >
            {customer.notes || 'Click to add notes...'}
          </p>
        )}
      </div>
      <div className="mt-4 flex gap-2">
        <button
          onClick={() => setConfirmRemove(true)}
          className="text-xs text-red-400 hover:text-red-300"
        >
          Remove Customer
        </button>
      </div>
      <ConfirmDialog
        open={confirmRemove}
        title="Remove Customer"
        message={`Are you sure you want to remove ${customer.name}? This will delete their profile, preferences, and purchase history.`}
        confirmLabel="Remove"
        destructive
        onConfirm={() => {
          onRemove(customer.id)
          setConfirmRemove(false)
          toast.success('Customer removed')
        }}
        onCancel={() => setConfirmRemove(false)}
      />
    </Card>
  )
}

function CustomerPreferencesCard({
  customer,
  onUpdatePrefs,
}: {
  customer: Customer
  onUpdatePrefs: (id: string, prefs: Partial<CustomerPreferences>) => void
}) {
  const p = customer.preferences
  const [metal, setMetal] = useState(p.preferred_metal ?? '')
  const [ringSize, setRingSize] = useState(String(p.ring_size_us ?? ''))
  const [budgetMin, setBudgetMin] = useState(String(p.budget_range_usd?.[0] ?? ''))
  const [budgetMax, setBudgetMax] = useState(String(p.budget_range_usd?.[1] ?? ''))
  const [styleNotes, setStyleNotes] = useState(p.style_notes ?? '')
  const [shapes, setShapes] = useState(p.preferred_shapes?.join(', ') ?? '')

  const save = () => {
    const prefs: Partial<CustomerPreferences> = {}
    if (metal) prefs.preferred_metal = metal
    if (ringSize) prefs.ring_size_us = Number(ringSize)
    if (budgetMin || budgetMax) {
      prefs.budget_range_usd = [Number(budgetMin) || 0, Number(budgetMax) || 100000]
    }
    if (styleNotes) prefs.style_notes = styleNotes
    if (shapes) prefs.preferred_shapes = shapes.split(',').map((s) => s.trim()).filter(Boolean)
    onUpdatePrefs(customer.id, prefs)
    toast.success('Preferences saved')
  }

  return (
    <Card title="Preferences (Shared with All Avatars)">
      <div className="grid grid-cols-3 gap-4">
        <div>
          <label className="block text-xs text-white/50 mb-1">Preferred Metal</label>
          <select className={INPUT} value={metal} onChange={(e) => setMetal(e.target.value)}>
            <option value="">Any</option>
            <option value="yellow_gold_14k">14K Yellow Gold</option>
            <option value="yellow_gold_18k">18K Yellow Gold</option>
            <option value="white_gold_14k">14K White Gold</option>
            <option value="white_gold_18k">18K White Gold</option>
            <option value="rose_gold_14k">14K Rose Gold</option>
            <option value="platinum">Platinum</option>
          </select>
        </div>
        <div>
          <label className="block text-xs text-white/50 mb-1">Ring Size (US)</label>
          <input className={INPUT} placeholder="e.g. 6.5" value={ringSize} onChange={(e) => setRingSize(e.target.value)} />
        </div>
        <div>
          <label className="block text-xs text-white/50 mb-1">Preferred Shapes</label>
          <input className={INPUT} placeholder="round, oval, pear" value={shapes} onChange={(e) => setShapes(e.target.value)} />
        </div>
        <div>
          <label className="block text-xs text-white/50 mb-1">Budget Min ($)</label>
          <input className={INPUT} placeholder="500" value={budgetMin} onChange={(e) => setBudgetMin(e.target.value)} />
        </div>
        <div>
          <label className="block text-xs text-white/50 mb-1">Budget Max ($)</label>
          <input className={INPUT} placeholder="5000" value={budgetMax} onChange={(e) => setBudgetMax(e.target.value)} />
        </div>
        <div>
          <label className="block text-xs text-white/50 mb-1">Style Notes</label>
          <input className={INPUT} placeholder="Minimalist, classic..." value={styleNotes} onChange={(e) => setStyleNotes(e.target.value)} />
        </div>
      </div>
      <div className="mt-3">
        <button onClick={save} className={BTN_GOLD}>Save Preferences</button>
      </div>
    </Card>
  )
}

function PurchaseHistory({
  customer,
  onAddPurchase,
}: {
  customer: Customer
  onAddPurchase: (id: string, r: Omit<import('@/lib/types/customer').PurchaseRecord, 'id'>) => void
}) {
  const [showAdd, setShowAdd] = useState(false)
  const [productName, setProductName] = useState('')
  const [category, setCategory] = useState('ring')
  const [price, setPrice] = useState('')
  const [carat, setCarat] = useState('')
  const [metalUsed, setMetalUsed] = useState('')

  const handleAdd = () => {
    if (!productName.trim() || !price) {
      toast.error('Product name and price are required')
      return
    }
    onAddPurchase(customer.id, {
      date: new Date().toISOString(),
      product_name: productName.trim(),
      category,
      price_usd: Number(price),
      carat: carat ? Number(carat) : undefined,
      metal: metalUsed || undefined,
    })
    setProductName('')
    setPrice('')
    setCarat('')
    setMetalUsed('')
    setShowAdd(false)
    toast.success('Purchase recorded')
  }

  return (
    <Card title="Purchase History">
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs text-white/40">
          {customer.purchase_history.length} total purchases
        </p>
        <button onClick={() => setShowAdd(!showAdd)} className={BTN_OUTLINE}>
          {showAdd ? 'Cancel' : 'Add Purchase'}
        </button>
      </div>

      {showAdd && (
        <div className="mb-4 p-3 rounded-lg bg-surface border border-surface-border">
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs text-white/50 mb-1">Product *</label>
              <input className={INPUT} placeholder="Diamond Solitaire Ring" value={productName} onChange={(e) => setProductName(e.target.value)} />
            </div>
            <div>
              <label className="block text-xs text-white/50 mb-1">Category</label>
              <select className={INPUT} value={category} onChange={(e) => setCategory(e.target.value)}>
                <option value="ring">Ring</option>
                <option value="necklace">Necklace</option>
                <option value="earring">Earrings</option>
                <option value="bracelet">Bracelet</option>
                <option value="pendant">Pendant</option>
                <option value="custom">Custom</option>
              </select>
            </div>
            <div>
              <label className="block text-xs text-white/50 mb-1">Price ($) *</label>
              <input className={INPUT} type="number" placeholder="2500" value={price} onChange={(e) => setPrice(e.target.value)} />
            </div>
            <div>
              <label className="block text-xs text-white/50 mb-1">Carat</label>
              <input className={INPUT} placeholder="1.5" value={carat} onChange={(e) => setCarat(e.target.value)} />
            </div>
            <div>
              <label className="block text-xs text-white/50 mb-1">Metal</label>
              <input className={INPUT} placeholder="14K Yellow Gold" value={metalUsed} onChange={(e) => setMetalUsed(e.target.value)} />
            </div>
            <div className="flex items-end">
              <button onClick={handleAdd} className={BTN_GOLD}>Record Purchase</button>
            </div>
          </div>
        </div>
      )}

      {customer.purchase_history.length === 0 ? (
        <p className="text-xs text-white/25 text-center py-4">No purchases recorded</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-white/40 border-b border-surface-border">
                <th className="pb-2 font-medium">Date</th>
                <th className="pb-2 font-medium">Product</th>
                <th className="pb-2 font-medium">Category</th>
                <th className="pb-2 font-medium">Carat</th>
                <th className="pb-2 font-medium">Metal</th>
                <th className="pb-2 font-medium text-right">Price</th>
              </tr>
            </thead>
            <tbody>
              {[...customer.purchase_history].reverse().map((p) => (
                <tr key={p.id} className="border-b border-surface-border/50 text-white/70">
                  <td className="py-2.5 text-white/40">{new Date(p.date).toLocaleDateString()}</td>
                  <td className="py-2.5">{p.product_name}</td>
                  <td className="py-2.5">
                    <span className="rounded bg-surface px-2 py-0.5 text-xs capitalize">{p.category}</span>
                  </td>
                  <td className="py-2.5 text-white/50">{p.carat ? `${p.carat} ct` : '—'}</td>
                  <td className="py-2.5 text-white/50">{p.metal || '—'}</td>
                  <td className="py-2.5 text-right text-gold">${p.price_usd.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Card>
  )
}
