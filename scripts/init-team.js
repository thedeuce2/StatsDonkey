import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcrypt'

const prisma = new PrismaClient()

async function main() {
  // 1. Create Argos Team Account (User)
  const argosEmail = 'doug.ywdc@gmail.com' // Using user's context email
  const hashedPassword = await bcrypt.hash('Argos123', 10)
  
  const user = await prisma.user.upsert({
    where: { email: argosEmail },
    update: { password: hashedPassword },
    create: {
      email: argosEmail,
      password: hashedPassword,
    },
  })

  // 2. Create Argos Team
  const team = await prisma.team.upsert({
    where: { name: 'Argos' },
    update: {
      isUserTeam: true,
      userId: user.id,
      color: '#004C97', // Toronto Argos Blue
    },
    create: {
      name: 'Argos',
      isUserTeam: true,
      userId: user.id,
      color: '#004C97',
    },
  })

  console.log(`Initialized Team Argos for user ${user.email}`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
