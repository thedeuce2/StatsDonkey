import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding SloPitch database...');

  const team1 = await prisma.team.create({
    data: {
      name: 'The Slo-Pitch Squad',
      color: '#10b981',
      isUserTeam: true,
      players: {
        create: [
          { name: 'Doug Miller', number: '22', handedness: 'right' },
          { name: 'Jeff Smith', number: '15', handedness: 'right' },
          { name: 'Sarah Thompson', number: '08', handedness: 'left' },
          { name: 'Mike Garcia', number: '33', handedness: 'right' },
          { name: 'Kelly Wilson', number: '10', handedness: 'right' },
        ]
      }
    }
  });

  const team2 = await prisma.team.create({
    data: {
      name: 'Opponent Kings',
      color: '#ef4444',
      isUserTeam: false,
      players: {
        create: [
          { name: 'Opponent 1', number: '01' },
          { name: 'Opponent 2', number: '02' },
        ]
      }
    }
  });

  console.log('✅ Seeding complete!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
