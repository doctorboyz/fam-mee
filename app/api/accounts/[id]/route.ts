import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db"

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
    const accountId = Number(id)

    const account = await prisma.accounts.findFirst({
      where: {
        id: accountId,
        family_id: familyId,
        deleted_at: null,
      },
      include: {
        assets: true,
      }
    })

    if (!account) {
      return NextResponse.json(
        { error: "Account not found" },
        { status: 404 }
      )
    }

    return NextResponse.json({
      id: account.id,
      name: account.name,
      type: account.type,
      balance: Number(account.current_balance) || 0,
      asset_id: account.asset_id,
      asset_symbol: account.assets?.symbol || 'THB',
      icon: account.icon,
      color: account.color,
      created_at: account.created_at,
      updated_at: account.updated_at,
    })
  } catch (error) {
    console.error('Get Account Error:', error)
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
    const accountId = Number(id)
    const body = await request.json()

    const updatedAccount = await prisma.accounts.update({
      where: {
        id: accountId,
        family_id: familyId, // Ensure ownership
      },
      data: {
        name: body.name,
        type: body.type,
        icon: body.icon,
        color: body.color,
        // Balance is not updated here, use reconcile or transactions
        updated_at: new Date(),
      },
    })

    return NextResponse.json({
      id: updatedAccount.id,
      name: updatedAccount.name,
      type: updatedAccount.type,
      icon: updatedAccount.icon,
      color: updatedAccount.color,
    })
  } catch (error) {
    console.error('Update Account Error:', error)
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
    const accountId = Number(id)

    await prisma.accounts.update({
      where: {
        id: accountId,
        family_id: familyId,
      },
      data: {
        deleted_at: new Date(),
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete Account Error:', error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
