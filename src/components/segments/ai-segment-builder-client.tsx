"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Sparkles, ArrowRight, Loader2, Save, AlertCircle, CheckCircle, Database } from "lucide-react";
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
    } catch (err: any) {
      setError(err.message || "Something went wrong while composing segment filters");
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
    } catch (err: any) {
      setError(err.message || "Failed to save segment");
      setSaving(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Title */}
      <div>
        <h1 className="font-display font-extrabold text-3xl tracking-tight flex items-center gap-2.5">
          <Sparkles className="h-8 w-8 text-purple-600 dark:text-purple-400" />
          AI Segment Builder
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
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
          <div className="glass-panel p-6 rounded-3xl border border-slate-200 dark:border-slate-800/80 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/5 rounded-full filter blur-xl pointer-events-none"></div>

            <form onSubmit={handleGenerate} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-650 dark:text-slate-350">
                  Describe the segment you want to build
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder="e.g. Customers from Delhi who have spent more than ₹5000 and haven't purchased in 60 days"
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  className="block w-full px-4 py-3 text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all resize-none"
                />
              </div>

              <div className="flex justify-between items-center pt-2">
                <span className="text-[10px] text-slate-400 italic">Powered by Gemini 2.5 Flash</span>
                <button
                  type="submit"
                  disabled={generating || !prompt.trim()}
                  className="flex items-center gap-1.5 px-5 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-purple-600 to-blue-600 hover:opacity-95 shadow-md shadow-purple-500/10 rounded-xl disabled:opacity-50 transition-opacity"
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
            <div className="glass-panel p-6 rounded-3xl border border-purple-500/20 dark:border-purple-900/30 shadow-md space-y-6 animate-pulse-slow">
              <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-850 pb-4">
                <div>
                  <h3 className="font-display font-bold text-lg text-slate-900 dark:text-white flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-purple-650 dark:text-purple-400" />
                    {generatedSegment.segmentName}
                  </h3>
                  <p className="text-xs text-slate-550 dark:text-slate-400 mt-0.5">
                    {generatedSegment.description}
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 block">
                  Identified Segment Constraints
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {generatedSegment.conditions.map((cond, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 rounded-xl bg-slate-500/5 border border-slate-200/50 dark:border-slate-850 text-xs">
                      <span className="text-slate-500 uppercase tracking-wider font-semibold text-[10px]">{cond.field}</span>
                      <span className="font-bold text-slate-800 dark:text-slate-200">
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
                  className="flex items-center gap-1.5 px-5 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-purple-600 to-blue-600 hover:opacity-95 shadow-md shadow-purple-500/10 rounded-xl disabled:opacity-50 transition-opacity"
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
          <div className="glass-panel p-6 rounded-3xl border border-slate-200 dark:border-slate-800/80 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/5 rounded-full filter blur-xl pointer-events-none"></div>

            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-850 pb-4 mb-6">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-450 dark:text-slate-500">
                Audience Preview
              </h3>
              {generating && <Loader2 className="h-4.5 w-4.5 text-purple-600 dark:text-purple-400 animate-spin" />}
            </div>

            {previewStats ? (
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 bg-slate-500/5 dark:bg-slate-900/20 border border-slate-200/40 dark:border-slate-800/40 rounded-2xl">
                    <span className="text-[10px] text-slate-400 font-semibold block uppercase">Reach</span>
                    <span className="text-xl font-bold tracking-tight">{previewStats.audienceSize}</span>
                  </div>
                  <div className="p-3 bg-slate-500/5 dark:bg-slate-900/20 border border-slate-200/40 dark:border-slate-800/40 rounded-2xl">
                    <span className="text-[10px] text-slate-400 font-semibold block uppercase">Est. Reach %</span>
                    <span className="text-xl font-bold tracking-tight">{previewStats.estimatedReach}%</span>
                  </div>
                </div>

                <div className="space-y-1.5 p-4 bg-purple-50/45 dark:bg-purple-950/20 border border-purple-200/30 dark:border-purple-900/30 rounded-2xl">
                  <span className="text-[10px] font-bold text-purple-650 dark:text-purple-400 uppercase tracking-wider block">
                    Revenue Potential
                  </span>
                  <span className="text-2xl font-extrabold tracking-tight text-purple-700 dark:text-purple-400">
                    ₹{previewStats.estimatedRevenue.toLocaleString("en-IN")}
                  </span>
                  <span className="text-[10px] text-slate-400 block mt-1">
                    Averaging ₹{previewStats.averageSpend.toLocaleString("en-IN")} per customer
                  </span>
                </div>

                {/* Customer List Preview */}
                <div className="space-y-3">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-450 dark:text-slate-500 block">
                    Matching Profiles Preview ({previewStats.preview.length})
                  </span>
                  <div className="space-y-2 max-h-56 overflow-y-auto custom-scrollbar pr-1">
                    {previewStats.preview.length === 0 ? (
                      <span className="text-xs text-slate-500 block italic">No customers match this filter.</span>
                    ) : (
                      previewStats.preview.map((c) => (
                        <div key={c.id} className="flex justify-between items-center p-2.5 rounded-xl bg-slate-500/5 border border-slate-200/40 dark:border-slate-850/50 text-xs">
                          <div className="flex flex-col min-w-0">
                            <span className="font-semibold truncate text-slate-800 dark:text-slate-200">{c.name}</span>
                            <span className="text-[10px] text-slate-450 truncate">{c.city}</span>
                          </div>
                          <span className="font-bold text-slate-700 dark:text-slate-350 font-mono">
                            ₹{c.totalSpend.toLocaleString("en-IN")}
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-xs text-slate-450 dark:text-slate-400 text-center py-12">
                Input a natural language segment request to preview target stats.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
