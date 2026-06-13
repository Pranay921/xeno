import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { campaignAIService } from "@/ai/services/campaign-ai.service";
import { parseCampaignReasoning } from "@/ai/validators/campaign.schema";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { goal } = body;

    if (!goal || typeof goal !== "string") {
      return NextResponse.json({ error: "Goal is required" }, { status: 400 });
    }

    const result = await campaignAIService.generateCampaign(goal);
    
    // Parse explainability components from reasoning string
    const parsedReasoning = parseCampaignReasoning(result.reasoning);

    return NextResponse.json({
      ...result,
      reasoningDetails: parsedReasoning,
    });
  } catch (err: any) {
    console.error("AI Campaign Assistant Error:", err);
    return NextResponse.json({ error: err.message || "Failed to generate campaign suggestion" }, { status: 500 });
  }
}
