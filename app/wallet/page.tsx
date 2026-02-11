'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import BottomNav from '@/app/components/BottomNav'

interface Account {
  id: bigint
  name: string
  type: string
  balance: number
  icon?: string | null
  color?: string | null
  created_at: Date
  updated_at: Date
}

// ─── Account Modal ───
function AccountModal({
  isOpen,
  onClose,
  onSaved,
}: {
  isOpen: boolean
  onClose: () => void
  onSaved: () => void
}) {
  const [name, setName] = useState('')
  const [type, setType] = useState('CASH')
  const [balance, setBalance] = useState('')
  const [icon, setIcon] = useState('💰')
  const [color, setColor] = useState('indigo')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError('')

    try {
      const res = await fetch('/api/accounts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          type,
          asset_id: 1, // Default THB
          balance: parseFloat(balance) || 0,
          icon,
          color,
        }),
      })

      if (!res.ok) {
        throw new Error('Failed to create account')
      }

      onSaved()
      onClose()
    } catch (err) {
      setError('Failed to create account')
    } finally {
      setSaving(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
      <div className="bg-white rounded-2xl w-full max-w-md p-6 animate-slide-up">
        <h2 className="text-xl font-bold mb-4">เพิ่มบัญชีใหม่</h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">ชื่อบัญชี</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2 border rounded-xl"
              placeholder="Ex: Main Wallet, KBank"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">ประเภท</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="w-full px-4 py-2 border rounded-xl"
              >
                <option value="CASH">Cash</option>
                <option value="BANK">Bank</option>
                <option value="CREDIT">Credit Card</option>
                <option value="INVESTMENT">Investment</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">ยอดเงินเริ่มต้น</label>
              <input
                type="number"
                value={balance}
                onChange={(e) => setBalance(e.target.value)}
                className="w-full px-4 py-2 border rounded-xl"
                placeholder="0.00"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">ไอคอน</label>
            <div className="flex gap-2 overflow-x-auto pb-2">
              {['💰', '🏦', '💳', '💵', '🐷', '📈', '🏠', '🚗'].map((i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setIcon(i)}
                  className={`w-10 h-10 rounded-full flex items-center justify-center text-xl transition-all ${
                    icon === i ? 'bg-indigo-100 ring-2 ring-indigo-500' : 'bg-gray-100 hover:bg-gray-200'
                  }`}
                >
                  {i}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">สี</label>
            <div className="flex gap-2">
              {['indigo', 'green', 'blue', 'red', 'purple', 'pink', 'orange'].map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className={`w-8 h-8 rounded-full transition-all ${
                    color === c ? 'ring-2 ring-offset-2 ring-gray-400' : ''
                  }`}
                  style={{ backgroundColor: `var(--color-${c}-500)` }}
                />
              ))}
            </div>
          </div>

          {error && <p className="text-red-500 text-sm">{error}</p>}

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2 text-gray-600 hover:bg-gray-100 rounded-xl"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 disabled:opacity-50"
            >
              {saving ? 'กำลังบันทึก...' : 'บันทึก'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function WalletPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [accounts, setAccounts] = useState<Account[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'all' | 'cash' | 'bank'>('all')
  const [showAccountModal, setShowAccountModal] = useState(false)

  const fetchAccounts = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/accounts')
      if (!response.ok) throw new Error('Failed to fetch accounts')
      const data = await response.json()
      setAccounts(data)
    } catch (err) {
      console.error('Accounts error:', err)
      setError('Failed to load accounts')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/login')
    if (status === 'authenticated') fetchAccounts()
  }, [status, router])

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600" />
      </div>
    )
  }

  const totalBalance = accounts.reduce((sum, acc) => sum + acc.balance, 0)
  
  const filteredAccounts = accounts.filter(acc => {
    if (activeTab === 'all') return true
    if (activeTab === 'cash') return acc.type === 'CASH'
    if (activeTab === 'bank') return acc.type === 'BANK'
    return true
  })

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Header */}
      <div className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-lg mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">กระเป๋าเงิน</h1>
          <button 
            onClick={() => setShowAccountModal(true)}
            className="text-indigo-600 font-medium hover:bg-indigo-50 px-3 py-1 rounded-lg transition-colors"
          >
            + เพิ่มบัญชี
          </button>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 py-6 space-y-6">
        {/* Total Balance */}
        <div className="bg-linear-to-br from-indigo-600 to-purple-600 rounded-3xl p-6 text-white shadow-lg">
          <p className="text-sm opacity-90 mb-1">ยอดเงินรวมทั้งหมด</p>
          <h2 className="text-4xl font-bold mb-4">
            ฿{totalBalance.toLocaleString('th-TH', { minimumFractionDigits: 2 })}
          </h2>
          <p className="text-sm opacity-75">{accounts.length} บัญชี</p>
        </div>

        {/* Tabs */}
        <div className="flex bg-white p-1 rounded-xl shadow-sm">
          {['all', 'cash', 'bank'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as any)}
              className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === tab 
                  ? 'bg-indigo-100 text-indigo-700 shadow-sm' 
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab === 'all' ? 'ทั้งหมด' : tab === 'cash' ? 'เงินสด' : 'ธนาคาร'}
            </button>
          ))}
        </div>

        {/* Account List */}
        <div className="space-y-3">
          {filteredAccounts.map((acc) => (
            <Link
              key={String(acc.id)}
              href={`/wallet/${acc.id}`}
              className="block bg-white p-4 rounded-xl shadow-sm border border-gray-100 hover:border-indigo-200 transition-all"
            >
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center text-2xl bg-${acc.color || 'indigo'}-100`}>
                  {acc.icon || '💰'}
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">{acc.name}</h3>
                  <p className="text-xs text-gray-500">{acc.type}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-gray-900">฿{acc.balance.toLocaleString()}</p>
                </div>
              </div>
            </Link>
          ))}
          
          {filteredAccounts.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              ยังไม่มีบัญชีในหมวดนี้
            </div>
          )}
        </div>
      </div>

      <AccountModal
        isOpen={showAccountModal}
        onClose={() => setShowAccountModal(false)}
        onSaved={fetchAccounts}
      />

      <BottomNav />
    </div>
  )
}
