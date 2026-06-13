"use client";

import React, { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Sparkles, Key, Mail, Lock, ShieldAlert, ArrowLeft, Loader2, User, UserPlus } from "lucide-react";

export default function SignInPage() {
  const router = useRouter();
  const [isSignUp, setIsSignUp] = useState(false); // Mode toggle state
  
  // Form States
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"ADMIN" | "MARKETER">("MARKETER");
  
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (isSignUp) {
        // Mode: Register/Sign Up
        const registerRes = await fetch("/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password, name, role }),
        });
        const registerData = await registerRes.json();

        if (!registerRes.ok) {
          throw new Error(registerData.error || "Failed to create account");
        }
      }

      // Automatically sign in after signup, or standard sign in
      const res = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (res?.error) {
        setError(res.error);
        setLoading(false);
      } else {
        router.push("/dashboard");
        router.refresh();
      }
    } catch (err: any) {
      setError(err?.message || "An unexpected error occurred");
      setLoading(false);
    }
  };

  const autofillCredentials = (selectedRole: "admin" | "marketer") => {
    setIsSignUp(false); // Force Sign In mode
    if (selectedRole === "admin") {
      setEmail("admin@xeno.ai");
      setPassword("xeno123");
    } else {
      setEmail("marketer@xeno.ai");
      setPassword("xeno123");
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-slate-50 dark:bg-[#030712] p-6 transition-colors duration-300">
      {/* Background Glows */}
      <div className="absolute top-1/4 left-1/4 w-[400px] h-[400px] bg-purple-500/10 dark:bg-purple-900/10 rounded-full filter blur-[100px] pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-blue-500/10 dark:bg-blue-950/10 rounded-full filter blur-[100px] pointer-events-none"></div>

      <div className="w-full max-w-md space-y-6">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to home
        </Link>

        {/* Card Panel */}
        <div className="glass-panel p-8 rounded-3xl border border-slate-200 dark:border-slate-800/80 shadow-2xl relative">
          <div className="flex flex-col items-center mb-6">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-tr from-purple-600 to-blue-500 shadow-md mb-4">
              <Sparkles className="text-white h-5 w-5" />
            </div>
            <h1 className="font-display font-bold text-2xl text-slate-900 dark:text-white">
              {isSignUp ? "Create CRM Account" : "Sign in to Xeno CRM"}
            </h1>
            <p className="text-xs text-slate-550 dark:text-slate-400 mt-1 text-center">
              {isSignUp ? "Register as an Admin or Marketer User" : "Enter your credentials to access the platform"}
            </p>
          </div>

          {/* Mode Switch Tabs */}
          <div className="flex p-1.5 bg-slate-200/50 dark:bg-slate-900 rounded-xl mb-6">
            <button
              onClick={() => {
                setIsSignUp(false);
                setError(null);
              }}
              className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-colors ${
                !isSignUp
                  ? "bg-white dark:bg-slate-800 text-purple-650 dark:text-purple-400 shadow-sm"
                  : "text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-350"
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => {
                setIsSignUp(true);
                setError(null);
              }}
              className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-colors ${
                isSignUp
                  ? "bg-white dark:bg-slate-800 text-purple-650 dark:text-purple-400 shadow-sm"
                  : "text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-350"
              }`}
            >
              Register / Sign Up
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="flex items-start gap-2.5 p-3.5 rounded-xl bg-red-50 dark:bg-red-950/20 border border-red-200/50 dark:border-red-900/35 text-red-700 dark:text-red-400 text-xs">
                <ShieldAlert className="h-4 w-4 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            {isSignUp && (
              <div className="space-y-1.5 animate-pulse-slow">
                <label className="text-xs font-semibold text-slate-650 dark:text-slate-350">
                  Full Name
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <User className="h-4.5 w-4.5" />
                  </div>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Pranay Gupta"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="block w-full pl-10.5 pr-4 py-2.5 text-sm bg-white/50 dark:bg-slate-900/55 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 dark:focus:border-purple-600 transition-all"
                  />
                </div>
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-650 dark:text-slate-350">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Mail className="h-4.5 w-4.5" />
                </div>
                <input
                  type="email"
                  required
                  placeholder="marketer@xeno.ai"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full pl-10.5 pr-4 py-2.5 text-sm bg-white/50 dark:bg-slate-900/55 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 dark:focus:border-purple-600 transition-all"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-650 dark:text-slate-350">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="h-4.5 w-4.5" />
                </div>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-10.5 pr-4 py-2.5 text-sm bg-white/50 dark:bg-slate-900/55 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 dark:focus:border-purple-600 transition-all"
                />
              </div>
            </div>

            {isSignUp && (
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-650 dark:text-slate-350">
                  Select CRM Role
                </label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as any)}
                  className="block w-full px-3.5 py-2.5 text-sm bg-white/50 dark:bg-slate-900/55 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                >
                  <option value="MARKETER">Marketer Role</option>
                  <option value="ADMIN">Admin Role</option>
                </select>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 py-2.5 px-4 mt-6 text-sm font-semibold text-white bg-gradient-to-r from-purple-600 to-blue-600 hover:opacity-95 shadow-md shadow-purple-500/10 rounded-xl disabled:opacity-50 transition-opacity"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4.5 w-4.5 animate-spin" />
                  {isSignUp ? "Creating Account..." : "Signing in..."}
                </>
              ) : (
                isSignUp ? "Register & Login" : "Sign In"
              )}
            </button>
          </form>

          {/* Quick Access Credentials (only show in sign in mode to keep interface tidy) */}
          {!isSignUp && (
            <div className="mt-8 border-t border-slate-200 dark:border-slate-850 pt-6">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 block mb-3">
                Quick Test Accounts
              </span>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => autofillCredentials("marketer")}
                  className="flex flex-col items-center justify-center p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 hover:bg-slate-100 dark:bg-slate-900/20 dark:hover:bg-slate-850 text-left transition-colors"
                >
                  <span className="text-xs font-semibold text-purple-650 dark:text-purple-400">Marketer Role</span>
                  <span className="text-[10px] text-slate-550 mt-0.5">Click to autofill</span>
                </button>
                <button
                  type="button"
                  onClick={() => autofillCredentials("admin")}
                  className="flex flex-col items-center justify-center p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 hover:bg-slate-100 dark:bg-slate-900/20 dark:hover:bg-slate-850 text-left transition-colors"
                >
                  <span className="text-xs font-semibold text-blue-650 dark:text-blue-400">Admin Role</span>
                  <span className="text-[10px] text-slate-550 mt-0.5">Click to autofill</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
