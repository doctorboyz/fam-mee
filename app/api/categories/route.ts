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

    const categories = await prisma.categories.findMany({
      where: {
        family_id: familyId,
        deleted_at: null,
      },
      orderBy: {
        name: 'asc',
      },
      select: {
        id: true,
        name: true,
        icon: true,
        color: true,
        type: true,
        jar_type: true,
        budget_limit: true,
      },
    })

    return NextResponse.json(categories)
  } catch (error) {
    console.error('Categories API Error:', error)
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
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const familyId = Number(session.user.familyId)
    const body = await request.json()

    if (!body.name || !body.type) {
        return NextResponse.json({ error: "Missing fields" }, { status: 400 })
    }

    const category = await prisma.categories.create({
        data: {
            family_id: familyId,
            name: body.name,
            type: body.type,
            icon: body.icon,
            color: body.color,
            jar_type: body.jar_type,
            budget_limit: body.budget_limit ? Number(body.budget_limit) : undefined
        }
    })

    return NextResponse.json(category)

  } catch (error) {
    console.error('Create Category Error:', error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
