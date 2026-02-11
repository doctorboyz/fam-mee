'use client'

import { useEffect, useState, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import BottomNav from '@/app/components/BottomNav'

// Types
interface Category {
  id: bigint
  name: string
  icon: string | null
  color: string | null
  type: string
}

interface Account {
  id: bigint
  name: string
  type: string
  balance: number
}

interface Transaction {
  id: bigint
  type: string
  amount: number
  description: string | null
  transaction_date: string
  category: Category | null
  account: { id: bigint; name: string } | null
  user: { id: bigint; name: string } | null
  project: { id: bigint; name: string } | null
}

type FilterType = 'ALL' | 'INCOME' | 'EXPENSE'

// ─── Add/Edit Transaction Modal ───
function TransactionModal({
  isOpen,
  onClose,
  onSaved,
  categories,
  accounts,
  editingTransaction,
}: {
  isOpen: boolean
  onClose: () => void
  onSaved: () => void
  categories: Category[]
  accounts: Account[]
  editingTransaction: Transaction | null
}) {
  const [type, setType] = useState<'INCOME' | 'EXPENSE'>('EXPENSE')
  const [amount, setAmount] = useState('')
  const [description, setDescription] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [accountId, setAccountId] = useState('')
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0])
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  // Reset form when modal opens or editingTransaction changes
  useEffect(() => {
    if (isOpen) {
      if (editingTransaction) {
        setType(editingTransaction.type as 'INCOME' | 'EXPENSE')
        setAmount(String(editingTransaction.amount))
        setDescription(editingTransaction.description || '')
        setCategoryId(editingTransaction.category ? String(editingTransaction.category.id) : '')
        setAccountId(editingTransaction.account ? String(editingTransaction.account.id) : '')
        setDate(new Date(editingTransaction.transaction_date).toISOString().split('T')[0])
      } else {
        setType('EXPENSE')
        setAmount('')
        setDescription('')
        setCategoryId('')
        setAccountId(accounts.length > 0 ? String(accounts[0].id) : '')
        setDate(new Date().toISOString().split('T')[0])
      }
      setError('')
    }
  }, [isOpen, editingTransaction, accounts])

  const filteredCategories = categories.filter(c => c.type === type)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!amount || !accountId) {
      setError('กรุณากรอกจำนวนเงินและเลือกบัญชี')
      return
    }

    setSaving(true)
    setError('')

    try {
      const payload = {
        type,
        amount: parseFloat(amount),
        description,
        category_id: categoryId || null,
        from_account_id: accountId,
        asset_id: 1, // Default THB asset
        transaction_date: new Date(date).toISOString(),
      }

      const url = editingTransaction
        ? `/api/transactions/${editingTransaction.id}`
        : '/api/transactions'

      const res = await fetch(url, {
        method: editingTransaction ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to save')
      }

      onSaved()
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'เกิดข้อผิดพลาด')
    } finally {
      setSaving(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center z-50">
      <div className="bg-white w-full sm:max-w-md sm:rounded-2xl rounded-t-2xl max-h-[90vh] overflow-y-auto animate-slide-up">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 sticky top-0 bg-white rounded-t-2xl">
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 text-sm font-medium">
            ยกเลิก
          </button>
          <h2 className="text-lg font-bold text-gray-900">
            {editingTransaction ? 'แก้ไขรายการ' : 'เพิ่มรายการ'}
          </h2>
          <button
            onClick={handleSubmit}
            disabled={saving}
            className="text-indigo-600 hover:text-indigo-700 text-sm font-semibold disabled:opacity-50"
          >
            {saving ? 'กำลังบันทึก...' : 'บันทึก'}
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-5">
          {/* Type Toggle */}
          <div className="flex bg-gray-100 rounded-xl p-1">
            <button
              type="button"
              onClick={() => setType('EXPENSE')}
              className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                type === 'EXPENSE'
                  ? 'bg-red-500 text-white shadow-sm'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              💸 รายจ่าย
            </button>
            <button
              type="button"
              onClick={() => setType('INCOME')}
              className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                type === 'INCOME'
                  ? 'bg-green-500 text-white shadow-sm'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              💰 รายรับ
            </button>
          </div>

          {/* Amount Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">จำนวนเงิน (฿)</label>
            <input
              type="number"
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              className="w-full text-3xl font-bold text-center py-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
              required
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">รายละเอียด</label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="อาหาร, ค่าเดินทาง, เงินเดือน..."
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          {/* Category Select */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">หมวดหมู่</label>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white"
            >
              <option value="">ไม่ระบุหมวดหมู่</option>
              {filteredCategories.map((cat) => (
                <option key={String(cat.id)} value={String(cat.id)}>
                  {cat.icon || '📁'} {cat.name}
                </option>
              ))}
            </select>
          </div>

          {/* Account Select */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">บัญชี</label>
            <select
              value={accountId}
              onChange={(e) => setAccountId(e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white"
              required
            >
              <option value="">เลือกบัญชี</option>
              {accounts.map((acc) => (
                <option key={String(acc.id)} value={String(acc.id)}>
                  {acc.name} (฿{acc.balance.toLocaleString()})
                </option>
              ))}
            </select>
          </div>

          {/* Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">วันที่</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          {/* Error */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
              {error}
            </div>
          )}
        </form>
      </div>
    </div>
  )
}

// ─── Delete Confirmation Modal ───
function DeleteModal({
  isOpen,
  onClose,
  onConfirm,
  deleting,
}: {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  deleting: boolean
}) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
      <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-xl">
        <div className="text-center">
          <div className="text-5xl mb-3">🗑️</div>
          <h3 className="text-lg font-bold text-gray-900 mb-2">ลบรายการนี้?</h3>
          <p className="text-gray-600 text-sm mb-6">
            การลบรายการนี้จะไม่สามารถกู้คืนได้
          </p>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 py-2.5 px-4 border border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50"
            >
              ยกเลิก
            </button>
            <button
              onClick={onConfirm}
              disabled={deleting}
              className="flex-1 py-2.5 px-4 bg-red-500 text-white rounded-xl font-medium hover:bg-red-600 disabled:opacity-50"
            >
              {deleting ? 'กำลังลบ...' : 'ลบ'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Transaction Card ───
function TransactionCard({
  tx,
  onEdit,
  onDelete,
}: {
  tx: Transaction
  onEdit: () => void
  onDelete: () => void
}) {
  const isExpense = tx.type === 'EXPENSE'
  const formattedDate = new Date(tx.transaction_date).toLocaleDateString('th-TH', {
    day: 'numeric',
    month: 'short',
  })
  const relativeTime = getRelativeTime(new Date(tx.transaction_date))

  return (
    <div className="group bg-white rounded-xl border border-gray-100 hover:border-gray-200 hover:shadow-md transition-all p-4">
      <div className="flex items-start gap-3">
        {/* Icon */}
        <div
          className={`w-11 h-11 rounded-xl flex items-center justify-center text-lg shrink-0 ${
            isExpense ? 'bg-red-50' : 'bg-green-50'
          }`}
        >
          {tx.category?.icon || (isExpense ? '💸' : '💰')}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <p className="font-semibold text-gray-900 truncate">
                {tx.description || tx.category?.name || (isExpense ? 'รายจ่าย' : 'รายรับ')}
              </p>
              <div className="flex items-center gap-2 mt-0.5">
                {tx.category && (
                  <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                    {tx.category.name}
                  </span>
                )}
                <span className="text-xs text-gray-400">{relativeTime}</span>
              </div>
            </div>
            <div className="text-right shrink-0">
              <p className={`font-bold text-base ${isExpense ? 'text-red-600' : 'text-green-600'}`}>
                {isExpense ? '-' : '+'}฿{tx.amount.toLocaleString()}
              </p>
              <p className="text-xs text-gray-400 mt-0.5">{formattedDate}</p>
            </div>
          </div>

          {/* Account & User Row */}
          <div className="flex items-center justify-between mt-2.5">
            <div className="flex items-center gap-2 text-xs text-gray-400">
              {tx.account && (
                <span className="flex items-center gap-1">
                  🏦 {tx.account.name}
                </span>
              )}
              {tx.user && (
                <span className="flex items-center gap-1">
                  👤 {tx.user.name}
                </span>
              )}
            </div>

            {/* Actions (visible on hover/focus) */}
            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                onClick={onEdit}
                className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                title="แก้ไข"
              >
                ✏️
              </button>
              <button
                onClick={onDelete}
                className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                title="ลบ"
              >
                🗑️
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Helpers ───
function getRelativeTime(date: Date): string {
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 1) return 'เมื่อสักครู่'
  if (diffMins < 60) return `${diffMins} นาทีที่แล้ว`
  if (diffHours < 24) return `${diffHours} ชั่วโมงที่แล้ว`
  if (diffDays === 1) return 'เมื่อวาน'
  if (diffDays < 7) return `${diffDays} วันที่แล้ว`
  return date.toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: 'numeric' })
}

// ─── Summary Header Card ───
function SummaryCard({
  transactions,
  filterType,
}: {
  transactions: Transaction[]
  filterType: FilterType
}) {
  const income = transactions
    .filter((t) => t.type === 'INCOME')
    .reduce((sum, t) => sum + t.amount, 0)
  const expense = transactions
    .filter((t) => t.type === 'EXPENSE')
    .reduce((sum, t) => sum + t.amount, 0)
  const net = income - expense

  return (
    <div className="bg-linear-to-br from-indigo-500 via-indigo-600 to-purple-600 rounded-2xl p-5 text-white shadow-lg">
      {filterType === 'ALL' ? (
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-white/70 text-xs font-medium mb-1">รายรับ</p>
            <p className="text-lg font-bold text-green-300">+฿{income.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-white/70 text-xs font-medium mb-1">รายจ่าย</p>
            <p className="text-lg font-bold text-red-300">-฿{expense.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-white/70 text-xs font-medium mb-1">สุทธิ</p>
            <p className={`text-lg font-bold ${net >= 0 ? 'text-green-300' : 'text-red-300'}`}>
              {net >= 0 ? '+' : ''}฿{net.toLocaleString()}
            </p>
          </div>
        </div>
      ) : (
        <div className="text-center">
          <p className="text-white/70 text-sm mb-1">
            {filterType === 'INCOME' ? 'รวมรายรับ' : 'รวมรายจ่าย'}
          </p>
          <p className="text-3xl font-bold">
            ฿{(filterType === 'INCOME' ? income : expense).toLocaleString()}
          </p>
          <p className="text-white/60 text-sm mt-1">{transactions.length} รายการ</p>
        </div>
      )}
    </div>
  )
}

// ─── Main Page ───
export default function TransactionsPage() {
  const { status } = useSession()
  const router = useRouter()

  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [accounts, setAccounts] = useState<Account[]>([])
  const [loading, setLoading] = useState(true)
  const [filterType, setFilterType] = useState<FilterType>('ALL')
  const [searchQuery, setSearchQuery] = useState('')

  // Modal states
  const [showAddModal, setShowAddModal] = useState(false)
  const [editingTx, setEditingTx] = useState<Transaction | null>(null)
  const [deletingTx, setDeletingTx] = useState<Transaction | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  // Auth redirect
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
    }
  }, [status, router])

  // Fetch data
  const fetchData = useCallback(async () => {
    try {
      setLoading(true)
      const [txRes, catRes, accRes] = await Promise.all([
        fetch('/api/transactions'),
        fetch('/api/categories'),
        fetch('/api/accounts'),
      ])

      if (txRes.ok) {
        const txData = await txRes.json()
        setTransactions(txData)
      }
      if (catRes.ok) {
        const catData = await catRes.json()
        setCategories(catData)
      }
      if (accRes.ok) {
        const accData = await accRes.json()
        setAccounts(accData)
      }
    } catch (err) {
      console.error('Error fetching data:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (status === 'authenticated') {
      fetchData()
    }
  }, [status, fetchData])

  // Handlers
  const handleDelete = async () => {
    if (!deletingTx) return
    setIsDeleting(true)
    try {
      const res = await fetch(`/api/transactions/${deletingTx.id}`, { method: 'DELETE' })
      if (res.ok) {
        await fetchData()
        setDeletingTx(null)
      }
    } catch (err) {
      console.error('Delete error:', err)
    } finally {
      setIsDeleting(false)
    }
  }

  // Filter & search
  const filteredTransactions = transactions.filter((tx) => {
    if (filterType !== 'ALL' && tx.type !== filterType) return false
    if (searchQuery) {
      const q = searchQuery.toLowerCase()
      return (
        (tx.description || '').toLowerCase().includes(q) ||
        (tx.category?.name || '').toLowerCase().includes(q) ||
        (tx.account?.name || '').toLowerCase().includes(q)
      )
    }
    return true
  })

  // Group by date
  const groupedTransactions: Record<string, Transaction[]> = {}
  filteredTransactions.forEach((tx) => {
    const dateKey = new Date(tx.transaction_date).toLocaleDateString('th-TH', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    })
    if (!groupedTransactions[dateKey]) {
      groupedTransactions[dateKey] = []
    }
    groupedTransactions[dateKey].push(tx)
  })

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full mx-auto mb-3" />
          <p className="text-gray-500">กำลังโหลด...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Header */}
      <div className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-lg mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-3">
            <h1 className="text-2xl font-bold text-gray-900">รายการเงิน</h1>
            <button
              onClick={fetchData}
              className="p-2 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-colors"
              title="รีเฟรช"
            >
              🔄
            </button>
          </div>

          {/* Search */}
          <div className="relative mb-3">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ค้นหารายการ..."
              className="w-full pl-10 pr-4 py-2.5 bg-gray-100 border border-transparent rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:bg-white focus:border-indigo-500 transition-all"
            />
          </div>

          {/* Filter Tabs */}
          <div className="flex bg-gray-100 rounded-xl p-1">
            {([
              { key: 'ALL', label: 'ทั้งหมด' },
              { key: 'INCOME', label: '💰 รายรับ' },
              { key: 'EXPENSE', label: '💸 รายจ่าย' },
            ] as const).map((tab) => (
              <button
                key={tab.key}
                onClick={() => setFilterType(tab.key)}
                className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
                  filterType === tab.key
                    ? 'bg-white text-indigo-600 shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-lg mx-auto px-4 py-4 space-y-4">
        {/* Summary */}
        {!loading && transactions.length > 0 && (
          <SummaryCard transactions={filteredTransactions} filterType={filterType} />
        )}

        {/* Loading */}
        {loading && (
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="bg-white rounded-xl p-4 animate-pulse">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 bg-gray-200 rounded-xl" />
                  <div className="flex-1">
                    <div className="h-4 bg-gray-200 rounded w-2/3 mb-2" />
                    <div className="h-3 bg-gray-200 rounded w-1/3" />
                  </div>
                  <div className="text-right">
                    <div className="h-4 bg-gray-200 rounded w-16 mb-2" />
                    <div className="h-3 bg-gray-200 rounded w-12" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && filteredTransactions.length === 0 && (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">📝</div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">
              {searchQuery ? 'ไม่พบรายการ' : 'ยังไม่มีรายการ'}
            </h2>
            <p className="text-gray-500 mb-6">
              {searchQuery
                ? `ไม่พบรายการที่ตรงกับ "${searchQuery}"`
                : 'เริ่มบันทึกรายรับรายจ่ายของคุณ'}
            </p>
            {!searchQuery && (
              <button
                onClick={() => setShowAddModal(true)}
                className="px-6 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 font-medium transition-colors shadow-lg shadow-indigo-200"
              >
                + เพิ่มรายการแรก
              </button>
            )}
          </div>
        )}

        {/* Transaction List Grouped by Date */}
        {!loading &&
          Object.entries(groupedTransactions).map(([dateLabel, txs]) => (
            <div key={dateLabel}>
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-semibold text-gray-500">{dateLabel}</h3>
                <span className="text-xs text-gray-400">{txs.length} รายการ</span>
              </div>
              <div className="space-y-2">
                {txs.map((tx) => (
                  <TransactionCard
                    key={String(tx.id)}
                    tx={tx}
                    onEdit={() => {
                      setEditingTx(tx)
                      setShowAddModal(true)
                    }}
                    onDelete={() => setDeletingTx(tx)}
                  />
                ))}
              </div>
            </div>
          ))}
      </div>

      {/* FAB - Add Transaction */}
      <button
        onClick={() => {
          setEditingTx(null)
          setShowAddModal(true)
        }}
        className="fixed bottom-24 right-4 w-14 h-14 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full shadow-xl shadow-indigo-300 flex items-center justify-center text-2xl transition-all hover:scale-110 active:scale-95 z-40"
        title="เพิ่มรายการ"
      >
        +
      </button>

      {/* Bottom Nav */}
      <BottomNav />

      {/* Modals */}
      <TransactionModal
        isOpen={showAddModal}
        onClose={() => {
          setShowAddModal(false)
          setEditingTx(null)
        }}
        onSaved={fetchData}
        categories={categories}
        accounts={accounts}
        editingTransaction={editingTx}
      />

      <DeleteModal
        isOpen={!!deletingTx}
        onClose={() => setDeletingTx(null)}
        onConfirm={handleDelete}
        deleting={isDeleting}
      />
    </div>
  )
}
