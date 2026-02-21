import { prisma } from '../../../lib/prisma';

// GET /api/teams/user/[userId] - Get all teams for a specific user
export async function GET(request: Request, { params }: { params: Promise<{ userId: string }> }) {
  const { userId } = await params;
  
  try {
    const teams = await prisma.team.findMany({
      where: { userId },
      select: {
        id: true,
        name: true,
        isUserTeam: true,
        color: true,
      }
    });
    
    return Response.json(teams);
  } catch (error) {
    console.error('Error fetching user teams:', error);
    return Response.json({ error: 'Failed to fetch teams' }, { status: 500 });
  }
}
