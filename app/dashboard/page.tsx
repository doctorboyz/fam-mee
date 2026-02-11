'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import BottomNav from '@/app/components/BottomNav'

interface DashboardData {
  summary: {
    totalBalance: number
    monthlyIncome: number
    monthlyExpense: number
    accountsCount: number
    netIncome: number
  }
  accounts: Array<{
    id: bigint
    name: string
    type: string
    balance: number
    icon?: string | null
    color?: string | null
  }>
  recentTransactions: Array<{
    id: bigint
    type: string
    amount: number
    description: string | null
    transaction_date: Date
    category: {
      id: bigint
      name: string
      icon?: string | null
      color?: string | null
    } | null
  }>
}

export default function DashboardPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
    }
  }, [status, router])

  useEffect(() => {
    async function fetchDashboard() {
      try {
        setLoading(true)
        const response = await fetch('/api/dashboard')
        
        if (!response.ok) {
          throw new Error('Failed to fetch dashboard data')
        }
        
        const data = await response.json()
        setDashboardData(data)
        setError(null)
      } catch (err) {
        console.error('Dashboard error:', err)
        setError('Failed to load dashboard data')
      } finally {
        setLoading(false)
      }
    }

    if (status === 'authenticated') {
      fetchDashboard()
    }
  }, [status])

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-linear-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-linear-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center">
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

  if (!dashboardData) {
    return null
  }

  const { summary, accounts, recentTransactions } = dashboardData

  const handleRefresh = () => {
    setLoading(true)
    window.location.reload()
  }

  const handleLogout = async () => {
    await fetch('/api/auth/signout', { method: 'POST' })
    router.push('/login')
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-indigo-50 via-white to-purple-50 p-6 pb-24">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Welcome back, {session?.user?.name || 'User'}!
            </h1>
            <p className="text-gray-600 mt-1">Here&apos;s your family financial overview</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleRefresh}
              className="px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 flex items-center gap-2"
            >
              <span>🔄</span>
              Refresh
            </button>
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
            >
              Logout
            </button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium text-gray-600">Total Balance</p>
              <span className="text-2xl">💰</span>
            </div>
            <p className="text-3xl font-bold text-gray-900">
              ฿{summary.totalBalance.toLocaleString('th-TH', { minimumFractionDigits: 2 })}
            </p>
            <p className="text-xs text-gray-500 mt-2">{accounts.length} accounts</p>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium text-gray-600">Monthly Income</p>
              <span className="text-2xl">📈</span>
            </div>
            <p className="text-3xl font-bold text-green-600">
              ฿{summary.monthlyIncome.toLocaleString('th-TH', { minimumFractionDigits: 2 })}
            </p>
            <p className="text-xs text-gray-500 mt-2">This month</p>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium text-gray-600">Monthly Expense</p>
              <span className="text-2xl">📉</span>
            </div>
            <p className="text-3xl font-bold text-red-600">
              ฿{summary.monthlyExpense.toLocaleString('th-TH', { minimumFractionDigits: 2 })}
            </p>
            <p className="text-xs text-gray-500 mt-2">This month</p>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium text-gray-600">Net Income</p>
              <span className="text-2xl">💵</span>
            </div>
            <p className={`text-3xl font-bold ${summary.netIncome >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              ฿{summary.netIncome.toLocaleString('th-TH', { minimumFractionDigits: 2 })}
            </p>
            <p className="text-xs text-gray-500 mt-2">This month</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Accounts */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">Accounts</h2>
              <Link href="/wallet" className="text-sm text-indigo-600 hover:text-indigo-700 font-medium">
                View All →
              </Link>
            </div>
            <div className="space-y-3">
              {accounts.slice(0, 5).map((account) => (
                <div key={account.id.toString()} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${account.color || 'bg-indigo-100'}`}>
                      <span>{account.icon || '🏦'}</span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{account.name}</p>
                      <p className="text-xs text-gray-500">{account.type}</p>
                    </div>
                  </div>
                  <p className="font-bold text-gray-900">
                    ฿{account.balance.toLocaleString('th-TH', { minimumFractionDigits: 2 })}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Transactions */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">Recent Transactions</h2>
              <Link href="/transactions" className="text-sm text-indigo-600 hover:text-indigo-700 font-medium">
                View All →
              </Link>
            </div>
            <div className="space-y-3">
              {recentTransactions.map((tx) => (
                <div key={tx.id.toString()} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      tx.type === 'INCOME' ? 'bg-green-100' : 'bg-red-100'
                    }`}>
                      <span>{tx.category?.icon || (tx.type === 'INCOME' ? '💰' : '💸')}</span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{tx.description || 'Transaction'}</p>
                      <p className="text-xs text-gray-500">
                        {tx.category?.name || tx.type} • {new Date(tx.transaction_date).toLocaleDateString('th-TH')}
                      </p>
                    </div>
                  </div>
                  <p className={`font-bold ${tx.type === 'INCOME' ? 'text-green-600' : 'text-red-600'}`}>
                    {tx.type === 'INCOME' ? '+' : '-'}฿{tx.amount.toLocaleString('th-TH', { minimumFractionDigits: 2 })}
                  </p>
                </div>
              ))}
              {recentTransactions.length === 0 && (
                <p className="text-center text-gray-500 py-8">No transactions yet</p>
              )}
            </div>
          </div>
        </div>
      </div>

      <BottomNav />
    </div>
  )
}
