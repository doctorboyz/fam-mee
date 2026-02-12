import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db"

interface SharedUser {
  userId: number
  access: 'READ' | 'WRITE'
}

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
    const userId = Number(session.user.id)
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

    // Permission Check
    let hasAccess = false
    let accessLevel = 'READ'

    // 1. Owner
    if (account.owner_user_id && Number(account.owner_user_id) === userId) {
      hasAccess = true
      accessLevel = 'OWNER'
    } 
    // 2. Family Visibility
    else if (account.visibility === 'FAMILY') {
      hasAccess = true
      accessLevel = 'WRITE' // Default family access
    }
    // 3. Shared List
    else {
      const sharedList = account.visible_to_user_ids as unknown as SharedUser[]
      if (Array.isArray(sharedList)) {
        const userShare = sharedList.find(u => Number(u.userId) === userId)
        if (userShare) {
          hasAccess = true
          if (userShare.access === 'WRITE') {
            accessLevel = 'WRITE'
          }
        }
      }
    }

    if (!hasAccess) {
      return NextResponse.json(
        { error: "Forbidden" },
        { status: 403 }
      )
    }

    return NextResponse.json({
      ...account,
      balance: Number(account.current_balance) || 0,
      initial_balance: Number(account.initial_balance) || 0,
      access: accessLevel,
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
    const userId = Number(session.user.id)
    const accountId = Number(id)
    const body = await request.json()

    // Check existence and permission
    const existing = await prisma.accounts.findFirst({
      where: {
        id: accountId,
        family_id: familyId,
        deleted_at: null,
      },
    })

    if (!existing) {
      return NextResponse.json(
        { error: "Account not found" },
        { status: 404 }
      )
    }

    // Permission Check (Must be Owner or have WRITE access)
    let canEdit = false
    if (existing.owner_user_id && Number(existing.owner_user_id) === userId) {
      canEdit = true
    } else if (existing.visibility === 'FAMILY') {
      canEdit = true // Family accounts editable by all
    } else {
      const sharedList = existing.visible_to_user_ids as unknown as SharedUser[]
      if (Array.isArray(sharedList)) {
        const userShare = sharedList.find(u => Number(u.userId) === userId)
        if (userShare?.access === 'WRITE') {
          canEdit = true
        }
      }
    }

    if (!canEdit) {
      return NextResponse.json(
        { error: "Forbidden: Write access required" },
        { status: 403 }
      )
    }

    const updated = await prisma.accounts.update({
      where: {
        id: accountId,
      },
      data: {
        name: body.name,
        icon: body.icon,
        color: body.color,
        visibility: body.visibility, // Allow updating visibility? (Only owner should?)
        // Let's assume anyone with WRITE can edit properties for now, OR restrict visibility change to Owner.
        // For simplicity: WRITE access allows editing details.
        // Ideally: Only Owner changes visibility/sharing.
        visible_to_user_ids: body.sharedWith, 
      },
    })

    return NextResponse.json({
      ...updated,
      balance: Number(updated.current_balance) || 0,
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
    const userId = Number(session.user.id)
    const accountId = Number(id)

    // Check existence
    const existing = await prisma.accounts.findFirst({
      where: {
        id: accountId,
        family_id: familyId,
        deleted_at: null,
      },
    })

    if (!existing) {
      return NextResponse.json(
        { error: "Account not found" },
        { status: 404 }
      )
    }

    // Only Owner (or Admin?) can delete accounts? 
    // Or Shared with WRITE? Usually Delete is Owner only.
    // Let's restrict to Owner for safety.
    const isOwner = existing.owner_user_id && Number(existing.owner_user_id) === userId
    
    if (!isOwner) {
       return NextResponse.json(
        { error: "Forbidden: Only owner can delete account" },
        { status: 403 }
      )
    }

    await prisma.accounts.update({
      where: {
        id: accountId,
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
