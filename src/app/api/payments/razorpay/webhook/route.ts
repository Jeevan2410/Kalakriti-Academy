import { NextRequest, NextResponse } from "next/server";
import { getRazorpayInstance, isRazorpayConfigured } from "@/lib/razorpay";
import crypto from "crypto";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Log webhook event for debugging
    console.log("Razorpay webhook event:", body.event);

    if (!isRazorpayConfigured) {
      console.log("Webhook received but Razorpay not configured (simulated mode)");
      return NextResponse.json({ status: "simulated" });
    }

    // Verify webhook signature
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
    if (webhookSecret) {
      const signature = request.headers.get("x-razorpay-signature");
      if (!signature) {
        console.error("Missing webhook signature");
        return NextResponse.json({ error: "Missing signature" }, { status: 400 });
      }

      const expectedSignature = crypto
        .createHmac("sha256", webhookSecret)
        .update(JSON.stringify(body))
        .digest("hex");

      if (expectedSignature !== signature) {
        console.error("Invalid webhook signature");
        return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
      }
    }

    const event = body.event;

    // Handle specific webhook events
    switch (event) {
      case "payment.captured":
      case "payment.authorized": {
        const payment = body.payload?.payment?.entity;
        console.log(`Payment ${payment?.id} ${event}: ₹${(payment?.amount / 100).toFixed(2)}`);
        break;
      }
      case "payment.failed": {
        const payment = body.payload?.payment?.entity;
        console.log(`Payment failed: ${payment?.id}, reason: ${payment?.error_description}`);
        break;
      }
      case "order.paid": {
        const order = body.payload?.order?.entity;
        console.log(`Order paid: ${order?.id}`);
        break;
      }
      default:
        console.log(`Unhandled webhook event: ${event}`);
    }

    return NextResponse.json({ status: "received" });
  } catch (error) {
    console.error("Webhook error:", error);
    return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 });
  }
}