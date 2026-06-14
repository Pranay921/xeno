"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Loader2, UserPlus, AlertCircle } from "lucide-react";

export default function NewCustomerPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [city, setCity] = useState("Delhi");
  const [gender, setGender] = useState("Male");
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) {
      setError("Name and Email are required");
      return;
    }
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/customers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, phone, city, gender }),
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to create customer");
      }

      router.push("/customers");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to register customer");
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 text-foreground bg-background">
      {/* Back Button */}
      <Link
        href="/customers"
        className="inline-flex items-center gap-1.5 text-sm font-semibold text-foreground/60 hover:text-foreground transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to customer database
      </Link>

      {/* Header */}
      <div>
        <h1 className="font-display font-extrabold text-3xl tracking-tight flex items-center gap-2.5 text-foreground">
          <UserPlus className="h-8 w-8 text-foreground" />
          Add New Customer
        </h1>
        <p className="text-sm text-foreground/60 mt-1">
          Create a new profile details card inside CRM customer index.
        </p>
      </div>

      <div className="max-w-2xl">
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="flex items-start gap-2.5 p-4 rounded-2xl bg-red-50 dark:bg-red-950/20 border border-red-200/50 dark:border-red-900/35 text-red-700 dark:text-red-400 text-sm">
              <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <div className="bg-card p-8 rounded-2xl border border-border shadow-sm space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* Full Name */}
              <div className="space-y-1.5 sm:col-span-2">
                <label className="text-xs font-semibold text-foreground/70">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Pranay Gupta"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="block w-full px-4 py-2.5 text-sm bg-background border border-border rounded-xl focus:outline-none focus:border-foreground/50 text-foreground transition-all"
                />
              </div>

              {/* Email */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground/70">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  placeholder="e.g. pranay@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full px-4 py-2.5 text-sm bg-background border border-border rounded-xl focus:outline-none focus:border-foreground/50 text-foreground transition-all"
                />
              </div>

              {/* Phone */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground/70">
                  Phone Number (Optional)
                </label>
                <input
                  type="tel"
                  placeholder="e.g. +919876543210"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="block w-full px-4 py-2.5 text-sm bg-background border border-border rounded-xl focus:outline-none focus:border-foreground/50 text-foreground transition-all"
                />
              </div>

              {/* City Selection */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground/70">
                  City Location
                </label>
                <select
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="block w-full px-4 py-2.5 text-sm bg-background border border-border rounded-xl focus:outline-none focus:border-foreground/50 text-foreground transition-all"
                >
                  <option value="Delhi">Delhi</option>
                  <option value="Mumbai">Mumbai</option>
                  <option value="Bangalore">Bangalore</option>
                  <option value="Hyderabad">Hyderabad</option>
                  <option value="Pune">Pune</option>
                </select>
              </div>

              {/* Gender Selection */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground/70">
                  Gender
                </label>
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                  className="block w-full px-4 py-2.5 text-sm bg-background border border-border rounded-xl focus:outline-none focus:border-foreground/50 text-foreground transition-all"
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3.5 pt-4 border-t border-border">
              <Link
                href="/customers"
                className="px-5 py-2.5 text-sm font-semibold text-foreground hover:bg-foreground/5 rounded-xl border border-border transition-colors"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={loading}
                className="flex items-center gap-1.5 px-5 py-2.5 text-sm font-semibold text-background bg-foreground hover:opacity-90 rounded-xl disabled:opacity-50 transition-opacity cursor-pointer"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4.5 w-4.5 animate-spin" />
                    Registering Customer...
                  </>
                ) : (
                  "Add Customer"
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
