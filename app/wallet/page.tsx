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
  visibility?: string
  access?: string
}

interface User {
  id: number
  name: string
  avatar_url?: string
}

interface Asset {
  id: string
  code: string
  name: string
  symbol: string
  type: string
}

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
  const [assetId, setAssetId] = useState('1') // Default to THB (ID 1)
  const [balance, setBalance] = useState('')
  const [icon, setIcon] = useState('💰')
  const [color, setColor] = useState('indigo')
  const [visibility, setVisibility] = useState('FAMILY')
  const [uiVisibility, setUiVisibility] = useState<'FAMILY' | 'PRIVATE' | 'SELECTED'>('FAMILY')
  const [sharedWith, setSharedWith] = useState<{userId: number, access: 'READ' | 'WRITE'}[]>([])
  const [availableUsers, setAvailableUsers] = useState<User[]>([])
  const [availableAssets, setAvailableAssets] = useState<Asset[]>([])
  
  // Debt Specific Inputs
  const [creditLimit, setCreditLimit] = useState('')
  const [apr, setApr] = useState('')
  const [dueDay, setDueDay] = useState('1')
  const [minimumPayment, setMinimumPayment] = useState('')

  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (isOpen) {
      // Load family members
      fetch('/api/users')
        .then(res => res.json())
        .then(data => {
          if (Array.isArray(data)) setAvailableUsers(data)
        })
        .catch(console.error)

      // Load Assets
      fetch('/api/assets')
        .then(res => res.json())
        .then(data => {
          if (Array.isArray(data)) {
            setAvailableAssets(data)
            // If we have data but no asset selected, default to first FIAT or first asset
            // Assuming ID 1 is THB/Fiat is handled by seed or default
          }
        })
        .catch(console.error)
    }
  }, [isOpen])

  const toggleShareUser = (userId: number) => {
    setSharedWith(prev => {
      const exists = prev.find(p => p.userId === userId)
      if (exists) {
        return prev.filter(p => p.userId !== userId)
      }
      return [...prev, { userId, access: 'READ' }]
    })
  }

  const updateAccess = (userId: number, access: 'READ' | 'WRITE') => {
    setSharedWith(prev => prev.map(p => p.userId === userId ? { ...p, access } : p))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError('')

    // Determine final asset ID. Use selected if INVESTMENT, otherwise 1 (THB)
    // Note: If type is 'BANK', it's also usually THB.
    // If user wants a Multi-currency wallet (USD Bank Account), they might select 'BANK' and 'USD'.
    // So let's allow asset selection for all types, but default to 'THB' if not selected.
    const finalAssetId = assetId ? Number(assetId) : 1

    try {
      const res = await fetch('/api/accounts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          type,
          asset_id: finalAssetId,
          balance: parseFloat(balance) || 0,
          icon,
          color,
          visibility,
          sharedWith: visibility === 'PRIVATE' ? sharedWith : [],
          creditLimit: parseFloat(creditLimit) || 0,
          apr: parseFloat(apr) || 0,
          dueDay: parseInt(dueDay) || 1,
          minimumPayment: parseFloat(minimumPayment) || 0
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
      <div className="bg-white rounded-2xl w-full max-w-md p-6 animate-slide-up max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl font-bold mb-4">เพิ่มบัญชีใหม่</h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">ชื่อบัญชี</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2 border rounded-xl"
              placeholder="Ex: Main Wallet, KBank, BTC Portfolio"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">ประเภท (Type)</label>
              <select
                value={type}
                onChange={(e) => {
                   setType(e.target.value)
                   // Auto-set icon based on type
                   if (e.target.value === 'INVESTMENT') setIcon('📈')
                   else if (e.target.value === 'BANK') setIcon('🏦')
                   else if (e.target.value === 'CREDIT') setIcon('💳')
                   else if (e.target.value === 'LOAN') setIcon('💸')
                   else if (e.target.value === 'WALLET') setIcon('👛')
                   else if (e.target.value === 'ASSET') setIcon('🏠')
                   else if (e.target.value === 'OTHER') setIcon('🧾')
                   else setIcon('💰')
                }}
                className="w-full px-4 py-2 border rounded-xl"
              >
                <option value="CASH">Cash (เงินสด)</option>
                <option value="BANK">Bank (ธนาคาร)</option>
                <option value="CREDIT">Credit Card (บัตรเครดิต)</option>
                <option value="INVESTMENT">Investment (การลงทุน)</option>
                <option value="LOAN">Loan (สินเชื่อ/เงินกู้)</option>
                <option value="WALLET">Digital Wallet (กระเป๋าดิจิทัล)</option>
                <option value="ASSET">Asset (ทรัพย์สิน)</option>
                <option value="OTHER">Other (อื่นๆ)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {type === 'CREDIT' || type === 'LOAN' ? 'ยอดหนี้คงเหลือ' : 'ยอดเงินเริ่มต้น'}
              </label>
              <input
                type="number"
                value={balance}
                onChange={(e) => setBalance(e.target.value)}
                className="w-full px-4 py-2 border rounded-xl"
                placeholder="0.00"
              />
              {(type === 'CREDIT' || type === 'LOAN') && (
                  <p className="text-xs text-red-500 mt-1">*ใส่เครื่องหมายลบ (-) สำหรับหนี้สิน</p>
              )}
            </div>
          </div>

          {(type === 'CREDIT' || type === 'LOAN') && (
             <div className="bg-red-50 p-4 rounded-xl space-y-3 animate-fade-in">
                <h4 className="text-sm font-bold text-red-800">ข้อมูลหนี้สิน (Debt Details)</h4>
                <div className="grid grid-cols-2 gap-3">
                   <div>
                      <label className="block text-xs text-red-700 mb-1">วงเงิน (Limit)</label>
                      <input type="number" value={creditLimit} onChange={e => setCreditLimit(e.target.value)} className="w-full px-2 py-1 border rounded text-sm" placeholder="Ex: 50000" />
                   </div>
                   <div>
                      <label className="block text-xs text-red-700 mb-1">ดอกเบี้ย (APR %)</label>
                      <input type="number" value={apr} onChange={e => setApr(e.target.value)} className="w-full px-2 py-1 border rounded text-sm" placeholder="Ex: 16" />
                   </div>
                   <div>
                      <label className="block text-xs text-red-700 mb-1">วันครบกำหนดชำระ</label>
                      <select value={dueDay} onChange={e => setDueDay(e.target.value)} className="w-full px-2 py-1 border rounded text-sm bg-white">
                         {Array.from({length: 31}, (_, i) => i + 1).map(d => (
                             <option key={d} value={d}>วันที่ {d}</option>
                         ))}
                      </select>
                   </div>
                   <div>
                      <label className="block text-xs text-red-700 mb-1">ผ่อนชำระขั้นต่ำ</label>
                      <input type="number" value={minimumPayment} onChange={e => setMinimumPayment(e.target.value)} className="w-full px-2 py-1 border rounded text-sm" placeholder="Ex: 1000" />
                   </div>
                </div>
             </div>
          )}

          {/* Asset Selection - Show mainly for Investment, or allow all */}
          {(type === 'INVESTMENT' || type === 'BANK' || type === 'CASH' || type === 'WALLET' || type === 'ASSET' || type === 'LOAN') && (
            <div>
               <label className="block text-sm font-medium text-gray-700 mb-1">สกุลเงิน / สินทรัพย์</label>
               <select
                  value={assetId}
                  onChange={(e) => setAssetId(e.target.value)}
                  className="w-full px-4 py-2 border rounded-xl"
               >
                 {availableAssets.map(asset => (
                   <option key={asset.id} value={asset.id}>
                     {asset.code} - {asset.name}
                   </option>
                 ))}
                 {availableAssets.length === 0 && <option value="1">THB (Default)</option>}
               </select>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">ไอคอน</label>
            <div className="flex gap-2 overflow-x-auto pb-2 custom-scrollbar">
              {['💰', '🏦', '💳', '💵', '🐷', '📈', '🏠', '🚗', '🪙', '💍', '💸', '👛', '🧾', '🏥', '🎓', '✈️', '🛒', '🎮'].map((i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setIcon(i)}
                  className={`w-10 h-10 min-w-10 rounded-full flex items-center justify-center text-xl transition-all ${
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

          <div className="border-t pt-4">
             <label className="block text-sm font-medium text-gray-700 mb-2">การมองเห็น (Visibility)</label>
             <div className="flex flex-col gap-2 mb-4">
               <label className="flex items-center gap-2 cursor-pointer p-2 rounded-lg hover:bg-gray-50 transition-colors">
                 <input 
                   type="radio" 
                   name="visibility" 
                   value="FAMILY" 
                   checked={uiVisibility === 'FAMILY'}
                   onChange={() => {
                     setUiVisibility('FAMILY')
                     setVisibility('FAMILY')
                     setSharedWith([]) // Reset shared users
                   }}
                   className="text-indigo-600 focus:ring-indigo-500"
                 />
                 <div className="flex flex-col">
                    <span className="font-medium text-gray-900">ทุกคนในบ้าน (Family)</span>
                    <span className="text-xs text-gray-500">สมาชิกทุกคนในครอบครัวสามารถมองเห็นได้</span>
                 </div>
               </label>
               
               <label className="flex items-center gap-2 cursor-pointer p-2 rounded-lg hover:bg-gray-50 transition-colors">
                 <input 
                   type="radio" 
                   name="visibility" 
                   value="PRIVATE" 
                   checked={uiVisibility === 'PRIVATE'}
                   onChange={() => {
                      setUiVisibility('PRIVATE')
                      setVisibility('PRIVATE')
                      setSharedWith([]) // Clear shared users for true Private
                   }}
                   className="text-indigo-600 focus:ring-indigo-500"
                 />
                 <div className="flex flex-col">
                    <span className="font-medium text-gray-900">ส่วนตัว (Private - Only Me)</span>
                    <span className="text-xs text-gray-500">เห็นได้เฉพาะฉันคนเดียว</span>
                 </div>
               </label>

               <label className="flex items-center gap-2 cursor-pointer p-2 rounded-lg hover:bg-gray-50 transition-colors">
                 <input 
                   type="radio" 
                   name="visibility" 
                   value="SELECTED" 
                   checked={uiVisibility === 'SELECTED'}
                   onChange={() => {
                      setUiVisibility('SELECTED')
                      setVisibility('PRIVATE') // Backend still sees 'PRIVATE'
                   }}
                   className="text-indigo-600 focus:ring-indigo-500"
                 />
                 <div className="flex flex-col">
                    <span className="font-medium text-gray-900">เลือกคนที่จะให้เห็น (Selected Members)</span>
                    <span className="text-xs text-gray-500">ฉันและสมาชิกที่เลือกเท่านั้นที่เห็น</span>
                 </div>
               </label>
             </div>

             {uiVisibility === 'SELECTED' && (
               <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 ml-6 animate-fade-in">
                 <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">เลือกสมาชิกที่ต้องการแชร์</p>
                 <div className="space-y-3 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
                   {availableUsers.map(u => {
                     const isSelected = sharedWith.some(s => s.userId === u.id)
                     const permission = sharedWith.find(s => s.userId === u.id)?.access || 'READ'

                     return (
                       <div key={u.id} className="flex items-center justify-between bg-white p-2 rounded-lg border border-gray-100 shadow-sm">
                         <label className="flex items-center gap-3 text-sm cursor-pointer flex-1">
                           <input 
                             type="checkbox" 
                             checked={isSelected}
                             onChange={() => toggleShareUser(u.id)}
                             className="rounded text-indigo-600 focus:ring-indigo-500 w-4 h-4"
                           />
                           <div className="flex items-center gap-2 select-none">
                             {/* Avatar if avail */}
                             {u.avatar_url ? (
                               <img src={u.avatar_url} alt={u.name} className="w-8 h-8 rounded-full object-cover" />
                             ) : (
                               <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-xs font-bold">
                                 {u.name.charAt(0).toUpperCase()}
                               </div>
                             )}
                             <span className="text-gray-700 font-medium">{u.name}</span>
                           </div>
                         </label>
                         
                         {isSelected && (
                           <select 
                             value={permission}
                             onChange={(e) => updateAccess(u.id, e.target.value as any)}
                             className="text-xs border-gray-200 rounded-md px-2 py-1 bg-gray-50 text-gray-600 focus:outline-hidden focus:ring-1 focus:ring-indigo-500"
                           >
                             <option value="READ">View Only</option>
                             <option value="WRITE">Can Edit</option>
                           </select>
                         )}
                       </div>
                     )
                   })}
                   {availableUsers.length === 0 && (
                      <p className="text-sm text-gray-400 text-center py-2">No other family members found.</p>
                   )}
                 </div>
               </div>
             )}
          </div>

          {error && (
            <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 bg-red-50 border border-red-200 text-red-600 px-6 py-3 rounded-full shadow-lg z-[60] animate-bounce-in flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <span className="font-medium">{error}</span>
            </div>
          )}

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
  const { status } = useSession()
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
              onClick={() => setActiveTab(tab as 'all' | 'cash' | 'bank')}
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
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-gray-900">{acc.name}</h3>
                    {acc.access === 'READ' && <span className="text-[10px] bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded-full">View Only</span>}
                    {acc.access === 'WRITE' && acc.visibility === 'FAMILY' && <span className="text-[10px] bg-green-100 text-green-700 px-1.5 py-0.5 rounded-full">Family</span>}
                    {acc.access === 'WRITE' && acc.visibility !== 'FAMILY' && <span className="text-[10px] bg-purple-100 text-purple-700 px-1.5 py-0.5 rounded-full">Shared Edit</span>}
                    {acc.visibility === 'PRIVATE' && acc.access === 'OWNER' && <span className="text-[10px] bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded-full">🔒 Private</span>}
                  </div>
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
