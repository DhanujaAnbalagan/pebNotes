"use client"

import { useEffect } from "react"
import { useNoteStore } from "@/store/use-note-store"
import { useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"

export default function NewNotePage() {
  const { createNote } = useNoteStore()
  const router = useRouter()

  useEffect(() => {
    const initNote = async () => {
      const note = await createNote({ 
        title: "Untitled Note", 
        content: "", 
        category: "Personal" 
      })
      if (note) {
        router.replace(`/notes/${note.id}`)
      } else {
        router.replace("/notes")
      }
    }
    initNote()
  }, [createNote, router])

  return (
    <div className="flex h-[50vh] w-full items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-muted-foreground animate-pulse">Creating your new note...</p>
      </div>
    </div>
  )
}
