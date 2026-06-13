import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { communicationId, status } = body as { communicationId: string; status: string };

    if (!communicationId || !status) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    console.log(`[CRM Webhook] Received status callback: "${status}" for communicationId: ${communicationId}`);

    let updatedComm: any = null;
    let attempts = 0;
    const maxAttempts = 4; // Try up to 4 times
    const delayMs = 500;   // Wait 500ms between attempts

    while (attempts < maxAttempts) {
      try {
        attempts++;
        // Update Communication status and insert history event in a transaction
        const [commResult] = await prisma.$transaction([
          prisma.communication.update({
            where: { id: communicationId },
            data: { status },
            include: {
              campaign: true,
              customer: true,
            },
          }),
          prisma.communicationEvent.create({
            data: {
              communicationId,
              status,
            },
          }),
        ]);
        
        updatedComm = commResult;
        break; // Success! Exit retry loop
      } catch (dbErr: any) {
        // P2025 is Prisma's code for "Record to update not found"
        if (dbErr.code === "P2025" && attempts < maxAttempts) {
          console.warn(`[CRM Webhook] Communication ${communicationId} not found in DB yet. Attempt ${attempts}/${maxAttempts}. Retrying in ${delayMs}ms...`);
          await sleep(delayMs);
        } else {
          throw dbErr; // Rethrow other database errors or if max attempts exceeded
        }
      }
    }

    if (!updatedComm) {
      throw new Error(`Communication record ${communicationId} could not be updated.`);
    }

    // Attribution Loop: "order came because of this communication"
    if (status === "converted") {
      const amount = Math.floor(1500 + Math.random() * 5000); // Simulated purchase amount
      const productName = `Promo: ${updatedComm.campaign.name}`;
      const now = new Date();

      console.log(`[CRM Webhook] Attribution triggered. Registering order transaction:
        - Customer: ${updatedComm.customer.name}
        - Product: ${productName}
        - Amount: ₹${amount}`);

      // 1. Create a new Order record linked to the customer
      await prisma.order.create({
        data: {
          customerId: updatedComm.customerId,
          productName,
          amount,
          quantity: 1,
          orderDate: now,
        },
      });

      // 2. Recalculate customer spending totals
      const customerOrders = await prisma.order.findMany({
        where: { customerId: updatedComm.customerId },
      });
      const totalSpend = customerOrders.reduce((sum, o) => sum + o.amount, 0);

      await prisma.customer.update({
        where: { id: updatedComm.customerId },
        data: {
          totalSpend,
          lastPurchaseDate: now,
        },
      });
    }

    return NextResponse.json({ success: true, updatedStatus: updatedComm.status });
  } catch (err: any) {
    console.error("[CRM Webhook] Failed to process status receipt:", err);
    return NextResponse.json({ error: err.message || "Callback processing failed" }, { status: 500 });
  }
}
