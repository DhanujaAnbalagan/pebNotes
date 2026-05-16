import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { NoteService } from "@/services/note.service";

export async function POST(req: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json();
    const { action } = body; // "share" or "unshare"
    
    let note;
    if (action === "share") {
      note = await NoteService.shareNote(params.id, session.userId);
    } else {
      note = await NoteService.unshareNote(params.id, session.userId);
    }
    
    return NextResponse.json(note);
  } catch (error) {
    return NextResponse.json({ error: "Failed to update sharing status" }, { status: 500 });
  }
}
