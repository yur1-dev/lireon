// src/app/api/auth/me/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    console.error("❌ No session or user ID");
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  console.log("👤 Fetching user data for ID:", session.user.id);

  try {
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        email: true,
        username: true,
        dailyGoal: true,
        weeklyGoal: true,
        monthlyGoal: true,
        streak: true,
        totalPagesRead: true,
        hasSeenTutorial: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      console.error("❌ User not found for ID:", session.user.id);
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    console.log("✅ User found:", user.username, user.email);
    return NextResponse.json(user);
  } catch (error) {
    console.error("❌ Error fetching user:", error);
    return NextResponse.json(
      { error: "Failed to fetch user" },
      { status: 500 }
    );
  }
}
