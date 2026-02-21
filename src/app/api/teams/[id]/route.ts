import { prisma } from '../../../../lib/prisma';

// GET /api/teams/[id] - Get a specific team
export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  
  try {
    const team = await prisma.team.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        color: true,
        isUserTeam: true,
      }
    });
    
    if (!team) {
      return Response.json({ error: 'Team not found' }, { status: 404 });
    }
    
    return Response.json(team);
  } catch (error) {
    console.error('Error fetching team:', error);
    return Response.json({ error: 'Failed to fetch team' }, { status: 500 });
  }
}
