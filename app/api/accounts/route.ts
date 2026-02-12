import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db"


interface SharedUser {
  userId: number
  access: 'READ' | 'WRITE'
}

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
    const userId = Number(session.user.id || 0)

    const accounts = await prisma.accounts.findMany({
      where: {
        family_id: familyId,
        deleted_at: null,
      },
      orderBy: {
        name: 'asc',
      },
    })

    // Filter accounts based on visibility and determine access level
    const visibleAccounts = accounts.filter(account => {
      // 1. Owner always sees
      if (account.owner_user_id && Number(account.owner_user_id) === userId) return true
      
      // 2. Family visibility (visible to all family members)
      if (account.visibility === 'FAMILY') return true
      
      // 3. Shared specifically
      const sharedList = account.visible_to_user_ids as unknown as SharedUser[]
      if (Array.isArray(sharedList)) {
        return sharedList.some(u => Number(u.userId) === userId)
      }

      return false
    }).map(account => {
      let access = 'READ' // Default
      const isOwner = account.owner_user_id && Number(account.owner_user_id) === userId
      
      if (isOwner) {
        access = 'OWNER' // Implies WRITE
      } else if (account.visibility === 'FAMILY') {
        access = 'WRITE' // Default family accounts are editable by all (Joint)
      } else {
        // Check specific share permission
        const sharedList = account.visible_to_user_ids as unknown as SharedUser[]
        const userShare = Array.isArray(sharedList) ? sharedList.find(u => Number(u.userId) === userId) : null
        if (userShare?.access === 'WRITE') {
          access = 'WRITE'
        }
      }

      return {
        id: account.id,
        name: account.name,
        type: account.type,
        balance: Number(account.current_balance) || 0,
        currency: 'THB', // Default for now
        icon: account.icon,
        color: account.color,
        visibility: account.visibility,
        access, // READ, WRITE, OWNER
        created_at: account.created_at,
        updated_at: account.updated_at,
      }
    })

    return NextResponse.json(visibleAccounts)
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
    const userId = Number(session.user.id)
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
        owner_user_id: userId,
        name: body.name,
        type: body.type,
        asset_id: Number(body.asset_id),
        initial_balance: body.balance || 0,
        current_balance: body.balance || 0,
        icon: body.icon,
        color: body.color,
        visibility: body.visibility || 'FAMILY', // Default to FAMILY
        visible_to_user_ids: body.sharedWith || [], // Array of { userId, access }
        settings: {
          credit_limit: body.creditLimit,
          apr: body.apr,
          due_day: body.dueDay,
          minimum_payment: body.minimumPayment
        },
      },
    })

    return NextResponse.json(
      {
        id: newAccount.id,
        name: newAccount.name,
        type: newAccount.type,
        balance: Number(newAccount.current_balance) || 0,
        access: 'OWNER',
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
