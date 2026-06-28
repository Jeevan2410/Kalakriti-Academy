import { NextRequest, NextResponse } from "next/server";

// Razorpay Payment Integration
// Set in .env:
//   NEXT_PUBLIC_RAZORPAY_KEY_ID  (public, used in frontend)
//   RAZORPAY_KEY_SECRET         (private, server only)

export async function POST(request: NextRequest) {
  try {
    const keyId = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    // If Razorpay not configured, fall back to simulated payment
    if (!keyId || !keySecret) {
      console.log("Razorpay not configured — using simulated payment");
      const body = await request.json().catch(() => ({}));
      return NextResponse.json({
        simulated: true,
        message: "Razorpay not configured. Set NEXT_PUBLIC_RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in .env",
        orderId: "sim_" + Date.now(),
        amount: body?.amount || 0,
        currency: "INR",
        key: "simulated",
      });
    }

    const body = await request.json();
    const { amount, receipt } = body;

    if (!amount || amount <= 0) {
      return NextResponse.json({ error: "Invalid amount" }, { status: 400 });
    }

    // Create Razorpay order
    const orderData = JSON.stringify({
      amount: Math.round(amount * 100), // Razorpay expects amount in paise
      currency: "INR",
      receipt: receipt || `rcpt_${Date.now()}`,
    });

    const authString = Buffer.from(`${keyId}:${keySecret}`).toString("base64");

    const response = await fetch("https://api.razorpay.com/v1/orders", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Basic ${authString}`,
      },
      body: orderData,
    });

    if (!response.ok) {
      const error = await response.json();
      console.error("Razorpay order creation failed:", error);
      return NextResponse.json(
        { error: error.error?.description || "Failed to create payment order" },
        { status: 500 }
      );
    }

    const order = await response.json();

    return NextResponse.json({
      simulated: false,
      orderId: order.id,
      amount: order.amount / 100, // Convert back to rupees
      currency: order.currency,
      key: keyId,
      receipt: order.receipt,
    });
  } catch (error) {
    console.error("Payment error:", error);
    return NextResponse.json({ error: "Payment initiation failed" }, { status: 500 });
  }
}

// Verify Razorpay payment signature after completion
export async function PUT(request: NextRequest) {
  try {
    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    if (!keySecret) {
      return NextResponse.json({ verified: true, simulated: true });
    }

    const body = await request.json();
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return NextResponse.json({ error: "Missing payment verification fields" }, { status: 400 });
    }

    // Verify signature
    const crypto = await import("crypto");
    const expectedSignature = crypto
      .createHmac("sha256", keySecret)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    const isVerified = expectedSignature === razorpay_signature;

    if (!isVerified) {
      return NextResponse.json({ verified: false, error: "Invalid payment signature" }, { status: 400 });
    }

    return NextResponse.json({ verified: true, paymentId: razorpay_payment_id });
  } catch (error) {
    console.error("Verification error:", error);
    return NextResponse.json({ error: "Payment verification failed" }, { status: 500 });
  }
}