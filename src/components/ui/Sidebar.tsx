// components/ui/Sidebar.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Download,
  Home,
  BookOpen,
  Target,
  BarChart3,
  X,
  Menu,
} from "lucide-react";
import Image from "next/image";

export default function Sidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  const navItems = [
    { href: "/dashboard", label: "Dashboard", icon: Home },
    { href: "/about", label: "About Us", icon: BookOpen },
    { href: "/faq", label: "FAQs", icon: Target },
    { href: "/objectives", label: "Objectives", icon: BarChart3 },
  ];

  // NEW: Direct download of static PDF from /public
  const downloadTrackerPDF = () => {
    // This works because file is in /public/lireon-daily-tracker.pdf
    const link = document.createElement("a");
    link.href = "/lireon-daily-tracker.pdf";
    link.download = "Lireon_Daily_Habit_Tracker.pdf";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const SidebarContent = ({ onLinkClick }: { onLinkClick: () => void }) => (
    <>
      {/* Compact Logo */}
      <div className="p-3 sm:p-4 lg:p-6 pt-14 sm:pt-12 lg:pt-8 border-b border-[#DBDAAE] flex justify-center">
        <Link href="/dashboard" onClick={onLinkClick} className="block">
          <div className="relative w-32 sm:w-40 lg:w-56 max-w-full">
            <Image
              src="/lireon-logo.png"
              alt="Lireon"
              width={320}
              height={120}
              className="w-full h-auto object-contain drop-shadow-lg"
              priority
            />
          </div>
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-3 sm:p-4 lg:p-6 space-y-1.5 sm:space-y-2 lg:space-y-3">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onLinkClick}
              className={`flex items-center gap-2.5 sm:gap-3 lg:gap-4 px-3 sm:px-4 lg:px-6 py-2.5 sm:py-3 lg:py-4 rounded-xl lg:rounded-2xl font-medium text-sm sm:text-base transition-all ${
                active
                  ? "bg-[#5D6939] text-white shadow-md lg:shadow-lg"
                  : "text-[#5D6939] hover:bg-[#DBDAAE]/30"
              }`}
            >
              <Icon className="w-4 h-4 sm:w-4.5 h-4.5 lg:w-5 lg:h-5 shrink-0" />
              <span className="text-sm sm:text-base">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Daily Habit Tracker - NOW DIRECT DOWNLOAD */}
      <div className="border-t border-[#DBDAAE] p-3 sm:p-4 lg:p-6">
        <div className="bg-[#FAF2E5] rounded-2xl lg:rounded-3xl p-3 sm:p-4 lg:p-6 border border-dashed border-[#AAB97E]">
          <p className="text-center font-bold text-[#5D6939] text-xs sm:text-sm uppercase tracking-wide">
            Daily Reading Quest
          </p>
          <p className="text-center text-[10px] sm:text-xs text-[#5D6939]/70 mt-1.5 sm:mt-2 mb-3 sm:mb-4 lg:mb-5 leading-snug">
            Monday to Sunday tracking made easy!
          </p>

          <button
            onClick={downloadTrackerPDF}
            className="w-full flex items-center justify-center gap-2 py-2.5 sm:py-3 lg:py-4 bg-[#5D6939] text-white rounded-xl lg:rounded-2xl text-sm font-bold shadow-md lg:shadow-lg hover:bg-[#4a552d] transition active:scale-95"
          >
            <Download className="w-4 h-4 sm:w-4.5 h-4.5 lg:w-5 lg:h-5" />
            <span className="text-xs sm:text-sm lg:text-base">
              Download PDF
            </span>
          </button>
          {/* 
          <p className="text-center text-[10px] sm:text-xs italic text-[#5D6939]/70 mt-2 sm:mt-2.5 lg:mt-3">
            Libre i-print kahit ilang beses!
          </p> */}
        </div>
      </div>
    </>
  );

  return (
    <>
      {/* DESKTOP SIDEBAR */}
      <aside className="hidden lg:block fixed inset-y-0 left-0 z-50 w-72 bg-white border-r-2 border-[#DBDAAE] shadow-2xl">
        <SidebarContent onLinkClick={() => {}} />
      </aside>

      {/* MOBILE: Hamburger */}
      <motion.button
        onClick={() => setIsOpen(true)}
        className="fixed top-3 left-3 z-[100] flex h-9 w-9 items-center justify-center rounded-lg bg-white/95 shadow-md border border-[#DBDAAE]/50 backdrop-blur-sm hover:shadow-lg lg:hidden"
        initial={false}
        animate={{ scale: isOpen ? 0 : 1, opacity: isOpen ? 0 : 1 }}
        transition={{ type: "spring", stiffness: 500, damping: 30 }}
        style={{ pointerEvents: isOpen ? "none" : "auto" }}
      >
        <Menu className="w-4.5 h-4.5 text-[#5D6939]" />
      </motion.button>

      {/* MOBILE SIDEBAR */}
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 z-40 bg-black/40 lg:hidden"
            />

            <motion.div
              initial={{ x: -240 }}
              animate={{ x: 0 }}
              exit={{ x: -240 }}
              transition={{ type: "spring", stiffness: 400, damping: 35 }}
              className="fixed inset-y-0 left-0 z-50 w-60 sm:w-64 bg-white border-r border-[#DBDAAE] shadow-xl lg:hidden overflow-y-auto"
            >
              <motion.button
                onClick={() => setIsOpen(false)}
                className="absolute top-3 right-3 z-10 flex h-8 w-8 items-center justify-center rounded-lg bg-white/90 shadow-sm border border-[#DBDAAE]/40 hover:bg-white/100"
              >
                <X className="w-4 h-4 text-[#5D6939]" />
              </motion.button>

              <SidebarContent onLinkClick={() => setIsOpen(false)} />
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
