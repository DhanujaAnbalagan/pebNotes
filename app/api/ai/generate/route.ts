import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { NoteService } from "@/services/note.service";
import { AIService } from "@/services/ai.service";
import prisma from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session || !session.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { noteId } = await req.json();
    if (!noteId) {
      return NextResponse.json({ error: "Note ID is required" }, { status: 400 });
    }

    // 1. Verify note ownership and fetch content
    const note = await NoteService.getNoteById(noteId, session.userId);
    if (!note) {
      return NextResponse.json({ error: "Note not found" }, { status: 404 });
    }

    if (!note.content || note.content.trim().length === 0) {
      return NextResponse.json({ error: "Note content is empty. Add some text before generating insights." }, { status: 400 });
    }

    // 2. Generate insights via AI Service
    const insights = await AIService.generateNoteInsights(note.content, session.userId);

    // 3. Persist to Database
    const savedInsight = await prisma.aIInsight.create({
      data: {
        summary: insights.summary,
        actionItems: JSON.stringify(insights.action_items), // Storing as JSON string since schema uses String
        suggestedTitle: insights.suggested_title,
        noteId: note.id,
        userId: session.userId,
      },
    });

    // 4. Return structured result
    return NextResponse.json({
      ...insights,
      id: savedInsight.id,
      createdAt: savedInsight.createdAt,
    });
  } catch (error: any) {
    console.error("AI API Error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to generate AI insights" },
      { status: 500 }
    );
  }
}
