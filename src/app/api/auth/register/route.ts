import { prisma } from '@/lib/prisma';
import bcrypt from 'bcrypt';

export async function POST(request: Request) {
  const { email, password } = await request.json();
  
  // Hash the password
  const hashedPassword = await bcrypt.hash(password, 10);
  
  try {
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
      },
    });
    
    // Create a default team for the user
    await prisma.team.create({
      data: {
        name: "My Team",
        isUserTeam: true,
        userId: user.id, // Assuming we add userId to Team model
      }
    });
    
    return Response.json({ success: true, userId: user.id });
  } catch (error) {
    return Response.json({ error: 'Registration failed' }, { status: 500 });
  }
}