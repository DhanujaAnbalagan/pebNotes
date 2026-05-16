import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { NoteService } from "@/services/note.service";

export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = req.nextUrl;
  const q = searchParams.get("q") || undefined;
  const category = searchParams.get("category") || undefined;
  const tag = searchParams.get("tag") || undefined;
  const sort = searchParams.get("sort") || undefined;
  const archived = searchParams.get("archived") === "true";
  const scheduled = searchParams.get("scheduled") === "true";
  const isPublic = searchParams.get("isPublic") === "true" ? true : searchParams.get("isPublic") === "false" ? false : undefined;
  
  try {
    const notes = await NoteService.getNotes(session.userId, {
      q,
      category,
      tag,
      sort,
      archived,
      isPublic,
      scheduled
    });
      
    return NextResponse.json(notes);
  } catch (error) {
    console.error("Fetch notes error:", error);
    return NextResponse.json({ error: "Failed to fetch notes" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json();
    const note = await NoteService.createNote(session.userId, {
      title: body.title || "Untitled Note",
      content: body.content || "",
      category: body.category || "Personal",
    });
    
    return NextResponse.json(note);
  } catch (error) {
    return NextResponse.json({ error: "Failed to create note" }, { status: 500 });
  }
}
