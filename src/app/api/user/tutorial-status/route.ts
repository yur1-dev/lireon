// app/api/user/tutorial-status/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET - Check if user has seen tutorial
export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { hasSeenTutorial: true },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({
      hasSeenTutorial: user.hasSeenTutorial || false,
    });
  } catch (error) {
    console.error("Error fetching tutorial status:", error);
    return NextResponse.json(
      { error: "Failed to fetch tutorial status" },
      { status: 500 }
    );
  }
}

// PATCH - Update tutorial status
export async function PATCH(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { hasSeenTutorial } = await request.json();

    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: { hasSeenTutorial },
    });

    return NextResponse.json({
      success: true,
      hasSeenTutorial: updatedUser.hasSeenTutorial,
    });
  } catch (error) {
    console.error("Error updating tutorial status:", error);
    return NextResponse.json(
      { error: "Failed to update tutorial status" },
      { status: 500 }
    );
  }
}
