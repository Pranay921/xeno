import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { queryCustomersByConditions } from "@/lib/segment-query";

type Params = Promise<{ id: string }>;

export async function POST(req: NextRequest, { params }: { params: Params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const campaign = await prisma.campaign.findUnique({
      where: { id },
      include: { segment: true },
    });

    if (!campaign) {
      return NextResponse.json({ error: "Campaign not found" }, { status: 404 });
    }

    if (campaign.status === "RUNNING") {
      return NextResponse.json({ error: "Campaign is already running" }, { status: 400 });
    }

    // 1. Fetch Segment Customers
    const conditions = JSON.parse(campaign.segment.conditions as string);
    const customers = await queryCustomersByConditions(conditions);

    if (customers.length === 0) {
      return NextResponse.json({ error: "Cannot launch: segment matches 0 customers" }, { status: 400 });
    }

    // 2. Set status to RUNNING and record initial audience size
    await prisma.campaign.update({
      where: { id },
      data: {
        status: "RUNNING",
        audienceSize: customers.length,
      },
    });

    // 3. Process dispatch in background to prevent HTTP timeouts
    const channelServiceUrl = process.env.CHANNEL_SERVICE_URL || "http://localhost:3001";

    const dispatchCampaign = async () => {
      console.log(`[CRM Launcher] Starting background dispatch for Campaign: ${campaign.name} (${customers.length} customers)`);
      
      for (const customer of customers) {
        try {
          // Personalize message copy
          const personalizedMessage = campaign.message
            .replace(/\{\{name\}\}/g, customer.name)
            .replace(/\{\{city\}\}/g, customer.city)
            .replace(/\{\{totalSpend\}\}/g, customer.totalSpend.toLocaleString("en-IN"));

          // Create Communication log
          const comm = await prisma.communication.create({
            data: {
              campaignId: campaign.id,
              customerId: customer.id,
              personalizedMessage,
              status: "sent",
            },
          });

          // Create sent event
          await prisma.communicationEvent.create({
            data: {
              communicationId: comm.id,
              status: "sent",
            },
          });

          // Forward to Channel Simulator Service (ignore response to keep loops fast)
          fetch(`${channelServiceUrl}/send`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              communicationId: comm.id,
              customerId: customer.id,
              channel: campaign.channel,
              message: personalizedMessage,
            }),
          }).catch((fetchErr) => {
            console.error(`[CRM Launcher] Failed to send webhook dispatch for customer ${customer.id}:`, fetchErr.message);
          });

        } catch (custErr) {
          console.error(`[CRM Launcher] Failed to build communication for customer ${customer.id}:`, custErr);
        }
      }

      // Mark campaign completed after dispatch is finished (in this simplified memory queue)
      await prisma.campaign.update({
        where: { id },
        data: { status: "COMPLETED" },
      });
      console.log(`[CRM Launcher] Completed background dispatch loop for Campaign: ${campaign.name}`);
    };

    // Trigger asynchronous execution and return immediately
    dispatchCampaign();

    return NextResponse.json({ success: true, message: "Campaign dispatch triggered" });
  } catch (err: any) {
    console.error("Launch Campaign Error:", err);
    return NextResponse.json({ error: err.message || "Failed to launch campaign" }, { status: 500 });
  }
}
