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

    const projects = await prisma.projects.findMany({
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
        description: true,
        type: true,
        icon: true,
        color: true,
      },
    })

    return NextResponse.json(projects)
  } catch (error) {
    console.error('Projects API Error:', error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
