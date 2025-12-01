// components/Dashboard.tsx
"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
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
  const userName =
    rawUserName && rawUserName.length > 0
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

  // Refresh sessions — now memoized so it doesn't break the listener
  const refreshSessions = useCallback(async () => {
    try {
      const res = await fetch("/api/reading-sessions", {
        credentials: "include",
      });
      if (!res.ok) return;

      const sessions: ReadingSession[] = await res.json();

      setAppData((prev) => {
        if (!prev) return prev;
        const updated = { ...prev, sessions };
        propSetAppData?.(updated);
        return updated;
      });
    } catch (error) {
      console.error("Failed to refresh sessions:", error);
    }
  }, [propSetAppData]);

  // Refresh books
  const refreshBooks = useCallback(async () => {
    try {
      const res = await fetch("/api/books");
      if (!res.ok) throw new Error("Failed to fetch books");

      const freshBooks: Book[] = await res.json();
      const safeBooks = Array.isArray(freshBooks) ? freshBooks : [];

      setAppData((prev) => {
        if (!prev) return prev;
        const updated = { ...prev, books: safeBooks };
        propSetAppData?.(updated);
        return updated;
      });
    } catch (error) {
      console.error("Failed to refresh books:", error);
    }
  }, [propSetAppData]);

  // CRITICAL FIX: This listener MUST NOT have appData in deps!
  useEffect(() => {
    const handleSessionCompleted = () => {
      console.log("Session completed! Refreshing..."); // ← You’ll see this in console
      refreshSessions();
    };

    window.addEventListener("readingSessionCompleted", handleSessionCompleted);

    return () => {
      window.removeEventListener(
        "readingSessionCompleted",
        handleSessionCompleted
      );
    };
  }, [refreshSessions]); // ← ONLY refreshSessions here!

  // Safe extraction
  const books: Book[] = useMemo(() => {
    const raw = Array.isArray(appData?.books) ? appData.books : [];
    return raw.filter(
      (book): book is Book =>
        !!book &&
        typeof book === "object" &&
        typeof book.id === "string" &&
        !book.id.startsWith("temp-")
    );
  }, [appData?.books]);

  const sessions: ReadingSession[] = useMemo(() => {
    return Array.isArray(appData?.sessions) ? appData.sessions : [];
  }, [appData?.sessions]);

  const totalReadingMinutes = useMemo(() => {
    return sessions.reduce((total, s) => total + (s.duration ?? 0), 0);
  }, [sessions]);

  const weeklySessionCount = useMemo(() => {
    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    return sessions.filter((s) => new Date(s.date) >= weekAgo).length;
  }, [sessions]);

  const calculatedStreak = useMemo(() => {
    if (sessions.length === 0) return 0;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const dates = new Set(
      sessions.map((s) => new Date(s.date).toISOString().split("T")[0])
    );

    let streak = 0;
    for (let i = 0; i < 365; i++) {
      const checkDate = new Date(today);
      checkDate.setDate(checkDate.getDate() - i);
      const dateStr = checkDate.toISOString().split("T")[0];
      if (dates.has(dateStr)) {
        streak++;
      } else if (i > 0) break;
    }
    return streak;
  }, [sessions]);

  return (
    <div className="min-h-screen bg-[#FAF2E5]">
      {/* ... rest of your JSX exactly the same ... */}
      <div className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b-2 border-[#DBDAAE] px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto py-5">
          <AnimatePresence>
            {showWelcome && (
              <motion.div
                initial={{ opacity: 0, y: -30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -30 }}
                className="relative bg-gradient-to-r from-[#FAF2E5]/80 via-white to-[#FAF2E5]/80 rounded-2xl p-6 shadow-xl border-2 border-[#DBDAAE] flex flex-col sm:flex-row items-center justify-between gap-6"
              >
                <div className="text-center sm:text-left">
                  <h2 className="text-2xl sm:text-3xl font-bold text-[#5D6939] flex items-center gap-3">
                    Welcome back, {userName}!
                  </h2>
                  <p className="text-sm text-[#5D6939]/80 mt-1">
                    Keep up the great reading journey
                  </p>
                </div>

                <div className="flex items-center gap-3 px-5 py-3 bg-gradient-to-r from-orange-50 to-orange-100 rounded-2xl border-2 border-orange-200">
                  <div className="p-2 bg-orange-200 rounded-xl">
                    <Flame className="w-5 h-5 text-orange-600" />
                  </div>
                  <div>
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
                  className="absolute top-3 right-3 p-1.5 rounded-full bg-white/90 hover:bg-white shadow-md border border-[#DBDAAE]/50"
                >
                  <X className="w-4 h-4 text-[#5D6939]/70" />
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          {!showWelcome && (
            <div className="flex flex-wrap justify-center sm:justify-end gap-3 py-3">
              <div className="flex items-center gap-2 px-4 py-2 bg-green-50 rounded-xl border-2 border-green-200">
                <BookOpen className="w-5 h-5 text-green-600" />
                <div>
                  <div className="font-bold text-green-700 text-lg">
                    {books.length}
                  </div>
                  <div className="text-xs text-green-600">books</div>
                </div>
              </div>

              <div className="flex items-center gap-2 px-4 py-2 bg-blue-50 rounded-xl border-2 border-blue-200">
                <FileText className="w-5 h-5 text-blue-600" />
                <div>
                  <div className="font-bold text-blue-700 text-lg">
                    {appData?.user?.totalPagesRead ?? 0}
                  </div>
                  <div className="text-xs text-blue-600">pages read</div>
                </div>
              </div>

              {/* <div className="flex items-center gap-2 px-4 py-2 bg-purple-50 rounded-xl border-2 border-purple-200">
                <Clock className="w-5 h-5 text-purple-600" />
                <div>
                  <div className="font-bold text-purple-700 text-lg">
                    {Math.floor(totalReadingMinutes / 60)}h{" "}
                    {totalReadingMinutes % 60}m
                  </div>
                  <div className="text-xs text-purple-600">read time</div>
                </div>
              </div> */}

              <div className="flex items-center gap-2 px-4 py-2 bg-amber-50 rounded-xl border-2 border-amber-200">
                <TrendingUp className="w-5 h-5 text-amber-600" />
                <div>
                  <div className="font-bold text-amber-700 text-lg">
                    {weeklySessionCount}
                  </div>
                  <div className="text-xs text-amber-600">this week</div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

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
              setAppData((prev) => {
                if (!prev) return prev;
                const updated = { ...prev, books: newBooks };
                propSetAppData?.(updated);
                return updated;
              });
            }}
            updateBook={(updatedBook: Partial<Book> & { id: string }) => {
              setAppData((prev) => {
                if (!prev) return prev;
                const updatedBooks = (prev.books || []).map((b: Book) =>
                  b.id === updatedBook.id ? { ...b, ...updatedBook } : b
                );
                const updated = { ...prev, books: updatedBooks };
                propSetAppData?.(updated);
                return updated;
              });
            }}
            onSessionsUpdate={refreshSessions}
            onRefresh={refreshBooks}
          />
        </div>
      </main>

      {showTutorial !== "pending" && (
        <TutorialModal
          open={showTutorial as boolean}
          onOpenChange={(open) => !open && closeTutorialForever()}
        />
      )}
    </div>
  );
}
