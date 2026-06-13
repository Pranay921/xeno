import { NextRequest, NextResponse } from "next/server";
import { queryCustomersByConditions, SegmentCondition } from "@/lib/segment-query";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { conditions } = body as { conditions: SegmentCondition[] };

    if (!conditions || !Array.isArray(conditions)) {
      return NextResponse.json({ error: "Invalid conditions format" }, { status: 400 });
    }

    const customers = await queryCustomersByConditions(conditions);

    const audienceSize = customers.length;
    const totalSpend = customers.reduce((sum, c) => sum + c.totalSpend, 0);
    const averageSpend = audienceSize > 0 ? totalSpend / audienceSize : 0;
    
    // Reach: Percentage of users with email & phone. In seeded database, all have emails, so reach is high.
    const reachable = customers.filter((c) => c.email || c.phone).length;
    const estimatedReach = audienceSize > 0 ? (reachable / audienceSize) * 100 : 0;

    // Get customer preview (top 5)
    const preview = customers.slice(0, 5).map((c) => ({
      id: c.id,
      name: c.name,
      email: c.email,
      city: c.city,
      totalSpend: c.totalSpend,
    }));

    return NextResponse.json({
      audienceSize,
      averageSpend: Math.round(averageSpend),
      estimatedReach: Math.round(estimatedReach),
      estimatedRevenue: Math.round(totalSpend),
      preview,
    });
  } catch (err: any) {
    console.error("Preview Segment Error:", err);
    return NextResponse.json({ error: err.message || "Failed to preview segment" }, { status: 500 });
  }
}
