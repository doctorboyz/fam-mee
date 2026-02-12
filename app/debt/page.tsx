'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import BottomNav from '@/app/components/BottomNav'

interface DebtAccount {
  id: string
  name: string
  type: string // CREDIT, LOAN
  balance: number // Positive amount owed
  original_balance: number // Signed
  limit: number
  apr: number
  due_day: number
  minimum_payment: number
  utilization: number
  icon?: string
  color?: string
}

export default function DebtPage() {
  const { status } = useSession()
  const router = useRouter()
  const [debts, setDebts] = useState<DebtAccount[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/login')
    if (status === 'authenticated') {
      fetch('/api/debts')
        .then(res => res.json())
        .then(data => {
            if (Array.isArray(data)) setDebts(data)
        })
        .catch(console.error)
        .finally(() => setLoading(false))
    }
  }, [status, router])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600" />
      </div>
    )
  }

  const totalDebt = debts.reduce((sum, d) => sum + d.balance, 0)
  const totalLimit = debts.reduce((sum, d) => sum + d.limit, 0)
  const overallUtilization = totalLimit > 0 ? (totalDebt / totalLimit) * 100 : 0

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <div className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-lg mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">จัดการหนี้สิน (Debt)</h1>
          <Link href="/wallet" className="text-indigo-600 text-sm font-medium">
             + เพิ่มหนี้
          </Link>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 py-6 space-y-6">
        {/* Summary Card */}
        <div className="bg-linear-to-r from-red-500 to-pink-600 rounded-3xl p-6 text-white shadow-lg relative overflow-hidden">
           <div className="relative z-10">
              <p className="text-sm opacity-90 mb-1">หนี้สินรวมทั้งหมด (Total Debt)</p>
              <h2 className="text-3xl font-bold mb-2">
                ฿{totalDebt.toLocaleString()}
              </h2>
              {totalLimit > 0 && (
                  <div className="mt-4">
                     <div className="flex justify-between text-xs opacity-90 mb-1">
                        <span>วงเงินที่ใช้ไป (Utilization)</span>
                        <span>{overallUtilization.toFixed(1)}%</span>
                     </div>
                     <div className="h-2 bg-black/20 rounded-full overflow-hidden">
                        <div 
                           className={`h-full rounded-full transition-all duration-1000 ${overallUtilization > 50 ? 'bg-yellow-300' : 'bg-green-300'} ${overallUtilization > 80 ? 'bg-red-300' : ''}`}
                           style={{ width: `${Math.min(overallUtilization, 100)}%` }} 
                        />
                     </div>
                  </div>
              )}
           </div>
           <div className="absolute right-[-20px] top-[-20px] text-9xl opacity-10 rotate-12">
              💸
           </div>
        </div>

        {/* Debt List */}
        <div className="space-y-4">
           <h3 className="font-bold text-gray-800">รายการหนี้สิน</h3>
           {debts.map(debt => (
              <Link href={`/wallet/${debt.id}`} key={debt.id} className="block bg-white p-5 rounded-2xl shadow-sm border border-gray-100/50 hover:shadow-md transition-all">
                 <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                       <div className={`w-10 h-10 rounded-full flex items-center justify-center text-xl bg-${debt.color || 'gray'}-100`}>
                          {debt.icon || '💳'}
                       </div>
                       <div>
                          <h4 className="font-bold text-gray-900">{debt.name}</h4>
                          <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">{debt.type}</span>
                       </div>
                    </div>
                    <div className="text-right">
                       <p className="font-bold text-red-600">฿{debt.balance.toLocaleString()}</p>
                       <p className="text-xs text-gray-400">ครบกำหนด: วันที่ {debt.due_day}</p>
                    </div>
                 </div>

                 {/* Progress Bar for Credit Card */}
                 {debt.limit > 0 && (
                    <div className="space-y-1">
                       <div className="flex justify-between text-xs text-gray-500">
                          <span>ใช้ไป ฿{debt.balance.toLocaleString()}</span>
                          <span>วงเงิน ฿{debt.limit.toLocaleString()}</span>
                       </div>
                       <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                          <div 
                             className={`h-full rounded-full ${debt.utilization > 80 ? 'bg-red-500' : debt.utilization > 50 ? 'bg-yellow-500' : 'bg-green-500'}`}
                             style={{ width: `${Math.min(debt.utilization, 100)}%` }}
                          />
                       </div>
                    </div>
                 )}

                 <div className="mt-3 flex gap-4 text-xs text-gray-500 bg-gray-50 p-2 rounded-lg">
                    <div className="flex items-center gap-1">
                       <span>📉</span>
                       <span>ดอกเบี้ย {debt.apr}%</span>
                    </div>
                    <div className="flex items-center gap-1">
                       <span>💰</span>
                       <span>ขั้นต่ำ {debt.minimum_payment > 0 ? `฿${debt.minimum_payment.toLocaleString()}` : '-'}</span>
                    </div>
                 </div>
              </Link>
           ))}

           {debts.length === 0 && (
              <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-gray-300">
                 <p className="text-gray-400">โปะหนี้หมดแล้ว! หรือยังไม่ได้เพิ่มหนี้สิน 🎉</p>
                 <Link href="/wallet" className="text-indigo-600 font-medium text-sm mt-2 inline-block">
                    + เพิ่มรายการบัญชีเงินกู้/บัตรเครดิต
                 </Link>
              </div>
           )}
        </div>
      </div>

      <BottomNav />
    </div>
  )
}
