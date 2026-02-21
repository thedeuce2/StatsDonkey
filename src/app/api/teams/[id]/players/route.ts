import { prisma } from "@/lib/db";

// GET /api/teams/[id]/players - Get all players for a specific team
export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  
  try {
    const players = await prisma.player.findMany({
      where: { 
        teams: {
          some: {
            id: id
          }
        }
      },
      select: {
        id: true,
        name: true,
        number: true,
        handedness: true,
      },
      orderBy: { number: 'asc' }
    });
    
    return Response.json(players);
  } catch (error) {
    console.error('Error fetching team players:', error);
    return Response.json({ error: 'Failed to fetch players' }, { status: 500 });
  }
}
