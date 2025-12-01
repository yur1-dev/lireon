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

  const SidebarContent = ({ onLinkClick }: { onLinkClick: () => void }) => (
    <>
      {/* Centered Logo */}
      <div className="p-6 pt-16 lg:pt-8 border-b-2 border-[#DBDAAE] flex justify-center">
        <Link href="/dashboard" onClick={onLinkClick} className="block">
          <div className="relative w-48 sm:w-56 md:w-64 max-w-full px-4">
            <Image
              src="/lireon-logo.png"
              alt="Lireon"
              width={320}
              height={120}
              className="w-full h-auto object-contain drop-shadow-2xl"
              priority
            />
          </div>
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-6 space-y-3">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onLinkClick}
              className={`flex items-center gap-4 px-6 py-4 rounded-2xl font-medium transition-all ${
                active
                  ? "bg-[#5D6939] text-white shadow-lg"
                  : "text-[#5D6939] hover:bg-[#DBDAAE]/30"
              }`}
            >
              <Icon className="w-5 h-5" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Weekly Quest */}
      <div className="border-t-2 border-[#DBDAAE] p-6">
        <div className="bg-[#FAF2E5] rounded-3xl p-6 border-2 border-dashed border-[#AAB97E]">
          <p className="text-center font-bold text-[#5D6939] text-sm uppercase tracking-wider">
            Weekly Reading Quest
          </p>
          <p className="text-center text-xs text-[#5D6939]/70 mt-2 mb-5">
            Print it. Fill it. Become legendary.
          </p>
          <a
            href="https://github.com/kelvyndev/lireon-resources/raw/main/Lireon_Weekly_Reading_Quest.pdf"
            download
            target="_blank"
            rel="noopener noreferrer"
            className="w-full flex items-center justify-center gap-2 py-4 bg-[#5D6939] text-white rounded-2xl font-bold shadow-lg hover:bg-[#4a552d] transition"
          >
            <Download className="w-5 h-5" />
            Download PDF
          </a>
          <p className="text-center text-xs italic text-[#5D6939]/70 mt-3">
            Libre i-print kahit ilang beses!
          </p>
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

      {/* MOBILE: Tiny Cute Hamburger */}
      <motion.button
        onClick={() => setIsOpen(true)}
        className="fixed top-4 left-4 z-[100] flex h-10 w-10 items-center justify-center rounded-xl bg-white/95 shadow-lg border border-[#DBDAAE]/50 backdrop-blur-sm hover:shadow-xl lg:hidden"
        initial={false}
        animate={{ scale: isOpen ? 0 : 1, opacity: isOpen ? 0 : 1 }}
        transition={{ type: "spring", stiffness: 500, damping: 30 }}
        style={{ pointerEvents: isOpen ? "none" : "auto" }}
      >
        <Menu className="w-5 h-5 text-[#5D6939]" />
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
              initial={{ x: -288 }}
              animate={{ x: 0 }}
              exit={{ x: -288 }}
              transition={{ type: "spring", stiffness: 400, damping: 35 }}
              className="fixed inset-y-0 left-0 z-50 w-72 bg-white border-r-2 border-[#DBDAAE] shadow-2xl lg:hidden"
            >
              {/* Tiny Close Button */}
              <motion.button
                onClick={() => setIsOpen(false)}
                className="absolute top-4 right-4 z-10 flex h-9 w-9 items-center justify-center rounded-lg bg-white/90 shadow-md border border-[#DBDAAE]/40 hover:bg-white/100 transition-all"
                initial={{ opacity: 0, rotate: -90 }}
                animate={{ opacity: 1, rotate: 0 }}
                transition={{ delay: 0.1 }}
              >
                <X className="w-4.5 h-4.5 text-[#5D6939]" />
              </motion.button>

              <SidebarContent onLinkClick={() => setIsOpen(false)} />
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
