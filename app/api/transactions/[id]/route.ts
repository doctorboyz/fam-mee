import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db"

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    
    if (!session?.user?.familyId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const familyId = Number(session.user.familyId)
    const { id } = await params
    const transactionId = Number(id)

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
    
    if (!session?.user?.familyId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const familyId = Number(session.user.familyId)
    const { id } = await params
    const transactionId = Number(id)
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
    
    if (!session?.user?.familyId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const familyId = Number(session.user.familyId)
    const { id } = await params
    const transactionId = Number(id)

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
