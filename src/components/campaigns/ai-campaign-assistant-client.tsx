"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Sparkles,
  ArrowRight,
  Loader2,
  Megaphone,
  User,
  MessageSquare,
  Compass,
  AlertCircle,
  HelpCircle,
} from "lucide-react";

export default function AICampaignAssistantClient() {
  const router = useRouter();
  const [goal, setGoal] = useState("");
  const [generating, setGenerating] = useState(false);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Suggested Campaign Draft
  const [draft, setDraft] = useState<{
    campaignName: string;
    segmentDescription: string;
    channel: string;
    message: string;
    reasoning: string;
    reasoningDetails: {
      whyAudience: string;
      whyChannel: string;
      whyMessage: string;
    };
  } | null>(null);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!goal.trim()) return;

    setGenerating(true);
    setError(null);
    setDraft(null);

    try {
      const res = await fetch("/api/ai/campaign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ goal }),
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to generate campaign suggestion");
      }

      setDraft(data);
    } catch (err: any) {
      setError(err.message || "Something went wrong while generating the campaign draft");
    } finally {
      setGenerating(false);
    }
  };

  const handleCreateCampaign = async () => {
    if (!draft) return;
    setCreating(true);
    setError(null);

    try {
      // Step 1: Create Campaign (which will auto-generate the segment as well)
      const res = await fetch("/api/campaigns", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: draft.campaignName,
          segmentDescription: draft.segmentDescription,
          channel: draft.channel,
          message: draft.message,
        }),
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to create campaign draft");
      }

      // Route to Campaign list page so user can review/launch
      router.push("/campaigns");
      router.refresh();
    } catch (err: any) {
      setError(err.message || "Failed to finalize campaign");
      setCreating(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Title */}
      <div>
        <h1 className="font-display font-extrabold text-3xl tracking-tight flex items-center gap-2.5">
          <Megaphone className="h-8 w-8 text-purple-650 dark:text-purple-400" />
          AI Campaign Assistant
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Describe marketing objectives and get instant suggested audiences, channels, copies, and reasoning.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Input objective */}
        <div className="lg:col-span-2 space-y-6">
          {error && (
            <div className="flex items-start gap-2.5 p-4 rounded-2xl bg-red-50 dark:bg-red-950/20 border border-red-200/50 dark:border-red-900/35 text-red-700 dark:text-red-400 text-sm">
              <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Prompter Panel */}
          <div className="glass-panel p-6 rounded-3xl border border-slate-200 dark:border-slate-800/80 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/5 rounded-full filter blur-xl pointer-events-none"></div>

            <form onSubmit={handleGenerate} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-650 dark:text-slate-350">
                  What is your marketing campaign goal?
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder="e.g. Win back inactive customers, reward high-spenders, increase weekend orders"
                  value={goal}
                  onChange={(e) => setGoal(e.target.value)}
                  className="block w-full px-4 py-3 text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all resize-none"
                />
              </div>

              <div className="flex justify-between items-center pt-2">
                <span className="text-[10px] text-slate-400 italic">Powered by Gemini 2.5 Flash</span>
                <button
                  type="submit"
                  disabled={generating || !goal.trim()}
                  className="flex items-center gap-1.5 px-5 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-purple-600 to-blue-600 hover:opacity-95 shadow-md shadow-purple-500/10 rounded-xl disabled:opacity-50 transition-opacity"
                >
                  {generating ? (
                    <>
                      <Loader2 className="h-4.5 w-4.5 animate-spin" />
                      Strategizing...
                    </>
                  ) : (
                    <>
                      Formulate Campaign
                      <ArrowRight className="h-4.5 w-4.5" />
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* Suggestions view */}
          {draft && (
            <div className="glass-panel p-8 rounded-[32px] border border-purple-500/25 dark:border-purple-900/35 shadow-lg space-y-6">
              <div className="border-b border-slate-200 dark:border-slate-850 pb-4">
                <span className="text-[10px] font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400">
                  AI Recommended Strategy
                </span>
                <h3 className="font-display font-extrabold text-xl text-slate-900 dark:text-white mt-1">
                  {draft.campaignName}
                </h3>
              </div>

              {/* Suggestions grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-slate-500/5 dark:bg-slate-900/20 border border-slate-200/40 dark:border-slate-800/40 rounded-2xl">
                  <div className="flex items-center gap-1.5 text-slate-400 text-xs font-semibold uppercase tracking-wider">
                    <User className="h-3.5 w-3.5 text-purple-500" />
                    Target Segment
                  </div>
                  <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 mt-2">
                    {draft.segmentDescription}
                  </p>
                </div>

                <div className="p-4 bg-slate-500/5 dark:bg-slate-900/20 border border-slate-200/40 dark:border-slate-800/40 rounded-2xl">
                  <div className="flex items-center gap-1.5 text-slate-400 text-xs font-semibold uppercase tracking-wider">
                    <Compass className="h-3.5 w-3.5 text-purple-500" />
                    Optimal Channel
                  </div>
                  <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 mt-2">
                    {draft.channel}
                  </p>
                </div>

                <div className="md:col-span-2 p-4 bg-slate-500/5 dark:bg-slate-900/20 border border-slate-200/40 dark:border-slate-800/40 rounded-2xl">
                  <div className="flex items-center gap-1.5 text-slate-400 text-xs font-semibold uppercase tracking-wider">
                    <MessageSquare className="h-3.5 w-3.5 text-purple-500" />
                    Personalized Message Copy
                  </div>
                  <p className="text-sm font-medium text-slate-800 dark:text-slate-200 mt-2 bg-white dark:bg-slate-950 p-3 rounded-xl border border-slate-200/30 dark:border-slate-800/65 font-mono">
                    {draft.message}
                  </p>
                </div>
              </div>

              {/* Explainability Panels */}
              <div className="space-y-3 pt-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-450 dark:text-slate-500 flex items-center gap-1">
                  <HelpCircle className="h-3.5 w-3.5" /> AI Explainability Log
                </span>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4.5 rounded-2xl bg-purple-500/5 border border-purple-500/10 text-xs">
                    <span className="font-bold text-purple-650 dark:text-purple-400 block mb-1">Why Audience?</span>
                    <p className="text-slate-600 dark:text-slate-400 leading-relaxed">{draft.reasoningDetails.whyAudience}</p>
                  </div>
                  <div className="p-4.5 rounded-2xl bg-purple-500/5 border border-purple-500/10 text-xs">
                    <span className="font-bold text-purple-650 dark:text-purple-400 block mb-1">Why Channel?</span>
                    <p className="text-slate-600 dark:text-slate-400 leading-relaxed">{draft.reasoningDetails.whyChannel}</p>
                  </div>
                  <div className="p-4.5 rounded-2xl bg-purple-500/5 border border-purple-500/10 text-xs">
                    <span className="font-bold text-purple-650 dark:text-purple-400 block mb-1">Why Message?</span>
                    <p className="text-slate-600 dark:text-slate-400 leading-relaxed">{draft.reasoningDetails.whyMessage}</p>
                  </div>
                </div>
              </div>

              {/* Submit CTA */}
              <div className="flex gap-4 pt-4 border-t border-slate-200 dark:border-slate-850">
                <button
                  onClick={handleCreateCampaign}
                  disabled={creating}
                  className="flex items-center gap-1.5 px-6 py-3 text-sm font-semibold text-white bg-gradient-to-r from-purple-600 to-blue-600 hover:opacity-95 shadow-md shadow-purple-500/10 rounded-xl disabled:opacity-50 transition-opacity"
                >
                  {creating ? (
                    <>
                      <Loader2 className="h-4.5 w-4.5 animate-spin" />
                      Creating Campaign Draft...
                    </>
                  ) : (
                    <>
                      Create Campaign Draft
                      <ArrowRight className="h-4.5 w-4.5" />
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Sidebar Info/Tips */}
        <div className="space-y-6">
          <div className="glass-panel p-6 rounded-3xl border border-slate-200 dark:border-slate-800/80 shadow-sm">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-450 dark:text-slate-500 mb-4">
              Assistant Ideas
            </h3>
            <ul className="space-y-3.5 text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              <li className="p-3 bg-slate-500/5 rounded-xl border border-slate-200/20 dark:border-slate-800/40">
                <span className="font-bold text-purple-600 dark:text-purple-400">Win-back Dormant Users:</span>
                <p className="mt-1">&quot;Bring back high value customers who haven&apos;t ordered in 90 days&quot;</p>
              </li>
              <li className="p-3 bg-slate-500/5 rounded-xl border border-slate-200/20 dark:border-slate-800/40">
                <span className="font-bold text-purple-600 dark:text-purple-400">Reward Loyal Shoppers:</span>
                <p className="mt-1">&quot;Offer a special discount to users with more than 5 orders from Pune&quot;</p>
              </li>
              <li className="p-3 bg-slate-500/5 rounded-xl border border-slate-200/20 dark:border-slate-800/40">
                <span className="font-bold text-purple-600 dark:text-purple-400">Clear Clearance Stock:</span>
                <p className="mt-1">&quot;Launch a WhatsApp promo for Bangalore users to buy headphones&quot;</p>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
