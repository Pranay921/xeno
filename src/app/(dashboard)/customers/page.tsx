import React from "react";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Search, MapPin, Filter, Calendar, ArrowUpRight, UserPlus } from "lucide-react";

type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>;

export const revalidate = 0;

export default async function CustomersPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;
  const searchQuery = (params.search as string) || "";
  const selectedCity = (params.city as string) || "";
  const selectedGender = (params.gender as string) || "";

  // Query unique cities for filter dropdown
  const citiesResult = await prisma.customer.findMany({
    select: { city: true },
    distinct: ["city"],
  });
  const cities = citiesResult.map((c) => c.city).sort();

  // Build prisma filter query
  const whereClause = {
    AND: [
      searchQuery
        ? {
            OR: [
              { name: { contains: searchQuery, mode: "insensitive" as const } },
              { email: { contains: searchQuery, mode: "insensitive" as const } },
              { phone: { contains: searchQuery, mode: "insensitive" as const } },
            ],
          }
        : {},
      selectedCity ? { city: selectedCity } : {},
      selectedGender ? { gender: selectedGender } : {},
    ],
  };

  // Fetch customers matching criteria
  const customers = await prisma.customer.findMany({
    where: whereClause,
    orderBy: { totalSpend: "desc" },
    take: 100, // Limit for UI performance
  });

  return (
    <div className="space-y-8 text-foreground bg-background">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display font-extrabold text-3xl tracking-tight text-foreground">Customer Database</h1>
          <p className="text-sm text-foreground/60 mt-1">
            Browse profile histories, spending, and interaction timeline metrics.
          </p>
        </div>
        <div>
          <Link
            href="/customers/new"
            className="flex items-center gap-1.5 px-4.5 py-2.5 text-sm font-semibold text-background bg-foreground hover:opacity-90 rounded-xl transition-all duration-200"
          >
            <UserPlus className="h-4 w-4" /> Add Customer
          </Link>
        </div>
      </div>

      {/* Filter / Search Bar */}
      <div className="bg-card p-6 rounded-2xl border border-border shadow-sm">
        <form method="GET" className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search Input */}
          <div className="relative md:col-span-2">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-foreground/45">
              <Search className="h-4.5 w-4.5" />
            </div>
            <input
              type="text"
              name="search"
              placeholder="Search by name, email, or phone..."
              defaultValue={searchQuery}
              className="block w-full pl-10 pr-4 py-2.5 text-sm bg-background border border-border rounded-xl focus:outline-none focus:border-foreground/50 text-foreground transition-all"
            />
          </div>

          {/* City Filter */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-foreground/45">
              <MapPin className="h-4.5 w-4.5" />
            </div>
            <select
              name="city"
              defaultValue={selectedCity}
              className="block w-full pl-10 pr-4 py-2.5 text-sm bg-background border border-border rounded-xl focus:outline-none focus:border-foreground/50 text-foreground transition-all appearance-none"
            >
              <option value="">All Cities</option>
              {cities.map((city) => (
                <option key={city} value={city}>
                  {city}
                </option>
              ))}
            </select>
          </div>

          {/* Gender Filter */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-foreground/45">
              <Filter className="h-4.5 w-4.5" />
            </div>
            <select
              name="gender"
              defaultValue={selectedGender}
              className="block w-full pl-10 pr-4 py-2.5 text-sm bg-background border border-border rounded-xl focus:outline-none focus:border-foreground/50 text-foreground transition-all appearance-none"
            >
              <option value="">All Genders</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
          </div>

          {/* Submit Button */}
          <button type="submit" className="hidden" />
          
          {/* Quick Apply Reset */}
          {(searchQuery || selectedCity || selectedGender) && (
            <div className="md:col-span-4 flex justify-end">
              <Link
                href="/customers"
                className="text-xs font-semibold text-foreground/70 hover:text-foreground hover:underline"
              >
                Clear Filters
              </Link>
            </div>
          )}
        </form>
      </div>

      {/* Customer List Table */}
      <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-border bg-foreground/5 text-foreground/60 text-xs uppercase tracking-wider font-semibold">
                <th className="px-6 py-4">Customer Details</th>
                <th className="px-6 py-4">Location</th>
                <th className="px-6 py-4">Gender</th>
                <th className="px-6 py-4 text-right">Total Spend</th>
                <th className="px-6 py-4 text-right">Last Purchase</th>
                <th className="px-6 py-4"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border text-sm">
              {customers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-foreground/60">
                    No customers found matching the search criteria.
                  </td>
                </tr>
              ) : (
                customers.map((c) => (
                  <tr key={c.id} className="hover:bg-foreground/5 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-foreground/5 border border-border text-foreground font-bold text-xs uppercase">
                          {c.name.split(" ").map(n => n[0]).join("")}
                        </div>
                        <div className="flex flex-col">
                          <span className="font-semibold text-foreground">{c.name}</span>
                          <span className="text-xs text-foreground/60">{c.email}</span>
                          {c.phone && <span className="text-[11px] text-foreground/45 mt-0.5">{c.phone}</span>}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-foreground/80">
                      <div className="flex items-center gap-1.5">
                        <MapPin className="h-3.5 w-3.5 text-foreground/50" />
                        {c.city}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-foreground/80">{c.gender}</td>
                    <td className="px-6 py-4 text-right font-semibold text-foreground">
                      ₹{c.totalSpend.toLocaleString("en-IN")}
                    </td>
                    <td className="px-6 py-4 text-right text-foreground/60">
                      {c.lastPurchaseDate ? (
                        <div className="flex items-center justify-end gap-1 text-xs">
                          <Calendar className="h-3.5 w-3.5 text-foreground/50" />
                          {new Date(c.lastPurchaseDate).toLocaleDateString("en-IN", {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          })}
                        </div>
                      ) : (
                        "-"
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link
                        href={`/customers/${c.id}`}
                        className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-foreground border border-border hover:bg-foreground/5 rounded-lg transition-colors"
                      >
                        Timeline
                        <ArrowUpRight className="h-3.5 w-3.5" />
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
