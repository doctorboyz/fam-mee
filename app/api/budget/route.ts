import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db"

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const session = await auth()
    if (!session?.user?.familyId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const familyId = Number(session.user.familyId)
    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59)

    // 1. Fetch Categories grouped by Jar Type
    const categories = await prisma.categories.findMany({
      where: {
        family_id: familyId,
        type: 'EXPENSE',
        deleted_at: null,
      }
    })

    // 2. Fetch Spending (Transactions) grouped by Category
    const spending = await prisma.transactions.groupBy({
      by: ['category_id'],
      where: {
        family_id: familyId,
        type: 'EXPENSE',
        transaction_date: {
          gte: startOfMonth,
          lte: endOfMonth
        },
        deleted_at: null,
      },
      _sum: {
        actual_amount: true
      }
    })

    // 3. Merge Data
    // Map spending to category ID
    const spendingMap = new Map<string, number>()
    spending.forEach(s => {
       if (s.category_id) spendingMap.set(s.category_id.toString(), Number(s._sum.actual_amount || 0))
    })

    const budgetData = categories.map(cat => {
        const spent = spendingMap.get(cat.id.toString()) || 0
        const limit = Number(cat.budget_limit || 0)
        
        return {
            id: cat.id.toString(),
            name: cat.name,
            icon: cat.icon,
            color: cat.color,
            jar_type: cat.jar_type || 'OTHER',
            spent: spent,
            limit: limit,
            remaining: limit > 0 ? limit - spent : 0,
            percentage: limit > 0 ? (spent / limit) * 100 : 0
        }
    })

    // Group by Jar Type for Frontend
    // Or just return flat list and let frontend group?
    // Let's return flat list.
    
    // Also calculate Total Budget vs Total Spent
    const totalBudget = budgetData.reduce((sum, item) => sum + item.limit, 0)
    const totalSpent = budgetData.reduce((sum, item) => sum + item.spent, 0)

    return NextResponse.json({
        period: {
            month: now.getMonth() + 1,
            year: now.getFullYear()
        },
        summary: {
            total_budget: totalBudget,
            total_spent: totalSpent,
            percentage: totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0
        },
        categories: budgetData
    })

  } catch (error) {
    console.error('Budget API Error:', error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
