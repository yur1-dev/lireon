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
  const [showTutorial, setShowTutorial] = useState<boolean>(false);
  const [tutorialInitialized, setTutorialInitialized] = useState(false);

  // Sync prop changes to local state
  useEffect(() => {
    if (propAppData) {
      setAppData(propAppData);
    }
  }, [propAppData]);

  // Initialize tutorial state separately
  useEffect(() => {
    if (tutorialInitialized) return;

    const hasSeenTutorial =
      localStorage.getItem("LIREON_TUTORIAL_SEEN") === "true";

    if (hasSeenTutorial) {
      setShowTutorial(false);
      setTutorialInitialized(true);
      return;
    }

    if (propAppData !== null && propAppData !== undefined) {
      setShowTutorial(!propAppData.hasSeenTutorial);
      setTutorialInitialized(true);
    }
  }, [propAppData, tutorialInitialized]);

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

  // Refresh sessions
  const refreshSessions = useCallback(async () => {
    try {
      const res = await fetch("/api/reading-sessions", {
        credentials: "include",
      });
      if (!res.ok) return;

      const sessions: ReadingSession[] = await res.json();

      setAppData((prev) => {
        if (!prev) return prev;
        return { ...prev, sessions };
      });

      // Update parent asynchronously
      if (propSetAppData && appData) {
        propSetAppData({ ...appData, sessions });
      }
    } catch (error) {
      console.error("Failed to refresh sessions:", error);
    }
  }, [propSetAppData, appData]);

  // Refresh books
  const refreshBooks = useCallback(async () => {
    try {
      const res = await fetch("/api/books");
      if (!res.ok) throw new Error("Failed to fetch books");

      const freshBooks: Book[] = await res.json();
      const safeBooks = Array.isArray(freshBooks) ? freshBooks : [];

      setAppData((prev) => {
        if (!prev) return prev;
        return { ...prev, books: safeBooks };
      });

      // Update parent asynchronously
      if (propSetAppData && appData) {
        propSetAppData({ ...appData, books: safeBooks });
      }
    } catch (error) {
      console.error("Failed to refresh books:", error);
    }
  }, [propSetAppData, appData]);

  useEffect(() => {
    const handleSessionCompleted = () => {
      console.log("Session completed! Refreshing...");
      refreshSessions();
    };

    window.addEventListener("readingSessionCompleted", handleSessionCompleted);

    return () => {
      window.removeEventListener(
        "readingSessionCompleted",
        handleSessionCompleted
      );
    };
  }, [refreshSessions]);

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
    <div className="min-h-screen bg-[#FAF2E5] pb-safe">
      {/* Fixed Header - Mobile Optimized */}
      <div className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b-2 border-[#DBDAAE] shadow-sm">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-3 sm:py-4">
          <AnimatePresence>
            {showWelcome && (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="relative bg-gradient-to-r from-[#FAF2E5]/80 via-white to-[#FAF2E5]/80 rounded-xl sm:rounded-2xl p-3 sm:p-5 shadow-lg border-2 border-[#DBDAAE] flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-6"
              >
                <div className="text-center sm:text-left w-full sm:w-auto">
                  <h2 className="text-lg sm:text-2xl md:text-3xl font-bold text-[#5D6939] flex items-center justify-center sm:justify-start gap-2">
                    Welcome back, {userName}!
                  </h2>
                  <p className="text-xs sm:text-sm text-[#5D6939]/80 mt-0.5 sm:mt-1">
                    Keep up the great reading journey
                  </p>
                </div>

                <div className="flex items-center gap-2 sm:gap-3 px-3 sm:px-5 py-2 sm:py-3 bg-gradient-to-r from-orange-50 to-orange-100 rounded-xl sm:rounded-2xl border-2 border-orange-200 shrink-0">
                  <div className="p-1.5 sm:p-2 bg-orange-200 rounded-lg sm:rounded-xl">
                    <Flame className="w-4 h-4 sm:w-5 sm:h-5 text-orange-600" />
                  </div>
                  <div>
                    <p className="text-xs sm:text-sm font-medium text-orange-600">
                      Streak
                    </p>
                    <p className="text-lg sm:text-2xl font-bold text-orange-700">
                      {calculatedStreak} days
                    </p>
                  </div>
                </div>

                <button
                  onClick={dismissWelcome}
                  className="absolute top-2 right-2 sm:top-3 sm:right-3 p-1 sm:p-1.5 rounded-full bg-white/90 hover:bg-white shadow-md border border-[#DBDAAE]/50 transition-colors"
                  aria-label="Dismiss welcome message"
                >
                  <X className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#5D6939]/70" />
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          {!showWelcome && (
            <div className="flex flex-wrap justify-center sm:justify-end gap-2 sm:gap-3">
              <div className="flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-4 py-1.5 sm:py-2 bg-green-50 rounded-lg sm:rounded-xl border-2 border-green-200">
                <BookOpen className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" />
                <div>
                  <div className="font-bold text-green-700 text-sm sm:text-lg">
                    {books.length}
                  </div>
                  <div className="text-[10px] sm:text-xs text-green-600">
                    books
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-4 py-1.5 sm:py-2 bg-blue-50 rounded-lg sm:rounded-xl border-2 border-blue-200">
                <FileText className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
                <div>
                  <div className="font-bold text-blue-700 text-sm sm:text-lg">
                    {appData?.user?.totalPagesRead ?? 0}
                  </div>
                  <div className="text-[10px] sm:text-xs text-blue-600">
                    pages
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-4 py-1.5 sm:py-2 bg-amber-50 rounded-lg sm:rounded-xl border-2 border-amber-200">
                <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-amber-600" />
                <div>
                  <div className="font-bold text-amber-700 text-sm sm:text-lg">
                    {weeklySessionCount}
                  </div>
                  <div className="text-[10px] sm:text-xs text-amber-600">
                    this week
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Main Content with proper spacing */}
      <main className="px-3 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
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
            setBooks={useCallback(
              (newBooks: Book[]) => {
                setAppData((prev) => {
                  if (!prev) return prev;
                  return { ...prev, books: newBooks };
                });
                // Update parent in next tick to avoid render conflicts
                setTimeout(() => {
                  if (propSetAppData && appData) {
                    propSetAppData({ ...appData, books: newBooks });
                  }
                }, 0);
              },
              [propSetAppData, appData]
            )}
            updateBook={useCallback(
              (updatedBook: Partial<Book> & { id: string }) => {
                setAppData((prev) => {
                  if (!prev) return prev;
                  const updatedBooks = (prev.books || []).map((b: Book) =>
                    b.id === updatedBook.id ? { ...b, ...updatedBook } : b
                  );
                  return { ...prev, books: updatedBooks };
                });
                // Update parent in next tick to avoid render conflicts
                setTimeout(() => {
                  if (propSetAppData && appData) {
                    const updatedBooks = (appData.books || []).map((b: Book) =>
                      b.id === updatedBook.id ? { ...b, ...updatedBook } : b
                    );
                    propSetAppData({ ...appData, books: updatedBooks });
                  }
                }, 0);
              },
              [propSetAppData, appData]
            )}
            onSessionsUpdate={refreshSessions}
            onRefresh={refreshBooks}
          />
        </div>
      </main>

      {tutorialInitialized && (
        <TutorialModal
          open={showTutorial}
          onOpenChange={(open) => !open && closeTutorialForever()}
        />
      )}
    </div>
  );
}
