"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Megaphone,
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
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong while launching the campaign");
    } finally {
      setLaunchingId(null);
    }
  };

  const getStatusBadge = (status: Campaign["status"]) => {
    switch (status) {
      case "COMPLETED":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-foreground/5 text-foreground border border-border">
            <CheckCircle className="h-3.5 w-3.5" />
            Completed
          </span>
        );
      case "RUNNING":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-foreground/10 text-foreground border border-border">
            <Send className="h-3.5 w-3.5" />
            Running
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-foreground/5 text-foreground/60 border border-border">
            <Clock className="h-3.5 w-3.5" />
            Draft
          </span>
        );
    }
  };

  return (
    <div className="space-y-8 text-foreground bg-background">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display font-extrabold text-3xl tracking-tight text-foreground">Outreach Campaigns</h1>
          <p className="text-sm text-foreground/60 mt-1">
            Compose message templates, launch dispatches, and track real-time delivery logs.
          </p>
        </div>
        <div className="flex gap-3">
          <Link
            href="/ai-campaign-assistant"
            className="flex items-center gap-1.5 px-4.5 py-2.5 text-sm font-semibold text-background bg-foreground hover:opacity-90 rounded-xl transition-all duration-200 cursor-pointer"
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
        <div className="bg-card p-16 rounded-2xl border border-border text-center space-y-4 shadow-sm">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-lg bg-foreground/5 border border-border text-foreground">
            <Megaphone className="h-7 w-7" />
          </div>
          <div className="space-y-1">
            <h3 className="font-display font-bold text-lg text-foreground">No Campaigns Found</h3>
            <p className="text-sm text-foreground/60 max-w-sm mx-auto">
              Draft messages manually or let our AI Campaign Assistant write them for you based on objectives.
            </p>
          </div>
          <Link
            href="/ai-campaign-assistant"
            className="inline-flex items-center gap-1.5 px-5 py-2.5 text-sm font-semibold text-background bg-foreground hover:opacity-90 rounded-xl transition-colors cursor-pointer"
          >
            <Sparkles className="h-4 w-4" /> Ask AI Assistant
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {campaigns.map((c) => (
            <div
              key={c.id}
              className="bg-card p-6 rounded-2xl border border-border shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6 hover:scale-[1.002] transition-all"
            >
              {/* Campaign Profile info */}
              <div className="flex-1 space-y-4">
                <div className="flex flex-wrap items-center gap-3">
                  <h3 className="font-display font-bold text-lg text-foreground leading-snug">
                    {c.name}
                  </h3>
                  {getStatusBadge(c.status)}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs text-foreground/60">
                  <div className="flex items-center gap-1.5">
                    <Users className="h-4 w-4 text-foreground/45" />
                    <span>Segment: <strong className="text-foreground font-semibold">{c.segment.name}</strong> ({c.audienceSize} customers)</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Compass className="h-4 w-4 text-foreground/45" />
                    <span>Channel: <strong className="text-foreground font-semibold">{c.channel}</strong></span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <FileText className="h-4 w-4 text-foreground/45" />
                    <span>Created: <strong className="text-foreground font-semibold">{new Date(c.createdAt).toLocaleDateString("en-IN")}</strong></span>
                  </div>
                </div>

                <div className="bg-background p-3.5 rounded-xl border border-border text-xs font-mono text-foreground/80 leading-relaxed max-w-2xl">
                  {c.message}
                </div>
              </div>

              {/* Action Launch Buttons */}
              <div className="flex md:flex-col justify-end gap-3.5">
                {c.status === "DRAFT" && (
                  <button
                    onClick={() => handleLaunch(c.id)}
                    disabled={launchingId !== null}
                    className="flex items-center gap-1.5 px-4.5 py-2.5 text-xs font-semibold text-background bg-foreground hover:opacity-90 rounded-xl disabled:opacity-50 transition-opacity cursor-pointer animate-pulse"
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
                    className="flex items-center gap-1.5 px-4.5 py-2.5 text-xs font-semibold text-foreground hover:bg-foreground/5 rounded-xl border border-border transition-colors cursor-pointer"
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
