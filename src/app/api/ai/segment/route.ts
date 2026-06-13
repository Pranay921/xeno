import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { segmentAIService } from "@/ai/services/segment-ai.service";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { prompt } = body;

    if (!prompt || typeof prompt !== "string") {
      return NextResponse.json({ error: "Prompt is required" }, { status: 400 });
    }

    const result = await segmentAIService.generateSegment(prompt);
    return NextResponse.json(result);
  } catch (err: any) {
    console.error("AI Segment Builder Error:", err);
    return NextResponse.json({ error: err.message || "Failed to generate segment via AI" }, { status: 500 });
  }
}
