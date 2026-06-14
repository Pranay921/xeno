import React from "react";
import { prisma } from "@/lib/prisma";
import DashboardCharts from "@/components/dashboard/dashboard-charts";
import {
  Users,
  ShoppingBag,
  DollarSign,
  Megaphone,
  Send,
  CheckCircle,
  Eye,
  MousePointerClick,
  TrendingUp,
} from "lucide-react";

export const revalidate = 0; // Disable caching for real-time dashboards

export default async function DashboardPage() {
  // Fetch key stats
  const totalCustomers = await prisma.customer.count();
  const totalOrders = await prisma.order.count();
  const revenueResult = await prisma.order.aggregate({
    _sum: { amount: true },
  });
  const totalRevenue = revenueResult._sum.amount || 0;
  const totalCampaigns = await prisma.campaign.count();

  // Communication status counts
  const sentCount = await prisma.communication.count();
  const deliveredCount = await prisma.communication.count({
    where: { status: { in: ["delivered", "opened", "clicked", "converted"] } },
  });
  const openedCount = await prisma.communication.count({
    where: { status: { in: ["opened", "clicked", "converted"] } },
  });
  const clickedCount = await prisma.communication.count({
    where: { status: { in: ["clicked", "converted"] } },
  });
  const convertedCount = await prisma.communication.count({
    where: { status: "converted" },
  });

  // Calculate Rates
  const deliveryRate = sentCount > 0 ? (deliveredCount / sentCount) * 100 : 0;
  const openRate = deliveredCount > 0 ? (openedCount / deliveredCount) * 100 : 0;
  const clickRate = openedCount > 0 ? (clickedCount / openedCount) * 100 : 0;
  const conversionRate = clickedCount > 0 ? (convertedCount / clickedCount) * 100 : 0;

  // 1. Revenue trend (last 30 days)
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const dailyRevenue = await prisma.order.groupBy({
    by: ["orderDate"],
    where: { orderDate: { gte: thirtyDaysAgo } },
    _sum: { amount: true },
    orderBy: { orderDate: "asc" },
  });

  // Map daily revenue to chart format
  const revenueMap = new Map<string, number>();
  dailyRevenue.forEach((item) => {
    const dateStr = new Date(item.orderDate).toLocaleDateString("en-IN", {
      month: "short",
      day: "numeric",
    });
    revenueMap.set(dateStr, (revenueMap.get(dateStr) || 0) + (item._sum.amount || 0));
  });
  const revenueTrend = Array.from(revenueMap.entries()).map(([date, revenue]) => ({
    date,
    revenue: Math.round(revenue),
  }));

  // 2. Campaign performance (top 5 campaigns)
  const campaignsList = await prisma.campaign.findMany({
    take: 5,
    orderBy: { createdAt: "desc" },
    include: {
      communications: true,
    },
  });

  const campaignPerformance = campaignsList.map((c) => {
    const sent = c.communications.length;
    const converted = c.communications.filter((comm) => comm.status === "converted").length;
    return {
      name: c.name.length > 15 ? c.name.slice(0, 15) + "..." : c.name,
      sent,
      converted,
    };
  });

  // 3. Channel distribution
  const channelsGroup = await prisma.campaign.groupBy({
    by: ["channel"],
    _count: { _all: true },
  });

  const channelPerformance = channelsGroup.map((item) => ({
    name: item.channel,
    value: item._count._all,
  }));

  // If empty, supply placeholder data
  const finalChannelPerformance = channelPerformance.length > 0
    ? channelPerformance
    : [
        { name: "Email", value: 1 },
        { name: "SMS", value: 1 },
        { name: "WhatsApp", value: 1 },
      ];

  // 4. Campaign Funnel
  const funnelData = [
    { name: "Sent", count: sentCount, percentage: 100 },
    { name: "Delivered", count: deliveredCount, percentage: sentCount > 0 ? Math.round((deliveredCount / sentCount) * 100) : 0 },
    { name: "Opened", count: openedCount, percentage: deliveredCount > 0 ? Math.round((openedCount / deliveredCount) * 100) : 0 },
    { name: "Clicked", count: clickedCount, percentage: openedCount > 0 ? Math.round((clickedCount / openedCount) * 100) : 0 },
    { name: "Converted", count: convertedCount, percentage: clickedCount > 0 ? Math.round((convertedCount / clickedCount) * 100) : 0 },
  ];

  const statCards = [
    { name: "Total Customers", value: totalCustomers.toLocaleString("en-IN"), icon: Users, color: "text-foreground bg-foreground/5 border border-border" },
    { name: "Total Orders", value: totalOrders.toLocaleString("en-IN"), icon: ShoppingBag, color: "text-foreground bg-foreground/5 border border-border" },
    { name: "Total Revenue", value: `₹${Math.round(totalRevenue).toLocaleString("en-IN")}`, icon: DollarSign, color: "text-foreground bg-foreground/5 border border-border" },
    { name: "Active Campaigns", value: totalCampaigns.toLocaleString("en-IN"), icon: Megaphone, color: "text-foreground bg-foreground/5 border border-border" },
  ];

  const metrics = [
    { name: "Messages Sent", value: sentCount.toLocaleString("en-IN"), icon: Send, rate: null },
    { name: "Delivery Rate", value: `${deliveryRate.toFixed(1)}%`, icon: CheckCircle, rate: "Delivered / Sent" },
    { name: "Open Rate", value: `${openRate.toFixed(1)}%`, icon: Eye, rate: "Opened / Delivered" },
    { name: "Click Rate (CTR)", value: `${clickRate.toFixed(1)}%`, icon: MousePointerClick, rate: "Clicked / Opened" },
    { name: "Conversion Rate", value: `${conversionRate.toFixed(1)}%`, icon: TrendingUp, rate: "Converted / Clicked" },
  ];

  return (
    <div className="space-y-8 text-foreground bg-background">
      {/* Title */}
      <div>
        <h1 className="font-display font-extrabold text-3xl tracking-tight text-foreground">Analytics Dashboard</h1>
        <p className="text-sm text-foreground/60 mt-1">
          Monitor your customer growth, spending behavior, and campaign performance in real-time.
        </p>
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.name}
              className="bg-card p-6 rounded-2xl border border-border shadow-sm flex items-center justify-between"
            >
              <div className="space-y-1">
                <span className="text-xs font-semibold text-foreground/60 uppercase tracking-wider">
                  {stat.name}
                </span>
                <h2 className="text-2xl font-bold tracking-tight text-foreground">{stat.value}</h2>
              </div>
              <div className={`p-3 rounded-lg ${stat.color}`}>
                <Icon className="h-5 w-5" />
              </div>
            </div>
          );
        })}
      </div>

      {/* Campaign Analytics Loop Metrics */}
      <div className="bg-card p-6 rounded-2xl border border-border shadow-sm">
        <h3 className="text-xs font-bold uppercase tracking-wider text-foreground/60 mb-6">
          Campaign Conversion Funnel Metrics
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
          {metrics.map((m) => {
            const Icon = m.icon;
            return (
              <div key={m.name} className="flex flex-col space-y-2.5 p-4 rounded-xl bg-foreground/5 border border-border">
                <div className="flex items-center gap-2 text-foreground/60">
                  <Icon className="h-4 w-4" />
                  <span className="text-xs font-semibold">{m.name}</span>
                </div>
                <span className="text-xl font-extrabold tracking-tight text-foreground">{m.value}</span>
                {m.rate && <span className="text-[10px] text-foreground/40 italic">{m.rate}</span>}
              </div>
            );
          })}
        </div>
      </div>

      {/* Charts Section */}
      <DashboardCharts
        revenueTrend={revenueTrend}
        campaignPerformance={campaignPerformance}
        channelPerformance={finalChannelPerformance}
        funnelData={funnelData}
      />
    </div>
  );
}
