import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { getAccountAccess, canWrite } from "@/lib/permissions"

export async function GET(
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
    const transactionId = Number(id)
    const userId = Number(session.user.id || 0)

    const transaction = await prisma.transactions.findFirst({
      where: {
        id: transactionId,
        family_id: familyId,
        deleted_at: null,
      },
      include: {
        categories: true,
        accounts_transactions_from_account_idToaccounts: true,
        users_transactions_created_by_user_idTousers: {
          select: {
            id: true,
            name: true,
          },
        },
        projects: true,
      },
    })

    if (!transaction) {
      return NextResponse.json(
        { error: "Transaction not found" },
        { status: 404 }
      )
    }

    // Check Read Permission on accounts involved
    const accountIdsToCheck = []
    if (transaction.from_account_id) accountIdsToCheck.push(Number(transaction.from_account_id))
    if (transaction.to_account_id) accountIdsToCheck.push(Number(transaction.to_account_id))

    if (accountIdsToCheck.length > 0) {
      const accounts = await prisma.accounts.findMany({
        where: { id: { in: accountIdsToCheck } },
        select: { id: true, owner_user_id: true, visibility: true, visible_to_user_ids: true }
      })

      // If user cannot see ANY of the involved accounts, deny access?
      // Or if user cannot see ONE of them?
      // Strict: Must see ALL involved accounts? 
      // Existing logic in GET /transactions showed if ANY matches. 
      // But for detail view, usually strict is safer.
      // Let's ensure user has READ access to at least one of the accounts? 
      // Actually, if I can see the transaction in the list, I should see it here.
      // List logic: OR(from accessible, to accessible).
      // So if I have access to 'from' but not 'to' (e.g. transfer to private), 
      // I should still see the transaction because it affects my account.
      
      const hasAccess = accounts.some(acc => getAccountAccess(acc, userId) !== 'NONE')
      if (!hasAccess) {
         return NextResponse.json({ error: "Forbidden" }, { status: 403 })
      }
    }

    return NextResponse.json({
      ...transaction,
      amount: Number(transaction.actual_amount) || 0,
    })
  } catch (error) {
    console.error('Get Transaction Error:', error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

export async function PUT(
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
    const transactionId = Number(id)
    const userId = Number(session.user.id || 0)
    const body = await request.json()

    // Check if transaction exists and belongs to family
    const existing = await prisma.transactions.findFirst({
      where: {
        id: transactionId,
        family_id: familyId,
        deleted_at: null,
      },
    })

    if (!existing) {
      return NextResponse.json(
        { error: "Transaction not found" },
        { status: 404 }
      )
    }

    // Identify all accounts needing Write permission
    // 1. Accounts currently involved (because their balance might change or we are removing tx from them)
    const accountIdsToCheck = new Set<number>()
    if (existing.from_account_id) accountIdsToCheck.add(Number(existing.from_account_id))
    if (existing.to_account_id) accountIdsToCheck.add(Number(existing.to_account_id))

    // 2. New accounts involved (if changing)
    if (body.from_account_id) accountIdsToCheck.add(Number(body.from_account_id))
    if (body.to_account_id) accountIdsToCheck.add(Number(body.to_account_id))

    if (accountIdsToCheck.size > 0) {
      const accounts = await prisma.accounts.findMany({
        where: { id: { in: Array.from(accountIdsToCheck) } },
        select: { id: true, owner_user_id: true, visibility: true, visible_to_user_ids: true }
      })

      for (const acc of accounts) {
        const access = getAccountAccess(acc, userId)
        if (!canWrite(access)) {
          return NextResponse.json(
            { error: `You do not have permission to edit account #${acc.id}` },
            { status: 403 }
          )
        }
      }
    }

    // Build update data
    interface UpdateData {
      type?: string
      actual_amount?: number
      description?: string
      category_id?: number | null
      from_account_id?: number
      to_account_id?: number | null
      project_id?: number | null
      transaction_date?: Date
    }

    const updateData: UpdateData = {}
    
    if (body.type) updateData.type = body.type
    if (body.amount !== undefined) updateData.actual_amount = body.amount
    if (body.description !== undefined) updateData.description = body.description
    if (body.category_id !== undefined) updateData.category_id = body.category_id ? Number(body.category_id) : null
    if (body.from_account_id) updateData.from_account_id = Number(body.from_account_id)
    if (body.to_account_id !== undefined) updateData.to_account_id = body.to_account_id ? Number(body.to_account_id) : null
    if (body.project_id !== undefined) updateData.project_id = body.project_id ? Number(body.project_id) : null
    if (body.transaction_date) updateData.transaction_date = new Date(body.transaction_date)

    const updated = await prisma.transactions.update({
      where: {
        id: transactionId,
      },
      data: updateData,
      include: {
        categories: true,
        accounts_transactions_from_account_idToaccounts: true,
        users_transactions_created_by_user_idTousers: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    })

    return NextResponse.json({
      ...updated,
      amount: Number(updated.actual_amount) || 0,
    })
  } catch (error) {
    console.error('Update Transaction Error:', error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

export async function DELETE(
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
    const transactionId = Number(id)
    const userId = Number(session.user.id || 0)

    // Check if transaction exists and belongs to family
    const existing = await prisma.transactions.findFirst({
      where: {
        id: transactionId,
        family_id: familyId,
        deleted_at: null,
      },
    })

    if (!existing) {
      return NextResponse.json(
        { error: "Transaction not found" },
        { status: 404 }
      )
    }

    // Verify Write permission on involved accounts
    const accountIdsToCheck = new Set<number>()
    if (existing.from_account_id) accountIdsToCheck.add(Number(existing.from_account_id))
    if (existing.to_account_id) accountIdsToCheck.add(Number(existing.to_account_id))

    if (accountIdsToCheck.size > 0) {
      const accounts = await prisma.accounts.findMany({
        where: { id: { in: Array.from(accountIdsToCheck) } },
        select: { id: true, owner_user_id: true, visibility: true, visible_to_user_ids: true }
      })

      for (const acc of accounts) {
        const access = getAccountAccess(acc, userId)
        if (!canWrite(access)) {
          return NextResponse.json(
            { error: `You do not have permission to edit account #${acc.id}` },
            { status: 403 }
          )
        }
      }
    }

    // Soft delete
    await prisma.transactions.update({
      where: {
        id: transactionId,
      },
      data: {
        deleted_at: new Date(),
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete Transaction Error:', error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
