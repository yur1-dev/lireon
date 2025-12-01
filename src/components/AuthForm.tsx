// src/components/AuthForm.tsx
"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { BookOpen, Loader2, CheckCircle2 } from "lucide-react";
import type { AppData } from "@/types";

interface AuthFormProps {
  onLogin: (data: AppData) => void;
}

export default function AuthForm({ onLogin }: AuthFormProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setSuccess(false);
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const email = (formData.get("email") as string)?.trim().toLowerCase();
    const password = formData.get("password") as string;
    const username = (formData.get("username") as string)?.trim();

    // Validation
    if (!email || !password) {
      setError("Email and password are required");
      setLoading(false);
      return;
    }

    if (!isLogin) {
      if (!username || username.length < 3) {
        setError("Username must be at least 3 characters");
        setLoading(false);
        return;
      }
      if (password.length < 6) {
        setError("Password must be at least 6 characters");
        setLoading(false);
        return;
      }
    }

    try {
      if (isLogin) {
        // === LOGIN ===
        const res = await signIn("credentials", {
          email,
          password,
          redirect: false,
        });

        if (res?.error) {
          setError("Invalid email or password");
          setLoading(false);
          return;
        }

        // Fetch user data
        const meRes = await fetch("/api/auth/me");
        if (!meRes.ok) throw new Error("Failed to load your data");

        const { user } = await meRes.json();

        onLogin({
          user: {
            id: user.id,
            username: user.username,
            email: user.email,
            dailyGoal: user.dailyGoal || 30,
            weeklyGoal: user.weeklyGoal || 200,
            monthlyGoal: user.monthlyGoal || 1000,
            streak: user.streak || 0,
            totalPagesRead: user.totalPagesRead || 0,
          },
          books: user.books || [],
          sessions: user.sessions || [],
          hasSeenTutorial: user.hasSeenTutorial ?? false,
        });
      } else {
        // === REGISTER ===
        const res = await fetch("/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username, email, password }),
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Registration failed");

        setSuccess(true);
        setTimeout(() => setIsLogin(true), 1800); // Auto switch to login after success
      }
    } catch (err: any) {
      setError(err.message || "Something went wrong. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#FAF2E5] via-[#FAF2E5] to-[#E8E2D3] p-4">
      <div className="w-full max-w-md">
        {/* Main Card */}
        <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl p-8 border-2 border-[#DBDAAE] relative overflow-hidden">
          {/* Subtle Pattern Background */}
          <div className="absolute inset-0 opacity-5">
            <div className="absolute inset-0 bg-gradient-to-br from-[#5D6939] to-[#AAB97E]" />
          </div>

          {/* Logo */}
          <div className="flex justify-center mb-8 relative z-10">
            <div className="relative">
              <div className="absolute inset-0 bg-[#5D6939]/20 blur-2xl rounded-full w-24 h-24 -z-10" />
              <div className="bg-gradient-to-br from-[#5D6939] to-[#AAB97E] p-5 rounded-3xl shadow-2xl ring-4 ring-white/50">
                <BookOpen className="w-12 h-12 text-white" />
              </div>
            </div>
          </div>

          {/* Title */}
          <h1 className="text-4xl font-black text-center text-[#2D3319] mb-3">
            {isLogin ? "Welcome Back" : "Join Lireon"}
          </h1>
          <p className="text-center text-[#5D6939]/80 font-medium mb-8">
            {isLogin
              ? "Continue your reading journey"
              : "Start reading with intention"}
          </p>

          {/* Success Message */}
          {success && (
            <div className="mb-6 p-4 bg-green-50 border-2 border-green-200 rounded-2xl flex items-center gap-3 text-green-700 animate-pulse">
              <CheckCircle2 className="w-6 h-6" />
              <span className="font-semibold">
                Account created! Signing you in...
              </span>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border-2 border-red-200 rounded-2xl text-red-700 font-medium text-sm animate-in slide-in-from-top">
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5 relative z-10">
            {!isLogin && (
              <div className="relative">
                <input
                  name="username"
                  type="text"
                  required
                  placeholder="Choose a username"
                  className="w-full px-5 py-4 bg-[#FAF2E5]/70 border-2 border-[#DBDAAE] rounded-2xl focus:outline-none focus:border-[#AAB97E] focus:bg-white transition-all duration-300 placeholder-[#5D6939]/60 font-medium"
                />
              </div>
            )}

            <div className="relative">
              <input
                name="email"
                type="email"
                required
                placeholder="your@email.com"
                className="w-full px-5 py-4 bg-[#FAF2E5]/70 border-2 border-[#DBDAAE] rounded-2xl focus:outline-none focus:border-[#AAB97E] focus:bg-white transition-all duration-300 placeholder-[#5D6939]/60 font-medium"
              />
            </div>

            <div className="relative">
              <input
                name="password"
                type="password"
                required
                placeholder={
                  isLogin ? "Your password" : "Create a strong password"
                }
                className="w-full px-5 py-4 bg-[#FAF2E5]/70 border-2 border-[#DBDAAE] rounded-2xl focus:outline-none focus:border-[#AAB97E] focus:bg-white transition-all duration-300 placeholder-[#5D6939]/60 font-medium"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-[#5D6939] to-[#AAB97E] text-white py-5 rounded-2xl font-bold text-lg shadow-xl hover:shadow-2xl hover:scale-[1.02] disabled:opacity-70 disabled:scale-100 transition-all duration-300 flex items-center justify-center gap-3"
            >
              {loading ? (
                <>
                  <Loader2 className="w-6 h-6 animate-spin" />
                  <span>Processing...</span>
                </>
              ) : (
                <span>{isLogin ? "Sign In" : "Create Account"}</span>
              )}
            </button>
          </form>

          {/* Toggle */}
          <div className="mt-8 text-center">
            <button
              type="button"
              onClick={() => {
                setIsLogin(!isLogin);
                setError("");
                setSuccess(false);
              }}
              className="text-[#5D6939] hover:text-[#3d4a2a] font-semibold transition-colors"
            >
              {isLogin
                ? "New here? Create an account"
                : "Already have an account? Sign in"}
            </button>
          </div>

          {/* Footer */}
          <p className="text-center text-[#5D6939]/60 text-xs mt-10 font-medium">
            By continuing, you agree to our Terms & Privacy Policy
          </p>
        </div>
      </div>
    </div>
  );
}
