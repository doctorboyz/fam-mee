import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db"

export async function GET(request: Request) {
  try {
    const session = await auth()
    if (!session?.user?.familyId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const familyId = Number(session.user.familyId)

    const debts = await prisma.accounts.findMany({
      where: {
        family_id: familyId,
        type: { in: ['CREDIT', 'LOAN'] },
        is_active: true,
        deleted_at: null,
      },
      orderBy: {
        current_balance: 'asc', // Usually debts are negative, so ascending means largest debt (most negative) first? 
        // Wait, Credit Card balance is usually treated as Negative in accounting.
        // But some apps show it as Positive liability.
        // My app:
        // Cash: 1000 (Positive asset)
        // CC: -500 (Liability)
        // If I fetch distinct debts, I should handle the sign.
      }
    })

    const formattedDebts = debts.map(acc => {
      const settings = (acc.settings || {}) as Record<string, any>
      const creditLimit = Number(settings.credit_limit || 0)
      const balance = Number(acc.current_balance || 0)
      
      // Calculate Utilization
      // For Credit Cards, balance is typically negative (liability).
      // We display Debt as Positive number for "Amount Owed".
      // If balance is -500, Amount Owed is 500.
      const amountOwed = Math.abs(balance)
      const utilization = creditLimit > 0 ? (amountOwed / creditLimit) * 100 : 0

      return {
        id: acc.id.toString(),
        name: acc.name,
        type: acc.type,
        balance: amountOwed, // Positive debt amount
        original_balance: balance, // Signed balance
        limit: creditLimit,
        apr: Number(settings.apr || 0),
        due_day: Number(settings.due_day || 1),
        minimum_payment: Number(settings.minimum_payment || 0),
        utilization: Number(utilization.toFixed(1)),
        icon: acc.icon,
        color: acc.color
      }
    })

    return NextResponse.json(formattedDebts)

  } catch (error) {
    console.error('Debts API Error:', error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
