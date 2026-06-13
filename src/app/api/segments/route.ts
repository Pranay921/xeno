import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { name, description, conditions } = body;

    if (!name || !conditions || !Array.isArray(conditions)) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const creatorId = (session.user as any).id;

    const segment = await prisma.segment.create({
      data: {
        name,
        description,
        conditions: JSON.stringify(conditions),
        creatorId,
      },
    });

    return NextResponse.json(segment);
  } catch (err: any) {
    console.error("Save Segment Error:", err);
    return NextResponse.json({ error: err.message || "Failed to save segment" }, { status: 500 });
  }
}
