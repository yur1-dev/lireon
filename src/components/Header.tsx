"use client";

import { LogOut } from "lucide-react";

export default function Header({ userName }: { userName: string }) {
  const handleLogout = () => {
    if (confirm("Log out of Lireon?")) {
      // Change this to your real logout route later
      window.location.href = "/login";
    }
  };

  return (
    <header className="bg-white border-b border-gray-200 px-8 py-5">
      <div className="flex items-center justify-between max-w-7xl mx-auto">
        <div />
        <div className="flex items-center gap-6">
          <span className="text-sm font-medium text-gray-700">
            Hi, {userName}
          </span>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition"
          >
            <LogOut size={16} />
            Logout
          </button>
        </div>
      </div>
    </header>
  );
}
