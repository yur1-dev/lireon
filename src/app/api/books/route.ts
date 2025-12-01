// app/api/books/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET all books for the logged-in user
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const books = await prisma.book.findMany({
      where: { userId: session.user.id },
      orderBy: { updatedAt: "desc" },
    });

    console.log(`✅ Fetched ${books.length} books for user:`, session.user.id);
    return NextResponse.json(books);
  } catch (error) {
    console.error("GET /api/books error:", error);
    return NextResponse.json(
      { error: "Failed to fetch books" },
      { status: 500 }
    );
  }
}

// POST - Create a new book
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { title, author, totalPages } = body;

    if (!title || !author || !totalPages) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const book = await prisma.book.create({
      data: {
        title,
        author,
        totalPages: parseInt(totalPages),
        currentPage: 0,
        status: "to-read",
        userId: session.user.id,
      },
    });

    console.log("✅ Book created for user:", session.user.id, "Book:", book);
    return NextResponse.json(book, { status: 201 });
  } catch (error) {
    console.error("POST /api/books error:", error);
    return NextResponse.json(
      { error: "Failed to create book" },
      { status: 500 }
    );
  }
}
