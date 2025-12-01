// src/app/api/auth/register/route.ts
import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";

// Import prisma with error handling
let prisma: any;
try {
  const prismaModule = require("@/lib/prisma");
  prisma = prismaModule.prisma || prismaModule.default;
  console.log("✅ Prisma imported successfully");
} catch (error) {
  console.error("❌ Failed to import Prisma:", error);
}

export async function POST(request: NextRequest) {
  console.log("📝 Register endpoint called");

  try {
    // Check if Prisma is available
    if (!prisma) {
      console.error("❌ Prisma client not available");
      return NextResponse.json(
        { error: "Database connection not available" },
        { status: 500 }
      );
    }

    // Parse request body
    let body;
    try {
      body = await request.json();
      console.log("📦 Request body parsed:", {
        username: body.username,
        email: body.email,
        hasPassword: !!body.password,
      });
    } catch (parseError) {
      console.error("❌ Failed to parse request body:", parseError);
      return NextResponse.json(
        { error: "Invalid request body" },
        { status: 400 }
      );
    }

    const { username, email, password } = body;

    // Validate input
    if (!username || !email || !password) {
      console.log("❌ Missing required fields");
      return NextResponse.json(
        { error: "All fields are required" },
        { status: 400 }
      );
    }

    if (username.length < 3) {
      return NextResponse.json(
        { error: "Username must be at least 3 characters" },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters" },
        { status: 400 }
      );
    }

    // Check if user already exists
    console.log("🔍 Checking if user exists...");
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { email: email.toLowerCase() },
          { username: username.toLowerCase() },
        ],
      },
    });

    if (existingUser) {
      console.log("❌ User already exists");
      if (existingUser.email.toLowerCase() === email.toLowerCase()) {
        return NextResponse.json(
          { error: "Email already registered" },
          { status: 400 }
        );
      }
      return NextResponse.json(
        { error: "Username already taken" },
        { status: 400 }
      );
    }

    // Hash password
    console.log("🔐 Hashing password...");
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    console.log("👤 Creating user...");
    const user = await prisma.user.create({
      data: {
        username: username.toLowerCase(),
        email: email.toLowerCase(),
        password: hashedPassword,
        dailyGoal: 30,
        weeklyGoal: 200,
        monthlyGoal: 1000,
        streak: 0,
        totalPagesRead: 0,
        hasSeenTutorial: false,
      },
    });

    console.log("✅ User created successfully:", user.email);

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user;

    return NextResponse.json(
      {
        success: true,
        message: "Account created successfully",
        user: userWithoutPassword,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("❌ Registration error:", error);
    console.error("Error details:", {
      name: error.name,
      message: error.message,
      stack: error.stack,
    });

    return NextResponse.json(
      {
        error: "Failed to create account. Please try again.",
        details:
          process.env.NODE_ENV === "development" ? error.message : undefined,
      },
      { status: 500 }
    );
  }
}

// Add a GET endpoint for testing
export async function GET() {
  return NextResponse.json({
    message: "Register API is working",
    prismaAvailable: !!prisma,
    timestamp: new Date().toISOString(),
  });
}
