"use client";

import React from "react";
import { useTheme } from "@/app/providers";
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

export default function DashboardCharts({
  revenueTrend,
  campaignPerformance,
  channelPerformance,
  funnelData,
}: ChartDataProps) {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  // Minimalist beige-white-black monochrome palettes
  const colors = isDark
    ? ["#f2efe6", "#a8a396", "#7c776c", "#504d45", "#222222"]
    : ["#111111", "#7c776c", "#a8a396", "#d5d0c3", "#e6e3da"];

  const strokeColor = isDark ? "#222222" : "#e6e3da";
  const textColor = isDark ? "#a8a396" : "#7c776c";
  const tooltipBg = isDark ? "#141414" : "#ffffff";
  const tooltipBorder = isDark ? "#222222" : "#e6e3da";
  const tooltipText = isDark ? "#f2efe6" : "#111111";
  
  const primaryBrandColor = isDark ? "#f2efe6" : "#111111";
  const secondaryBrandColor = isDark ? "#7c776c" : "#a8a396";

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Revenue Trend Area Chart */}
      <div className="bg-card p-6 rounded-2xl border border-border shadow-sm">
        <h3 className="text-base font-bold text-foreground mb-6 font-display">
          Revenue Trend (Last 30 Days)
        </h3>
        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={revenueTrend}>
              <defs>
                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={primaryBrandColor} stopOpacity={0.15} />
                  <stop offset="95%" stopColor={primaryBrandColor} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke={strokeColor} />
              <XAxis dataKey="date" stroke={textColor} style={{ fontSize: "11px" }} tickLine={false} />
              <YAxis stroke={textColor} style={{ fontSize: "11px" }} tickLine={false} />
              <Tooltip
                contentStyle={{
                  backgroundColor: tooltipBg,
                  borderColor: tooltipBorder,
                  color: tooltipText,
                  borderRadius: "8px",
                }}
              />
              <Area type="monotone" dataKey="revenue" stroke={primaryBrandColor} strokeWidth={2} fillOpacity={1} fill="url(#colorRevenue)" name="Revenue (₹)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Campaign Performance Bar Chart */}
      <div className="bg-card p-6 rounded-2xl border border-border shadow-sm">
        <h3 className="text-base font-bold text-foreground mb-6 font-display">
          Campaign Outreach vs Conversion
        </h3>
        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={campaignPerformance}>
              <CartesianGrid strokeDasharray="3 3" stroke={strokeColor} />
              <XAxis dataKey="name" stroke={textColor} style={{ fontSize: "11px" }} tickLine={false} />
              <YAxis stroke={textColor} style={{ fontSize: "11px" }} tickLine={false} />
              <Tooltip
                contentStyle={{
                  backgroundColor: tooltipBg,
                  borderColor: tooltipBorder,
                  color: tooltipText,
                  borderRadius: "8px",
                }}
              />
              <Legend wrapperStyle={{ fontSize: "12px" }} />
              <Bar dataKey="sent" fill={primaryBrandColor} radius={[2, 2, 0, 0]} name="Messages Sent" />
              <Bar dataKey="converted" fill={secondaryBrandColor} radius={[2, 2, 0, 0]} name="Converted Customers" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Channel Performance Donut Chart */}
      <div className="bg-card p-6 rounded-2xl border border-border shadow-sm">
        <h3 className="text-base font-bold text-foreground mb-6 font-display">
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
                  <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: tooltipBg,
                  borderColor: tooltipBorder,
                  color: tooltipText,
                  borderRadius: "8px",
                }}
              />
              <Legend wrapperStyle={{ fontSize: "12px" }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Funnel Performance Bar Chart */}
      <div className="bg-card p-6 rounded-2xl border border-border shadow-sm">
        <h3 className="text-base font-bold text-foreground mb-6 font-display">
          Outreach Conversion Funnel
        </h3>
        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              layout="vertical"
              data={funnelData}
              margin={{ top: 20, right: 30, left: 40, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke={strokeColor} />
              <XAxis type="number" stroke={textColor} style={{ fontSize: "11px" }} tickLine={false} />
              <YAxis dataKey="name" type="category" stroke={textColor} style={{ fontSize: "11px" }} tickLine={false} />
              <Tooltip
                contentStyle={{
                  backgroundColor: tooltipBg,
                  borderColor: tooltipBorder,
                  color: tooltipText,
                  borderRadius: "8px",
                }}
              />
              <Bar dataKey="count" fill={primaryBrandColor} radius={[0, 2, 2, 0]} name="Count">
                {funnelData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
