import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    return NextResponse.json({ error: "Not logged in" });
  }

  // Find all users with this email
  const users = await prisma.user.findMany({
    where: {
      email: session.user.email.toLowerCase(),
    },
    select: {
      id: true,
      email: true,
      username: true,
      createdAt: true,
      _count: {
        select: {
          books: true,
        },
      },
    },
  });

  // Get current session user's books
  const currentUserBooks = await prisma.book.findMany({
    where: {
      userId: session.user.id,
    },
  });

  return NextResponse.json({
    sessionUserId: session.user.id,
    sessionEmail: session.user.email,
    totalUsersWithThisEmail: users.length,
    users: users,
    currentUserBooks: currentUserBooks,
  });
}
