import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: "postgresql://postgres.clxbdlqmbwzzuydxhyng:D%2398ouglasStatsDonkey@aws-1-us-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true"
    }
  }
});

async function main() {
    try {
        console.log('Connecting to Supabase...');
        const teams = await prisma.team.findMany();
        console.log('Teams found:', teams.length);
        console.log(teams.map(t => ({ id: t.id, name: t.name, isUserTeam: t.isUserTeam })));
    } catch (e) {
        console.error('Failed to connect:', e.message);
    } finally {
        await prisma.$disconnect();
    }
}

main();
