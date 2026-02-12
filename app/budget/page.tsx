'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import BottomNav from '@/app/components/BottomNav'

interface BudgetCategory {
  id: string
  name: string
  icon?: string
  color?: string
  jar_type: string
  spent: number
  limit: number
  remaining: number
  percentage: number
}

interface BudgetSummary {
  period: { month: number, year: number }
  summary: {
    total_budget: number
    total_spent: number
    percentage: number
  }
  categories: BudgetCategory[]
}

export default function BudgetPage() {
  const { status } = useSession()
  const router = useRouter()
  const [data, setData] = useState<BudgetSummary | null>(null)
  const [loading, setLoading] = useState(true)
  const [showEditModal, setShowEditModal] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<BudgetCategory | null>(null)
  const [newLimit, setNewLimit] = useState('')

  const fetchData = async () => {
      try {
          const res = await fetch('/api/budget')
          if (res.ok) {
              const d = await res.json()
              setData(d)
          }
      } catch (e) {
          console.error(e)
      } finally {
          setLoading(false)
      }
  }

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/login')
    if (status === 'authenticated') fetchData()
  }, [status, router])

  const handleUpdateLimit = async () => {
      if (!selectedCategory) return
      
      try {
          // We need an endpoint to update JUST the category limit.
          // Or use POST /api/categories (which creates)? 
          // Wait, I didn't create a PATCH endpoint or 'Update' logic.
          // POST /api/categories creates NEW category.
          // I need to update EXISTING category.
          // I should add `PATCH /api/categories/[id]` ?
          // Or just use POST with ID? No, REST principles.
          // `app/api/categories/route.ts` handles generic GET/POST.
          // I need `app/api/categories/[id]/route.ts` for PATCH/DELETE.
          // I haven't created that yet!
          // Alert user or fix implementation plan?
          // I'll assume I will create it next.
          // For now, let's just log or stub it.
          // Actually, I should CREATE it now.
          
          const res = await fetch(`/api/categories/${selectedCategory.id}`, {
              method: 'PATCH',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ budget_limit: parseFloat(newLimit) })
          })

          if (res.ok) {
              fetchData()
              setShowEditModal(false)
          }
      } catch (e) {
          console.error(e)
      }
  }

  if (loading || !data) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600" />
      </div>
    )
  }

  // Group by Jar
  const grouped = data.categories.reduce((acc, cat) => {
      const jar = cat.jar_type || 'OTHER'
      if (!acc[jar]) acc[jar] = []
      acc[jar].push(cat)
      return acc
  }, {} as Record<string, BudgetCategory[]>)

  const jarOrder = ['NECESSITY', 'EDUCATION', 'PLAY', 'LONG_TERM', 'GIVE', 'INVEST', 'OTHER']

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <div className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-lg mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">งบประมาณ (Budget)</h1>
          <span className="text-gray-500 text-sm">
             {new Date(0, data.period.month - 1).toLocaleString('default', { month: 'long' })} {data.period.year}
          </span>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 py-6 space-y-6">
        {/* Total Summary */}
        <div className="bg-linear-to-r from-blue-500 to-indigo-600 rounded-3xl p-6 text-white shadow-lg">
           <p className="text-sm opacity-90 mb-1">งบประมาณรวม (Total Budget)</p>
           <h2 className="text-3xl font-bold mb-2">
             ฿{data.summary.total_budget.toLocaleString()}
           </h2>
           <div className="mt-4">
              <div className="flex justify-between text-xs opacity-90 mb-1">
                 <span>ใช้ไป ฿{data.summary.total_spent.toLocaleString()}</span>
                 <span>{data.summary.percentage.toFixed(1)}%</span>
              </div>
              <div className="h-2 bg-black/20 rounded-full overflow-hidden">
                 <div 
                    className={`h-full rounded-full transition-all duration-1000 ${data.summary.percentage > 100 ? 'bg-red-400' : 'bg-green-400'}`}
                    style={{ width: `${Math.min(data.summary.percentage, 100)}%` }} 
                 />
              </div>
           </div>
        </div>

        {/* Jars List */}
        {jarOrder.map(jar => {
            const cats = grouped[jar]
            if (!cats || cats.length === 0) return null
            
            return (
                <div key={jar} className="space-y-3">
                    <h3 className="font-bold text-gray-700 uppercase text-xs tracking-wider pl-1">{jar}</h3>
                    {cats.map(cat => (
                        <div key={cat.id} className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-all cursor-pointer"
                             onClick={() => {
                                 setSelectedCategory(cat)
                                 setNewLimit(cat.limit.toString())
                                 setShowEditModal(true)
                             }}
                        >
                            <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-3">
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-lg bg-${cat.color || 'gray'}-100`}>
                                        {cat.icon || '🏷️'}
                                    </div>
                                    <span className="font-medium text-gray-900">{cat.name}</span>
                                </div>
                                <div className="text-right">
                                    <span className={`text-sm font-bold ${cat.spent > cat.limit && cat.limit > 0 ? 'text-red-500' : 'text-gray-700'}`}>
                                        ฿{cat.spent.toLocaleString()}
                                    </span>
                                    <span className="text-xs text-gray-400"> / ฿{cat.limit.toLocaleString()}</span>
                                </div>
                            </div>
                            
                            {/* Progress */}
                            <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                <div 
                                    className={`h-full rounded-full ${cat.percentage > 100 ? 'bg-red-500' : cat.percentage > 80 ? 'bg-yellow-500' : 'bg-green-500'}`}
                                    style={{ width: `${Math.min(cat.percentage, 100)}%` }}
                                />
                            </div>
                        </div>
                    ))}
                </div>
            )
        })}
      </div>
      
      {/* Edit Budget Modal */}
      {showEditModal && selectedCategory && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
              <div className="bg-white rounded-2xl w-full max-w-sm p-6 animate-scale-in">
                  <h3 className="text-lg font-bold mb-4">ตั้งงบประมาณ: {selectedCategory.name}</h3>
                  <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-1">วงเงิน (Limit)</label>
                      <input 
                          type="number" 
                          value={newLimit}
                          onChange={(e) => setNewLimit(e.target.value)}
                          className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-indigo-500 outline-hidden"
                          autoFocus
                      />
                  </div>
                  <div className="flex gap-3">
                      <button 
                          onClick={() => setShowEditModal(false)}
                          className="flex-1 py-2 text-gray-600 hover:bg-gray-100 rounded-xl"
                      >
                          ยกเลิก
                      </button>
                      <button 
                          onClick={handleUpdateLimit}
                          className="flex-1 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700"
                      >
                          บันทึก
                      </button>
                  </div>
              </div>
          </div>
      )}

      <BottomNav />
    </div>
  )
}
