"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Loader2, Eye, EyeOff } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [formData, setFormData] = useState({
    email: "",
    username: "",
    password: "",
  });

  const passwordStrength = () => {
    if (isLogin || !formData.password) return null;

    const checks = {
      length: formData.password.length >= 8,
      uppercase: /[A-Z]/.test(formData.password),
      lowercase: /[a-z]/.test(formData.password),
      number: /\d/.test(formData.password),
      special: /[!@#$%^&*(),.?":{}|<>]/.test(formData.password),
    };

    const passed = Object.values(checks).filter(Boolean).length;
    return { checks, passed, total: 5 };
  };

  const strength = passwordStrength();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!isLogin && (!strength || strength.passed < 5)) {
      setError("Password must meet all requirements below");
      return;
    }

    setLoading(true);

    try {
      if (isLogin) {
        const result = await signIn("credentials", {
          email: formData.email,
          password: formData.password,
          redirect: false,
        });

        if (result?.error) {
          setError("Invalid email or password");
        } else if (result?.ok) {
          router.push("/dashboard");
        }
      } else {
        const response = await fetch("/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });

        const data = await response.json();

        if (!response.ok) {
          setError(data.error || "Failed to create account");
        } else {
          const result = await signIn("credentials", {
            email: formData.email,
            password: formData.password,
            redirect: false,
          });

          if (result?.ok) {
            router.push("/dashboard");
          }
        }
      }
    } catch (err) {
      setError("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FAF2E5] via-white to-[#FAF2E5] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-10">
          <div className="flex justify-center">
            <Image
              src="/lireon-centered-logo.png"
              alt="Lireon – Track your reading journey"
              width={280}
              height={180}
              priority
              className="drop-shadow-2xl"
            />
          </div>
          <p className="mt-4 text-xl font-medium text-[#5D6939]/80">
            Every Turning Page Counts.
          </p>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-3xl shadow-2xl p-8 border-4 border-[#DBDAAE]">
          {/* Toggle */}
          <div className="flex gap-2 mb-8 bg-[#FAF2E5] p-2 rounded-2xl cursor-pointer">
            <button
              type="button"
              onClick={() => {
                setIsLogin(true);
                setError("");
              }}
              className={`flex-1 py-3 px-6 rounded-xl font-bold text-lg transition-all cursor-pointer ${
                isLogin
                  ? "bg-[#5D6939] text-white shadow-lg"
                  : "text-[#5D6939] hover:bg-white"
              }`}
            >
              Login
            </button>
            <button
              type="button"
              onClick={() => {
                setIsLogin(false);
                setError("");
              }}
              className={`flex-1 py-3 px-6 rounded-xl font-bold text-lg transition-all cursor-pointer ${
                !isLogin
                  ? "bg-[#5D6939] text-white shadow-lg"
                  : "text-[#5D6939] hover:bg-white"
              }`}
            >
              Sign Up
            </button>
          </div>

          {/* Error */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border-2 border-red-200 rounded-xl text-red-600 font-medium text-center">
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {!isLogin && (
              <div>
                <label className="block text-sm font-bold text-[#5D6939] mb-2">
                  Username
                </label>
                <input
                  type="text"
                  required
                  value={formData.username}
                  onChange={(e) =>
                    setFormData({ ...formData, username: e.target.value })
                  }
                  className="w-full px-4 py-3 border-2 border-[#DBDAAE] rounded-xl focus:outline-none focus:border-[#5D6939] focus:ring-4 focus:ring-[#AAB97E]/30 transition cursor-text"
                  placeholder="Choose a username"
                  disabled={loading}
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-bold text-[#5D6939] mb-2">
                Email
              </label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                className="w-full px-4 py-3 border-2 border-[#DBDAAE] rounded-xl focus:outline-none focus:border-[#5D6939] focus:ring-4 focus:ring-[#AAB97E]/30 transition cursor-text"
                placeholder="your@email.com"
                disabled={loading}
              />
            </div>

            {/* Password Field with Eye Toggle */}
            <div>
              <label className="block text-sm font-bold text-[#5D6939] mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                  className="w-full px-4 py-3 pr-12 border-2 border-[#DBDAAE] rounded-xl focus:outline-none focus:border-[#5D6939] focus:ring-4 focus:ring-[#AAB97E]/30 transition cursor-text"
                  placeholder="••••••••"
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-[#5D6939]/70 hover:text-[#5D6939] hover:bg-[#FAF2E5]/50 rounded-lg transition-all cursor-pointer"
                  tabIndex={-1}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>

              {/* Password Strength (Sign Up only) */}
              {!isLogin && strength && (
                <div className="mt-3 space-y-2 text-xs">
                  <p className="font-bold text-[#5D6939]/80">
                    Password must contain:
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    <div
                      className={`flex items-center gap-2 ${
                        strength.checks.length
                          ? "text-green-600"
                          : "text-gray-500"
                      }`}
                    >
                      {strength.checks.length ? "Check" : "Circle"} 8+
                      characters
                    </div>
                    <div
                      className={`flex items-center gap-2 ${
                        strength.checks.uppercase
                          ? "text-green-600"
                          : "text-gray-500"
                      }`}
                    >
                      {strength.checks.uppercase ? "Check" : "Circle"} Uppercase
                    </div>
                    <div
                      className={`flex items-center gap-2 ${
                        strength.checks.lowercase
                          ? "text-green-600"
                          : "text-gray-500"
                      }`}
                    >
                      {strength.checks.lowercase ? "Check" : "Circle"} Lowercase
                    </div>
                    <div
                      className={`flex items-center gap-2 ${
                        strength.checks.number
                          ? "text-green-600"
                          : "text-gray-500"
                      }`}
                    >
                      {strength.checks.number ? "Check" : "Circle"} Number
                    </div>
                    <div
                      className={`flex items-center gap-2 col-span-2 ${
                        strength.checks.special
                          ? "text-green-600"
                          : "text-gray-500"
                      }`}
                    >
                      {strength.checks.special ? "Check" : "Circle"} Special
                      char (!@#$ etc.)
                    </div>
                  </div>
                  <div className="mt-2 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all duration-300 ${
                        strength.passed === 5
                          ? "bg-green-500"
                          : strength.passed >= 3
                          ? "bg-yellow-500"
                          : "bg-red-500"
                      }`}
                      style={{
                        width: `${(strength.passed / strength.total) * 100}%`,
                      }}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#5D6939] text-white py-4 rounded-xl font-black text-lg hover:bg-[#4a552d] active:scale-98 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 shadow-xl cursor-pointer"
            >
              {loading && <Loader2 className="w-5 h-5 animate-spin" />}
              {loading
                ? "Please wait..."
                : isLogin
                ? "Login"
                : "Create Account"}
            </button>
          </form>

          {/* Switch Link */}
          <p className="text-center text-sm text-[#AAB97E] mt-6">
            {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
            <button
              type="button"
              onClick={() => {
                setIsLogin(!isLogin);
                setError("");
              }}
              className="text-[#5D6939] font-bold hover:underline cursor-pointer transition-all"
            >
              {isLogin ? "Sign up" : "Login"}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
