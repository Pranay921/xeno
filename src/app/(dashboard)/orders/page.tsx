import React from "react";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { ShoppingBag, Calendar, User, Search, TrendingUp } from "lucide-react";

type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>;

export const revalidate = 0;

export default async function OrdersPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;
  const searchQuery = (params.search as string) || "";

  // Build filter query
  const whereClause = searchQuery
    ? {
        OR: [
          { productName: { contains: searchQuery, mode: "insensitive" as const } },
          { customer: { name: { contains: searchQuery, mode: "insensitive" as const } } },
        ],
      }
    : {};

  // Fetch orders
  const orders = await prisma.order.findMany({
    where: whereClause,
    orderBy: { orderDate: "desc" },
    include: {
      customer: {
        select: { id: true, name: true, email: true },
      },
    },
    take: 100, // Limit for layout performance
  });

  // Calculate aggregations
  const totalOrders = orders.length;
  const totalAmount = orders.reduce((sum, order) => sum + order.amount, 0);
  const averageValue = totalOrders > 0 ? totalAmount / totalOrders : 0;

  return (
    <div className="space-y-8">
      {/* Title */}
      <div>
        <h1 className="font-display font-extrabold text-3xl tracking-tight">Order Logs</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Review recent transactions and calculate shopping metrics.
        </p>
      </div>

      {/* Aggregate Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-panel p-6 rounded-3xl border border-slate-200 dark:border-slate-800/80 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-450 dark:text-slate-500">
              Total Order Transactions
            </span>
            <h2 className="text-2xl font-extrabold tracking-tight">{totalOrders}</h2>
          </div>
          <div className="p-3 bg-purple-100 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 rounded-2xl">
            <ShoppingBag className="h-5 w-5" />
          </div>
        </div>

        <div className="glass-panel p-6 rounded-3xl border border-slate-200 dark:border-slate-800/80 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-450 dark:text-slate-500">
              Aggregated Revenue (Filtered)
            </span>
            <h2 className="text-2xl font-extrabold tracking-tight text-emerald-600 dark:text-emerald-400">
              ₹{Math.round(totalAmount).toLocaleString("en-IN")}
            </h2>
          </div>
          <div className="p-3 bg-emerald-100 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 rounded-2xl">
            <TrendingUp className="h-5 w-5" />
          </div>
        </div>

        <div className="glass-panel p-6 rounded-3xl border border-slate-200 dark:border-slate-800/80 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-450 dark:text-slate-500">
              Average Order Value (AOV)
            </span>
            <h2 className="text-2xl font-extrabold tracking-tight">
              ₹{Math.round(averageValue).toLocaleString("en-IN")}
            </h2>
          </div>
          <div className="p-3 bg-blue-100 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 rounded-2xl">
            <ShoppingBag className="h-5 w-5" />
          </div>
        </div>
      </div>

      {/* Filter / Search Bar */}
      <div className="glass-panel p-6 rounded-3xl border border-slate-200 dark:border-slate-800/80 shadow-sm">
        <form method="GET" className="relative">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
            <Search className="h-4.5 w-4.5" />
          </div>
          <input
            type="text"
            name="search"
            placeholder="Search by product name or customer name..."
            defaultValue={searchQuery}
            className="block w-full pl-10.5 pr-4 py-2.5 text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all"
          />
        </form>
      </div>

      {/* Table */}
      <div className="glass-panel rounded-3xl border border-slate-200 dark:border-slate-800/80 shadow-sm overflow-hidden">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-500/5 text-slate-400 text-xs uppercase tracking-wider font-semibold">
                <th className="px-6 py-4">Product Name</th>
                <th className="px-6 py-4">Customer Name</th>
                <th className="px-6 py-4 text-right">Price</th>
                <th className="px-6 py-4 text-center">Quantity</th>
                <th className="px-6 py-4 text-right">Total Amount</th>
                <th className="px-6 py-4 text-right">Order Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800 text-sm">
              {orders.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-500 dark:text-slate-400">
                    No orders found matching parameters.
                  </td>
                </tr>
              ) : (
                orders.map((o) => (
                  <tr key={o.id} className="hover:bg-slate-500/5 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-purple-50 dark:bg-purple-950/40 text-purple-650 dark:text-purple-400 rounded-xl">
                          <ShoppingBag className="h-4 w-4" />
                        </div>
                        <span className="font-semibold text-slate-800 dark:text-slate-200">{o.productName}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <Link
                        href={`/customers/${o.customer.id}`}
                        className="flex items-center gap-1.5 font-medium text-purple-600 dark:text-purple-400 hover:underline"
                      >
                        <User className="h-3.5 w-3.5" />
                        {o.customer.name}
                      </Link>
                    </td>
                    <td className="px-6 py-4 text-right">
                      ₹{Math.round(o.amount / o.quantity).toLocaleString("en-IN")}
                    </td>
                    <td className="px-6 py-4 text-center">{o.quantity}</td>
                    <td className="px-6 py-4 text-right font-semibold text-slate-800 dark:text-slate-200">
                      ₹{o.amount.toLocaleString("en-IN")}
                    </td>
                    <td className="px-6 py-4 text-right text-slate-550 dark:text-slate-400">
                      <div className="flex items-center justify-end gap-1.5 text-xs">
                        <Calendar className="h-3.5 w-3.5 text-slate-400" />
                        {new Date(o.orderDate).toLocaleDateString("en-IN", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
                      </div>
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
