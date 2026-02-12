import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db"

export async function POST(request: Request) {
  try {
    const session = await auth()
    if (!session?.user?.familyId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    if (!body.asset_id || !body.price) {
      return NextResponse.json({ error: "Missing asset_id or price" }, { status: 400 })
    }

    const newPrice = await prisma.asset_prices.create({
      data: {
        asset_id: BigInt(body.asset_id),
        price: body.price,
        currency: body.currency || 'THB',
        source: body.source || 'manual',
        timestamp: new Date(),
      }
    })

    return NextResponse.json({
      ...newPrice,
      id: newPrice.id.toString(),
      asset_id: newPrice.asset_id.toString(),
      price: Number(newPrice.price),
    }, { status: 201 })
  } catch (error) {
     console.error('Update Price Error:', error)
     return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
