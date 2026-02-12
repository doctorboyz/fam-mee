import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { getAccountAccess, canWrite } from "@/lib/permissions"

export async function GET(request: Request) {
  try {
    const session = await auth()
    
    if (!session?.user?.familyId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const familyId = Number(session.user.familyId)
    const userId = Number(session.user.id || 0)
    const { searchParams } = new URL(request.url)
    
    // Parse query parameters
    const fromDate = searchParams.get('from')
    const toDate = searchParams.get('to')
    const categoryId = searchParams.get('category')
    const type = searchParams.get('type')
    const limit = searchParams.get('limit')
    const accountId = searchParams.get('account_id')

    // 1. Fetch all accounts to determine access
    const allAccounts = await prisma.accounts.findMany({
      where: {
        family_id: familyId,
        deleted_at: null,
      },
      select: {
        id: true,
        owner_user_id: true,
        visibility: true,
        visible_to_user_ids: true,
      }
    })

    const accessibleAccountIds = allAccounts.filter(acc => {
      return getAccountAccess(acc, userId) !== 'NONE'
    }).map(acc => acc.id)

    // Build where clause
    interface WhereClause {
      family_id: number
      deleted_at: null
      transaction_date?: {
        gte: Date
        lte: Date
      }
      category_id?: number
      type?: string
      OR?: any[]
      AND?: any[]
    }

    const where: WhereClause = {
      family_id: familyId,
      deleted_at: null,
      // Ensure we only see transactions where we have access to the accounts involved
      AND: [
        {
          OR: [
            { from_account_id: null },
            { from_account_id: { in: accessibleAccountIds } }
          ]
        },
        {
          OR: [
            { to_account_id: null },
            { to_account_id: { in: accessibleAccountIds } }
          ]
        }
      ]
    }

    if (fromDate && toDate) {
      where.transaction_date = {
        gte: new Date(fromDate),
        lte: new Date(toDate),
      }
    }

    if (categoryId) {
      where.category_id = Number(categoryId)
    }

    if (type && (type === 'INCOME' || type === 'EXPENSE')) {
      where.type = type
    }
    
    // If specific account requested, ensure we have access and filter by it
    if (accountId) {
      const requestedId = BigInt(accountId)
      // Check if user has access to this account
      if (!accessibleAccountIds.includes(requestedId)) {
        return NextResponse.json([], { status: 200 }) // Return empty if no access
      }

      where.OR = [
        { from_account_id: requestedId },
        { to_account_id: requestedId }
      ]
    }

    const transactions = await prisma.transactions.findMany({
      where,
      take: limit ? Number(limit) : undefined,
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
        projects: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    })

    // Format response
    const formatted = transactions.map(tx => ({
      id: tx.id,
      type: tx.type,
      amount: Number(tx.actual_amount) || 0,
      description: tx.description,
      transaction_date: tx.transaction_date,
      category: tx.categories,
      account: tx.accounts_transactions_from_account_idToaccounts,
      user: tx.users_transactions_created_by_user_idTousers,
      project: tx.projects,
      created_at: tx.created_at,
    }))

    return NextResponse.json(formatted)
  } catch (error) {
    console.error('Transactions API Error:', error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth()
    
    if (!session?.user?.familyId || !session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const familyId = Number(session.user.familyId)
    const userId = Number(session.user.id)
    const body = await request.json()

    // Validate required fields
    if (!body.type || !body.amount || !body.from_account_id || !body.asset_id) {
      return NextResponse.json(
        { error: "Type, amount, from_account_id, and asset_id are required" },
        { status: 400 }
      )
    }

    // Validate type
    if (body.type !== 'INCOME' && body.type !== 'EXPENSE') {
      return NextResponse.json(
        { error: "Type must be INCOME or EXPENSE" },
        { status: 400 }
      )
    }

    // Permission Check: Must have Write access to from_account (and to_account if Transfer)
    const accountIdsToCheck = [Number(body.from_account_id)]
    if (body.to_account_id) accountIdsToCheck.push(Number(body.to_account_id))

    const accounts = await prisma.accounts.findMany({
      where: {
        id: { in: accountIdsToCheck },
        family_id: familyId,
      },
      select: {
        id: true,
        owner_user_id: true,
        visibility: true,
        visible_to_user_ids: true,
      }
    })

    if (accounts.length !== accountIdsToCheck.length) {
       return NextResponse.json({ error: "One or more accounts not found" }, { status: 404 })
    }

    for (const acc of accounts) {
      const access = getAccountAccess(acc, userId)
      if (!canWrite(access)) {
        return NextResponse.json(
          { error: `You do not have permission to edit account #${acc.id}` },
          { status: 403 }
        )
      }
    }

    const newTransaction = await prisma.transactions.create({
      data: {
        family_id: familyId,
        created_by_user_id: userId,
        type: body.type,
        actual_amount: body.amount,
        description: body.description || '',
        category_id: body.category_id ? Number(body.category_id) : null,
        from_account_id: Number(body.from_account_id),
        to_account_id: body.to_account_id ? Number(body.to_account_id) : null,
        project_id: body.project_id ? Number(body.project_id) : null,
        asset_id: Number(body.asset_id),
        transaction_date: body.transaction_date ? new Date(body.transaction_date) : new Date(),
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
      },
    })

    return NextResponse.json(
      {
        ...newTransaction,
        amount: Number(newTransaction.actual_amount) || 0,
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Create Transaction Error:', error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
