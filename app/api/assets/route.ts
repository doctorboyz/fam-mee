import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db"

export async function GET(request: Request) {
  try {
    const session = await auth()
    if (!session?.user?.familyId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const assets = await prisma.assets.findMany({
      where: {
        is_active: true,
      },
      include: {
        asset_types: true,
        // Get the latest price
        asset_prices: {
          orderBy: {
            timestamp: 'desc',
          },
          take: 1,
        },
      },
    })

    const formatted = assets.map(asset => ({
      id: asset.id.toString(),
      code: asset.code,
      name: asset.name,
      symbol: asset.symbol,
      type: asset.asset_types.code,
      latest_price: asset.asset_prices[0]?.price ? Number(asset.asset_prices[0].price) : null,
      last_updated: asset.asset_prices[0]?.timestamp,
    }))

    return NextResponse.json(formatted)
  } catch (error) {
    console.error('Assets API Error:', error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth()
    if (!session?.user?.familyId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    // Validation
    if (!body.code || !body.name || !body.asset_type_id) {
       return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const newAsset = await prisma.assets.create({
      data: {
        code: body.code,
        name: body.name,
        symbol: body.symbol,
        asset_type_id: BigInt(body.asset_type_id),
        decimal_places: body.decimal_places || 2,
        is_active: true,
      }
    })

    return NextResponse.json({
      ...newAsset,
      id: newAsset.id.toString(),
      asset_type_id: newAsset.asset_type_id.toString(),
    }, { status: 201 })
  } catch (error) {
    console.error('Create Asset Error:', error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
