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
  created_at: Date
  updated_at: Date
}

export default function WalletPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [accounts, setAccounts] = useState<Account[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'all' | 'cash' | 'bank'>('all')
  const [openMenuId, setOpenMenuId] = useState<string | null>(null)
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null)
  const [showAccountModal, setShowAccountModal] = useState(false)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
    }
  }, [status, router])

  useEffect(() => {
    async function fetchAccounts() {
      try {
        setLoading(true)
        const response = await fetch('/api/accounts')
        
        if (!response.ok) {
          throw new Error('Failed to fetch accounts')
        }
        
        const data = await response.json()
        setAccounts(data)
        setError(null)
      } catch (err) {
        console.error('Accounts error:', err)
        setError('Failed to load accounts')
      } finally {
        setLoading(false)
      }
    }

    if (status === 'authenticated') {
      fetchAccounts()
    }
  }, [status])

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading wallet...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  const totalBalance = accounts.reduce((sum, acc) => sum + acc.balance, 0)
  
  const filteredAccounts = accounts.filter(acc => {
    if (activeTab === 'all') return true
    if (activeTab === 'cash') return acc.type.toLowerCase().includes('cash')
    if (activeTab === 'bank') return acc.type.toLowerCase().includes('bank')
    return true
  })

  const getAccountIcon = (type: string) => {
    const lowerType = type.toLowerCase()
    if (lowerType.includes('cash')) return '💵'
    if (lowerType.includes('bank')) return '🏦'
    if (lowerType.includes('credit')) return '💳'
    if (lowerType.includes('saving')) return '🐷'
    return '💰'
  }

  const getAccountColor = (type: string) => {
    const lowerType = type.toLowerCase()
    if (lowerType.includes('cash')) return 'from-green-400 to-green-600'
    if (lowerType.includes('bank')) return 'from-blue-400 to-blue-600'
    if (lowerType.includes('credit')) return 'from-purple-400 to-purple-600'
    if (lowerType.includes('saving')) return 'from-pink-400 to-pink-600'
    return 'from-indigo-400 to-indigo-600'
  }

  const handleAccountAction = (account: Account, action: string) => {
    setOpenMenuId(null)
    
    switch(action) {
      case 'income':
        // TODO: Open transaction form with account pre-selected and type=INCOME
        alert(`Add Income to ${account.name}`)
        break
      case 'expense':
        // TODO: Open transaction form with account pre-selected and type=EXPENSE
        alert(`Add Expense from ${account.name}`)
        break
      case 'transfer':
        // TODO: Open transfer form with from_account pre-selected
        alert(`Transfer from ${account.name}`)
        break
      case 'transactions':
        // TODO: Navigate to transactions filtered by account
        router.push(`/transactions?account=${account.id}`)
        break
      case 'edit':
        // TODO: Open edit account form
        alert(`Edit ${account.name}`)
        break
      case 'delete':
        // TODO: Show delete confirmation
        if (confirm(`Delete ${account.name}?`)) {
          alert('Delete functionality coming soon')
        }
        break
      case 'details':
        setSelectedAccount(account)
        setShowAccountModal(true)
        break
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-lg mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900">Wallet</h1>
            <button className="p-2 hover:bg-gray-100 rounded-lg">
              <span className="text-xl">⚙️</span>
            </button>
          </div>
        </div>
      </div>

      {/* Total Balance Card */}
      <div className="max-w-lg mx-auto px-4 py-6">
        <div className="bg-linear-to-br from-indigo-600 to-purple-600 rounded-3xl p-6 text-white shadow-lg">
          <p className="text-sm opacity-90 mb-1">Total Balance</p>
          <h2 className="text-4xl font-bold mb-4">
            ฿{totalBalance.toLocaleString('th-TH', { minimumFractionDigits: 2 })}
          </h2>
          <p className="text-sm opacity-75">{accounts.length} accounts</p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="max-w-lg mx-auto px-4 mb-6">
        <div className="grid grid-cols-2 gap-3">
          <button className="bg-white rounded-2xl p-4 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-2">
              <span className="text-2xl">➕</span>
            </div>
            <p className="text-sm font-medium text-gray-700">New Account</p>
          </button>
          
          <Link href="/transactions" className="bg-white rounded-2xl p-4 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-2">
              <span className="text-2xl">📊</span>
            </div>
            <p className="text-sm font-medium text-gray-700">All Transactions</p>
          </Link>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="max-w-lg mx-auto px-4 mb-4">
        <div className="flex gap-2 bg-white rounded-full p-1 shadow-sm">
          <button
            onClick={() => setActiveTab('all')}
            className={`flex-1 py-2 px-4 rounded-full text-sm font-medium transition-all ${
              activeTab === 'all'
                ? 'bg-indigo-600 text-white'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setActiveTab('cash')}
            className={`flex-1 py-2 px-4 rounded-full text-sm font-medium transition-all ${
              activeTab === 'cash'
                ? 'bg-indigo-600 text-white'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            Cash
          </button>
          <button
            onClick={() => setActiveTab('bank')}
            className={`flex-1 py-2 px-4 rounded-full text-sm font-medium transition-all ${
              activeTab === 'bank'
                ? 'bg-indigo-600 text-white'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            Bank
          </button>
        </div>
      </div>

      {/* Account Cards */}
      <div className="max-w-lg mx-auto px-4 space-y-3">
        {filteredAccounts.map((account) => (
          <div
            key={account.id.toString()}
            className="bg-white rounded-2xl p-5 shadow-sm hover:shadow-md transition-all relative"
          >
            <div className="flex items-center justify-between mb-3">
              <div 
                className="flex items-center gap-3 flex-1 cursor-pointer"
                onClick={() => handleAccountAction(account, 'details')}
              >
                <div className={`w-12 h-12 bg-linear-to-br ${getAccountColor(account.type)} rounded-full flex items-center justify-center text-2xl`}>
                  {getAccountIcon(account.type)}
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{account.name}</h3>
                  <p className="text-xs text-gray-500">{account.type}</p>
                </div>
              </div>
              
              {/* Quick Actions Menu */}
              <div className="relative">
                <button 
                  onClick={() => setOpenMenuId(openMenuId === account.id.toString() ? null : account.id.toString())}
                  className="p-2 hover:bg-gray-100 rounded-lg"
                >
                  <span className="text-gray-400 text-xl">⋯</span>
                </button>
                
                {openMenuId === account.id.toString() && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-gray-200 py-2 z-20">
                    <button
                      onClick={() => handleAccountAction(account, 'income')}
                      className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-3"
                    >
                      <span className="text-green-600">➕</span>
                      <span className="text-sm font-medium text-gray-700">Add Income</span>
                    </button>
                    <button
                      onClick={() => handleAccountAction(account, 'expense')}
                      className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-3"
                    >
                      <span className="text-red-600">➖</span>
                      <span className="text-sm font-medium text-gray-700">Add Expense</span>
                    </button>
                    <button
                      onClick={() => handleAccountAction(account, 'transfer')}
                      className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-3"
                    >
                      <span className="text-blue-600">💸</span>
                      <span className="text-sm font-medium text-gray-700">Transfer Money</span>
                    </button>
                    <div className="border-t border-gray-100 my-1"></div>
                    <button
                      onClick={() => handleAccountAction(account, 'transactions')}
                      className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-3"
                    >
                      <span>📊</span>
                      <span className="text-sm font-medium text-gray-700">View Transactions</span>
                    </button>
                    <button
                      onClick={() => handleAccountAction(account, 'edit')}
                      className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-3"
                    >
                      <span>✏️</span>
                      <span className="text-sm font-medium text-gray-700">Edit Account</span>
                    </button>
                    <button
                      onClick={() => handleAccountAction(account, 'delete')}
                      className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-3"
                    >
                      <span className="text-red-600">🗑️</span>
                      <span className="text-sm font-medium text-red-600">Delete Account</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500 mb-1">Balance</p>
                <p className="text-2xl font-bold text-gray-900">
                  ฿{account.balance.toLocaleString('th-TH', { minimumFractionDigits: 2 })}
                </p>
              </div>
            </div>
          </div>
        ))}

        {filteredAccounts.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">No accounts found</p>
            <button className="mt-4 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
              Create Your First Account
            </button>
          </div>
        )}
      </div>

      {/* Click outside to close menu */}
      {openMenuId && (
        <div 
          className="fixed inset-0 z-10" 
          onClick={() => setOpenMenuId(null)}
        ></div>
      )}

      <BottomNav />
    </div>
  )
}
