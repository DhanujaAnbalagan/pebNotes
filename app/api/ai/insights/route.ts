import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const insights = await prisma.aIInsight.findMany({
      where: { userId: session.userId },
      orderBy: { createdAt: "desc" },
      include: {
        note: {
          select: {
            id: true,
            title: true,
            category: true,
          }
        }
      }
    });

    return NextResponse.json(insights);
  } catch (error) {
    console.error("Fetch AI insights error:", error);
    return NextResponse.json({ error: "Failed to fetch AI insights" }, { status: 500 });
  }
}
