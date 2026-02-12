import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { Prisma } from "@prisma/client"

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    const { id } = await params
    
    if (!session?.user?.familyId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const familyId = Number(session.user.familyId)
    const userId = Number(session.user.id)
    const accountId = Number(id)
    const body = await request.json()
    const actualBalance = Number(body.actual_balance)

    if (isNaN(actualBalance)) {
      return NextResponse.json(
        { error: "Invalid actual balance" },
        { status: 400 }
      )
    }

    // 1. Get current account state
    const account = await prisma.accounts.findFirst({
      where: {
        id: accountId,
        family_id: familyId,
        deleted_at: null,
      },
    })

    if (!account) {
      return NextResponse.json(
        { error: "Account not found" },
        { status: 404 }
      )
    }

    const currentBalance = Number(account.current_balance) || 0
    const diff = actualBalance - currentBalance

    if (Math.abs(diff) < 0.01) {
      // No change needed, just update last_reconciled fields
      await prisma.accounts.update({
        where: { id: accountId },
        data: {
          last_reconciled_at: new Date(),
          last_reconciled_balance: actualBalance,
        }
      })
      return NextResponse.json({ success: true, message: "Balance matches, no adjustment needed." })
    }

    // 2. Create adjustment transaction
    // If diff > 0: Actual > System => Income (Found money)
    // If diff < 0: Actual < System => Expense (Lost money)
    const type = diff > 0 ? "INCOME" : "EXPENSE"
    const amount = Math.abs(diff)

    // Find or create 'Adjustment' category? For now, let's leave category null or handle it visually.
    // Ideally we should have a system category for adjustments.

    await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      // Create transaction
      await tx.transactions.create({
        data: {
          family_id: familyId,
          created_by_user_id: userId,
          type: type,
          actual_amount: amount,
          description: "Balance Adjustment (Reconcile)",
          transaction_date: new Date(),
          // Connect to this account

          // Since it's an adjustment, if it's income to this account, to_account_id is this account.
          // If expense from this account, from_account_id is this account.
          
          from_account_id: type === "EXPENSE" ? accountId : null,
          to_account_id: type === "INCOME" ? accountId : null,
          
          asset_id: account.asset_id, // Same asset as account
        }
      })

      // Update account balance
      await tx.accounts.update({
        where: { id: accountId },
        data: {
          current_balance: actualBalance,
          last_reconciled_at: new Date(),
          last_reconciled_balance: actualBalance,
        }
      })
    })

    return NextResponse.json({ success: true, diff })
    
  } catch (error) {
    console.error('Reconcile Account Error:', error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
