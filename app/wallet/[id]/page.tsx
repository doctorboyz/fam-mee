'use client'

import { useEffect, useState, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import BottomNav from '@/app/components/BottomNav'

interface AccountDetail {
  id: bigint
  name: string
  type: string
  balance: number
  icon?: string | null
  color?: string | null
  asset_symbol: string
  updated_at: Date
  visibility?: 'FAMILY' | 'PRIVATE'
  visible_to_user_ids?: SharedUser[]
}

interface User {
  id: number
  name: string
  avatar_url?: string
}

interface SharedUser {
  userId: number
  access: 'READ' | 'WRITE'
}

interface Transaction {
  id: bigint
  type: string
  amount: number
  description: string | null
  transaction_date: string
  category: { name: string; icon: string | null } | null
}

const COLORS: Record<string, string> = {
  indigo: 'bg-indigo-600',
  green: 'bg-green-600',
  blue: 'bg-blue-600',
  red: 'bg-red-600',
  purple: 'bg-purple-600',
  pink: 'bg-pink-600',
  orange: 'bg-orange-600',
}

function ReconcileModal({
  isOpen,
  onClose,
  account,
  onReconciled,
}: {
  isOpen: boolean
  onClose: () => void
  account: AccountDetail
  onReconciled: () => void
}) {
  const [actualBalance, setActualBalance] = useState('')
  const [diff, setDiff] = useState<number | null>(null)
  const [saving, setSaving] = useState(false)
  const [step, setStep] = useState(1) // 1: Input, 2: Confirm
  const [error, setError] = useState('')

  useEffect(() => {
    if (isOpen) {
      setActualBalance(String(account.balance))
      setDiff(null)
      setStep(1)
      setError('')
    }
  }, [isOpen, account])

  const handleNext = () => {
    const val = parseFloat(actualBalance)
    if (isNaN(val)) {
      setError('กรุณากรอกตัวเลขที่ถูกต้อง')
      return
    }
    const difference = val - account.balance
    setDiff(difference)
    setStep(2)
  }

  const handleConfirm = async () => {
    setSaving(true)
    setError('')
    try {
      const res = await fetch(`/api/accounts/${account.id}/reconcile`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ actual_balance: parseFloat(actualBalance) }),
      })

      if (!res.ok) throw new Error('Failed to reconcile')
      
      onReconciled()
      onClose()
    } catch (err) {
      setError('เกิดข้อผิดพลาดในการปรับยอด')
    } finally {
      setSaving(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
      <div className="bg-white rounded-2xl w-full max-w-sm p-6 animate-slide-up">
        <h3 className="text-lg font-bold mb-4">ปรับยอดดุล (Reconcile)</h3>
        
        {step === 1 ? (
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-gray-600 mb-1">ยอดเงินในระบบ</label>
              <div className="text-xl font-bold text-gray-400">
                ฿{account.balance.toLocaleString()}
              </div>
            </div>
            <div>
              <label className="block text-sm text-gray-800 font-medium mb-1">ยอดเงินจริง</label>
              <input
                type="number"
                value={actualBalance}
                onChange={(e) => setActualBalance(e.target.value)}
                className="w-full text-3xl font-bold text-center py-4 border-2 border-indigo-100 rounded-xl focus:border-indigo-500 text-indigo-700"
                autoFocus
              />
            </div>
            {error && <p className="text-red-500 text-sm">{error}</p>}
            
            <div className="flex gap-3 pt-4">
              <button onClick={onClose} className="flex-1 py-2 text-gray-500">ยกเลิก</button>
              <button 
                onClick={handleNext}
                className="flex-1 py-2 bg-indigo-600 text-white rounded-xl shadow-lg shadow-indigo-200 hover:bg-indigo-700"
              >
                ตรวจสอบ
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4 text-center">
            <div className="py-4">
              <p className="text-sm text-gray-500">ส่วนต่าง</p>
              <p className={`text-3xl font-bold ${(diff || 0) > 0 ? 'text-green-500' : (diff || 0) < 0 ? 'text-red-500' : 'text-gray-700'}`}>
                {(diff || 0) > 0 ? '+' : ''}{diff?.toLocaleString()}
              </p>
              <p className="text-xs text-gray-400 mt-2">
                {(diff || 0) !== 0 
                  ? `ระบบจะสร้างรายการปรับปรุงอัตโนมัติ`
                  : 'ยอดตรงกัน ไม่มีการสร้างรายการ'}
              </p>
            </div>

            <div className="flex gap-3 pt-2">
              <button onClick={() => setStep(1)} className="flex-1 py-2 text-gray-500">กลับ</button>
              <button 
                onClick={handleConfirm}
                disabled={saving}
                className="flex-1 py-2 bg-indigo-600 text-white rounded-xl shadow-lg hover:bg-indigo-700 disabled:opacity-50"
              >
                {saving ? 'กำลังบันทึก...' : 'ยืนยัน'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function EditAccountModal({
  isOpen,
  onClose,
  account,
  onSaved,
}: {
  isOpen: boolean
  onClose: () => void
  account: AccountDetail
  onSaved: () => void
}) {
  const [name, setName] = useState(account.name)
  const [icon, setIcon] = useState(account.icon || '💰')
  const [color, setColor] = useState(account.color || 'indigo')
  
  const [visibility, setVisibility] = useState<'FAMILY' | 'PRIVATE'>(account.visibility || 'FAMILY')
  const [sharedWith, setSharedWith] = useState<SharedUser[]>(
    Array.isArray(account.visible_to_user_ids) ? account.visible_to_user_ids : []
  )
  const [availableUsers, setAvailableUsers] = useState<User[]>([])

  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (isOpen) {
      setName(account.name)
      setIcon(account.icon || '💰')
      setColor(account.color || 'indigo')
      setVisibility(account.visibility || 'FAMILY')
      setSharedWith(Array.isArray(account.visible_to_user_ids) ? account.visible_to_user_ids : [])

      // Load family members
      fetch('/api/users')
        .then(res => res.json())
        .then(data => {
          if (Array.isArray(data)) setAvailableUsers(data)
        })
        .catch(console.error)
    }
  }, [isOpen, account])

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
    try {
      const res = await fetch(`/api/accounts/${account.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          name, 
          icon, 
          color, 
          type: account.type,
          visibility,
          sharedWith: visibility === 'PRIVATE' ? sharedWith : [],
        }),
      })
      if (res.ok) {
        onSaved()
        onClose()
      }
    } catch (err) {
      console.error(err)
    } finally {
      setSaving(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
      <div className="bg-white rounded-2xl w-full max-w-sm p-6 animate-slide-up max-h-[90vh] overflow-y-auto">
        <h3 className="text-lg font-bold mb-4">แก้ไขบัญชี</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">ชื่อบัญชี</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2 border rounded-xl"
            />
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
                    icon === i ? 'bg-indigo-100 ring-2 ring-indigo-500' : 'bg-gray-100'
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
              {Object.keys(COLORS).map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className={`w-8 h-8 rounded-full transition-all ${COLORS[c]} ${
                    color === c ? 'ring-2 ring-offset-2 ring-gray-400' : ''
                  }`}
                />
              ))}
            </div>
          </div>

          <div className="border-t pt-4">
             <label className="block text-sm font-medium text-gray-700 mb-2">การมองเห็น</label>
             <div className="flex gap-3 mb-4">
               <label className="flex items-center gap-2 cursor-pointer text-sm">
                 <input 
                   type="radio" 
                   name="edit_visibility" 
                   value="FAMILY" 
                   checked={visibility === 'FAMILY'}
                   onChange={() => setVisibility('FAMILY')}
                   className="text-indigo-600"
                 />
                 <span>ทุกคน (Family)</span>
               </label>
               <label className="flex items-center gap-2 cursor-pointer text-sm">
                 <input 
                   type="radio" 
                   name="edit_visibility" 
                   value="PRIVATE" 
                   checked={visibility === 'PRIVATE'}
                   onChange={() => setVisibility('PRIVATE')}
                   className="text-indigo-600"
                 />
                 <span>ส่วนตัว (Private)</span>
               </label>
             </div>

             {visibility === 'PRIVATE' && (
               <div className="bg-gray-50 p-3 rounded-xl border border-gray-100">
                 <p className="text-xs text-gray-500 mb-2">แชร์กับใครบ้าง?</p>
                 <div className="space-y-2 max-h-40 overflow-y-auto">
                   {availableUsers.map(u => {
                     const isSelected = sharedWith.some(s => s.userId === u.id)
                     const permission = sharedWith.find(s => s.userId === u.id)?.access || 'READ'

                     return (
                       <div key={u.id} className="flex items-center justify-between">
                         <label className="flex items-center gap-2 text-sm">
                           <input 
                             type="checkbox" 
                             checked={isSelected}
                             onChange={() => toggleShareUser(u.id)}
                             className="rounded text-indigo-600"
                           />
                           {u.name}
                         </label>
                         
                         {isSelected && (
                           <select 
                             value={permission}
                             onChange={(e) => updateAccess(u.id, e.target.value as any)}
                             className="text-xs border rounded px-1 py-0.5"
                           >
                             <option value="READ">View Only</option>
                             <option value="WRITE">Can Edit</option>
                           </select>
                         )}
                       </div>
                     )
                   })}
                 </div>
               </div>
             )}
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 text-gray-500 text-sm">ยกเลิก</button>
            <button type="submit" disabled={saving} className="flex-1 bg-indigo-600 text-white rounded-xl py-2 text-sm">บันทึก</button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function AccountDetailPage({ params }: { params: { id: string } }) {
  const { status } = useSession()
  const router = useRouter()
  const [account, setAccount] = useState<AccountDetail | null>(null)
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [showReconcile, setShowReconcile] = useState(false)
  const [showEdit, setShowEdit] = useState(false)

  const fetchData = useCallback(async () => {
    try {
      setLoading(true)
      const [accRes, txRes] = await Promise.all([
        fetch(`/api/accounts/${params.id}`),
        fetch(`/api/transactions?account_id=${params.id}&limit=20`) 
      ])
      
      if (accRes.ok) {
        setAccount(await accRes.json())
      }
      
      if (txRes.ok) {
        setTransactions(await txRes.json())
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [params.id])

  useEffect(() => {
    if (status === 'authenticated') fetchData()
    if (status === 'unauthenticated') router.push('/login')
  }, [status, fetchData, router])

  if (loading || !account) return <div className="min-h-screen bg-gray-50 flex items-center justify-center"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600" /></div>

  const headerColor = account.color && COLORS[account.color] ? COLORS[account.color] : 'bg-indigo-600'

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Header */}
      <div className={`${headerColor} text-white pb-8 pt-4 px-4 rounded-b-3xl shadow-lg transition-colors duration-500`}>
        <div className="flex justify-between items-start mb-6">
          <Link href="/wallet" className="text-white/80 hover:text-white text-lg">← กลับ</Link>
          <button onClick={() => setShowEdit(true)} className="text-white/80 hover:text-white">⚙️</button>
        </div>
        
        <div className="text-center">
          <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-3xl mx-auto mb-3 shadow-inner">
            {account.icon || '💰'}
          </div>
          <h1 className="text-2xl font-bold mb-1">{account.name}</h1>
          <p className="text-white/70 text-sm mb-4">{account.type}</p>
          <div className="text-5xl font-bold tracking-tight">
            ฿{account.balance.toLocaleString()}
          </div>
          <p className="text-white/60 text-xs mt-2">
            อัปเดตล่าสุด: {new Date(account.updated_at).toLocaleDateString('th-TH')}
          </p>
        </div>

        <div className="mt-8 flex justify-center">
          <button
            onClick={() => setShowReconcile(true)}
            className="bg-white/20 backdrop-blur-md hover:bg-white/30 text-white px-6 py-2 rounded-full text-sm font-medium transition-all shadow-lg"
          >
            ⚖️ ปรับยอดดุล (Reconcile)
          </button>
        </div>
      </div>

      {/* Transactions */}
      <div className="max-w-lg mx-auto px-4 py-6">
        <h3 className="font-bold text-gray-900 mb-4">รายการล่าสุด</h3>
        <div className="space-y-3">
          {transactions.map((tx) => (
            <div key={String(tx.id)} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg ${tx.type === 'INCOME' ? 'bg-green-100' : 'bg-red-100'}`}>
                  {tx.category?.icon || (tx.type === 'INCOME' ? '💰' : '💸')}
                </div>
                <div>
                  <p className="font-medium text-gray-900">{tx.description || tx.category?.name || 'รายการ'}</p>
                  <p className="text-xs text-gray-500">{new Date(tx.transaction_date).toLocaleDateString('th-TH')}</p>
                </div>
              </div>
              <p className={`font-bold ${tx.type === 'INCOME' ? 'text-green-600' : 'text-red-600'}`}>
                {tx.type === 'INCOME' ? '+' : '-'}฿{tx.amount.toLocaleString()}
              </p>
            </div>
          ))}
          {transactions.length === 0 && (
            <p className="text-center text-gray-500 py-8">ไม่มีรายการล่าสุด</p>
          )}
        </div>
      </div>

      <ReconcileModal
        isOpen={showReconcile}
        onClose={() => setShowReconcile(false)}
        account={account}
        onReconciled={fetchData}
      />
      
      <EditAccountModal
        isOpen={showEdit}
        onClose={() => setShowEdit(false)}
        account={account}
        onSaved={fetchData}
      />

      <BottomNav />
    </div>
  )
}
