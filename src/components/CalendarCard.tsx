// components/CalendarCard.tsx
"use client";

import React from "react";
import { Calendar, Flame } from "lucide-react";

interface Session {
  date: string | Date;
  pagesRead: number;
  bookTitle?: string;
}

interface CalendarCardProps {
  sessions: Session[];
}

export default function CalendarCard({ sessions }: CalendarCardProps) {
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = new Date(year, month, 1).getDay();

  const monthName = today.toLocaleString("default", { month: "long" });
  const monthYear = `${monthName} ${year}`;

  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  // Get sessions for a specific day
  const getSessionsForDay = (day: number): Session[] => {
    const dateStr = new Date(year, month, day).toISOString().split("T")[0];

    return sessions.filter((s) => {
      const sessionDate =
        typeof s.date === "string"
          ? s.date.split("T")[0]
          : new Date(s.date).toISOString().split("T")[0];

      return sessionDate === dateStr;
    });
  };

  // Get total pages read on a specific day
  const getPagesForDay = (day: number): number => {
    const daySessions = getSessionsForDay(day);
    return daySessions.reduce((sum, s) => sum + (s.pagesRead || 0), 0);
  };

  // Determine heat level (0–4)
  const getHeatLevel = (pages: number): number => {
    if (pages === 0) return 0;
    if (pages < 10) return 1;
    if (pages < 30) return 2;
    if (pages < 60) return 3;
    return 4;
  };

  // Your custom color scheme!
  const heatColors = [
    "bg-[#FAF2E5] border-2 border-[#DBDAAE]/40 text-[#5D6939]/50", // none
    "bg-[#DBDAAE]/40 border-2 border-[#DBDAAE]/60 text-[#5D6939]", // light
    "bg-[#AAB97E]/50 border-2 border-[#AAB97E]/70 text-[#5D6939]", // medium
    "bg-[#AAB97E] border-2 border-[#5D6939]/30 text-white font-semibold", // good
    "bg-[#5D6939] border-2 border-[#5D6939] text-white font-bold shadow-lg", // heavy
  ];

  const isToday = (day: number) => {
    return (
      day === today.getDate() &&
      month === today.getMonth() &&
      year === today.getFullYear()
    );
  };

  return (
    <div className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl p-8 border-2 border-[#DBDAAE] hover:shadow-3xl transition-all duration-500">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <h3 className="text-xl font-black text-[#5D6939] flex items-center gap-3">
          <div className="p-3 bg-gradient-to-br from-[#5D6939] to-[#AAB97E] rounded-2xl shadow-xl">
            <Calendar className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="text-xs text-[#5D6939]/70 uppercase tracking-wider font-bold">
              Reading Activity
            </div>
            <div className="text-2xl font-bold">{monthYear}</div>
          </div>
        </h3>
        <Flame className="w-8 h-8 text-[#AAB97E] animate-pulse" />
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-2">
        {/* Weekday Labels */}
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day, i) => (
          <div
            key={`weekday-${i}`}
            className="text-center text-xs font-bold text-[#5D6939]/70 uppercase tracking-wide pb-2"
          >
            {day}
          </div>
        ))}

        {/* Leading empty cells */}
        {Array.from({ length: firstDayOfMonth }, (_, i) => (
          <div key={`empty-${i}`} className="aspect-square" />
        ))}

        {/* Calendar Days */}
        {days.map((day) => {
          const pages = getPagesForDay(day);
          const daySessions = getSessionsForDay(day);
          const level = getHeatLevel(pages);
          const isTodayDay = isToday(day);

          return (
            <div
              key={day}
              className={`
                aspect-square rounded-xl flex items-center justify-center
                text-sm font-bold transition-all duration-300
                hover:scale-110 hover:shadow-xl cursor-default relative group
                ${heatColors[level]}
                ${isTodayDay ? "ring-4 ring-[#5D6939] ring-offset-2" : ""}
              `}
            >
              <span className="relative z-10">{day}</span>

              {/* Tooltip on hover */}
              {pages > 0 && (
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 bg-[#5D6939] text-white text-xs px-4 py-3 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50 shadow-2xl border-2 border-[#AAB97E]">
                  <div className="font-bold mb-1">
                    {new Date(year, month, day).toLocaleDateString("en-US", {
                      weekday: "short",
                      month: "short",
                      day: "numeric",
                    })}
                  </div>
                  <div className="text-[#AAB97E] font-semibold">
                    {pages} pages read
                  </div>
                  {daySessions.length > 0 && (
                    <div className="text-[#DBDAAE] text-xs mt-1">
                      {daySessions.length} session
                      {daySessions.length > 1 ? "s" : ""}
                    </div>
                  )}
                  {/* Arrow */}
                  <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-[6px] border-transparent border-t-[#5D6939]" />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="mt-8 flex items-center justify-center gap-3 text-sm">
        <span className="text-[#5D6939]/70 font-bold">Less</span>
        <div className="flex gap-2">
          {[0, 1, 2, 3, 4].map((level) => (
            <div
              key={level}
              className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-xs shadow-md transition-transform hover:scale-110 ${heatColors[level]}`}
              title={
                level === 0
                  ? "No activity"
                  : level === 1
                  ? "1-9 pages"
                  : level === 2
                  ? "10-29 pages"
                  : level === 3
                  ? "30-59 pages"
                  : "60+ pages"
              }
            >
              {level === 4 ? "60+" : level === 0 ? "" : level}
            </div>
          ))}
        </div>
        <span className="text-[#5D6939]/70 font-bold">More</span>
      </div>

      {/* Motivational Message */}
      <div className="mt-6 text-center">
        <p className="text-[#5D6939]/80 text-sm font-medium">
          Keep the streak alive
          <Flame className="inline w-5 h-5 ml-2 text-[#AAB97E] animate-pulse" />
        </p>
      </div>
    </div>
  );
}
