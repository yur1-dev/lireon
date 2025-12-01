// components/ProgressGoalsTabs.tsx
"use client";

import React, { useMemo } from "react";
import { Flame, BookOpen, TrendingUp, Award, Zap } from "lucide-react";

interface Book {
  id: string;
  title: string;
  author: string;
  currentPage: number;
  totalPages: number;
  status: "to-read" | "reading" | "completed";
}

interface ReadingSession {
  id: string;
  date: string | Date;
  pagesRead: number;
  bookId?: string;
  bookTitle?: string;
}

interface UserData {
  name?: string;
  streak?: number;
  totalPagesRead?: number;
  dailyGoal?: number;
  weeklyGoal?: number;
  monthlyGoal?: number;
}

interface ProgressGoalsTabsProps {
  userData: UserData;
  todayPages: number;
  weeklyPages: number;
  monthlyPages: number;
  books: Book[];
  sessions?: ReadingSession[];
}

export default function ProgressGoalsTabs({
  userData,
  todayPages: propTodayPages,
  weeklyPages: propWeeklyPages,
  monthlyPages: propMonthlyPages,
  books,
  sessions = [],
}: ProgressGoalsTabsProps) {
  const [activeTab, setActiveTab] = React.useState<"progress" | "goals">(
    "progress"
  );

  // Calculate pages from sessions
  const { todayPages, weeklyPages, monthlyPages } = useMemo(() => {
    if (!Array.isArray(sessions)) {
      return {
        todayPages: propTodayPages,
        weeklyPages: propWeeklyPages,
        monthlyPages: propMonthlyPages,
      };
    }

    const now = new Date();
    const todayStr = now.toISOString().split("T")[0];

    // Calculate start of week (Sunday)
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    startOfWeek.setHours(0, 0, 0, 0);

    // Calculate start of month
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    let today = 0;
    let week = 0;
    let month = 0;

    sessions.forEach((s) => {
      const sessionDate = new Date(
        typeof s.date === "string" ? s.date.split("T")[0] : s.date
      );
      const sessionDateStr = sessionDate.toISOString().split("T")[0];

      // Today's pages
      if (sessionDateStr === todayStr) {
        today += s.pagesRead || 0;
      }

      // This week's pages
      if (sessionDate >= startOfWeek) {
        week += s.pagesRead || 0;
      }

      // This month's pages
      if (sessionDate >= startOfMonth) {
        month += s.pagesRead || 0;
      }
    });

    return { todayPages: today, weeklyPages: week, monthlyPages: month };
  }, [sessions, propTodayPages, propWeeklyPages, propMonthlyPages]);

  // Calculate current streak - FIXED VERSION
  const currentStreak = useMemo(() => {
    if (!Array.isArray(sessions) || sessions.length === 0) return 0;

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
    const todayStr = now.toISOString().split("T")[0];

    // Check each date starting from today
    for (let i = 0; i < sortedDates.length; i++) {
      const expectedDate = new Date(now);
      expectedDate.setDate(now.getDate() - streak);
      const expectedStr = expectedDate.toISOString().split("T")[0];

      if (sortedDates[i] === expectedStr) {
        streak++;
      } else if (streak > 0) {
        // If we've started counting and hit a gap, stop
        break;
      }
    }

    return streak;
  }, [sessions]);

  const readingBooks = books.filter((b) => b.status === "reading");

  return (
    <div className="bg-white rounded-2xl shadow-lg p-4 md:p-6 border-2 border-[#DBDAAE]">
      {/* Tabs */}
      <div className="flex gap-2 mb-6 bg-[#FAF2E5] p-1 rounded-xl">
        <button
          onClick={() => setActiveTab("progress")}
          className={`flex-1 py-2.5 px-4 rounded-lg text-sm font-bold transition-all cursor-pointer ${
            activeTab === "progress"
              ? "bg-[#5D6939] text-white shadow-md"
              : "text-[#5D6939] hover:bg-white"
          }`}
        >
          Progress
        </button>
        <button
          onClick={() => setActiveTab("goals")}
          className={`flex-1 py-2.5 px-4 rounded-lg text-sm font-bold transition-all cursor-pointer ${
            activeTab === "goals"
              ? "bg-[#5D6939] text-white shadow-md"
              : "text-[#5D6939] hover:bg-white"
          }`}
        >
          Goals
        </button>
      </div>

      {/* PROGRESS TAB */}
      {activeTab === "progress" && (
        <div className="space-y-5">
          {/* Stats Grid */}
          <div className="grid grid-cols-3 gap-2 md:gap-3">
            {/* Today */}
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-3 md:p-4 text-center border border-blue-200">
              <div className="text-2xl md:text-3xl font-black text-blue-600">
                {todayPages}
              </div>
              <p className="text-xs md:text-sm font-semibold text-blue-700 mt-1">
                Today
              </p>
            </div>

            {/* Streak */}
            <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-3 md:p-4 text-center border border-orange-200">
              <div className="text-2xl md:text-3xl font-black text-orange-600 flex items-center justify-center gap-1">
                {currentStreak}
                <Flame className="w-4 h-4 md:w-5 md:h-5" />
              </div>
              <p className="text-xs md:text-sm font-semibold text-orange-700 mt-1">
                Streak
              </p>
            </div>

            {/* Total */}
            <div className="bg-gradient-to-br from-[#AAB97E]/20 to-[#AAB97E]/40 rounded-xl p-3 md:p-4 text-center border border-[#AAB97E]">
              <div className="text-2xl md:text-3xl font-black text-[#5D6939]">
                {userData.totalPagesRead || 0}
              </div>
              <p className="text-xs md:text-sm font-semibold text-[#5D6939] mt-1">
                Total
              </p>
            </div>
          </div>

          {/* Currently Reading */}
          <div className="bg-[#FAF2E5] rounded-xl p-4 border border-[#DBDAAE]">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm md:text-base font-bold text-[#5D6939] flex items-center gap-2">
                <BookOpen className="w-4 h-4 md:w-5 md:h-5 text-[#AAB97E]" />
                Currently Reading
              </h3>
              {readingBooks.length > 0 && (
                <span className="bg-[#5D6939] text-white text-xs font-bold px-2 py-1 rounded-full">
                  {readingBooks.length}
                </span>
              )}
            </div>

            {readingBooks.length === 0 ? (
              <div className="text-center py-8 bg-white rounded-lg border-2 border-dashed border-[#DBDAAE]">
                <p className="text-3xl mb-2">📚</p>
                <p className="text-sm text-[#5D6939]/70">
                  No books in progress
                </p>
              </div>
            ) : (
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {readingBooks.map((book) => {
                  const progress = Math.round(
                    (book.currentPage / book.totalPages) * 100
                  );
                  return (
                    <div
                      key={book.id}
                      className="bg-white rounded-lg p-3 border border-[#DBDAAE]"
                    >
                      <div className="flex justify-between items-start mb-2 gap-2">
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-bold text-[#5D6939] truncate">
                            {book.title}
                          </h4>
                          <p className="text-xs italic text-[#AAB97E] truncate">
                            {book.author}
                          </p>
                        </div>
                        <div className="text-right shrink-0">
                          <div className="text-lg md:text-xl font-black text-[#5D6939]">
                            {progress}%
                          </div>
                          <div className="text-xs text-[#5D6939]/60">
                            {book.currentPage}/{book.totalPages}
                          </div>
                        </div>
                      </div>

                      <div className="w-full bg-[#DBDAAE]/30 rounded-full h-2">
                        <div
                          className="h-full bg-gradient-to-r from-[#AAB97E] to-[#5D6939] rounded-full transition-all"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* GOALS TAB */}
      {activeTab === "goals" && (
        <div className="space-y-4">
          {[
            {
              label: "Daily Goal",
              current: todayPages,
              target: userData.dailyGoal || 50,
              icon: Zap,
              color: "blue" as const,
            },
            {
              label: "Weekly Goal",
              current: weeklyPages,
              target: userData.weeklyGoal || 300,
              icon: TrendingUp,
              color: "green" as const,
            },
            {
              label: "Monthly Goal",
              current: monthlyPages,
              target: userData.monthlyGoal || 1200,
              icon: Award,
              color: "purple" as const,
            },
          ].map((goal) => {
            const percentage = Math.min(
              (goal.current / goal.target) * 100,
              100
            );
            const isComplete = percentage >= 100;
            const Icon = goal.icon;

            const colorMap = {
              blue: {
                bg: "from-blue-50 to-blue-100",
                bar: "from-blue-400 to-blue-600",
                text: "text-blue-700",
                border: "border-blue-200",
              },
              green: {
                bg: "from-green-50 to-green-100",
                bar: "from-green-400 to-green-600",
                text: "text-green-700",
                border: "border-green-200",
              },
              purple: {
                bg: "from-purple-50 to-purple-100",
                bar: "from-purple-400 to-purple-600",
                text: "text-purple-700",
                border: "border-purple-200",
              },
            };

            const colors = colorMap[goal.color];

            return (
              <div
                key={goal.label}
                className={`bg-gradient-to-br ${colors.bg} rounded-xl p-4 border ${colors.border}`}
              >
                <div className="flex justify-between items-center mb-3">
                  <div className="flex items-center gap-2">
                    <Icon className={`w-4 h-4 ${colors.text}`} />
                    <h4 className={`text-sm font-bold ${colors.text}`}>
                      {goal.label}
                    </h4>
                  </div>
                  <div className="text-right">
                    <span className={`text-xl font-black ${colors.text}`}>
                      {goal.current}
                    </span>
                    <span className={`text-sm ${colors.text} opacity-70`}>
                      /{goal.target}
                    </span>
                    {isComplete && <span className="ml-1">✅</span>}
                  </div>
                </div>

                <div className="w-full bg-white/60 rounded-full h-2.5 overflow-hidden">
                  <div
                    className={`h-full bg-gradient-to-r ${colors.bar} rounded-full transition-all duration-500`}
                    style={{ width: `${percentage}%` }}
                  />
                </div>

                <div className="mt-2 flex justify-between items-center text-xs">
                  <span className={`${colors.text} opacity-70 font-medium`}>
                    {goal.target - goal.current > 0
                      ? `${goal.target - goal.current} pages left`
                      : "Complete!"}
                  </span>
                  <span className={`font-bold ${colors.text}`}>
                    {Math.round(percentage)}%
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
