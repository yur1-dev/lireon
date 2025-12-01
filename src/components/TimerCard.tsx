// components/TimerCard.tsx
"use client";

import React, { useState, useEffect } from "react";
import { Play, Pause, RotateCcw, Check, Sparkles } from "lucide-react";

export default function TimerCard() {
  const [minutes, setMinutes] = useState(25);
  const [seconds, setSeconds] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [selectedPreset, setSelectedPreset] = useState<number | null>(null);
  const [totalInitialSeconds, setTotalInitialSeconds] = useState<number>(
    25 * 60
  );
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [justFinished, setJustFinished] = useState(false);

  const saveReadingSession = async (durationMinutes: number) => {
    try {
      const response = await fetch("/api/reading-sessions", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          duration: Math.round(durationMinutes),
          date: new Date().toISOString(),
        }),
      });

      if (!response.ok) throw new Error("Failed to save session");

      window.dispatchEvent(new CustomEvent("readingSessionCompleted"));

      setJustFinished(true);
      setTimeout(() => setJustFinished(false), 4000);
    } catch (error) {
      console.error("Failed to save reading session:", error);
    }
  };

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (isRunning) {
      interval = setInterval(() => {
        setElapsedSeconds((prev) => {
          const newElapsed = prev + 1;
          const total = totalInitialSeconds;

          if (newElapsed >= total) {
            setIsRunning(false);
            setSelectedPreset(null);
            saveReadingSession(total / 60);
            return 0;
          }

          const remaining = total - newElapsed;
          setMinutes(Math.floor(remaining / 60));
          setSeconds(remaining % 60);
          return newElapsed;
        });
      }, 1000);
    } else if (elapsedSeconds === 0) {
      setMinutes(Math.floor(totalInitialSeconds / 60));
      setSeconds(0);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRunning, totalInitialSeconds]);

  const startTimer = (mins: number) => {
    const total = mins * 60;
    setTotalInitialSeconds(total);
    setMinutes(mins);
    setSeconds(0);
    setElapsedSeconds(0);
    setIsRunning(true);
    setSelectedPreset(mins);
    setJustFinished(false);
  };

  const resetTimer = () => {
    setIsRunning(false);
    setMinutes(25);
    setSeconds(0);
    setElapsedSeconds(0);
    setSelectedPreset(null);
    setTotalInitialSeconds(25 * 60);
    setJustFinished(false);
  };

  const remainingSeconds = totalInitialSeconds - elapsedSeconds;
  const progress =
    totalInitialSeconds > 0
      ? Math.max(0, (remainingSeconds / totalInitialSeconds) * 100)
      : 0;

  const presets = [10, 25, 45];

  return (
    <div className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl p-5 sm:p-6 border-2 border-[#DBDAAE] hover:shadow-3xl transition-all h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2.5 bg-gradient-to-br from-[#5D6939] to-[#AAB97E] rounded-2xl shadow-xl">
          <svg
            className="w-7 h-7 text-white"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>
        <div>
          <h3 className="text-xl font-black text-[#5D6939]">Reading Timer</h3>
          <p className="text-xs text-[#5D6939]/70 uppercase tracking-wider">
            Tap to begin
          </p>
        </div>
      </div>

      {/* Timer Circle */}
      <div className="flex-1 flex items-center justify-center my-2">
        <div className="relative w-40 h-40 sm:w-48 sm:h-48 md:w-52 md:h-52">
          <svg className="w-full h-full -rotate-90">
            <circle
              cx="50%"
              cy="50%"
              r="42%"
              stroke="#DBDAAE"
              strokeWidth="10"
              fill="none"
              opacity="0.25"
            />
            <circle
              cx="50%"
              cy="50%"
              r="42%"
              stroke="url(#grad)"
              strokeWidth="11"
              fill="none"
              strokeDasharray="792"
              strokeDashoffset={`${792 * (1 - progress / 100)}`}
              strokeLinecap="round"
              className="transition-all duration-950 ease-linear"
            />
            <defs>
              <linearGradient id="grad">
                <stop offset="0%" stopColor="#AAB97E" />
                <stop offset="100%" stopColor="#5D6939" />
              </linearGradient>
            </defs>
          </svg>

          {/* Time Display - RESPONSIVE! */}
          <div className="absolute inset-0 flex items-center justify-center flex-col px-4">
            <div className="text-4xl sm:text-5xl font-black text-[#5D6939] tracking-wider drop-shadow-md text-center leading-tight">
              {String(minutes).padStart(2, "0")}:
              {String(seconds).padStart(2, "0")}
            </div>
          </div>
        </div>
      </div>

      {/* Success Message */}
      <div className="h-8 mb-3 flex items-center justify-center px-2">
        {justFinished && (
          <div className="flex items-center gap-2 text-green-600 font-bold text-sm sm:text-base animate-bounce text-center">
            <Sparkles className="w-5 h-5 flex-shrink-0" />
            <span>Session saved! +{totalInitialSeconds / 60} min added</span>
          </div>
        )}
      </div>

      {/* Presets */}
      <div className="grid grid-cols-3 gap-3 mb-5">
        {presets.map((m) => (
          <button
            key={m}
            onClick={() => startTimer(m)}
            disabled={isRunning}
            className={`relative py-3 text-sm sm:text-base font-bold rounded-xl transition-all duration-300 shadow-sm overflow-hidden
              ${
                isRunning
                  ? "opacity-50 cursor-not-allowed"
                  : "hover:scale-105 active:scale-95"
              }
              ${
                selectedPreset === m && isRunning
                  ? "bg-[#5D6939] text-white ring-4 ring-[#5D6939]/30"
                  : "bg-[#FAF2E5] text-[#5D6939] border border-[#DBDAAE] hover:bg-[#DBDAAE]/40"
              }`}
          >
            {selectedPreset === m && isRunning ? (
              <>
                <Check className="w-4 h-4 inline-block mr-1" />
                {m} min
              </>
            ) : (
              `${m} min`
            )}
          </button>
        ))}
      </div>

      {/* Controls */}
      <div className="flex gap-3">
        <button
          onClick={() => setIsRunning(!isRunning)}
          disabled={!isRunning && selectedPreset === null}
          className={`flex-1 py-4 rounded-2xl font-bold text-white flex items-center justify-center gap-2 shadow-xl transition-all active:scale-95
            ${
              isRunning
                ? "bg-orange-600 hover:bg-orange-700"
                : "bg-[#5D6939] hover:bg-[#4a552d]"
            }
            ${
              !isRunning && selectedPreset === null
                ? "opacity-50 cursor-not-allowed"
                : ""
            }`}
        >
          {isRunning ? (
            <Pause className="w-5 h-5" />
          ) : (
            <Play className="w-5 h-5" />
          )}
          <span>{isRunning ? "Pause" : "Start"}</span>
        </button>

        <button
          onClick={resetTimer}
          className="p-4 bg-[#DBDAAE]/50 rounded-2xl hover:bg-[#DBDAAE]/80 transition-all shadow-md active:scale-95"
        >
          <RotateCcw className="w-5 h-5 text-[#5D6939]" />
        </button>
      </div>

      {/* Victory text */}
      {remainingSeconds === 0 && !isRunning && !justFinished && (
        <p className="text-center mt-5 text-lg font-bold text-[#AAB97E] animate-pulse">
          Great session!
        </p>
      )}
    </div>
  );
}
