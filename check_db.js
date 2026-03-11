import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function main() {
    const teams = await prisma.team.findMany({
        include: { players: true }
    });
    console.log('--- TEAMS IN DATABASE ---');
    teams.forEach(t => {
        console.log(`ID: ${t.id} | Name: ${t.name} | isUserTeam: ${t.isUserTeam} | Players: ${t.players.length}`);
    });
    console.log('-------------------------');
}
main().catch(e => console.error(e)).finally(() => prisma.$disconnect());
