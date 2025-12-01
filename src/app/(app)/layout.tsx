// app/(app)/layout.tsx
"use client";

import { useEffect, useState } from "react";
import { signOut } from "next-auth/react";
import { LogOut } from "lucide-react";
import Sidebar from "@/components/ui/Sidebar";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const [userName, setUserName] = useState<string | null>(null); // null = still loading

  useEffect(() => {
    async function loadUser() {
      try {
        const res = await fetch("/api/auth/me", { credentials: "include" });
        if (!res.ok) return;

        const data = await res.json();

        const name =
          data.user?.username ||
          data.user?.name ||
          data.username ||
          data.name ||
          data.user?.profile?.username ||
          null;

        setUserName(name);
      } catch (err) {
        console.error("Failed to load user:", err);
      }
    }
    loadUser();
  }, []);

  const handleLogout = async () => {
    localStorage.clear();
    await signOut({ redirect: false });
    window.location.href = "/";
  };

  // Capitalize first letter, keep the rest as-is (or lowercase if you prefer)
  const formatDisplayName = (name: string | null) => {
    if (!name) return "Reader";
    return name.charAt(0).toUpperCase() + name.slice(1).toLowerCase();
  };

  const displayName = formatDisplayName(userName);
  const avatarUrl = `https://api.dicebear.com/9.x/lorelei/svg?seed=${encodeURIComponent(
    displayName
  )}&backgroundColor=FAF2E5&clothingColor=5D6939,AAB97E,DBDAAE`;

  return (
    <div className="flex min-h-screen bg-[#FAF2E5]">
      <Sidebar />

      <div className="flex-1 lg:ml-72">
        {/* Header */}
        <header className="fixed top-0 right-0 left-0 lg:left-72 z-40 h-20 bg-white/95 backdrop-blur-md border-b-2 border-[#DBDAAE] shadow-lg">
          <div className="flex items-center justify-end h-full px-6">
            <div className="flex items-center gap-4">
              {/* Avatar */}
              <div className="w-14 h-14 rounded-2xl overflow-hidden shadow-xl ring-4 ring-white/80 hover:scale-110 hover:rotate-3 transition-all duration-500">
                <img
                  src={avatarUrl}
                  alt="Your avatar"
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Name - Only show when loaded */}
              <span className="font-semibold text-[#5D6939] hidden sm:block">
                Hi, {displayName}
              </span>
            </div>

            {/* Logout Button */}
            <button
              onClick={handleLogout}
              className="cursor-pointer ml-6 flex items-center gap-3 px-6 py-3 rounded-2xl bg-[#5D6939]/10 hover:bg-red-50 border-2 border-transparent hover:border-red-200 transition"
            >
              <LogOut className="w-5 h-5 text-[#5D6939] group-hover:text-red-600" />
              <span className="font-medium text-[#5D6939] group-hover:text-red-600 hidden sm:inline">
                Logout
              </span>
            </button>
          </div>
        </header>

        {/* Main Content */}
        <main className="pt-24 lg:pt-24 px-2 lg:px-8 pb-12">{children}</main>
      </div>
    </div>
  );
}
