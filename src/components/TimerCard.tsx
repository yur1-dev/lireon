// components/TimerCard.tsx
"use client";

import React, { useState, useEffect } from "react";
import { Play, Pause, RotateCcw, Check } from "lucide-react";

export default function TimerCard() {
  const [minutes, setMinutes] = useState(25);
  const [seconds, setSeconds] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [selectedPreset, setSelectedPreset] = useState<number | null>(null);
  const [totalInitialSeconds, setTotalInitialSeconds] = useState<number>(
    25 * 60
  );

  // This makes the circle update every second with smooth animation
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (isRunning) {
      interval = setInterval(() => {
        setElapsedSeconds((prev) => prev + 1);

        if (seconds === 0 && minutes === 0) {
          setIsRunning(false);
          setSelectedPreset(null);
          setElapsedSeconds(0);
        } else if (seconds === 0) {
          setMinutes((m) => m - 1);
          setSeconds(59);
        } else {
          setSeconds((s) => s - 1);
        }
      }, 1000);
    } else {
      setElapsedSeconds(0);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRunning, minutes, seconds]);

  const startTimer = (mins: number) => {
    const total = mins * 60;
    setTotalInitialSeconds(total);
    setMinutes(mins);
    setSeconds(0);
    setElapsedSeconds(0);
    setIsRunning(true);
    setSelectedPreset(mins);
  };

  const resetTimer = () => {
    setIsRunning(false);
    setMinutes(25);
    setSeconds(0);
    setElapsedSeconds(0);
    setSelectedPreset(null);
    setTotalInitialSeconds(25 * 60);
  };

  const currentTotalSeconds = minutes * 60 + seconds;
  const remainingSeconds = totalInitialSeconds - elapsedSeconds;
  const progress =
    totalInitialSeconds > 0
      ? Math.max(0, (remainingSeconds / totalInitialSeconds) * 100)
      : 0;

  const presets = [10, 25, 45];

  return (
    <div className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl p-5 sm:p-6 border-2 border-[#DBDAAE] hover:shadow-3xl transition-all h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center gap-3 mb-5">
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

      {/* ULTRA SMOOTH Circle */}
      <div className="flex-1 flex items-center justify-center my-4">
        <div className="relative w-44 h-44 sm:w-48 sm:h-48">
          <svg className="w-full h-full -rotate-90">
            {/* Background ring */}
            <circle
              cx="50%"
              cy="50%"
              r="42%"
              stroke="#DBDAAE"
              strokeWidth="10"
              fill="none"
              opacity="0.25"
            />

            {/* Progress ring — now silky smooth every second */}
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
              className="transition-all duration-950 ease-linear" // ← this makes it buttery
            />

            <defs>
              <linearGradient id="grad">
                <stop offset="0%" stopColor="#AAB97E" />
                <stop offset="100%" stopColor="#5D6939" />
              </linearGradient>
            </defs>
          </svg>

          {/* Time display */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-5xl font-black text-[#5D6939] tracking-wider drop-shadow-md">
              {String(minutes).padStart(2, "0")}:
              {String(seconds).padStart(2, "0")}
            </div>
          </div>
        </div>
      </div>

      {/* Presets */}
      <div className="grid grid-cols-3 gap-3 mb-5">
        {presets.map((m) => (
          <button
            key={m}
            onClick={() => startTimer(m)}
            disabled={isRunning}
            className={`relative py-3 text-base font-bold rounded-xl transition-all duration-300 shadow-sm overflow-hidden
              ${
                isRunning
                  ? "opacity-50 cursor-not-allowed"
                  : "cursor-pointer hover:scale-105 active:scale-95 hover:bg-[#DBDAAE]/40"
              }
              ${
                selectedPreset === m && isRunning
                  ? "bg-[#5D6939] text-white ring-4 ring-[#5D6939]/30"
                  : "bg-[#FAF2E5] text-[#5D6939] border border-[#DBDAAE]"
              }
            `}
          >
            {selectedPreset === m && isRunning ? (
              <>
                <Check className="w-5 h-5 inline-block mr-1 -ml-1" />
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
          className={`flex-1 py-4 rounded-2xl font-bold text-white flex items-center justify-center gap-2 shadow-xl transition-all active:scale-95 cursor-pointer
            ${
              isRunning
                ? "bg-orange-600 hover:bg-orange-700"
                : "bg-[#5D6939] hover:bg-[#4a552d]"
            }
            ${
              !isRunning && selectedPreset === null
                ? "opacity-50 cursor-not-allowed"
                : ""
            }
          `}
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
          className="p-4 bg-[#DBDAAE]/50 rounded-2xl hover:bg-[#DBDAAE]/80 transition-all shadow-md cursor-pointer active:scale-95"
        >
          <RotateCcw className="w-5 h-5 text-[#5D6939]" />
        </button>
      </div>

      {/* Victory */}
      {currentTotalSeconds === 0 && !isRunning && (
        <p className="text-center mt-6 text-lg font-bold text-[#AAB97E] animate-pulse">
          Great session!
        </p>
      )}
    </div>
  );
}
