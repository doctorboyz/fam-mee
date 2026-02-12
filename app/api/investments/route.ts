import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db"

export async function GET(request: Request) {
  try {
    const session = await auth()
    if (!session?.user?.familyId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const familyId = Number(session.user.familyId)
    const userId = Number(session.user.id || 0)

    // Fetch accounts with assets and prices
    const accounts = await prisma.accounts.findMany({
      where: {
        family_id: familyId,
        is_active: true,
        deleted_at: null,
      },
      include: {
        assets: {
          include: {
            asset_types: true,
            asset_prices: {
              orderBy: { timestamp: 'desc' },
              take: 1
            }
          }
        }
      }
    })

    // Prepare aggregation
    let totalPortfolioValue = 0
    const assetAllocation: Record<string, number> = {}
    const typeAllocation: Record<string, number> = {}
    
    const holdings = accounts.filter(acc => {
        // Filter out Cash/Bank if we only want "Investments"?
        // Or include everything? "Net Worth" includes cash.
        // Let's return everything but mark the type.
        return true
    }).map(acc => {
      const asset = acc.assets
      const latestPrice = asset.asset_prices[0]?.price ? Number(asset.asset_prices[0].price) : 1 // Default to 1 if no price (e.g. FIAT 1:1 if base is THB?)
      // Check if price is for 1 unit.
      // If asset is THB, price should be 1.
      
      const balance = Number(acc.current_balance) || 0
      const value = balance * latestPrice
      
      totalPortfolioValue += value

      // Aggregate by Asset Symbol
      const symbol = asset.symbol || asset.code
      assetAllocation[symbol] = (assetAllocation[symbol] || 0) + value

      // Aggregate by Type
      const type = asset.asset_types.code
      typeAllocation[type] = (typeAllocation[type] || 0) + value

      return {
        account_id: acc.id.toString(),
        account_name: acc.name,
        account_type: acc.type,
        asset_code: asset.code,
        asset_name: asset.name,
        asset_type: asset.asset_types.code,
        balance,
        price: latestPrice,
        value,
        last_updated: asset.asset_prices[0]?.timestamp
      }
    })

    // Filter mainly for Investment dashboard (exclude Cash/Bank for "Investments" list, but keep for Net Worth?)
    // Let's filter investments separately.
    const investments = holdings.filter(h => h.account_type === 'INVESTMENT' || h.asset_type !== 'FIAT')

    return NextResponse.json({
      total_wealth: totalPortfolioValue,
      total_investment: investments.reduce((sum, item) => sum + item.value, 0),
      holdings: investments.sort((a, b) => b.value - a.value),
      allocation: {
        by_asset: assetAllocation,
        by_type: typeAllocation
      },
      all_accounts: holdings // For net worth calc if needed
    })

  } catch (error) {
    console.error('Investments API Error:', error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
