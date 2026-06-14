"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Sparkles, ArrowRight, Loader2, Save, AlertCircle, CheckCircle } from "lucide-react";
import { SegmentCondition } from "@/lib/segment-query";

export default function AISegmentBuilderClient() {
  const router = useRouter();
  const [prompt, setPrompt] = useState("");
  const [generating, setGenerating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // AI Generated Results
  const [generatedSegment, setGeneratedSegment] = useState<{
    segmentName: string;
    description: string;
    conditions: SegmentCondition[];
  } | null>(null);

  // Preview Stats
  const [previewStats, setPreviewStats] = useState<{
    audienceSize: number;
    averageSpend: number;
    estimatedReach: number;
    estimatedRevenue: number;
    preview: { id: string; name: string; email: string; city: string; totalSpend: number }[];
  } | null>(null);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;

    setGenerating(true);
    setError(null);
    setGeneratedSegment(null);
    setPreviewStats(null);

    try {
      const res = await fetch("/api/ai/segment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to generate segment structure");
      }

      setGeneratedSegment(data);

      // Instantly load preview stats for these conditions
      const previewRes = await fetch("/api/segments/preview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ conditions: data.conditions }),
      });
      const previewData = await previewRes.json();
      if (previewRes.ok) {
        setPreviewStats(previewData);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong while composing segment filters");
    } finally {
      setGenerating(false);
    }
  };

  const handleSave = async () => {
    if (!generatedSegment) return;
    setSaving(true);
    setError(null);

    try {
      const res = await fetch("/api/segments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: generatedSegment.segmentName,
          description: generatedSegment.description,
          conditions: generatedSegment.conditions,
        }),
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to save segment");
      }

      router.push("/segments");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save segment");
      setSaving(false);
    }
  };

  return (
    <div className="space-y-8 text-foreground bg-background">
      {/* Title */}
      <div>
        <h1 className="font-display font-extrabold text-3xl tracking-tight flex items-center gap-2.5 text-foreground">
          <Sparkles className="h-8 w-8 text-foreground" />
          AI Segment Builder
        </h1>
        <p className="text-sm text-foreground/60 mt-1">
          Input business profiles in plain language to construct and estimate audience groups.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Prompter and Generated view */}
        <div className="lg:col-span-2 space-y-6">
          {error && (
            <div className="flex items-start gap-2.5 p-4 rounded-2xl bg-red-50 dark:bg-red-950/20 border border-red-200/50 dark:border-red-900/35 text-red-700 dark:text-red-400 text-sm">
              <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Prompter Form */}
          <div className="bg-card p-6 rounded-2xl border border-border shadow-sm relative overflow-hidden">
            <form onSubmit={handleGenerate} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground/70">
                  Describe the segment you want to build
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder="e.g. Customers from Delhi who have spent more than ₹5000 and haven't purchased in 60 days"
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  className="block w-full px-4 py-3 text-sm bg-background border border-border rounded-xl focus:outline-none focus:border-foreground/50 text-foreground transition-all resize-none"
                />
              </div>

              <div className="flex justify-between items-center pt-2">
                <span className="text-[10px] text-foreground/50 italic">Powered by Gemini 2.5 Flash</span>
                <button
                  type="submit"
                  disabled={generating || !prompt.trim()}
                  className="flex items-center gap-1.5 px-5 py-2.5 text-sm font-semibold text-background bg-foreground hover:opacity-90 rounded-xl disabled:opacity-50 transition-opacity cursor-pointer"
                >
                  {generating ? (
                    <>
                      <Loader2 className="h-4.5 w-4.5 animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      Translate to Filters
                      <ArrowRight className="h-4.5 w-4.5" />
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* AI generated Conditions Preview */}
          {generatedSegment && (
            <div className="bg-card p-6 rounded-2xl border border-border shadow-sm space-y-6">
              <div className="flex items-center justify-between border-b border-border pb-4">
                <div>
                  <h3 className="font-display font-bold text-lg text-foreground flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-foreground" />
                    {generatedSegment.segmentName}
                  </h3>
                  <p className="text-xs text-foreground/60 mt-0.5">
                    {generatedSegment.description}
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <span className="text-[10px] font-bold uppercase tracking-wider text-foreground/50 block">
                  Identified Segment Constraints
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {generatedSegment.conditions.map((cond, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 rounded-lg bg-foreground/5 border border-border text-xs text-foreground">
                      <span className="text-foreground/50 uppercase tracking-wider font-semibold text-[10px]">{cond.field}</span>
                      <span className="font-bold text-foreground">
                        {cond.operator} {cond.value}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex gap-4">
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex items-center gap-1.5 px-5 py-2.5 text-sm font-semibold text-background bg-foreground hover:opacity-90 rounded-xl disabled:opacity-50 transition-opacity cursor-pointer"
                >
                  {saving ? (
                    <>
                      <Loader2 className="h-4.5 w-4.5 animate-spin" />
                      Saving Segment...
                    </>
                  ) : (
                    <>
                      <Save className="h-4.5 w-4.5" />
                      Save Segment
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Live Audience Preview Sidebar */}
        <div className="space-y-6">
          <div className="bg-card p-6 rounded-2xl border border-border shadow-sm relative overflow-hidden">
            <div className="flex items-center justify-between border-b border-border pb-4 mb-6">
              <h3 className="text-sm font-bold uppercase tracking-wider text-foreground/60">
                Audience Preview
              </h3>
              {generating && <Loader2 className="h-4.5 w-4.5 text-foreground animate-spin" />}
            </div>

            {previewStats ? (
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 bg-foreground/5 border border-border rounded-xl">
                    <span className="text-[10px] text-foreground/50 font-semibold block uppercase">Reach</span>
                    <span className="text-xl font-bold tracking-tight text-foreground">{previewStats.audienceSize}</span>
                  </div>
                  <div className="p-3 bg-foreground/5 border border-border rounded-xl">
                    <span className="text-[10px] text-foreground/50 font-semibold block uppercase">Est. Reach %</span>
                    <span className="text-xl font-bold tracking-tight text-foreground">{previewStats.estimatedReach}%</span>
                  </div>
                </div>

                <div className="space-y-1.5 p-4 bg-foreground/5 border border-border rounded-xl">
                  <span className="text-[10px] font-bold text-foreground/60 uppercase tracking-wider block">
                    Revenue Potential
                  </span>
                  <span className="text-2xl font-extrabold tracking-tight text-foreground">
                    ₹{previewStats.estimatedRevenue.toLocaleString("en-IN")}
                  </span>
                  <span className="text-[10px] text-foreground/50 block mt-1">
                    Averaging ₹{previewStats.averageSpend.toLocaleString("en-IN")} per customer
                  </span>
                </div>

                {/* Customer List Preview */}
                <div className="space-y-3">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-foreground/50 block">
                    Matching Profiles Preview ({previewStats.preview.length})
                  </span>
                  <div className="space-y-2 max-h-56 overflow-y-auto custom-scrollbar pr-1">
                    {previewStats.preview.length === 0 ? (
                      <span className="text-xs text-foreground/50 block italic">No customers match this filter.</span>
                    ) : (
                      previewStats.preview.map((c) => (
                        <div key={c.id} className="flex justify-between items-center p-2.5 rounded-lg bg-foreground/5 border border-border text-xs text-foreground">
                          <div className="flex flex-col min-w-0">
                            <span className="font-semibold truncate text-foreground">{c.name}</span>
                            <span className="text-[10px] text-foreground/50 truncate">{c.city}</span>
                          </div>
                          <span className="font-bold text-foreground">
                            ₹{c.totalSpend.toLocaleString("en-IN")}
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-xs text-foreground/50 text-center py-12">
                Input a natural language segment request to preview target stats.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
