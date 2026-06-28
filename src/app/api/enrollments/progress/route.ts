import { db } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { enrollmentId, progress } = body;

    if (!enrollmentId || progress === undefined) {
      return NextResponse.json({ error: "enrollmentId and progress are required" }, { status: 400 });
    }

    const clampedProgress = Math.min(100, Math.max(0, progress));

    const enrollment = await db.enrollment.update({
      where: { id: enrollmentId },
      data: {
        progress: clampedProgress,
        lastAccessedAt: new Date(),
        status: clampedProgress >= 100 ? "completed" : "active",
      },
    });

    return NextResponse.json(enrollment);
  } catch (error) {
    console.error("Error updating progress:", error);
    return NextResponse.json({ error: "Failed to update progress" }, { status: 500 });
  }
}