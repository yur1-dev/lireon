// src/app/api/reading-sessions/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET - Fetch all reading sessions for the current user
export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      console.log("❌ GET /api/reading-sessions - Unauthorized");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    console.log("📖 Fetching sessions for user:", session.user.id);

    // Fetch all reading sessions for this user
    const sessions = await prisma.readingSession.findMany({
      where: {
        userId: session.user.id as string,
      },
      include: {
        book: {
          select: {
            title: true,
          },
        },
      },
      orderBy: {
        date: "desc",
      },
    });

    // Format sessions for the calendar
    const formattedSessions = sessions.map((s: any) => ({
      id: s.id,
      date: s.date,
      pagesRead: s.pagesRead,
      bookId: s.bookId,
      bookTitle: s.book?.title || s.bookTitle,
    }));

    console.log(`✅ Fetched ${formattedSessions.length} reading sessions`);
    return NextResponse.json(formattedSessions);
  } catch (error) {
    console.error("❌ Error fetching reading sessions:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch sessions",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

// POST - Create/Update reading session
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { bookId, pagesRead } = await request.json();

    if (!bookId || !pagesRead || pagesRead < 1) {
      return NextResponse.json({ error: "Invalid data" }, { status: 400 });
    }

    const result = await prisma.$transaction(async (tx) => {
      // Get the book first
      const book = await tx.book.findFirst({
        where: {
          id: bookId,
          userId: session.user.id as string,
        },
      });

      if (!book) throw new Error("Book not found");

      // Get today's date at midnight
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      // Try to find existing session
      const allSessionsToday = await tx.readingSession.findMany({
        where: {
          userId: session.user.id as string,
          date: today,
        },
      });

      const existingSession = allSessionsToday.find(
        (s: any) => s.bookId === bookId
      );

      let readingSession;
      if (existingSession) {
        // Update existing session
        readingSession = await tx.readingSession.update({
          where: { id: existingSession.id },
          data: {
            pagesRead: existingSession.pagesRead + pagesRead,
          },
        });
      } else {
        // Create new session
        try {
          readingSession = await tx.readingSession.create({
            data: {
              userId: session.user.id as string,
              bookId,
              pagesRead,
              date: today,
            } as any,
          });
        } catch (error) {
          console.error("Failed with bookId, trying bookTitle:", error);
          readingSession = await tx.readingSession.create({
            data: {
              userId: session.user.id as string,
              bookTitle: book.title,
              pagesRead,
              date: today,
            } as any,
          });
        }
      }

      // Update book progress
      const newCurrentPage = Math.min(
        book.currentPage + pagesRead,
        book.totalPages
      );
      const newStatus =
        newCurrentPage >= book.totalPages ? "completed" : book.status;

      const updatedBook = await tx.book.update({
        where: { id: bookId },
        data: {
          currentPage: newCurrentPage,
          status: newStatus,
        },
      });

      // Update user total pages
      await tx.user.update({
        where: { id: session.user.id as string },
        data: {
          totalPagesRead: {
            increment: pagesRead,
          },
        },
      });

      return { book: updatedBook };
    });

    console.log(`✅ Logged ${pagesRead} pages for book ${bookId}`);
    return NextResponse.json(result);
  } catch (error) {
    console.error("❌ Reading session error:", error);
    return NextResponse.json(
      {
        error: "Failed to log reading",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
