// components/Dashboard.tsx
"use client";

import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Flame, BookOpen, FileText, Clock, TrendingUp } from "lucide-react";
import TimerCard from "@/components/TimerCard";
import CalendarCard from "@/components/CalendarCard";
import ProgressGoalsTabs from "@/components/ProgressGoalsTabs";
import BooksSection from "@/components/BooksSelection";
import TutorialModal from "@/components/TutorialModal";
import type { AppData, Book, ReadingSession } from "@/types";

interface DashboardProps {
  appData?: AppData | null;
  setAppData?: (data: AppData | null) => void;
  onLogout: () => void;
}

export default function Dashboard({
  appData: propAppData,
  setAppData: propSetAppData,
  onLogout,
}: DashboardProps) {
  const rawUserName = propAppData?.user?.username ?? "Reader";
  const userName = rawUserName
    ? rawUserName.charAt(0).toUpperCase() + rawUserName.slice(1).toLowerCase()
    : "Reader";

  const [appData, setAppData] = useState<AppData | null>(propAppData ?? null);
  const [showWelcome, setShowWelcome] = useState(true);
  const [showTutorial, setShowTutorial] = useState<"pending" | boolean>(
    "pending"
  );

  useEffect(() => {
    setAppData(propAppData ?? null);
  }, [propAppData]);

  useEffect(() => {
    if (localStorage.getItem("LIREON_TUTORIAL_SEEN") === "true") {
      setShowTutorial(false);
      return;
    }
    if (propAppData === null || propAppData === undefined) return;
    setShowTutorial(!propAppData.hasSeenTutorial);
  }, [propAppData]);

  useEffect(() => {
    const dismissedDate = localStorage.getItem("LIREON_WELCOME_DISMISSED");
    const today = new Date().toDateString();
    if (dismissedDate === today) {
      setShowWelcome(false);
    }
  }, []);

  const dismissWelcome = () => {
    localStorage.setItem("LIREON_WELCOME_DISMISSED", new Date().toDateString());
    setShowWelcome(false);
  };

  const closeTutorialForever = async () => {
    setShowTutorial(false);
    localStorage.setItem("LIREON_TUTORIAL_SEEN", "true");

    try {
      await fetch("/api/user/tutorial-status", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ hasSeenTutorial: true }),
      });

      if (appData) {
        const updated = { ...appData, hasSeenTutorial: true };
        setAppData(updated);
        propSetAppData?.(updated);
      }
    } catch (error) {
      console.error("Failed to update tutorial status:", error);
    }
  };

  // Function to refresh sessions from API
  const refreshSessions = async () => {
    try {
      console.log("🔄 Refreshing sessions...");
      const res = await fetch("/api/reading-sessions", {
        credentials: "include",
      });

      if (res.ok) {
        const sessions: ReadingSession[] = await res.json();
        console.log("✅ Sessions refreshed:", sessions);
        console.log("📊 Sample session:", sessions[0]);

        if (appData) {
          const updated: AppData = { ...appData, sessions };
          setAppData(updated);
          propSetAppData?.(updated);

          console.log(
            "📦 Updated appData with sessions:",
            updated.sessions.length
          );
        }
      } else {
        console.error("❌ Failed to fetch sessions:", res.status);
      }
    } catch (error) {
      console.error("❌ Failed to refresh sessions:", error);
    }
  };

  const sessions: ReadingSession[] = appData?.sessions ?? [];
  const rawBooks = appData?.books ?? [];
  const books: Book[] = rawBooks.filter((book) => !book.id.startsWith("temp-"));

  // Calculate total reading time from sessions
  const totalReadingMinutes = useMemo(() => {
    return sessions.reduce((total, session) => {
      return total + (session.duration ?? 0);
    }, 0);
  }, [sessions]);

  // Calculate this week's reading sessions
  const weeklySessionCount = useMemo(() => {
    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    return sessions.filter((session) => {
      const sessionDate =
        typeof session.date === "string"
          ? new Date(session.date)
          : new Date(session.date);
      return sessionDate >= weekAgo;
    }).length;
  }, [sessions]);

  // Calculate real-time streak from sessions
  const calculatedStreak = useMemo(() => {
    console.log("🔥 DASHBOARD: Calculating streak from sessions");
    console.log("📊 DASHBOARD: Sessions count:", sessions.length);

    if (!Array.isArray(sessions) || sessions.length === 0) {
      console.log("❌ DASHBOARD: No sessions - returning 0");
      return 0;
    }

    const now = new Date();
    now.setHours(0, 0, 0, 0);

    // Get unique dates from sessions
    const uniqueDates = new Set<string>();
    sessions.forEach((s) => {
      const dateStr =
        typeof s.date === "string"
          ? s.date.split("T")[0]
          : new Date(s.date).toISOString().split("T")[0];
      uniqueDates.add(dateStr);
    });

    // Sort dates in descending order (most recent first)
    const sortedDates = Array.from(uniqueDates).sort(
      (a, b) => new Date(b).getTime() - new Date(a).getTime()
    );

    let streak = 0;

    // Check each date starting from today
    for (let i = 0; i < sortedDates.length; i++) {
      const expectedDate = new Date(now);
      expectedDate.setDate(now.getDate() - streak);
      const expectedStr = expectedDate.toISOString().split("T")[0];

      if (sortedDates[i] === expectedStr) {
        streak++;
      } else if (streak > 0) {
        break;
      }
    }

    console.log(`🔥 DASHBOARD: Final streak = ${streak}`);
    return streak;
  }, [sessions]);

  // Debug log
  useEffect(() => {
    console.log("🔍 Dashboard sessions count:", sessions.length);
    console.log("🔍 Dashboard books count:", books.length);
    console.log("🔥 Dashboard calculated streak:", calculatedStreak);
  }, [sessions, books, calculatedStreak]);

  return (
    <div className="min-h-screen bg-[#FAF2E5]">
      {/* Closable Welcome Banner */}
      <div className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b-2 border-[#DBDAAE] px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto py-5">
          <AnimatePresence>
            {showWelcome && (
              <motion.div
                initial={{ opacity: 0, y: -30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -30 }}
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
                className="relative bg-gradient-to-r from-[#FAF2E5]/80 via-white to-[#FAF2E5]/80 rounded-2xl p-6 shadow-xl border-2 border-[#DBDAAE] flex flex-col sm:flex-row items-center justify-between gap-6"
              >
                <div className="text-center sm:text-left">
                  <h2 className="text-tracking-tight text-2xl sm:text-3xl font-bold text-[#5D6939] flex items-center gap-3 justify-center sm:justify-start">
                    Welcome back, {userName}!
                    <span className="animate-wave text-3xl sm:text-4xl">
                      👋
                    </span>
                  </h2>
                  <p className="text-sm sm:text-base text-[#5D6939]/80 mt-1">
                    Keep up the great reading journey
                  </p>
                </div>

                {/* Streak Badge with Icon */}
                <div className="flex items-center gap-3 px-5 py-3 bg-gradient-to-r from-orange-50 to-orange-100 rounded-2xl border-2 border-orange-200 shadow-md">
                  <div className="p-2 bg-orange-200 rounded-xl">
                    <Flame className="w-5 h-5 text-orange-600" />
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-orange-600">
                      Streak
                    </p>
                    <p className="text-2xl font-bold text-orange-700">
                      {calculatedStreak} days
                    </p>
                  </div>
                </div>

                <button
                  onClick={dismissWelcome}
                  className="absolute top-3 right-3 p-1.5 rounded-full bg-white/90 backdrop-blur-sm hover:bg-white shadow-md border border-[#DBDAAE]/50 transition-all hover:scale-110 active:scale-95"
                  aria-label="Dismiss welcome banner"
                >
                  <X className="w-3.5 h-3.5 text-[#5D6939]/70" />
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Enhanced Mini Stats Bar with Icons */}
          {!showWelcome && (
            <div className="flex flex-wrap justify-center sm:justify-end gap-3 py-3">
              {/* Books Count Badge */}
              <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-50 to-emerald-100 rounded-xl border-2 border-green-200 shadow-sm hover:shadow-md transition-all hover:scale-105 cursor-pointer">
                <div className="p-1.5 bg-green-200 rounded-lg">
                  <BookOpen className="w-4 h-4 text-green-600" />
                </div>
                <div className="flex flex-col">
                  <span className="font-bold text-green-700 text-lg leading-none">
                    {books.length}
                  </span>
                  <span className="text-[10px] text-green-600 font-medium">
                    {books.length === 1 ? "book" : "books"}
                  </span>
                </div>
              </div>

              {/* Total Pages Badge */}
              <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl border-2 border-blue-200 shadow-sm hover:shadow-md transition-all hover:scale-105 cursor-pointer">
                <div className="p-1.5 bg-blue-200 rounded-lg">
                  <FileText className="w-4 h-4 text-blue-600" />
                </div>
                <div className="flex flex-col">
                  <span className="font-bold text-blue-700 text-lg leading-none">
                    {appData?.user?.totalPagesRead ?? 0}
                  </span>
                  <span className="text-[10px] text-blue-600 font-medium">
                    pages read
                  </span>
                </div>
              </div>

              {/* Reading Time Badge */}
              <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-50 to-purple-100 rounded-xl border-2 border-purple-200 shadow-sm hover:shadow-md transition-all hover:scale-105 cursor-pointer">
                <div className="p-1.5 bg-purple-200 rounded-lg">
                  <Clock className="w-4 h-4 text-purple-600" />
                </div>
                <div className="flex flex-col">
                  <span className="font-bold text-purple-700 text-lg leading-none">
                    {Math.floor(totalReadingMinutes / 60)}h{" "}
                    {totalReadingMinutes % 60}m
                  </span>
                  <span className="text-[10px] text-purple-600 font-medium">
                    read time
                  </span>
                </div>
              </div>

              {/* Weekly Activity Badge */}
              <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-50 to-amber-100 rounded-xl border-2 border-amber-200 shadow-sm hover:shadow-md transition-all hover:scale-105 cursor-pointer">
                <div className="p-1.5 bg-amber-200 rounded-lg">
                  <TrendingUp className="w-4 h-4 text-amber-600" />
                </div>
                <div className="flex flex-col">
                  <span className="font-bold text-amber-700 text-lg leading-none">
                    {weeklySessionCount}
                  </span>
                  <span className="text-[10px] text-amber-600 font-medium">
                    this week
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <main className="px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <TimerCard />
          <CalendarCard sessions={sessions} />
          <ProgressGoalsTabs
            userData={{
              name: userName,
              streak: calculatedStreak,
              totalPagesRead: appData?.user?.totalPagesRead,
              dailyGoal: appData?.user?.dailyGoal,
              weeklyGoal: appData?.user?.weeklyGoal,
              monthlyGoal: appData?.user?.monthlyGoal,
            }}
            todayPages={0}
            weeklyPages={0}
            monthlyPages={0}
            books={books}
            sessions={sessions}
          />
          <BooksSection
            books={books}
            setBooks={(newBooks: Book[]) => {
              if (!appData) return;
              const updated: AppData = { ...appData, books: newBooks };
              setAppData(updated);
              propSetAppData?.(updated);
            }}
            updateBook={(updatedBook: Partial<Book> & { id: string }) => {
              if (!appData) return;
              const updatedBooks = books.map((b) =>
                b.id === updatedBook.id ? { ...b, ...updatedBook } : b
              );
              const updated: AppData = { ...appData, books: updatedBooks };
              setAppData(updated);
              propSetAppData?.(updated);
            }}
            onSessionsUpdate={refreshSessions}
          />
        </div>
      </main>

      {/* Tutorial Modal */}
      {showTutorial !== "pending" && (
        <TutorialModal
          open={showTutorial as boolean}
          onOpenChange={(open) => !open && closeTutorialForever()}
        />
      )}
    </div>
  );
}
