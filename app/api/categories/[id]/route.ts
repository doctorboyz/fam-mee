import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db"

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user?.familyId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()

    if (!id) {
       return NextResponse.json({ error: "Missing ID" }, { status: 400 })
    }

    // Ensure category belongs to family
    const category = await prisma.categories.findFirst({
        where: {
            id: Number(id),
            family_id: Number(session.user.familyId),
        }
    })

    if (!category) {
        return NextResponse.json({ error: "Category not found" }, { status: 404 })
    }

    const updated = await prisma.categories.update({
        where: { id: BigInt(id) },
        data: {
            budget_limit: body.budget_limit !== undefined ? Number(body.budget_limit) : undefined,
            name: body.name,
            icon: body.icon,
            color: body.color,
            jar_type: body.jar_type,
            type: body.type
        }
    })

    return NextResponse.json({ ...updated, id: updated.id.toString() })

  } catch (error) {
    console.error('Update Category Error:', error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await auth()
        if (!session?.user?.familyId) {
          return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }
    
        const { id } = await params
        
        // Soft delete
        await prisma.categories.updateMany({
            where: { 
                id: Number(id),
                family_id: Number(session.user.familyId)
            },
            data: {
                deleted_at: new Date()
            }
        })

        return NextResponse.json({ success: true })
    } catch (_error) {
        return NextResponse.json({ error: "Internal server error" }, { status: 500 })
    }
}
