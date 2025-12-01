"use client";

import { useState } from "react";
import {
  X,
  ChevronRight,
  ChevronLeft,
  BookOpen,
  Timer,
  Target,
  TrendingUp,
} from "lucide-react";

interface TutorialModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const slides = [
  {
    icon: BookOpen,
    title: "Welcome to Lireon",
    description:
      "Your personal sanctuary for building deep, consistent reading habits.",
  },
  {
    icon: Timer,
    title: "Focus with the Timer",
    description:
      "Start reading — the timer runs gently in the background. Pause anytime.",
  },
  {
    icon: Target,
    title: "Track Your Journey",
    description:
      "Add books, log pages, and watch your progress grow — beautifully organized.",
  },
  {
    icon: TrendingUp,
    title: "Grow Your Streak",
    description:
      "Read daily to build momentum. Every page brings you closer to your best self.",
  },
];

export default function TutorialModal({
  open,
  onOpenChange,
}: TutorialModalProps) {
  const [currentSlide, setCurrentSlide] = useState(0);

  if (!open) return null;

  const isFirstSlide = currentSlide === 0;
  const isLastSlide = currentSlide === slides.length - 1;
  const slide = slides[currentSlide];
  const Icon = slide.icon;

  const handleNext = () => {
    if (isLastSlide) {
      onOpenChange(false);
      setCurrentSlide(0);
    } else {
      setCurrentSlide((prev) => prev + 1);
    }
  };

  const handlePrev = () => setCurrentSlide((prev) => Math.max(0, prev - 1));
  const handleSkip = () => {
    onOpenChange(false);
    setCurrentSlide(0);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-md">
      <div className="relative w-full max-w-md mx-4">
        {/* Card */}
        <div
          className="bg-[#FAF2E5] rounded-3xl shadow-2xl overflow-hidden border-4 border-[#DBDAAE] 
                        animate-in zoom-in-95 duration-500"
        >
          {/* Subtle Gradient Accent */}
          <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-[#5D6939]/10 to-transparent pointer-events-none" />

          {/* Close Button */}
          <button
            onClick={handleSkip}
            className="absolute top-5 right-5 z-10 p-3 rounded-full bg-white/80 backdrop-blur-sm shadow-md 
                       hover:bg-white hover:scale-110 transition-all duration-200"
          >
            <X className="w-5 h-5 text-[#5D6939]" />
          </button>

          <div className="pt-16 pb-10 px-10 text-center">
            {/* Icon */}
            <div
              className="w-24 h-24 mx-auto mb-8 rounded-3xl bg-gradient-to-br from-[#5D6939] to-[#AAB97E] 
                            shadow-xl flex items-center justify-center transform hover:rotate-6 hover:scale-110 
                            transition-all duration-500"
            >
              <Icon className="w-12 h-12 text-white" />
            </div>

            {/* Title */}
            <h2 className="text-3xl font-bold text-[#5D6939] mb-4 tracking-tight">
              {slide.title}
            </h2>

            {/* Description */}
            <p className="text-[#5D6939]/80 text-lg leading-relaxed max-w-xs mx-auto">
              {slide.description}
            </p>

            {/* Progress Dots */}
            <div className="flex justify-center gap-3 my-10">
              {slides.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentSlide(i)}
                  className={`transition-all duration-300 rounded-full ${
                    i === currentSlide
                      ? "w-12 h-3 bg-gradient-to-r from-[#5D6939] to-[#AAB97E]"
                      : "w-3 h-3 bg-[#DBDAAE] hover:bg-[#AAB97E]/60"
                  }`}
                />
              ))}
            </div>

            {/* Navigation */}
            <div className="flex gap-4">
              {!isFirstSlide && (
                <button
                  onClick={handlePrev}
                  className="flex-1 py-4 rounded-2xl bg-white border-2 border-[#DBDAAE] text-[#5D6939] 
                             font-bold hover:bg-[#DBDAAE]/30 transition-all duration-200 
                             flex items-center justify-center gap-2 shadow-md"
                >
                  <ChevronLeft className="w-5 h-5" />
                  Back
                </button>
              )}

              <button
                onClick={handleNext}
                className={`py-4 rounded-2xl font-bold text-white shadow-lg hover:shadow-xl 
                           transition-all duration-300 flex items-center justify-center gap-3
                           bg-gradient-to-r from-[#5D6939] to-[#AAB97E] 
                           hover:from-[#4a552d] hover:to-[#8B9A6B]
                           ${isFirstSlide ? "flex-1" : "flex-1"}`}
              >
                {isLastSlide ? (
                  <>Let's Begin</>
                ) : (
                  <>
                    Next <ChevronRight className="w-5 h-5" />
                  </>
                )}
              </button>
            </div>

            {/* Skip Text */}
            {!isLastSlide && (
              <button
                onClick={handleSkip}
                className="mt-6 text-sm text-[#5D6939]/70 hover:text-[#5D6939] transition-colors font-medium"
              >
                Skip tutorial
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
