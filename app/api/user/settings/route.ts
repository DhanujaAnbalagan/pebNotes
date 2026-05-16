import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function PATCH(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { geminiApiKey } = await req.json();
    const userId = session.userId;

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { geminiApiKey },
    });

    return NextResponse.json({ 
      success: true, 
      geminiApiKey: updatedUser.geminiApiKey 
    });
  } catch (error) {
    console.error("Update settings error:", error);
    return NextResponse.json({ error: "Failed to update settings" }, { status: 500 });
  }
}
