import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function main() {
    // 1. Mark "My Team" as user team if it exists
    await prisma.team.updateMany({
        where: { name: 'My Team' },
        data: { isUserTeam: true }
    });

    // 2. Delete other teams that were likely test teams
    const testNames = ['Test Team 500 Node', 'Donkey Warriors 12345', 'Verification Success', 'Donkey Warriors', 'Super Donkeys', 'Test Team 500'];
    await prisma.team.deleteMany({
        where: { 
            name: { in: testNames }
        }
    });

    // 3. Delete any other teams that are NOT "My Team" but have isUserTeam: true (to be safe)
    await prisma.team.deleteMany({
        where: {
            isUserTeam: true,
            NOT: { name: 'My Team' }
        }
    });

    console.log('Database cleanup complete.');
}
main().catch(e => console.error(e)).finally(() => prisma.$disconnect());
