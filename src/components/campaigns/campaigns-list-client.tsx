"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Megaphone,
  Plus,
  Sparkles,
  Play,
  CheckCircle,
  Clock,
  Send,
  Loader2,
  Users,
  Compass,
  FileText,
  AlertCircle,
} from "lucide-react";

type Campaign = {
  id: string;
  name: string;
  channel: string;
  message: string;
  audienceSize: number;
  status: "DRAFT" | "RUNNING" | "COMPLETED";
  createdAt: string;
  segment: { name: string };
  creator: { name: string } | null;
};

export default function CampaignsListClient({ campaigns: initialCampaigns }: { campaigns: Campaign[] }) {
  const router = useRouter();
  const [campaigns, setCampaigns] = useState<Campaign[]>(initialCampaigns);
  const [launchingId, setLaunchingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleLaunch = async (campaignId: string) => {
    setLaunchingId(campaignId);
    setError(null);

    try {
      const res = await fetch(`/api/campaigns/${campaignId}/launch`, {
        method: "POST",
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to launch campaign");
      }

      // Update local state to show campaign is running
      setCampaigns((prev) =>
        prev.map((c) => (c.id === campaignId ? { ...c, status: "RUNNING" } : c))
      );
      router.refresh();
    } catch (err: any) {
      setError(err.message || "Something went wrong while launching the campaign");
    } finally {
      setLaunchingId(null);
    }
  };

  const getStatusBadge = (status: Campaign["status"]) => {
    switch (status) {
      case "COMPLETED":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-450 border border-emerald-250/20">
            <CheckCircle className="h-3.5 w-3.5" />
            Completed
          </span>
        );
      case "RUNNING":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 dark:bg-blue-950/40 dark:text-blue-450 border border-blue-250/20 animate-pulse">
            <Send className="h-3.5 w-3.5" />
            Running
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
            <Clock className="h-3.5 w-3.5" />
            Draft
          </span>
        );
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display font-extrabold text-3xl tracking-tight">Outreach Campaigns</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Compose message templates, launch dispatches, and track real-time delivery logs.
          </p>
        </div>
        <div className="flex gap-3">
          <Link
            href="/ai-campaign-assistant"
            className="flex items-center gap-1.5 px-4.5 py-2.5 text-sm font-semibold text-purple-650 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-950/40 border border-purple-200 dark:border-purple-900/35 rounded-xl transition-all duration-200 animate-pulse-slow"
          >
            <Sparkles className="h-4 w-4" />
            AI Assistant
          </Link>
        </div>
      </div>

      {error && (
        <div className="flex items-start gap-2.5 p-4 rounded-2xl bg-red-50 dark:bg-red-950/20 border border-red-200/50 dark:border-red-900/35 text-red-700 dark:text-red-400 text-sm">
          <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {/* Campaign Cards List */}
      {campaigns.length === 0 ? (
        <div className="glass-panel p-16 rounded-[32px] border border-slate-200 dark:border-slate-800/80 text-center space-y-4 shadow-sm">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-purple-50 dark:bg-purple-950/40 text-purple-650 dark:text-purple-400">
            <Megaphone className="h-7 w-7" />
          </div>
          <div className="space-y-1">
            <h3 className="font-display font-bold text-lg text-slate-900 dark:text-white">No Campaigns Found</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
              Draft messages manually or let our AI Campaign Assistant write them for you based on objectives.
            </p>
          </div>
          <Link
            href="/ai-campaign-assistant"
            className="inline-flex items-center gap-1.5 px-5 py-2.5 text-sm font-semibold text-white bg-purple-650 hover:bg-purple-700 rounded-xl transition-colors"
          >
            <Sparkles className="h-4 w-4" /> Ask AI Assistant
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {campaigns.map((c) => (
            <div
              key={c.id}
              className="glass-panel p-6 rounded-[28px] border border-slate-200 dark:border-slate-800/80 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6 hover:scale-[1.002] transition-all"
            >
              {/* Campaign Profile info */}
              <div className="flex-1 space-y-4">
                <div className="flex flex-wrap items-center gap-3">
                  <h3 className="font-display font-bold text-lg text-slate-900 dark:text-white leading-snug">
                    {c.name}
                  </h3>
                  {getStatusBadge(c.status)}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs text-slate-500">
                  <div className="flex items-center gap-1.5">
                    <Users className="h-4 w-4 text-slate-400" />
                    <span>Segment: <strong className="text-slate-700 dark:text-slate-350">{c.segment.name}</strong> ({c.audienceSize} customers)</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Compass className="h-4 w-4 text-slate-400" />
                    <span>Channel: <strong className="text-slate-700 dark:text-slate-350">{c.channel}</strong></span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <FileText className="h-4 w-4 text-slate-400" />
                    <span>Created: <strong className="text-slate-700 dark:text-slate-350">{new Date(c.createdAt).toLocaleDateString("en-IN")}</strong></span>
                  </div>
                </div>

                <div className="bg-slate-100 dark:bg-slate-900/60 p-3.5 rounded-2xl border border-slate-200/30 dark:border-slate-850 text-xs font-mono text-slate-700 dark:text-slate-300 leading-relaxed max-w-2xl">
                  {c.message}
                </div>
              </div>

              {/* Action Launch Buttons */}
              <div className="flex md:flex-col justify-end gap-3.5">
                {c.status === "DRAFT" && (
                  <button
                    onClick={() => handleLaunch(c.id)}
                    disabled={launchingId !== null}
                    className="flex items-center gap-1.5 px-4.5 py-2.5 text-xs font-semibold text-white bg-gradient-to-r from-purple-600 to-blue-600 hover:opacity-95 shadow-md shadow-purple-500/10 rounded-xl disabled:opacity-50 transition-opacity"
                  >
                    {launchingId === c.id ? (
                      <>
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        Launching...
                      </>
                    ) : (
                      <>
                        <Play className="h-3.5 w-3.5" />
                        Launch Campaign
                      </>
                    )}
                  </button>
                )}
                {c.status !== "DRAFT" && (
                  <Link
                    href="/dashboard"
                    className="flex items-center gap-1.5 px-4.5 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-800 transition-colors"
                  >
                    View Metrics
                  </Link>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
