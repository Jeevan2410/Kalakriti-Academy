import { db } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");
    const sessionId = searchParams.get("sessionId");

    if (!userId && !sessionId) {
      return NextResponse.json({ error: "userId or sessionId is required" }, { status: 400 });
    }

    const where: Record<string, unknown> = {};
    if (userId) where.userId = userId;

    const orders = await db.order.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: {
        items: { orderBy: { createdAt: "asc" } },
      },
    });

    return NextResponse.json({ orders });
  } catch (error) {
    console.error("Error fetching orders:", error);
    return NextResponse.json({ error: "Failed to fetch orders" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, sessionId, couponCode, paymentMethod = "razorpay" } = body;

    // Fetch cart items - try userId first, then sessionId
    const cartWhere: Record<string, unknown> = {};
    if (userId && sessionId) {
      cartWhere.OR = [{ userId }, { sessionId }];
    } else if (userId) {
      cartWhere.userId = userId;
    } else if (sessionId) {
      cartWhere.sessionId = sessionId;
    } else {
      return NextResponse.json({ error: "userId or sessionId required" }, { status: 400 });
    }

    const cartItems = await db.cartItem.findMany({
      where: cartWhere,
      include: { product: true },
    });

    if (cartItems.length === 0) {
      return NextResponse.json({ error: "Cart is empty" }, { status: 400 });
    }

    let subtotal = cartItems.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
    let discount = 0;

    // Apply coupon
    if (couponCode) {
      const coupon = await db.coupon.findUnique({ where: { code: couponCode.toUpperCase() } });
      if (coupon && coupon.isActive && (!coupon.expiresAt || coupon.expiresAt > new Date())) {
        if (!coupon.minAmount || subtotal >= coupon.minAmount) {
          discount = Math.round((subtotal * coupon.discount) / 100 * 100) / 100;
          await db.coupon.update({
            where: { id: coupon.id },
            data: { usedCount: { increment: 1 } },
          });
        }
      }
    }

    const totalAmount = subtotal - discount;

    // Generate order number
    const orderCount = await db.order.count();
    const orderNumber = `KA${String(orderCount + 1).padStart(5, "0")}`;

    // Find or create user (idempotent)
    let finalUserId = userId;
    const existingUser = finalUserId ? await db.user.findUnique({ where: { id: finalUserId } }) : null;
    if (!existingUser) {
      // User doesn't exist in DB, create one
      const email = finalUserId ? `user_${finalUserId}@kalakriti.com` : `guest_${sessionId}@kalakriti.com`;
      const name = finalUserId ? "Demo User" : "Guest User";
      const newUser = await db.user.upsert({
        where: { email },
        update: {},
        create: { email, name },
      });
      finalUserId = newUser.id;
    }

    // Create order
    const order = await db.order.create({
      data: {
        orderNumber,
        userId: finalUserId!,
        status: "completed",
        totalAmount,
        subtotal,
        discount,
        paymentMethod,
        paymentStatus: "completed",
        paidAt: new Date(),
        items: {
          create: cartItems.map((item) => ({
            productId: item.productId,
            title: item.product.title,
            thumbnail: item.product.thumbnail,
            price: item.product.price,
            quantity: item.quantity,
          })),
        },
      },
      include: { items: true },
    });

    // Create enrollments
    for (const item of cartItems) {
      const existing = await db.enrollment.findUnique({
        where: { userId_productId: { userId: finalUserId!, productId: item.productId } },
      });
      if (!existing) {
        await db.enrollment.create({
          data: {
            userId: finalUserId!,
            productId: item.productId,
          },
        });
      }
    }

    // Clear cart
    await db.cartItem.deleteMany({ where: cartWhere });

    return NextResponse.json(order, { status: 201 });
  } catch (error) {
    console.error("Error creating order:", error);
    return NextResponse.json({ error: "Failed to create order" }, { status: 500 });
  }
}