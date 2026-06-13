"use client";

import React from "react";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

type ChartDataProps = {
  revenueTrend: { date: string; revenue: number }[];
  campaignPerformance: { name: string; sent: number; converted: number }[];
  channelPerformance: { name: string; value: number }[];
  funnelData: { name: string; count: number; percentage: number }[];
};

const COLORS = ["#8b5cf6", "#3b82f6", "#10b981", "#f59e0b", "#ef4444"];

export default function DashboardCharts({
  revenueTrend,
  campaignPerformance,
  channelPerformance,
  funnelData,
}: ChartDataProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Revenue Trend Area Chart */}
      <div className="glass-panel p-6 rounded-3xl border border-slate-200 dark:border-slate-800/80 shadow-sm">
        <h3 className="text-base font-bold text-slate-850 dark:text-slate-200 mb-6 font-display">
          Revenue Trend (Last 30 Days)
        </h3>
        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={revenueTrend}>
              <defs>
                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" className="stroke-slate-200 dark:stroke-slate-800" />
              <XAxis dataKey="date" className="text-xs fill-slate-500" />
              <YAxis className="text-xs fill-slate-500" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "rgba(15, 23, 42, 0.9)",
                  borderColor: "rgba(139, 92, 246, 0.2)",
                  color: "#fff",
                  borderRadius: "12px",
                }}
              />
              <Area type="monotone" dataKey="revenue" stroke="#8b5cf6" strokeWidth={2} fillOpacity={1} fill="url(#colorRevenue)" name="Revenue (₹)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Campaign Performance Bar Chart */}
      <div className="glass-panel p-6 rounded-3xl border border-slate-200 dark:border-slate-800/80 shadow-sm">
        <h3 className="text-base font-bold text-slate-850 dark:text-slate-200 mb-6 font-display">
          Campaign Outreach vs Conversion
        </h3>
        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={campaignPerformance}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-slate-200 dark:stroke-slate-800" />
              <XAxis dataKey="name" className="text-xs fill-slate-500" />
              <YAxis className="text-xs fill-slate-500" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "rgba(15, 23, 42, 0.9)",
                  borderColor: "rgba(59, 130, 246, 0.2)",
                  color: "#fff",
                  borderRadius: "12px",
                }}
              />
              <Legend wrapperStyle={{ fontSize: "12px" }} />
              <Bar dataKey="sent" fill="#3b82f6" radius={[4, 4, 0, 0]} name="Messages Sent" />
              <Bar dataKey="converted" fill="#10b981" radius={[4, 4, 0, 0]} name="Converted Customers" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Channel Performance Donut Chart */}
      <div className="glass-panel p-6 rounded-3xl border border-slate-200 dark:border-slate-800/80 shadow-sm">
        <h3 className="text-base font-bold text-slate-850 dark:text-slate-200 mb-6 font-display">
          Outreach Channels Distribution
        </h3>
        <div className="h-80 w-full flex items-center justify-center">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={channelPerformance}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={90}
                paddingAngle={5}
                dataKey="value"
              >
                {channelPerformance.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: "rgba(15, 23, 42, 0.9)",
                  borderColor: "rgba(255, 255, 255, 0.1)",
                  color: "#fff",
                  borderRadius: "12px",
                }}
              />
              <Legend wrapperStyle={{ fontSize: "12px" }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Funnel Performance Bar Chart */}
      <div className="glass-panel p-6 rounded-3xl border border-slate-200 dark:border-slate-800/80 shadow-sm">
        <h3 className="text-base font-bold text-slate-850 dark:text-slate-200 mb-6 font-display">
          Outreach Conversion Funnel
        </h3>
        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              layout="vertical"
              data={funnelData}
              margin={{ top: 20, right: 30, left: 40, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" className="stroke-slate-200 dark:stroke-slate-800" />
              <XAxis type="number" className="text-xs fill-slate-500" />
              <YAxis dataKey="name" type="category" className="text-xs fill-slate-500" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "rgba(15, 23, 42, 0.9)",
                  borderColor: "rgba(255, 255, 255, 0.1)",
                  color: "#fff",
                  borderRadius: "12px",
                }}
              />
              <Bar dataKey="count" fill="#8b5cf6" radius={[0, 4, 4, 0]} name="Count">
                {funnelData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
