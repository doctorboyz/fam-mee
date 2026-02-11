import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db"

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
    const { searchParams } = new URL(request.url)
    
    // Parse query parameters
    const fromDate = searchParams.get('from')
    const toDate = searchParams.get('to')
    const categoryId = searchParams.get('category')
    const type = searchParams.get('type')
    const limit = searchParams.get('limit')
    const accountId = searchParams.get('account_id')

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
      OR?: Array<{ from_account_id: number } | { to_account_id: number }>
    }

    const where: WhereClause = {
      family_id: familyId,
      deleted_at: null,
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
    
    if (accountId) {
      where.OR = [
        { from_account_id: Number(accountId) },
        { to_account_id: Number(accountId) }
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
