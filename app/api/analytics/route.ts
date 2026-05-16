import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { startOfWeek, endOfWeek, eachDayOfInterval, format, subDays } from "date-fns";

export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const userId = session.userId;

    // 1. Basic Stats
    const totalNotes = await prisma.note.count({ where: { userId } });
    const archivedNotes = await prisma.note.count({ where: { userId, archived: true } });
    const totalAIInsights = await prisma.aIInsight.count({ where: { userId } });
    
    // 2. Categories Distribution
    const categories = await prisma.note.groupBy({
      by: ['category'],
      where: { userId },
      _count: {
        category: true
      }
    });

    // 3. Most Used Tags
    const tags = await prisma.tag.findMany({
      where: {
        notes: {
          some: { userId }
        }
      },
      include: {
        _count: {
          select: { notes: true }
        }
      },
      orderBy: {
        notes: {
          _count: 'desc'
        }
      },
      take: 5
    });

    // 4. Weekly Activity (Last 7 days)
    const last7Days = eachDayOfInterval({
      start: subDays(new Date(), 6),
      end: new Date()
    });

    const activity = await Promise.all(last7Days.map(async (day) => {
      const startOfDay = new Date(day);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(day);
      endOfDay.setHours(23, 59, 59, 999);

      const count = await prisma.note.count({
        where: {
          userId,
          createdAt: {
            gte: startOfDay,
            lte: endOfDay
          }
        }
      });

      return {
        day: format(day, "EEE"),
        notes: count
      };
    }));

    return NextResponse.json({
      stats: {
        totalNotes,
        archivedNotes,
        totalAIInsights,
        activeNotes: totalNotes - archivedNotes
      },
      categories: categories.map(c => ({
        name: c.category || "General",
        count: c._count.category
      })),
      tags: tags.map(t => ({
        name: t.name,
        count: t._count.notes
      })),
      activity
    });
  } catch (error) {
    console.error("Analytics error:", error);
    return NextResponse.json({ error: "Failed to fetch analytics" }, { status: 500 });
  }
}
