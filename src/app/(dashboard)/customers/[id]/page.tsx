import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import {
  ArrowLeft,
  User,
  MapPin,
  Calendar,
  ShoppingBag,
  Megaphone,
  Eye,
  MousePointerClick,
  CheckCircle,
  HelpCircle,
} from "lucide-react";

type Params = Promise<{ id: string }>;

export const revalidate = 0;

export default async function CustomerDetailPage({ params }: { params: Params }) {
  const { id } = await params;

  // Fetch customer details with orders, communications, and events
  const customer = await prisma.customer.findUnique({
    where: { id },
    include: {
      orders: {
        orderBy: { orderDate: "desc" },
      },
      communications: {
        include: {
          campaign: true,
          events: {
            orderBy: { createdAt: "asc" },
          },
        },
        orderBy: { sentAt: "desc" },
      },
    },
  });

  if (!customer) {
    return notFound();
  }

  // Build a unified timeline
  type TimelineItem = {
    id: string;
    type: "created" | "order" | "campaign" | "opened" | "clicked";
    timestamp: Date;
    title: string;
    description: string;
    meta?: any;
  };

  const timeline: TimelineItem[] = [];

  // 1. Account Creation Event
  timeline.push({
    id: `creation-${customer.id}`,
    type: "created",
    timestamp: customer.createdAt,
    title: "Customer Profile Created",
    description: `Registered from ${customer.city}`,
  });

  // 2. Orders Events
  customer.orders.forEach((order) => {
    timeline.push({
      id: `order-${order.id}`,
      type: "order",
      timestamp: order.orderDate,
      title: `Placed Order: ${order.productName}`,
      description: `Purchased Qty ${order.quantity} for ₹${order.amount.toLocaleString("en-IN")}`,
      meta: order,
    });
  });

  // 3. Communications and their events
  customer.communications.forEach((comm) => {
    timeline.push({
      id: `comm-${comm.id}`,
      type: "campaign",
      timestamp: comm.sentAt,
      title: `Campaign Dispatched: ${comm.campaign.name}`,
      description: `Channel: ${comm.campaign.channel} | Message: "${comm.personalizedMessage}"`,
      meta: comm,
    });

    comm.events.forEach((event) => {
      if (event.status === "opened") {
        timeline.push({
          id: `event-open-${event.id}`,
          type: "opened",
          timestamp: event.createdAt,
          title: `Communication Opened`,
          description: `Opened campaign: ${comm.campaign.name} via ${comm.campaign.channel}`,
          meta: event,
        });
      } else if (event.status === "clicked") {
        timeline.push({
          id: `event-click-${event.id}`,
          type: "clicked",
          timestamp: event.createdAt,
          title: `Link Clicked`,
          description: `Clicked link in campaign: ${comm.campaign.name}`,
          meta: event,
        });
      }
    });
  });

  // Sort timeline chronologically (latest first)
  timeline.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

  // Function to return correct styling per timeline item type
  const getTimelineIcon = (type: string) => {
    switch (type) {
      case "created":
        return { icon: User, color: "text-blue-600 bg-blue-100 dark:text-blue-400 dark:bg-blue-950/40 border-blue-500/20" };
      case "order":
        return { icon: ShoppingBag, color: "text-emerald-600 bg-emerald-100 dark:text-emerald-400 dark:bg-emerald-950/40 border-emerald-500/20" };
      case "campaign":
        return { icon: Megaphone, color: "text-purple-600 bg-purple-100 dark:text-purple-400 dark:bg-purple-950/40 border-purple-500/20" };
      case "opened":
        return { icon: Eye, color: "text-amber-600 bg-amber-100 dark:text-amber-400 dark:bg-amber-950/40 border-amber-500/20" };
      case "clicked":
        return { icon: MousePointerClick, color: "text-fuchsia-600 bg-fuchsia-100 dark:text-fuchsia-400 dark:bg-fuchsia-950/40 border-fuchsia-500/20" };
      default:
        return { icon: HelpCircle, color: "text-slate-600 bg-slate-100 dark:text-slate-400 dark:bg-slate-950 border-slate-500/20" };
    }
  };

  return (
    <div className="space-y-8">
      {/* Back Button */}
      <Link
        href="/customers"
        className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to customers
      </Link>

      {/* Customer Info Card */}
      <div className="glass-panel p-8 rounded-3xl border border-slate-200 dark:border-slate-800/80 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4.5">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-tr from-purple-500/10 to-blue-500/10 border border-purple-500/20 text-purple-650 dark:text-purple-400 font-extrabold text-2xl uppercase">
              {customer.name.split(" ").map(n => n[0]).join("")}
            </div>
            <div className="space-y-1">
              <h1 className="font-display font-extrabold text-2xl tracking-tight text-slate-900 dark:text-white">
                {customer.name}
              </h1>
              <div className="flex flex-wrap items-center gap-3.5 text-sm text-slate-550 dark:text-slate-400">
                <span className="font-medium">{customer.email}</span>
                {customer.phone && <span className="text-slate-300 dark:text-slate-700">|</span>}
                {customer.phone && <span>{customer.phone}</span>}
                <span className="text-slate-300 dark:text-slate-700">|</span>
                <span className="flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5" />
                  {customer.city}
                </span>
                <span className="text-slate-300 dark:text-slate-700">|</span>
                <span>{customer.gender}</span>
              </div>
            </div>
          </div>

          <div className="flex gap-4 border-t md:border-t-0 pt-4 md:pt-0 border-slate-200 dark:border-slate-800">
            <div className="text-left md:text-right">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-450 dark:text-slate-500">
                Total Spend
              </span>
              <h3 className="text-xl font-extrabold tracking-tight text-emerald-600 dark:text-emerald-400 mt-0.5">
                ₹{customer.totalSpend.toLocaleString("en-IN")}
              </h3>
            </div>
            <div className="text-left md:text-right pl-6 border-l border-slate-200 dark:border-slate-800">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-450 dark:text-slate-500">
                Total Orders
              </span>
              <h3 className="text-xl font-extrabold tracking-tight mt-0.5">
                {customer.orders.length}
              </h3>
            </div>
          </div>
        </div>
      </div>

      {/* Customer Journey Timeline */}
      <div className="glass-panel p-8 rounded-3xl border border-slate-200 dark:border-slate-800/80 shadow-sm">
        <h2 className="font-display font-bold text-lg text-slate-850 dark:text-slate-200 mb-8">
          Customer Journey Timeline
        </h2>

        <div className="relative border-l border-slate-200 dark:border-slate-800 ml-4.5 space-y-8">
          {timeline.map((item, idx) => {
            const config = getTimelineIcon(item.type);
            const Icon = config.icon;

            return (
              <div key={item.id} className="relative pl-8 group">
                {/* Timeline node */}
                <span className={`absolute left-0 top-1.5 -translate-x-1/2 flex h-9 w-9 items-center justify-center rounded-xl border-2 ${config.color} transition-transform duration-200 group-hover:scale-110 shadow-sm z-10`}>
                  <Icon className="h-4.5 w-4.5" />
                </span>

                {/* Timeline content */}
                <div className="space-y-1">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                    <span className="font-bold text-slate-850 dark:text-slate-250">
                      {item.title}
                    </span>
                    <span className="text-xs text-slate-400 dark:text-slate-500">
                      {new Date(item.timestamp).toLocaleString("en-IN", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                  <p className="text-sm text-slate-550 dark:text-slate-400 leading-relaxed">
                    {item.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
