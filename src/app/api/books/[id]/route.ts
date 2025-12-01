// app/api/books/[id]/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET single book
export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const params = await context.params;
  console.log("📖 GET /api/books/[id] - Fetching book:", params.id);

  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    console.error("❌ Unauthorized - No session or user ID");
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  console.log("👤 User ID from session:", session.user.id);

  try {
    // Use findFirst instead of findUnique to allow compound where clause
    const book = await prisma.book.findFirst({
      where: {
        id: params.id,
        userId: session.user.id,
      },
    });

    if (!book) {
      console.error(
        "❌ Book not found for user:",
        session.user.id,
        "Book ID:",
        params.id
      );
      return NextResponse.json({ error: "Book not found" }, { status: 404 });
    }

    console.log(
      "✅ Book fetched successfully:",
      book.title,
      "User:",
      session.user.id
    );
    return NextResponse.json(book);
  } catch (error) {
    console.error("❌ Error fetching book:", error);
    return NextResponse.json(
      { error: "Failed to fetch book" },
      { status: 500 }
    );
  }
}

// PATCH (update) book
export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const params = await context.params;
  console.log("🔄 PATCH /api/books/[id] - Updating book:", params.id);

  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    console.error("❌ Unauthorized - No session or user ID");
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  console.log("👤 User ID from session:", session.user.id);

  try {
    const data = await request.json();
    console.log("📝 Update data:", data);

    // Verify the book belongs to the user
    const existingBook = await prisma.book.findFirst({
      where: {
        id: params.id,
        userId: session.user.id,
      },
    });

    if (!existingBook) {
      console.error(
        "❌ Book not found or unauthorized for user:",
        session.user.id,
        "Book ID:",
        params.id
      );
      return NextResponse.json({ error: "Book not found" }, { status: 404 });
    }

    console.log(
      "📚 Existing book:",
      existingBook.title,
      "User:",
      existingBook.userId
    );

    // Prepare update data - only include fields that are actually being updated
    const updateData: Record<string, any> = {};

    // Only add fields that are present in the request
    if ("status" in data) {
      updateData.status = data.status;
    }
    if ("currentPage" in data) {
      updateData.currentPage = Number(data.currentPage);
    }
    if ("rating" in data) {
      // Handle rating: null, 0, or a number
      updateData.rating = data.rating === null ? null : Number(data.rating);
    }
    if ("totalPages" in data) {
      updateData.totalPages = Number(data.totalPages);
    }
    if ("title" in data) {
      updateData.title = data.title;
    }
    if ("author" in data) {
      updateData.author = data.author;
    }

    console.log("📝 Prepared update data:", updateData);

    // Update the book
    const updatedBook = await prisma.book.update({
      where: {
        id: params.id,
      },
      data: updateData,
    });

    console.log(
      "✅ Book updated successfully:",
      updatedBook.title,
      "Status:",
      updatedBook.status,
      "User:",
      updatedBook.userId
    );
    return NextResponse.json(updatedBook);
  } catch (error) {
    console.error("❌ Error updating book - Full error:", error);
    console.error("Error details:", {
      name: error instanceof Error ? error.name : "Unknown",
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    });
    return NextResponse.json(
      {
        error: "Failed to update book",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

// DELETE book
export async function DELETE(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const params = await context.params;
  console.log("🗑️ DELETE /api/books/[id] - Deleting book:", params.id);

  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    console.error("❌ Unauthorized - No session or user ID");
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  console.log("👤 User ID from session:", session.user.id);

  try {
    // Verify the book belongs to the user
    const existingBook = await prisma.book.findFirst({
      where: {
        id: params.id,
        userId: session.user.id,
      },
    });

    if (!existingBook) {
      console.error(
        "❌ Book not found or unauthorized for user:",
        session.user.id,
        "Book ID:",
        params.id
      );
      return NextResponse.json({ error: "Book not found" }, { status: 404 });
    }

    console.log(
      "📚 Found book to delete:",
      existingBook.title,
      "User:",
      existingBook.userId
    );

    // Delete associated reading sessions first (Cascade should handle this, but being explicit)
    const deletedSessions = await prisma.readingSession.deleteMany({
      where: {
        bookId: params.id,
      },
    });
    console.log("🗑️ Deleted", deletedSessions.count, "reading sessions");

    // Delete the book
    await prisma.book.delete({
      where: {
        id: params.id,
      },
    });

    console.log(
      "✅ Book deleted successfully:",
      existingBook.title,
      "for user:",
      session.user.id
    );
    return NextResponse.json({ message: "Book deleted successfully" });
  } catch (error) {
    console.error("❌ Error deleting book:", error);
    return NextResponse.json(
      { error: "Failed to delete book" },
      { status: 500 }
    );
  }
}
