import React from "react";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Layers, Plus, Megaphone, User, Sparkles } from "lucide-react";
import { SegmentCondition } from "@/lib/segment-query";

export const revalidate = 0;

export default async function SegmentsPage() {
  // Fetch segments with creator and count of campaigns
  const segments = await prisma.segment.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      creator: { select: { name: true } },
      _count: { select: { campaigns: true } },
    },
  });

  return (
    <div className="space-y-8 text-foreground bg-background">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display font-extrabold text-3xl tracking-tight text-foreground">Customer Segments</h1>
          <p className="text-sm text-foreground/60 mt-1">
            Build and manage manual or AI-generated audience targets.
          </p>
        </div>
        <div className="flex gap-3">
          <Link
            href="/ai-segment-builder"
            className="flex items-center gap-1.5 px-4.5 py-2.5 text-sm font-semibold text-foreground hover:bg-foreground/5 rounded-xl border border-border transition-colors"
          >
            <Sparkles className="h-4 w-4" />
            AI Builder
          </Link>
          <Link
            href="/segments/new"
            className="flex items-center gap-1.5 px-4.5 py-2.5 text-sm font-semibold text-background bg-foreground hover:opacity-90 rounded-xl transition-all duration-200"
          >
            <Plus className="h-4 w-4" />
            Create Segment
          </Link>
        </div>
      </div>

      {/* Grid List */}
      {segments.length === 0 ? (
        <div className="bg-card p-16 rounded-2xl border border-border text-center space-y-4 shadow-sm">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-lg bg-foreground/5 border border-border text-foreground">
            <Layers className="h-7 w-7" />
          </div>
          <div className="space-y-1">
            <h3 className="font-display font-bold text-lg text-foreground">No Segments Created</h3>
            <p className="text-sm text-foreground/60 max-w-sm mx-auto">
              Create audience groups based on criteria or write natural language prompts using our AI builder.
            </p>
          </div>
          <Link
            href="/segments/new"
            className="inline-flex items-center gap-1 px-4.5 py-2.5 text-sm font-semibold text-background bg-foreground hover:opacity-90 rounded-xl transition-colors"
          >
            Build First Segment
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {segments.map((seg) => {
            const conditionsParsed = JSON.parse(seg.conditions as string);
            return (
              <div
                key={seg.id}
                className="bg-card p-6 rounded-2xl border border-border shadow-sm flex flex-col justify-between hover:scale-[1.01] transition-transform duration-200"
              >
                <div className="space-y-4">
                  <div>
                    <h3 className="font-display font-bold text-lg text-foreground leading-snug">
                      {seg.name}
                    </h3>
                    {seg.description && (
                      <p className="text-xs text-foreground/60 mt-1 line-clamp-2 leading-relaxed">
                        {seg.description}
                      </p>
                    )}
                  </div>

                  {/* Conditions Pills */}
                  <div className="flex flex-wrap gap-1.5">
                    {conditionsParsed.map((cond: SegmentCondition, idx: number) => (
                      <span
                        key={idx}
                        className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-semibold bg-foreground/5 text-foreground/80 border border-border"
                      >
                        {cond.field} {cond.operator} {cond.value}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Footer Metrics */}
                <div className="border-t border-border pt-4 mt-6 flex justify-between items-center text-xs text-foreground/55">
                  <div className="flex items-center gap-1.5">
                    <Megaphone className="h-3.5 w-3.5" />
                    <span>{seg._count.campaigns} campaigns</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <User className="h-3.5 w-3.5" />
                    <span>{seg.creator?.name || "System"}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
