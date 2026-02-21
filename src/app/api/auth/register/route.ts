import { prisma } from "../../../lib/db";
import bcrypt from 'bcrypt';

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
      },
    });

    return Response.json({ id: user.id, email: user.email });
  } catch (error) {
    console.error('Registration error:', error);
    return Response.json({ error: 'User already exists or server error' }, { status: 400 });
  }
}
