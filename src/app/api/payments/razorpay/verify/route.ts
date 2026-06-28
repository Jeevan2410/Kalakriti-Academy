import { NextRequest, NextResponse } from "next/server";
import { getRazorpayInstance, isRazorpayConfigured } from "@/lib/razorpay";
import crypto from "crypto";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = body;

    if (!razorpay_order_id) {
      return NextResponse.json({ error: "Missing order ID" }, { status: 400 });
    }

    // If Razorpay is not configured (simulated mode), always verify
    if (!isRazorpayConfigured || razorpay_order_id.startsWith("sim_order_")) {
      return NextResponse.json({
        verified: true,
        paymentId: razorpay_payment_id || `sim_pay_${Date.now()}`,
        simulated: true,
      });
    }

    // Real Razorpay signature verification
    const keySecret = process.env.RAZORPAY_KEY_SECRET;
    if (!keySecret) {
      return NextResponse.json({ error: "Razorpay not configured" }, { status: 500 });
    }

    const expectedSignature = crypto
      .createHmac("sha256", keySecret)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    const isSignatureValid = expectedSignature === razorpay_signature;

    if (isSignatureValid) {
      return NextResponse.json({
        verified: true,
        paymentId: razorpay_payment_id,
        orderId: razorpay_order_id,
        simulated: false,
      });
    } else {
      return NextResponse.json({
        verified: false,
        error: "Invalid payment signature",
      }, { status: 400 });
    }
  } catch (error) {
    console.error("Error verifying payment:", error);
    return NextResponse.json(
      { error: "Payment verification failed" },
      { status: 500 }
    );
  }
}