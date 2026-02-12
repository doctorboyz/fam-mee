import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db"

export async function GET() {
  try {
    const session = await auth()
    if (!session?.user?.familyId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const familyId = Number(session.user.familyId)

    // Fetch all active users in the family
    const users = await prisma.users.findMany({
      where: {
        family_id: familyId,
        deleted_at: null,
        status: "ACTIVE",
      },
      select: {
        id: true,
        name: true,

        avatar_url: true,
        role: true,
      },
      orderBy: {
        created_at: 'asc',
      },
    })

    // Map BigInt to number/string
    const safeUsers = users.map(u => ({
      ...u,
      id: Number(u.id),
 
      // Checking schema: users has 'name', 'username', 'role', 'avatar_url'. No nickname.
    }))

    return NextResponse.json(safeUsers)
  } catch (error) {
    console.error('Get Users Error:', error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
