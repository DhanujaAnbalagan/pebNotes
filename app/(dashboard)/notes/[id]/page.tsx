"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { useNoteStore } from "@/store/use-note-store"
import { NoteEditor } from "@/components/notes/note-editor"
import { Loader2 } from "lucide-react"

export default function NoteDetailPage() {
  const { id } = useParams()
  const router = useRouter()
  const { fetchNoteById, activeNote } = useNoteStore()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (id && id !== "new") {
      fetchNoteById(id as string).then((note) => {
        if (!note) {
          router.push("/notes")
        }
        setLoading(false)
      })
    }
  }, [id, fetchNoteById, router])

  if (loading) {
    return (
      <div className="flex h-[50vh] w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!activeNote) return null

  return (
    <div className="max-w-5xl mx-auto py-6">
      <NoteEditor note={activeNote} />
    </div>
  )
}
