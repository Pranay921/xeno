import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import {
  ArrowLeft,
  User,
  MapPin,
  ShoppingBag,
  Megaphone,
  Eye,
  MousePointerClick,
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
    meta?: unknown;
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
        return { icon: User, color: "text-foreground bg-background border-border" };
      case "order":
        return { icon: ShoppingBag, color: "text-foreground bg-background border-border" };
      case "campaign":
        return { icon: Megaphone, color: "text-foreground bg-background border-border" };
      case "opened":
        return { icon: Eye, color: "text-foreground bg-background border-border" };
      case "clicked":
        return { icon: MousePointerClick, color: "text-foreground bg-background border-border" };
      default:
        return { icon: HelpCircle, color: "text-foreground bg-background border-border" };
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
        Back to customers
      </Link>

      {/* Customer Info Card */}
      <div className="bg-card p-8 rounded-2xl border border-border shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4.5">
            <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-foreground/5 border border-border text-foreground font-extrabold text-2xl uppercase">
              {customer.name.split(" ").map(n => n[0]).join("")}
            </div>
            <div className="space-y-1">
              <h1 className="font-display font-extrabold text-2xl tracking-tight text-foreground">
                {customer.name}
              </h1>
              <div className="flex flex-wrap items-center gap-3.5 text-sm text-foreground/60">
                <span className="font-medium">{customer.email}</span>
                {customer.phone && <span className="text-foreground/20">|</span>}
                {customer.phone && <span>{customer.phone}</span>}
                <span className="text-foreground/20">|</span>
                <span className="flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5 text-foreground/50" />
                  {customer.city}
                </span>
                <span className="text-foreground/20">|</span>
                <span>{customer.gender}</span>
              </div>
            </div>
          </div>

          <div className="flex gap-4 border-t md:border-t-0 pt-4 md:pt-0 border-border">
            <div className="text-left md:text-right">
              <span className="text-[10px] font-bold uppercase tracking-wider text-foreground/60">
                Total Spend
              </span>
              <h3 className="text-xl font-extrabold tracking-tight text-foreground mt-0.5">
                ₹{customer.totalSpend.toLocaleString("en-IN")}
              </h3>
            </div>
            <div className="text-left md:text-right pl-6 border-l border-border">
              <span className="text-[10px] font-bold uppercase tracking-wider text-foreground/60">
                Total Orders
              </span>
              <h3 className="text-xl font-extrabold tracking-tight mt-0.5 text-foreground">
                {customer.orders.length}
              </h3>
            </div>
          </div>
        </div>
      </div>

      {/* Customer Journey Timeline */}
      <div className="bg-card p-8 rounded-2xl border border-border shadow-sm">
        <h2 className="font-display font-bold text-lg text-foreground mb-8">
          Customer Journey Timeline
        </h2>

        <div className="relative border-l border-border ml-4.5 space-y-8">
          {timeline.map((item) => {
            const config = getTimelineIcon(item.type);
            const Icon = config.icon;

            return (
              <div key={item.id} className="relative pl-8 group">
                {/* Timeline node */}
                <span className={`absolute left-0 top-1.5 -translate-x-1/2 flex h-9 w-9 items-center justify-center rounded-lg border-2 ${config.color} transition-transform duration-200 group-hover:scale-110 shadow-sm z-10`}>
                  <Icon className="h-4.5 w-4.5" />
                </span>

                {/* Timeline content */}
                <div className="space-y-1">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                    <span className="font-bold text-foreground">
                      {item.title}
                    </span>
                    <span className="text-xs text-foreground/50">
                      {new Date(item.timestamp).toLocaleString("en-IN", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                  <p className="text-sm text-foreground/75 leading-relaxed">
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
