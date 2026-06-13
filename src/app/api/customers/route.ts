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
    const { name, email, phone, city, gender } = body;

    if (!name || !email || !city || !gender) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Check if email already exists
    const existingCustomer = await prisma.customer.findUnique({
      where: { email },
    });

    if (existingCustomer) {
      return NextResponse.json({ error: "A customer with this email already exists" }, { status: 400 });
    }

    const customer = await prisma.customer.create({
      data: {
        name,
        email,
        phone,
        city,
        gender,
        totalSpend: 0,
      },
    });

    return NextResponse.json(customer);
  } catch (err: any) {
    console.error("Create Customer Error:", err);
    return NextResponse.json({ error: err.message || "Failed to register customer" }, { status: 500 });
  }
}
