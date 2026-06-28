import { NextRequest, NextResponse } from "next/server";
import { getRazorpayInstance, isRazorpayConfigured } from "@/lib/razorpay";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { amount, currency = "INR", receipt, notes } = body;

    if (!amount || amount <= 0) {
      return NextResponse.json({ error: "Valid amount is required" }, { status: 400 });
    }

    // If Razorpay is not configured, return simulated order
    if (!isRazorpayConfigured) {
      const simOrderId = `sim_order_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
      return NextResponse.json({
        id: simOrderId,
        amount: Math.round(amount * 100), // paise
        currency,
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "rzp_simulated",
        simulated: true,
        receipt: receipt || simOrderId,
      });
    }

    const razorpay = getRazorpayInstance()!;

    const order = await razorpay.orders.create({
      amount: Math.round(amount * 100), // Convert to paise
      currency,
      receipt: receipt || `rcpt_${Date.now()}`,
      notes: notes || {},
    });

    return NextResponse.json({
      id: order.id,
      amount: order.amount,
      currency: order.currency,
      key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
      simulated: false,
      receipt: order.receipt,
    });
  } catch (error) {
    console.error("Error creating Razorpay order:", error);
    return NextResponse.json(
      { error: "Failed to create payment order" },
      { status: 500 }
    );
  }
}