"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Plus, Trash2, ArrowLeft, Loader2, Sparkles, AlertCircle, Save } from "lucide-react";
import { SegmentCondition } from "@/lib/segment-query";

const FIELDS = [
  { value: "totalSpend", label: "Total Spend (₹)" },
  { value: "city", label: "City" },
  { value: "gender", label: "Gender" },
  { value: "orderCount", label: "Order Count" },
  { value: "daysSinceLastPurchase", label: "Days Since Last Purchase" },
];

const OPERATORS = [
  { value: ">", label: "Greater Than (>)" },
  { value: "<", label: "Less Than (<)" },
  { value: "=", label: "Equals (=)" },
  { value: ">=", label: "Greater Than or Equal (>=)" },
  { value: "<=", label: "Less Than or Equal (<=)" },
  { value: "contains", label: "Contains" },
];

export default function SegmentBuilderClient() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [conditions, setConditions] = useState<SegmentCondition[]>([
    { field: "totalSpend", operator: ">", value: "1000" },
  ]);

  // Preview Stats States
  const [loadingPreview, setLoadingPreview] = useState(false);
  const [previewStats, setPreviewStats] = useState<{
    audienceSize: number;
    averageSpend: number;
    estimatedReach: number;
    estimatedRevenue: number;
    preview: { id: string; name: string; email: string; city: string; totalSpend: number }[];
  } | null>(null);

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch preview when conditions change
  useEffect(() => {
    const fetchPreview = async () => {
      if (conditions.length === 0) {
        setPreviewStats(null);
        return;
      }
      setLoadingPreview(true);
      try {
        const res = await fetch("/api/segments/preview", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ conditions }),
        });
        const data = await res.json();
        if (res.ok) {
          setPreviewStats(data);
        }
      } catch (err) {
        console.error("Failed to load segment preview:", err);
      } finally {
        setLoadingPreview(false);
      }
    };

    const debounce = setTimeout(fetchPreview, 500);
    return () => clearTimeout(debounce);
  }, [conditions]);

  const addCondition = () => {
    setConditions([
      ...conditions,
      { field: "totalSpend", operator: ">", value: "0" },
    ]);
  };

  const removeCondition = (index: number) => {
    const next = [...conditions];
    next.splice(index, 1);
    setConditions(next);
  };

  const updateCondition = (index: number, key: keyof SegmentCondition, val: string) => {
    const next = [...conditions];
    next[index] = { ...next[index], [key]: val } as SegmentCondition;
    setConditions(next);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError("Segment name is required");
      return;
    }
    setSaving(true);
    setError(null);

    try {
      const res = await fetch("/api/segments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, description, conditions }),
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
      {/* Back Button */}
      <Link
        href="/segments"
        className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to segments
      </Link>

      {/* Header */}
      <div>
        <h1 className="font-display font-extrabold text-3xl tracking-tight">Manual Segment Builder</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Combine filters to isolate specific demographics and spending behaviors.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Builder Form */}
        <div className="lg:col-span-2 space-y-6">
          <form onSubmit={handleSave} className="space-y-6">
            {error && (
              <div className="flex items-start gap-2.5 p-4 rounded-2xl bg-red-50 dark:bg-red-950/20 border border-red-200/50 dark:border-red-900/35 text-red-700 dark:text-red-400 text-sm">
                <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            {/* Profile Config Card */}
            <div className="glass-panel p-6 rounded-3xl border border-slate-200 dark:border-slate-800/80 shadow-sm space-y-4">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-450 dark:text-slate-500">
                Segment Profile
              </h3>
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">Segment Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Inactive Bangalore High Spenders"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="block w-full px-4 py-2.5 text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">Description</label>
                  <textarea
                    rows={2}
                    placeholder="Describe the business purpose of this segment..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="block w-full px-4 py-2.5 text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all resize-none"
                  />
                </div>
              </div>
            </div>

            {/* Conditions Card */}
            <div className="glass-panel p-6 rounded-3xl border border-slate-200 dark:border-slate-800/80 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-850 pb-4">
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-450 dark:text-slate-500">
                  Filter Conditions
                </h3>
                <button
                  type="button"
                  onClick={addCondition}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-purple-650 dark:text-purple-400 hover:underline"
                >
                  <Plus className="h-4 w-4" /> Add Rule
                </button>
              </div>

              {conditions.length === 0 ? (
                <p className="text-center text-sm text-slate-500 dark:text-slate-400 py-6">
                  No filter rules defined. This segment will match all customers.
                </p>
              ) : (
                <div className="space-y-4">
                  {conditions.map((cond, idx) => (
                    <div key={idx} className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
                      {/* Field Selection */}
                      <select
                        value={cond.field}
                        onChange={(e) => updateCondition(idx, "field", e.target.value)}
                        className="block w-full sm:w-1/3 px-3.5 py-2 text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none"
                      >
                        {FIELDS.map((f) => (
                          <option key={f.value} value={f.value}>
                            {f.label}
                          </option>
                        ))}
                      </select>

                      {/* Operator Selection */}
                      <select
                        value={cond.operator}
                        onChange={(e) => updateCondition(idx, "operator", e.target.value)}
                        className="block w-full sm:w-1/4 px-3.5 py-2 text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none"
                      >
                        {OPERATORS.map((op) => (
                          <option key={op.value} value={op.value}>
                            {op.label}
                          </option>
                        ))}
                      </select>

                      {/* Value Input */}
                      <input
                        type="text"
                        required
                        value={cond.value}
                        onChange={(e) => updateCondition(idx, "value", e.target.value)}
                        className="block w-full sm:flex-1 px-3.5 py-2 text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none"
                        placeholder="e.g. Bangalore or 5000"
                      />

                      {/* Delete Action */}
                      <button
                        type="button"
                        onClick={() => removeCondition(idx)}
                        className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-xl transition-colors"
                        title="Delete Condition"
                      >
                        <Trash2 className="h-4.5 w-4.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex gap-4">
              <button
                type="submit"
                disabled={saving}
                className="flex items-center gap-1.5 px-5 py-3 text-sm font-semibold text-white bg-gradient-to-r from-purple-600 to-blue-600 hover:opacity-95 shadow-md shadow-purple-500/10 rounded-xl disabled:opacity-50 transition-opacity"
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
          </form>
        </div>

        {/* Live Audience Preview Sidebar */}
        <div className="space-y-6">
          <div className="glass-panel p-6 rounded-3xl border border-slate-200 dark:border-slate-800/80 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/5 dark:bg-purple-900/10 rounded-full filter blur-xl pointer-events-none"></div>

            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-850 pb-4 mb-6">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-450 dark:text-slate-500">
                Audience Preview
              </h3>
              {loadingPreview && <Loader2 className="h-4.5 w-4.5 text-purple-600 dark:text-purple-400 animate-spin" />}
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

                <div className="space-y-1.5 p-4 bg-purple-50/40 dark:bg-purple-950/20 border border-purple-200/30 dark:border-purple-900/30 rounded-2xl">
                  <span className="text-[10px] font-bold text-purple-650 dark:text-purple-400 uppercase tracking-wider block">
                    Revenue Potential
                  </span>
                  <div className="flex items-baseline gap-1 mt-1">
                    <span className="text-2xl font-extrabold tracking-tight text-purple-700 dark:text-purple-400">
                      ₹{previewStats.estimatedRevenue.toLocaleString("en-IN")}
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-400 block mt-1">
                    Averaging ₹{previewStats.averageSpend.toLocaleString("en-IN")} per buyer
                  </span>
                </div>

                {/* Customer List Preview */}
                <div className="space-y-3.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 block">
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
                            <span className="text-[10px] text-slate-400 truncate">{c.city}</span>
                          </div>
                          <span className="font-bold text-slate-700 dark:text-slate-300">
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
                Define filter conditions to estimate segment reach.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
