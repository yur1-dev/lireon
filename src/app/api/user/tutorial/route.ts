// app/api/user/tutorial/route.ts
import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST() {
  try {
    const cookieStore = await cookies();
    const userId = cookieStore.get("userId")?.value;

    if (!userId) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    // Store tutorial completion in localStorage on client side instead
    // Or update in your database if needed

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating tutorial status:", error);
    return NextResponse.json(
      { error: "Failed to update tutorial status" },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const cookieStore = await cookies();
    const userId = cookieStore.get("userId")?.value;

    if (!userId) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    return NextResponse.json({ hasSeenTutorial: false });
  } catch (error) {
    console.error("Error getting tutorial status:", error);
    return NextResponse.json(
      { error: "Failed to get tutorial status" },
      { status: 500 }
    );
  }
}
