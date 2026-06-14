"use client";

import React, { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Mail, Lock, ShieldAlert, ArrowLeft, Loader2, User } from "lucide-react";

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
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unexpected error occurred");
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
    <div className="relative min-h-screen flex items-center justify-center bg-background text-foreground p-6 transition-colors duration-300">
      <div className="w-full max-w-md space-y-6">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-foreground/60 hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to home
        </Link>

        {/* Card Panel */}
        <div className="bg-card p-8 rounded-2xl border border-border shadow-sm relative">
          <div className="flex flex-col items-center mb-6">
            <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-foreground text-background mb-4">
              <span className="font-bold text-lg font-display">X</span>
            </div>
            <h1 className="font-display font-bold text-2xl text-foreground">
              {isSignUp ? "Create CRM Account" : "Sign in to Xeno CRM"}
            </h1>
            <p className="text-xs text-foreground/60 mt-1 text-center">
              {isSignUp ? "Register as an Admin or Marketer User" : "Enter your credentials to access the platform"}
            </p>
          </div>

          {/* Mode Switch Tabs */}
          <div className="flex p-1 bg-background border border-border rounded-xl mb-6">
            <button
              onClick={() => {
                setIsSignUp(false);
                setError(null);
              }}
              className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-colors ${
                !isSignUp
                  ? "bg-foreground text-background shadow-sm"
                  : "text-foreground/60 hover:text-foreground"
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
                  ? "bg-foreground text-background shadow-sm"
                  : "text-foreground/60 hover:text-foreground"
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
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground/70">
                  Full Name
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-foreground/40">
                    <User className="h-4.5 w-4.5" />
                  </div>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Pranay Gupta"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="block w-full pl-10.5 pr-4 py-2.5 text-sm bg-background border border-border rounded-xl focus:outline-none focus:border-foreground/50 text-foreground transition-all"
                  />
                </div>
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground/70">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-foreground/40">
                  <Mail className="h-4.5 w-4.5" />
                </div>
                <input
                  type="email"
                  required
                  placeholder="marketer@xeno.ai"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full pl-10.5 pr-4 py-2.5 text-sm bg-background border border-border rounded-xl focus:outline-none focus:border-foreground/50 text-foreground transition-all"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground/70">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-foreground/40">
                  <Lock className="h-4.5 w-4.5" />
                </div>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-10.5 pr-4 py-2.5 text-sm bg-background border border-border rounded-xl focus:outline-none focus:border-foreground/50 text-foreground transition-all"
                />
              </div>
            </div>

            {isSignUp && (
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground/70">
                  Select CRM Role
                </label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as "ADMIN" | "MARKETER")}
                  className="block w-full px-3.5 py-2.5 text-sm bg-background border border-border rounded-xl focus:outline-none focus:border-foreground/50 text-foreground"
                >
                  <option value="MARKETER">Marketer Role</option>
                  <option value="ADMIN">Admin Role</option>
                </select>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 py-2.5 px-4 mt-6 text-sm font-semibold text-background bg-foreground hover:opacity-90 rounded-xl disabled:opacity-50 transition-opacity cursor-pointer"
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

          {/* Quick Access Credentials */}
          {!isSignUp && (
            <div className="mt-8 border-t border-border pt-6">
              <span className="text-xs font-bold uppercase tracking-wider text-foreground/40 block mb-3">
                Quick Test Accounts
              </span>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => autofillCredentials("marketer")}
                  className="flex flex-col items-center justify-center p-3 rounded-xl border border-border bg-background hover:bg-foreground/5 text-left transition-colors cursor-pointer"
                >
                  <span className="text-xs font-semibold text-foreground">Marketer Role</span>
                  <span className="text-[10px] text-foreground/50 mt-0.5">Click to autofill</span>
                </button>
                <button
                  type="button"
                  onClick={() => autofillCredentials("admin")}
                  className="flex flex-col items-center justify-center p-3 rounded-xl border border-border bg-background hover:bg-foreground/5 text-left transition-colors cursor-pointer"
                >
                  <span className="text-xs font-semibold text-foreground">Admin Role</span>
                  <span className="text-[10px] text-foreground/50 mt-0.5">Click to autofill</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
