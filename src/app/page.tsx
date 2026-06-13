"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { useTheme } from "@/app/providers";
import {
  Sparkles,
  ArrowRight,
  Target,
  BarChart3,
  Bot,
  Zap,
  ShieldAlert,
  Moon,
  Sun,
  ShieldCheck,
  Smartphone,
  CheckCircle,
} from "lucide-react";

export default function LandingPage() {
  const { data: session } = useSession();
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-slate-50 dark:bg-[#030712] transition-colors duration-300">
      {/* Background Glows */}
      <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-purple-500/10 dark:bg-purple-900/15 rounded-full filter blur-[120px] pointer-events-none -z-10 animate-pulse-slow"></div>
      <div className="absolute top-1/3 right-1/4 w-[500px] h-[500px] bg-blue-500/10 dark:bg-blue-950/20 rounded-full filter blur-[100px] pointer-events-none -z-10"></div>

      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-slate-200/60 dark:border-slate-800/40 bg-white/75 dark:bg-[#030712]/70 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-purple-600 to-blue-500 shadow-md">
              <span className="text-white font-bold text-lg font-display">X</span>
            </div>
            <span className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300 bg-clip-text text-transparent font-display">
              XENO AI
            </span>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </button>

            {session ? (
              <Link
                href="/dashboard"
                className="flex items-center gap-1.5 px-4.5 py-2 text-sm font-semibold text-white bg-gradient-to-r from-purple-600 to-blue-600 hover:opacity-95 shadow-md shadow-purple-500/10 rounded-xl transition-all duration-200"
              >
                Go to Dashboard
                <ArrowRight className="h-4 w-4" />
              </Link>
            ) : (
              <Link
                href="/auth/signin"
                className="flex items-center gap-1.5 px-4.5 py-2 text-sm font-semibold text-white bg-gradient-to-r from-purple-600 to-blue-600 hover:opacity-95 shadow-md shadow-purple-500/10 rounded-xl transition-all duration-200"
              >
                Sign In
                <ArrowRight className="h-4 w-4" />
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-6 pt-20 pb-16 text-center lg:pt-32">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-100 dark:bg-purple-950/45 border border-purple-200 dark:border-purple-900/40 text-purple-700 dark:text-purple-300 text-xs font-semibold mb-6">
          <Sparkles className="h-3.5 w-3.5" />
          Next-Generation AI-Native Marketing CRM
        </div>
        <h1 className="font-display font-extrabold text-5xl lg:text-7xl tracking-tight max-w-4xl mx-auto text-slate-900 dark:text-white leading-none">
          Drive campaigns using{" "}
          <span className="bg-gradient-to-r from-purple-600 via-fuchsia-500 to-blue-500 bg-clip-text text-transparent">
            Business Goals
          </span>{" "}
          instead of tools.
        </h1>
        <p className="mt-6 text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
          Describe your audience in natural language. Auto-create segments, generate tailored copy with Gemini 2.5 Flash, launch simulations, and track conversion loop in real time.
        </p>
        <div className="mt-10 flex flex-wrap justify-center gap-4">
          <Link
            href={session ? "/dashboard" : "/auth/signin"}
            className="flex items-center gap-2 px-6 py-3.5 text-base font-semibold text-white bg-gradient-to-r from-purple-600 to-blue-600 hover:scale-[1.02] shadow-lg shadow-purple-500/25 rounded-2xl transition-all duration-200"
          >
            Launch Xeno CRM
            <ArrowRight className="h-5 w-5" />
          </Link>
          <a
            href="#features"
            className="px-6 py-3.5 text-base font-semibold text-slate-750 dark:text-slate-350 hover:bg-slate-100 dark:hover:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-800 transition-all duration-200"
          >
            Explore Features
          </a>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="max-w-7xl mx-auto px-6 py-20 border-t border-slate-200/40 dark:border-slate-800/40">
        <div className="text-center mb-16">
          <h2 className="font-display font-bold text-3xl lg:text-4xl text-slate-900 dark:text-white">
            Supercharged AI Marketing Modules
          </h2>
          <p className="mt-4 text-slate-600 dark:text-slate-400 max-w-xl mx-auto">
            Everything you need to automate audience segmentation, campaign composition, and receipt simulation.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Card 1 */}
          <div className="glass-panel p-8 rounded-3xl relative overflow-hidden group hover:scale-[1.01] transition-transform duration-300">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-purple-100 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 mb-6">
              <Sparkles className="h-6 w-6" />
            </div>
            <h3 className="font-display font-semibold text-xl text-slate-900 dark:text-white mb-3">
              AI Segment Builder
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              Describe your target customer in natural language. Gemini translates it into structured database queries for live audience estimation.
            </p>
          </div>

          {/* Card 2 */}
          <div className="glass-panel p-8 rounded-3xl relative overflow-hidden group hover:scale-[1.01] transition-transform duration-300">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-100 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 mb-6">
              <Bot className="h-6 w-6" />
            </div>
            <h3 className="font-display font-semibold text-xl text-slate-900 dark:text-white mb-3">
              AI Campaign Assistant
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              Describe a business goal, like &quot;Win back inactive users&quot;, and get recommendations for target audiences, channels, and copy options.
            </p>
          </div>

          {/* Card 3 */}
          <div className="glass-panel p-8 rounded-3xl relative overflow-hidden group hover:scale-[1.01] transition-transform duration-300">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-100 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 mb-6">
              <BarChart3 className="h-6 w-6" />
            </div>
            <h3 className="font-display font-semibold text-xl text-slate-900 dark:text-white mb-3">
              Campaign Analytics
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              Track real-time ROI, CTR, and conversion metrics in modern charts with interactive funnel visualizations.
            </p>
          </div>
        </div>
      </section>

      {/* AI Segment Builder Showcase */}
      <section className="max-w-7xl mx-auto px-6 py-16 border-t border-slate-200/40 dark:border-slate-800/40">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-100 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 text-xs font-semibold mb-4">
              <Sparkles className="h-3 w-3" />
              Flagship UI
            </div>
            <h2 className="font-display font-bold text-3xl lg:text-4xl text-slate-900 dark:text-white mb-6">
              Instant segment construction in one sentence.
            </h2>
            <p className="text-slate-600 dark:text-slate-400 mb-6 leading-relaxed">
              Marketers can skip complex filter conditions. Just type:
              <br />
              <span className="italic block mt-2 text-purple-650 dark:text-purple-400 font-semibold bg-purple-50 dark:bg-purple-950/20 p-3 rounded-xl">
                &quot;Customers who spent more than ₹5000 and haven&apos;t ordered in 60 days&quot;
              </span>
            </p>
            <ul className="space-y-3">
              <li className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-350">
                <CheckCircle className="h-4.5 w-4.5 text-purple-500" />
                Live audience size calculation
              </li>
              <li className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-350">
                <CheckCircle className="h-4.5 w-4.5 text-purple-500" />
                Preview of match customers before saving
              </li>
              <li className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-350">
                <CheckCircle className="h-4.5 w-4.5 text-purple-500" />
                Auto-estimated revenue potential
              </li>
            </ul>
          </div>
          <div className="glass-panel p-6 rounded-3xl border border-slate-200 dark:border-slate-800/80 shadow-2xl relative">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-850 pb-4 mb-4">
              <span className="text-sm font-semibold text-slate-850 dark:text-slate-300">Audience Builder</span>
              <span className="text-xs bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-350 px-2.5 py-1 rounded-full font-semibold">Gemini 2.5 Flash</span>
            </div>
            <div className="space-y-4">
              <div className="bg-slate-100 dark:bg-slate-900/60 p-4 rounded-xl text-sm italic border border-slate-200 dark:border-slate-800">
                &quot;High value inactive customers&quot;
              </div>
              <div className="p-4 bg-purple-50/40 dark:bg-purple-950/20 border border-purple-200/30 dark:border-purple-900/30 rounded-xl space-y-2.5">
                <span className="text-xs font-bold uppercase tracking-wider text-purple-650 dark:text-purple-400">Identified Segment</span>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Audience Size</span>
                  <span className="text-sm font-bold text-slate-850 dark:text-slate-200">145 Customers</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Potential Revenue</span>
                  <span className="text-sm font-bold text-emerald-650 dark:text-emerald-400">₹8,45,000</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-7xl mx-auto px-6 py-20 text-center">
        <div className="glass-panel p-12 lg:p-20 rounded-[40px] relative overflow-hidden bg-gradient-to-b from-white/80 to-slate-50/40 dark:from-slate-900/40 dark:to-slate-950/30 border border-slate-200/80 dark:border-slate-800/80 shadow-xl">
          <h2 className="font-display font-extrabold text-4xl lg:text-5xl text-slate-900 dark:text-white leading-tight">
            Ready to upgrade to AI-native campaigns?
          </h2>
          <p className="mt-4 text-slate-600 dark:text-slate-400 max-w-xl mx-auto">
            Get started with credentials for Admin or Marketer accounts today.
          </p>
          <div className="mt-10 flex justify-center gap-4">
            <Link
              href={session ? "/dashboard" : "/auth/signin"}
              className="flex items-center gap-2 px-8 py-4 text-base font-semibold text-white bg-gradient-to-r from-purple-600 to-blue-600 hover:scale-102 rounded-2xl shadow-lg shadow-purple-500/20 transition-all duration-200"
            >
              Sign In to CRM
              <ArrowRight className="h-5 w-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200/60 dark:border-slate-800/40 bg-white/40 dark:bg-slate-950/10 py-8 text-center text-xs text-slate-500 dark:text-slate-550">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row justify-between items-center gap-4">
          <span>&copy; {new Date().getFullYear()} Xeno CRM. All rights reserved.</span>
          <div className="flex gap-6">
            <Link href="/auth/signin" className="hover:text-slate-800 dark:hover:text-slate-350">Sign In</Link>
            <a href="#" className="hover:text-slate-800 dark:hover:text-slate-350">Terms</a>
            <a href="#" className="hover:text-slate-800 dark:hover:text-slate-350">Privacy</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
