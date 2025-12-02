"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Loader2, Eye, EyeOff } from "lucide-react";

interface FormData {
  email: string;
  username: string;
  password: string;
}

interface PasswordChecks {
  length: boolean;
  uppercase: boolean;
  lowercase: boolean;
  number: boolean;
  special: boolean;
}

interface PasswordStrength {
  checks: PasswordChecks;
  passed: number;
  total: number;
}

interface SignInResult {
  error?: string;
  ok?: boolean;
}

interface RegisterResponse {
  error?: string;
}

export default function LoginPage() {
  const router = useRouter();
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [formData, setFormData] = useState<FormData>({
    email: "",
    username: "",
    password: "",
  });

  const passwordStrength = (): PasswordStrength | null => {
    if (isLogin || !formData.password) return null;

    const checks: PasswordChecks = {
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

  const handleSubmit = async (
    e: React.FormEvent<HTMLFormElement>
  ): Promise<void> => {
    e.preventDefault();
    setError("");

    if (!isLogin && (!strength || strength.passed < 5)) {
      setError("Password must meet all requirements below");
      return;
    }

    setLoading(true);

    try {
      if (isLogin) {
        const result = (await signIn("credentials", {
          email: formData.email,
          password: formData.password,
          redirect: false,
        })) as SignInResult | undefined;

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

        const data = (await response.json()) as RegisterResponse;

        if (!response.ok) {
          setError(data.error || "Failed to create account");
        } else {
          const result = (await signIn("credentials", {
            email: formData.email,
            password: formData.password,
            redirect: false,
          })) as SignInResult | undefined;

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
    <div className="min-h-screen bg-gradient-to-br from-[#FAF2E5] via-white to-[#FAF2E5] flex items-center justify-center p-3 sm:p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-6 sm:mb-8">
          <div className="flex justify-center mb-2 sm:mb-3">
            <Image
              src="/lireon-centered-logo.png"
              alt="Lireon – Track your reading journey"
              width={128}
              height={82}
              priority
              className="w-32 h-auto sm:w-48 drop-shadow-2xl"
            />
          </div>
          <p className="text-sm sm:text-lg font-medium text-[#5D6939]/80 px-4">
            Every Turning Page Counts.
          </p>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-2xl sm:rounded-3xl shadow-2xl p-5 sm:p-8 border-2 sm:border-4 border-[#DBDAAE]">
          {/* Toggle */}
          <div className="flex gap-1.5 sm:gap-2 mb-5 sm:mb-7 bg-[#FAF2E5] p-1.5 sm:p-2 rounded-xl sm:rounded-2xl">
            <button
              type="button"
              onClick={() => {
                setIsLogin(true);
                setError("");
              }}
              className={`flex-1 py-2.5 sm:py-3 px-4 sm:px-6 rounded-lg sm:rounded-xl font-bold text-sm sm:text-lg transition-all ${
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
              className={`flex-1 py-2.5 sm:py-3 px-4 sm:px-6 rounded-lg sm:rounded-xl font-bold text-sm sm:text-lg transition-all ${
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
            <div className="mb-4 sm:mb-5 p-3 sm:p-4 bg-red-50 border-2 border-red-200 rounded-xl text-red-600 font-medium text-center text-xs sm:text-sm">
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
            {!isLogin && (
              <div>
                <label className="block text-xs sm:text-sm font-bold text-[#5D6939] mb-1.5 sm:mb-2">
                  Username
                </label>
                <input
                  type="text"
                  required
                  value={formData.username}
                  onChange={(e) =>
                    setFormData({ ...formData, username: e.target.value })
                  }
                  className="w-full px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base border-2 border-[#DBDAAE] rounded-lg sm:rounded-xl focus:outline-none focus:border-[#5D6939] focus:ring-2 sm:focus:ring-4 focus:ring-[#AAB97E]/30 transition cursor-text"
                  placeholder="Choose a username"
                  disabled={loading}
                />
              </div>
            )}

            <div>
              <label className="block text-xs sm:text-sm font-bold text-[#5D6939] mb-1.5 sm:mb-2">
                Email
              </label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                className="w-full px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base border-2 border-[#DBDAAE] rounded-lg sm:rounded-xl focus:outline-none focus:border-[#5D6939] focus:ring-2 sm:focus:ring-4 focus:ring-[#AAB97E]/30 transition cursor-text"
                placeholder="your@email.com"
                disabled={loading}
              />
            </div>

            {/* Password Field with Eye Toggle */}
            <div>
              <label className="block text-xs sm:text-sm font-bold text-[#5D6939] mb-1.5 sm:mb-2">
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
                  className="w-full px-3 sm:px-4 py-2.5 sm:py-3 pr-11 sm:pr-12 text-sm sm:text-base border-2 border-[#DBDAAE] rounded-lg sm:rounded-xl focus:outline-none focus:border-[#5D6939] focus:ring-2 sm:focus:ring-4 focus:ring-[#AAB97E]/30 transition cursor-text"
                  placeholder="••••••••"
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2 sm:right-3 top-1/2 -translate-y-1/2 p-1.5 sm:p-2 text-[#5D6939]/70 hover:text-[#5D6939] hover:bg-[#FAF2E5]/50 rounded-lg transition-all cursor-pointer"
                  tabIndex={-1}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4 sm:w-5 sm:h-5" />
                  ) : (
                    <Eye className="w-4 h-4 sm:w-5 sm:h-5" />
                  )}
                </button>
              </div>

              {/* Password Strength (Sign Up only) */}
              {!isLogin && strength && (
                <div className="mt-2.5 sm:mt-3 space-y-1.5 sm:space-y-2 text-xs">
                  <p className="font-bold text-[#5D6939]/80">
                    Password must contain:
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                    <div
                      className={`flex items-center gap-1.5 ${
                        strength.checks.length
                          ? "text-green-600"
                          : "text-gray-500"
                      }`}
                    >
                      <span className="text-base">
                        {strength.checks.length ? "✓" : "○"}
                      </span>
                      8+ characters
                    </div>
                    <div
                      className={`flex items-center gap-1.5 ${
                        strength.checks.uppercase
                          ? "text-green-600"
                          : "text-gray-500"
                      }`}
                    >
                      <span className="text-base">
                        {strength.checks.uppercase ? "✓" : "○"}
                      </span>
                      Uppercase
                    </div>
                    <div
                      className={`flex items-center gap-1.5 ${
                        strength.checks.lowercase
                          ? "text-green-600"
                          : "text-gray-500"
                      }`}
                    >
                      <span className="text-base">
                        {strength.checks.lowercase ? "✓" : "○"}
                      </span>
                      Lowercase
                    </div>
                    <div
                      className={`flex items-center gap-1.5 ${
                        strength.checks.number
                          ? "text-green-600"
                          : "text-gray-500"
                      }`}
                    >
                      <span className="text-base">
                        {strength.checks.number ? "✓" : "○"}
                      </span>
                      Number
                    </div>
                    <div
                      className={`flex items-center gap-1.5 sm:col-span-2 ${
                        strength.checks.special
                          ? "text-green-600"
                          : "text-gray-500"
                      }`}
                    >
                      <span className="text-base">
                        {strength.checks.special ? "✓" : "○"}
                      </span>
                      Special char (!@#$ etc.)
                    </div>
                  </div>
                  <div className="mt-2 h-1.5 sm:h-2 bg-gray-200 rounded-full overflow-hidden">
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
              className="w-full bg-[#5D6939] text-white py-3 sm:py-4 rounded-lg sm:rounded-xl font-black text-sm sm:text-lg hover:bg-[#4a552d] active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 sm:gap-3 shadow-xl cursor-pointer"
            >
              {loading && (
                <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" />
              )}
              {loading
                ? "Please wait..."
                : isLogin
                ? "Login"
                : "Create Account"}
            </button>
          </form>

          {/* Switch Link */}
          <p className="text-center text-xs sm:text-sm text-[#AAB97E] mt-4 sm:mt-6">
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
