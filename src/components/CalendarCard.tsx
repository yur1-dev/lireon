"use client";
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

  const toLocalDateString = (date: Date | string): string => {
    const d = new Date(date);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(
      2,
      "0"
    )}-${String(d.getDate()).padStart(2, "0")}`;
  };

  const getSessionsForDay = (day: number): Session[] => {
    const targetDateStr = toLocalDateString(new Date(year, month, day));
    return sessions.filter((s) => {
      return toLocalDateString(s.date) === targetDateStr;
    });
  };

  const getPagesForDay = (day: number): number => {
    const daySessions = getSessionsForDay(day);
    return daySessions.reduce((sum, s) => sum + (s.pagesRead || 0), 0);
  };

  const getHeatLevel = (pages: number): number => {
    if (pages === 0) return 0;
    if (pages < 10) return 1;
    if (pages < 30) return 2;
    if (pages < 60) return 3;
    return 4;
  };

  const heatColors = [
    "bg-[#FAF2E5] text-[#5D6939]/40",
    "bg-[#DBDAAE]/50 text-[#5D6939]",
    "bg-[#AAB97E]/60 text-[#5D6939]",
    "bg-[#AAB97E] text-white",
    "bg-[#5D6939] text-white",
  ];

  const isToday = (day: number): boolean => {
    const todayStr = toLocalDateString(today);
    const dayStr = toLocalDateString(new Date(year, month, day));
    return todayStr === dayStr;
  };

  const weekdaysFull = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const weekdaysShort = ["S", "M", "T", "W", "T", "F", "S"];

  return (
    <div className="bg-white rounded-2xl shadow-lg p-4 sm:p-6 border-2 border-[#DBDAAE]">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 sm:mb-6">
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="p-2 sm:p-2.5 bg-gradient-to-br from-[#5D6939] to-[#AAB97E] rounded-xl">
            <Calendar className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
          </div>
          <div>
            <p className="text-[10px] sm:text-xs text-[#5D6939]/60 uppercase tracking-wider font-semibold">
              Reading Activity
            </p>
            <h3 className="text-lg sm:text-xl font-black text-[#5D6939]">
              {monthYear}
            </h3>
          </div>
        </div>
        <Flame className="w-6 h-6 sm:w-7 sm:h-7 text-[#AAB97E]" />
      </div>

      {/* Calendar Grid - Responsive gap and sizing */}
      <div className="grid grid-cols-7 gap-1 sm:gap-1.5 md:gap-2">
        {/* Weekday Labels */}
        {weekdaysFull.map((day, i) => (
          <div
            key={`weekday-${i}`}
            className="text-center text-[10px] sm:text-xs font-bold text-[#5D6939]/60 uppercase pb-1 sm:pb-2"
          >
            {/* Show single letter on mobile, full on larger */}
            <span className="sm:hidden">{weekdaysShort[i]}</span>
            <span className="hidden sm:inline">{day}</span>
          </div>
        ))}

        {/* Leading empty cells */}
        {Array.from({ length: firstDayOfMonth }, (_, i) => (
          <div key={`empty-${i}`} className="aspect-square" />
        ))}

        {/* Calendar Days - Better responsive sizing */}
        {days.map((day) => {
          const pages = getPagesForDay(day);
          const daySessions = getSessionsForDay(day);
          const level = getHeatLevel(pages);
          const todayHighlight = isToday(day);

          return (
            <div
              key={day}
              className={`
                aspect-square rounded-md sm:rounded-lg flex items-center justify-center
                text-xs sm:text-sm font-semibold transition-all duration-200
                hover:scale-105 cursor-default relative group
                ${heatColors[level]}
                ${todayHighlight ? "ring-2 ring-[#5D6939] ring-offset-1" : ""}
              `}
            >
              <span>{day}</span>

              {/* Tooltip - Only show on larger screens */}
              {pages > 0 && (
                <div className="hidden sm:block absolute bottom-full left-1/2 -translate-x-1/2 mb-2 bg-[#5D6939] text-white text-xs px-3 py-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50 shadow-lg">
                  <div className="font-bold">{pages} pages</div>
                  <div className="text-[#AAB97E] text-[10px]">
                    {daySessions.length} session
                    {daySessions.length > 1 ? "s" : ""}
                  </div>
                  <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-[#5D6939]" />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Legend - Responsive sizing and layout */}
      <div className="mt-4 sm:mt-6 flex items-center justify-center gap-1.5 sm:gap-2 text-xs">
        <span className="text-[#5D6939]/60 font-medium text-[10px] sm:text-xs">
          Less
        </span>
        <div className="flex gap-1 sm:gap-1.5">
          {[0, 1, 2, 3, 4].map((level) => (
            <div
              key={level}
              className={`w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 rounded sm:rounded-md ${heatColors[level]}`}
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
            />
          ))}
        </div>
        <span className="text-[#5D6939]/60 font-medium text-[10px] sm:text-xs">
          More
        </span>
      </div>
    </div>
  );
}
