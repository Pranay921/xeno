"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
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
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong while generating the campaign draft");
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
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to finalize campaign");
      setCreating(false);
    }
  };

  return (
    <div className="space-y-8 text-foreground bg-background">
      {/* Title */}
      <div>
        <h1 className="font-display font-extrabold text-3xl tracking-tight flex items-center gap-2.5 text-foreground">
          <Megaphone className="h-8 w-8 text-foreground" />
          AI Campaign Assistant
        </h1>
        <p className="text-sm text-foreground/60 mt-1">
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
          <div className="bg-card p-6 rounded-2xl border border-border shadow-sm relative overflow-hidden">
            <form onSubmit={handleGenerate} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground/70">
                  What is your marketing campaign goal?
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder="e.g. Win back inactive customers, reward high-spenders, increase weekend orders"
                  value={goal}
                  onChange={(e) => setGoal(e.target.value)}
                  className="block w-full px-4 py-3 text-sm bg-background border border-border rounded-xl focus:outline-none focus:border-foreground/50 text-foreground transition-all resize-none"
                />
              </div>

              <div className="flex justify-between items-center pt-2">
                <span className="text-[10px] text-foreground/50 italic">Powered by Gemini 2.5 Flash</span>
                <button
                  type="submit"
                  disabled={generating || !goal.trim()}
                  className="flex items-center gap-1.5 px-5 py-2.5 text-sm font-semibold text-background bg-foreground hover:opacity-90 rounded-xl disabled:opacity-50 transition-opacity cursor-pointer animate-pulse"
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
            <div className="bg-card p-6 rounded-2xl border border-border shadow-sm space-y-6 animate-pulse">
              <div className="border-b border-border pb-4">
                <span className="text-[10px] font-bold uppercase tracking-wider text-foreground/60">
                  AI Recommended Strategy
                </span>
                <h3 className="font-display font-extrabold text-xl text-foreground mt-1">
                  {draft.campaignName}
                </h3>
              </div>

              {/* Suggestions grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-foreground/5 border border-border rounded-xl">
                  <div className="flex items-center gap-1.5 text-foreground/60 text-xs font-semibold uppercase tracking-wider">
                    <User className="h-3.5 w-3.5" />
                    Target Segment
                  </div>
                  <p className="text-sm font-semibold text-foreground mt-2">
                    {draft.segmentDescription}
                  </p>
                </div>

                <div className="p-4 bg-foreground/5 border border-border rounded-xl">
                  <div className="flex items-center gap-1.5 text-foreground/60 text-xs font-semibold uppercase tracking-wider">
                    <Compass className="h-3.5 w-3.5" />
                    Optimal Channel
                  </div>
                  <p className="text-sm font-semibold text-foreground mt-2">
                    {draft.channel}
                  </p>
                </div>

                <div className="md:col-span-2 p-4 bg-foreground/5 border border-border rounded-xl">
                  <div className="flex items-center gap-1.5 text-foreground/60 text-xs font-semibold uppercase tracking-wider">
                    <MessageSquare className="h-3.5 w-3.5" />
                    Personalized Message Copy
                  </div>
                  <p className="text-sm font-medium text-foreground mt-2 bg-background p-3 rounded-xl border border-border font-mono">
                    {draft.message}
                  </p>
                </div>
              </div>

              {/* Explainability Panels */}
              <div className="space-y-3 pt-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-foreground/50 flex items-center gap-1">
                  <HelpCircle className="h-3.5 w-3.5" /> AI Explainability Log
                </span>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 rounded-xl bg-foreground/5 border border-border text-xs text-foreground">
                    <span className="font-bold text-foreground block mb-1">Why Audience?</span>
                    <p className="text-foreground/70 leading-relaxed">{draft.reasoningDetails.whyAudience}</p>
                  </div>
                  <div className="p-4 rounded-xl bg-foreground/5 border border-border text-xs text-foreground">
                    <span className="font-bold text-foreground block mb-1">Why Channel?</span>
                    <p className="text-foreground/70 leading-relaxed">{draft.reasoningDetails.whyChannel}</p>
                  </div>
                  <div className="p-4 rounded-xl bg-foreground/5 border border-border text-xs text-foreground">
                    <span className="font-bold text-foreground block mb-1">Why Message?</span>
                    <p className="text-foreground/70 leading-relaxed">{draft.reasoningDetails.whyMessage}</p>
                  </div>
                </div>
              </div>

              {/* Submit CTA */}
              <div className="flex gap-4 pt-4 border-t border-border">
                <button
                  onClick={handleCreateCampaign}
                  disabled={creating}
                  className="flex items-center gap-1.5 px-6 py-3 text-sm font-semibold text-background bg-foreground hover:opacity-90 rounded-xl disabled:opacity-50 transition-opacity cursor-pointer"
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
          <div className="bg-card p-6 rounded-2xl border border-border shadow-sm">
            <h3 className="text-xs font-bold uppercase tracking-wider text-foreground/60 mb-4">
              Assistant Ideas
            </h3>
            <ul className="space-y-3.5 text-xs text-foreground/70 leading-relaxed">
              <li className="p-3 bg-foreground/5 rounded-xl border border-border">
                <span className="font-bold text-foreground">Win-back Dormant Users:</span>
                <p className="mt-1">&quot;Bring back high value customers who haven&apos;t ordered in 90 days&quot;</p>
              </li>
              <li className="p-3 bg-foreground/5 rounded-xl border border-border">
                <span className="font-bold text-foreground">Reward Loyal Shoppers:</span>
                <p className="mt-1">&quot;Offer a special discount to users with more than 5 orders from Pune&quot;</p>
              </li>
              <li className="p-3 bg-foreground/5 rounded-xl border border-border">
                <span className="font-bold text-foreground">Clear Clearance Stock:</span>
                <p className="mt-1">&quot;Launch a WhatsApp promo for Bangalore users to buy headphones&quot;</p>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
