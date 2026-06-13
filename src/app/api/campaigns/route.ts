import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { segmentAIService } from "@/ai/services/segment-ai.service";
import { queryCustomersByConditions } from "@/lib/segment-query";

export const revalidate = 0;

export async function GET(req: NextRequest) {
  try {
    const campaigns = await prisma.campaign.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        segment: { select: { name: true } },
        creator: { select: { name: true } },
      },
    });
    return NextResponse.json(campaigns);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { name, segmentId, segmentDescription, channel, message } = body;

    if (!name || !channel || !message) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const creatorId = (session.user as any).id;
    let finalSegmentId = segmentId;
    let audienceSize = 0;

    // AI Generation Fallback: Create segment on-the-fly from natural language description
    if (!finalSegmentId && segmentDescription) {
      console.log(`AI segment description provided: "${segmentDescription}". Resolving to conditions...`);
      const aiSegment = await segmentAIService.generateSegment(segmentDescription);
      
      // Get matched customers to record initial audience size estimate
      const matchedCustomers = await queryCustomersByConditions(aiSegment.conditions);
      audienceSize = matchedCustomers.length;

      // Save segment
      const newSegment = await prisma.segment.create({
        data: {
          name: `AI: ${name}`,
          description: segmentDescription,
          conditions: JSON.stringify(aiSegment.conditions),
          creatorId,
        },
      });
      finalSegmentId = newSegment.id;
    } else if (finalSegmentId) {
      // Find manual segment and calculate size
      const segment = await prisma.segment.findUnique({
        where: { id: finalSegmentId },
      });
      if (!segment) {
        return NextResponse.json({ error: "Segment not found" }, { status: 400 });
      }
      const conditions = JSON.parse(segment.conditions as string);
      const matchedCustomers = await queryCustomersByConditions(conditions);
      audienceSize = matchedCustomers.length;
    } else {
      return NextResponse.json({ error: "Either segmentId or segmentDescription is required" }, { status: 400 });
    }

    const campaign = await prisma.campaign.create({
      data: {
        name,
        segmentId: finalSegmentId,
        channel,
        message,
        audienceSize,
        status: "DRAFT",
        creatorId,
      },
    });

    return NextResponse.json(campaign);
  } catch (err: any) {
    console.error("Create Campaign Error:", err);
    return NextResponse.json({ error: err.message || "Failed to create campaign" }, { status: 500 });
  }
}
