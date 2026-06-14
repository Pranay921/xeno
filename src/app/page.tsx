"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { useTheme } from "@/app/providers";
import {
  Sparkles,
  ArrowRight,
  BarChart3,
  Bot,
  Moon,
  Sun,
  CheckCircle,
} from "lucide-react";

export default function LandingPage() {
  const { data: session } = useSession();
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-background text-foreground transition-colors duration-300">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-foreground text-background">
              <span className="font-bold text-lg font-display">X</span>
            </div>
            <span className="font-extrabold text-xl tracking-tight text-foreground font-display">
              XENO AI
            </span>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg text-foreground/70 hover:bg-foreground/5 transition-colors"
            >
              {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </button>

            {session ? (
              <Link
                href="/dashboard"
                className="flex items-center gap-1.5 px-4.5 py-2 text-sm font-semibold text-background bg-foreground hover:opacity-90 rounded-lg transition-all duration-200"
              >
                Go to Dashboard
                <ArrowRight className="h-4 w-4" />
              </Link>
            ) : (
              <Link
                href="/auth/signin"
                className="flex items-center gap-1.5 px-4.5 py-2 text-sm font-semibold text-background bg-foreground hover:opacity-90 rounded-lg transition-all duration-200"
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
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-foreground/5 border border-border text-foreground text-xs font-semibold mb-6">
          <Sparkles className="h-3.5 w-3.5" />
          Next-Generation AI-Native Marketing CRM
        </div>
        <h1 className="font-display font-extrabold text-5xl lg:text-7xl tracking-tight max-w-4xl mx-auto text-foreground leading-none">
          Drive campaigns using{" "}
          <span className="italic underline decoration-border decoration-2 underline-offset-4">
            Business Goals
          </span>{" "}
          instead of tools.
        </h1>
        <p className="mt-6 text-lg text-foreground/70 max-w-2xl mx-auto">
          Describe your audience in natural language. Auto-create segments, generate tailored copy with Gemini 2.5 Flash, launch simulations, and track conversion loop in real time.
        </p>
        <div className="mt-10 flex flex-wrap justify-center gap-4">
          <Link
            href={session ? "/dashboard" : "/auth/signin"}
            className="flex items-center gap-2 px-6 py-3.5 text-base font-semibold text-background bg-foreground hover:opacity-90 rounded-xl transition-all duration-200"
          >
            Launch Xeno CRM
            <ArrowRight className="h-5 w-5" />
          </Link>
          <a
            href="#features"
            className="px-6 py-3.5 text-base font-semibold text-foreground hover:bg-foreground/5 rounded-xl border border-border transition-all duration-200"
          >
            Explore Features
          </a>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="max-w-7xl mx-auto px-6 py-20 border-t border-border">
        <div className="text-center mb-16">
          <h2 className="font-display font-bold text-3xl lg:text-4xl text-foreground">
            Supercharged AI Marketing Modules
          </h2>
          <p className="mt-4 text-foreground/70 max-w-xl mx-auto">
            Everything you need to automate audience segmentation, campaign composition, and receipt simulation.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Card 1 */}
          <div className="bg-card border border-border p-8 rounded-2xl relative overflow-hidden transition-transform duration-300">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-foreground/5 border border-border text-foreground mb-6">
              <Sparkles className="h-6 w-6" />
            </div>
            <h3 className="font-display font-semibold text-xl text-foreground mb-3">
              AI Segment Builder
            </h3>
            <p className="text-sm text-foreground/75 leading-relaxed">
              Describe your target customer in natural language. Gemini translates it into structured database queries for live audience estimation.
            </p>
          </div>

          {/* Card 2 */}
          <div className="bg-card border border-border p-8 rounded-2xl relative overflow-hidden transition-transform duration-300">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-foreground/5 border border-border text-foreground mb-6">
              <Bot className="h-6 w-6" />
            </div>
            <h3 className="font-display font-semibold text-xl text-foreground mb-3">
              AI Campaign Assistant
            </h3>
            <p className="text-sm text-foreground/75 leading-relaxed">
              Describe a business goal, like &quot;Win back inactive users&quot;, and get recommendations for target audiences, channels, and copy options.
            </p>
          </div>

          {/* Card 3 */}
          <div className="bg-card border border-border p-8 rounded-2xl relative overflow-hidden transition-transform duration-300">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-foreground/5 border border-border text-foreground mb-6">
              <BarChart3 className="h-6 w-6" />
            </div>
            <h3 className="font-display font-semibold text-xl text-foreground mb-3">
              Campaign Analytics
            </h3>
            <p className="text-sm text-foreground/75 leading-relaxed">
              Track real-time ROI, CTR, and conversion metrics in modern charts with interactive funnel visualizations.
            </p>
          </div>
        </div>
      </section>

      {/* AI Segment Builder Showcase */}
      <section className="max-w-7xl mx-auto px-6 py-16 border-t border-border">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-foreground/5 border border-border text-foreground text-xs font-semibold mb-4">
              <Sparkles className="h-3 w-3" />
              Flagship UI
            </div>
            <h2 className="font-display font-bold text-3xl lg:text-4xl text-foreground mb-6">
              Instant segment construction in one sentence.
            </h2>
            <p className="text-foreground/70 mb-6 leading-relaxed">
              Marketers can skip complex filter conditions. Just type:
              <br />
              <span className="italic block mt-2 text-foreground font-semibold bg-foreground/5 p-3 rounded-lg border border-border">
                {"\"Customers who spent more than ₹5000 and haven't ordered in 60 days\""}
              </span>
            </p>
            <ul className="space-y-3">
              <li className="flex items-center gap-2 text-sm text-foreground/85">
                <CheckCircle className="h-4.5 w-4.5 text-foreground" />
                Live audience size calculation
              </li>
              <li className="flex items-center gap-2 text-sm text-foreground/85">
                <CheckCircle className="h-4.5 w-4.5 text-foreground" />
                Preview of match customers before saving
              </li>
              <li className="flex items-center gap-2 text-sm text-foreground/85">
                <CheckCircle className="h-4.5 w-4.5 text-foreground" />
                Auto-estimated revenue potential
              </li>
            </ul>
          </div>
          <div className="bg-card p-6 rounded-2xl border border-border shadow-sm relative">
            <div className="flex items-center justify-between border-b border-border pb-4 mb-4">
              <span className="text-sm font-semibold text-foreground">Audience Builder</span>
              <span className="text-xs bg-foreground/5 border border-border text-foreground px-2.5 py-1 rounded-full font-semibold">Gemini 2.5 Flash</span>
            </div>
            <div className="space-y-4">
              <div className="bg-background border border-border p-4 rounded-xl text-sm italic">
                {"\"High value inactive customers\""}
              </div>
              <div className="p-4 bg-foreground/5 border border-border rounded-xl space-y-2.5">
                <span className="text-xs font-bold uppercase tracking-wider text-foreground opacity-60">Identified Segment</span>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Audience Size</span>
                  <span className="text-sm font-bold text-foreground">145 Customers</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Potential Revenue</span>
                  <span className="text-sm font-bold text-foreground">₹8,45,000</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-7xl mx-auto px-6 py-20 text-center">
        <div className="bg-card p-12 lg:p-20 rounded-3xl border border-border shadow-sm">
          <h2 className="font-display font-extrabold text-4xl lg:text-5xl text-foreground leading-tight">
            Ready to upgrade to AI-native campaigns?
          </h2>
          <p className="mt-4 text-foreground/70 max-w-xl mx-auto">
            Get started with credentials for Admin or Marketer accounts today.
          </p>
          <div className="mt-10 flex justify-center gap-4">
            <Link
              href={session ? "/dashboard" : "/auth/signin"}
              className="flex items-center gap-2 px-8 py-4 text-base font-semibold text-background bg-foreground hover:opacity-90 rounded-xl transition-all duration-200"
            >
              Sign In to CRM
              <ArrowRight className="h-5 w-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-background py-8 text-center text-xs text-foreground/50">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row justify-between items-center gap-4">
          <span>&copy; {new Date().getFullYear()} Xeno CRM. All rights reserved.</span>
          <div className="flex gap-6">
            <Link href="/auth/signin" className="hover:text-foreground">Sign In</Link>
            <a href="#" className="hover:text-foreground">Terms</a>
            <a href="#" className="hover:text-foreground">Privacy</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
