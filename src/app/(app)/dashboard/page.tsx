// app/dashboard/page.tsx
"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useSession, signOut } from "next-auth/react";
import Dashboard from "@/components/Dashboard";
import Sidebar from "@/components/ui/Sidebar";

export default function DashboardPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [appData, setAppData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadUserData() {
      // Wait for session to load
      if (status === "loading") return;

      if (status === "unauthenticated" || !session?.user?.id) {
        console.log("❌ No session, redirecting to login");
        router.push("/");
        return;
      }

      try {
        console.log("📥 Fetching user data for:", session.user.id);

        // Fetch user info
        const userRes = await fetch("/api/auth/me", {
          credentials: "include",
        });

        if (!userRes.ok) {
          throw new Error("Failed to fetch user");
        }

        const userData = await userRes.json();
        console.log("👤 User data:", userData);

        // Fetch books separately
        const booksRes = await fetch("/api/books", {
          credentials: "include",
        });

        const books = booksRes.ok ? await booksRes.json() : [];
        console.log("📚 Books loaded:", books.length);

        // Fetch reading sessions
        const sessionsRes = await fetch("/api/reading-sessions", {
          credentials: "include",
        });

        const sessions = sessionsRes.ok ? await sessionsRes.json() : [];
        console.log("📖 Sessions loaded:", sessions.length);

        // Fetch tutorial status
        let hasSeenTutorial = false;
        try {
          const tutorialRes = await fetch("/api/user/tutorial-status");
          if (tutorialRes.ok) {
            const tutorialData = await tutorialRes.json();
            hasSeenTutorial = tutorialData.hasSeenTutorial || false;
          }
        } catch (e) {
          console.log("Could not fetch tutorial status, using default");
        }

        // Structure the data properly
        const fullData = {
          user: {
            id: session.user.id,
            username: userData.username || "Reader",
            email: session.user.email,
            streak: userData.streak || 0,
            totalPagesRead: userData.totalPagesRead || 0,
            dailyGoal: userData.dailyGoal || 30,
            weeklyGoal: userData.weeklyGoal || 200,
            monthlyGoal: userData.monthlyGoal || 1000,
          },
          books: books,
          sessions: sessions,
          hasSeenTutorial: hasSeenTutorial,
        };

        console.log("✅ Full app data loaded:", {
          books: fullData.books.length,
          sessions: fullData.sessions.length,
          user: fullData.user.username,
        });

        setAppData(fullData);
      } catch (err) {
        console.error("❌ Load user data error:", err);
        router.push("/");
      } finally {
        setLoading(false);
      }
    }

    loadUserData();
  }, [router, session, status]);

  const handleLogout = async () => {
    try {
      // Clear localStorage first
      localStorage.clear();

      // Use NextAuth's signOut function
      await signOut({
        redirect: false,
        callbackUrl: "/",
      });

      // Force full page reload to root
      window.location.href = "/";
    } catch (error) {
      console.error("Logout error:", error);
      // Force redirect even on error
      window.location.href = "/";
    }
  };

  if (loading || status === "loading") {
    return (
      <>
        <Sidebar />
        <div className="min-h-screen flex items-center justify-center bg-gray-50 lg:ml-64">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-gray-600">Loading your dashboard...</p>
          </div>
        </div>
      </>
    );
  }

  if (!appData) {
    return (
      <>
        <Sidebar />
        <div className="min-h-screen flex items-center justify-center bg-gray-50 lg:ml-64">
          <div className="text-center">
            <p className="text-gray-600">
              Failed to load dashboard. Please try logging in again.
            </p>
            <button
              onClick={() => router.push("/")}
              className="mt-4 px-6 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"
            >
              Go to Login
            </button>
          </div>
        </div>
      </>
    );
  }

  return (
    <Dashboard
      appData={appData}
      setAppData={setAppData}
      onLogout={handleLogout}
    />
  );
}
