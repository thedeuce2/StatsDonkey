import { PrismaClient } from '@prisma/client';
import fs from 'fs';

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: "postgresql://postgres.clxbdlqmbwzzuydxhyng:D%2398ouglasStatsDonkey@aws-1-us-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true"
    }
  }
});

async function main() {
    try {
        const teams = await prisma.team.findMany();
        fs.writeFileSync('db_teams.json', JSON.stringify(teams, null, 2));
        console.log('Saved to db_teams.json');
    } catch (e) {
        console.error(e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
