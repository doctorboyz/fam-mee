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

    const accounts = await prisma.accounts.findMany({
      where: {
        family_id: familyId,
        deleted_at: null,
      },
      orderBy: {
        name: 'asc',
      },
    })

    // Format and return accounts
    const formattedAccounts = accounts.map(account => ({
      id: account.id,
      name: account.name,
      type: account.type,
      balance: Number(account.current_balance) || 0,
      created_at: account.created_at,
      updated_at: account.updated_at,
    }))

    return NextResponse.json(formattedAccounts)
  } catch (error) {
    console.error('Accounts API Error:', error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth()
    
    if (!session?.user?.familyId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const familyId = Number(session.user.familyId)
    const body = await request.json()

    // Validate required fields
    if (!body.name || !body.type || !body.asset_id) {
      return NextResponse.json(
        { error: "Name, type, and asset_id are required" },
        { status: 400 }
      )
    }

    const newAccount = await prisma.accounts.create({
      data: {
        family_id: familyId,
        name: body.name,
        type: body.type,
        asset_id: Number(body.asset_id),
        initial_balance: body.balance || 0,
        current_balance: body.balance || 0,
      },
    })

    return NextResponse.json(
      {
        id: newAccount.id,
        name: newAccount.name,
        type: newAccount.type,
        balance: Number(newAccount.current_balance) || 0,
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Create Account Error:', error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
