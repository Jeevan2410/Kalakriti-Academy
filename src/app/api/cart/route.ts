import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

// Helper to build cart where clause
function buildCartWhere(
  userId?: string | null,
  sessionId?: string | null
): { userId?: string; sessionId?: string } {
  if (userId) return { userId };
  if (sessionId) return { sessionId };
  return { userId: "" }; // will return empty results if neither provided
}

// Helper to fetch cart response
async function getCartResponse(where: { userId?: string; sessionId?: string }) {
  const cartItems = await db.cartItem.findMany({
    where,
    include: {
      product: {
        select: {
          id: true,
          title: true,
          thumbnail: true,
          price: true,
          originalPrice: true,
          instructor: true,
          slug: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  const total = cartItems.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );
  const itemCount = cartItems.reduce(
    (sum, item) => sum + item.quantity,
    0
  );

  return { items: cartItems, total, itemCount };
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");
    const sessionId = searchParams.get("sessionId");

    if (!userId && !sessionId) {
      return NextResponse.json(
        { error: "userId or sessionId is required" },
        { status: 400 }
      );
    }

    const where = buildCartWhere(userId, sessionId);
    const result = await getCartResponse(where);

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error fetching cart:", error);
    return NextResponse.json(
      { error: "Failed to fetch cart" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { productId, quantity = 1, sessionId, userId } = body;

    if (!productId) {
      return NextResponse.json(
        { error: "productId is required" },
        { status: 400 }
      );
    }

    // Verify product exists
    const product = await db.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      return NextResponse.json(
        { error: "Product not found" },
        { status: 404 }
      );
    }

    if (!userId && !sessionId) {
      return NextResponse.json(
        { error: "userId or sessionId is required" },
        { status: 400 }
      );
    }

    // Check if item already exists in cart
    const existingItem = await db.cartItem.findFirst({
      where: {
        productId,
        ...(userId ? { userId } : { sessionId }),
      },
    });

    if (existingItem) {
      const updated = await db.cartItem.update({
        where: { id: existingItem.id },
        data: { quantity: existingItem.quantity + quantity },
      });
    } else {
      await db.cartItem.create({
        data: {
          productId,
          quantity,
          userId: userId || null,
          sessionId: sessionId || null,
        },
      });
    }

    const where = buildCartWhere(userId, sessionId);
    const result = await getCartResponse(where);

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    console.error("Error adding to cart:", error);
    return NextResponse.json(
      { error: "Failed to add item to cart" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const itemId = searchParams.get("itemId");

    // Also try body for DELETE
    let bodyItemId: string | null = null;
    try {
      const body = await request.json();
      bodyItemId = body.itemId || null;
    } catch {
      // no body
    }

    const idToDelete = itemId || bodyItemId;

    if (!idToDelete) {
      return NextResponse.json(
        { error: "itemId is required" },
        { status: 400 }
      );
    }

    const cartItem = await db.cartItem.findUnique({
      where: { id: idToDelete },
    });

    if (!cartItem) {
      return NextResponse.json(
        { error: "Cart item not found" },
        { status: 404 }
      );
    }

    await db.cartItem.delete({
      where: { id: idToDelete },
    });

    const where = buildCartWhere(cartItem.userId, cartItem.sessionId);
    const result = await getCartResponse(where);

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error removing from cart:", error);
    return NextResponse.json(
      { error: "Failed to remove item from cart" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { itemId, quantity } = body;

    if (!itemId || quantity === undefined) {
      return NextResponse.json(
        { error: "itemId and quantity are required" },
        { status: 400 }
      );
    }

    if (quantity < 0) {
      return NextResponse.json(
        { error: "Quantity cannot be negative" },
        { status: 400 }
      );
    }

    const cartItem = await db.cartItem.findUnique({
      where: { id: itemId },
    });

    if (!cartItem) {
      return NextResponse.json(
        { error: "Cart item not found" },
        { status: 404 }
      );
    }

    if (quantity === 0) {
      await db.cartItem.delete({
        where: { id: itemId },
      });
    } else {
      await db.cartItem.update({
        where: { id: itemId },
        data: { quantity },
      });
    }

    const where = buildCartWhere(cartItem.userId, cartItem.sessionId);
    const result = await getCartResponse(where);

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error updating cart:", error);
    return NextResponse.json(
      { error: "Failed to update cart" },
      { status: 500 }
    );
  }
}