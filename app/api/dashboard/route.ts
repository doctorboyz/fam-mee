import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db"

export async function GET() {
  try {
    const session = await auth()
    
    if (!session?.user?.familyId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const familyId = Number(session.user.familyId)

    // Get all accounts for the family
    const accounts = await prisma.accounts.findMany({
      where: {
        family_id: familyId,
        deleted_at: null,
      },
      select: {
        id: true,
        name: true,
        type: true,
        current_balance: true,
        icon: true,
        color: true,
      },
    })

    // Calculate total balance
    const totalBalance = accounts.reduce((sum, account) => {
      return sum + (Number(account.current_balance) || 0)
    }, 0)

    // Get current month's date range
    const now = new Date()
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const lastDayOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59)

    // Get transactions for current month
    const monthlyTransactions = await prisma.transactions.findMany({
      where: {
        family_id: familyId,
        deleted_at: null,
        transaction_date: {
          gte: firstDayOfMonth,
          lte: lastDayOfMonth,
        },
      },
      select: {
        type: true,
        actual_amount: true,
      },
    })

    // Calculate monthly income and expense
    const monthlyIncome = monthlyTransactions
      .filter(t => t.type === 'INCOME')
      .reduce((sum, t) => sum + Number(t.actual_amount), 0)

    const monthlyExpense = monthlyTransactions
      .filter(t => t.type === 'EXPENSE')
      .reduce((sum, t) => sum + Number(t.actual_amount), 0)

    // Get recent transactions (last 10)
    const recentTransactions = await prisma.transactions.findMany({
      where: {
        family_id: familyId,
        deleted_at: null,
      },
      take: 10,
      orderBy: {
        transaction_date: 'desc',
      },
      include: {
        categories: {
          select: {
            id: true,
            name: true,
            icon: true,
            color: true,
          },
        },
        accounts_transactions_from_account_idToaccounts: {
          select: {
            id: true,
            name: true,
          },
        },
        users_transactions_created_by_user_idTousers: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    })

    // Format response
    const response = {
      summary: {
        totalBalance,
        monthlyIncome,
        monthlyExpense,
        accountsCount: accounts.length,
        netIncome: monthlyIncome - monthlyExpense,
      },
      accounts: accounts.map(account => ({
        id: account.id,
        name: account.name,
        type: account.type,
        balance: Number(account.current_balance) || 0,
        icon: account.icon,
        color: account.color,
      })),
      recentTransactions: recentTransactions.map(tx => ({
        id: tx.id,
        type: tx.type,
        amount: Number(tx.actual_amount) || 0,
        description: tx.description,
        transaction_date: tx.transaction_date,
        category: tx.categories,
        account: tx.accounts_transactions_from_account_idToaccounts,
        user: tx.users_transactions_created_by_user_idTousers,
      })),
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('Dashboard API Error:', error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
