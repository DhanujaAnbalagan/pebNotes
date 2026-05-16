import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const userId = session.userId;
    const now = new Date();

    const notifications = await prisma.note.findMany({
      where: {
        userId,
        reminderAt: {
          lte: now,
        },
        reminderDismissed: false,
      },
      orderBy: {
        reminderAt: "desc",
      },
      select: {
        id: true,
        title: true,
        reminderAt: true,
      }
    });

    return NextResponse.json(notifications);
  } catch (error) {
    console.error("Fetch notifications error:", error);
    return NextResponse.json({ error: "Failed to fetch notifications" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { noteId, dismissAll } = await req.json();
    const userId = session.userId;

    if (dismissAll) {
      await prisma.note.updateMany({
        where: {
          userId,
          reminderAt: {
            lte: new Date(),
          },
          reminderDismissed: false,
        },
        data: {
          reminderDismissed: true,
        },
      });
    } else if (noteId) {
      await prisma.note.update({
        where: { id: noteId, userId },
        data: {
          reminderDismissed: true,
        },
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Update notifications error:", error);
    return NextResponse.json({ error: "Failed to update notifications" }, { status: 500 });
  }
}
