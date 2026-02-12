import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const assets = await prisma.assets.findMany()
  console.log('Assets:', assets)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
