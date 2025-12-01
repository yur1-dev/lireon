// app/api/user/data/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  // Get the session using next-auth
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const dbUser = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: {
        books: {
          orderBy: {
            updatedAt: "desc",
          },
        },
        sessions: {
          orderBy: {
            date: "desc",
          },
          take: 100, // Last 100 sessions
        },
      },
    });

    if (!dbUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({
      user: {
        id: dbUser.id,
        username: dbUser.username,
        email: dbUser.email,
        dailyGoal: dbUser.dailyGoal,
        weeklyGoal: dbUser.weeklyGoal,
        monthlyGoal: dbUser.monthlyGoal,
        streak: dbUser.streak,
        totalPagesRead: dbUser.totalPagesRead,
        hasSeenTutorial: dbUser.hasSeenTutorial,
      },
      books: dbUser.books,
      sessions: dbUser.sessions,
      hasSeenTutorial: dbUser.hasSeenTutorial,
    });
  } catch (error) {
    console.error("Error fetching user data:", error);
    return NextResponse.json(
      { error: "Failed to fetch user data" },
      { status: 500 }
    );
  }
}
