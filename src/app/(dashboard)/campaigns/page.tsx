import React from "react";
import { prisma } from "@/lib/prisma";
import CampaignsListClient from "@/components/campaigns/campaigns-list-client";

export const revalidate = 0;

export default async function CampaignsPage() {
  const campaignsRaw = await prisma.campaign.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      segment: { select: { name: true } },
      creator: { select: { name: true } },
    },
  });

  // Map Date to ISO String for client component
  const campaigns = campaignsRaw.map((c) => ({
    ...c,
    createdAt: c.createdAt.toISOString(),
  }));

  return <CampaignsListClient campaigns={campaigns} />;
}
