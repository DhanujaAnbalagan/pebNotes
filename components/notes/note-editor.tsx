"use client"

import { useState, useEffect, useCallback } from "react"
import { 
  ChevronLeft, 
  Archive, 
  Trash2, 
  Tag as TagIcon, 
  Clock, 
  CheckCircle2, 
  AlertCircle,
  Loader2,
  X,
  Share2,
  MoreVertical,
  Sparkles,
  ExternalLink
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { ShareNoteDialog } from "./share-note-dialog"
import { ScheduleNoteDialog } from "./schedule-note-dialog"
import { AIInsightsPanel } from "./ai-insights-panel"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useNoteStore, Note } from "@/store/use-note-store"
import { useRouter } from "next/navigation"
import { formatDistanceToNow } from "date-fns"
import debounce from "lodash/debounce"

interface NoteEditorProps {
  note: Note
}

export function NoteEditor({ note: initialNote }: NoteEditorProps) {
  const router = useRouter()
  const { updateNote, deleteNote, archiveNote, saveStatus } = useNoteStore()
  
  const [title, setTitle] = useState(initialNote.title)
  const [content, setContent] = useState(initialNote.content || "")
  const [category, setCategory] = useState(initialNote.category || "Personal")
  const [tagInput, setTagInput] = useState("")
  const [tags, setTags] = useState(initialNote.tags.map(t => t.name))
  const [showAIPanel, setShowAIPanel] = useState(true)

  // Debounced autosave
  const debouncedSave = useCallback(
    debounce((data: any) => {
      updateNote(initialNote.id, data)
    }, 1000),
    [initialNote.id, updateNote]
  )

  // Cleanup debounce on unmount
  useEffect(() => {
    return () => {
      debouncedSave.cancel()
    }
  }, [debouncedSave])

  // Initial load or ID change sync
  useEffect(() => {
    setTitle(initialNote.title)
    setContent(initialNote.content || "")
    setCategory(initialNote.category || "Personal")
    setTags(initialNote.tags.map(t => t.name))
  }, [initialNote.id]) // Only sync when ID changes

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setTitle(value)
    debouncedSave({ title: value })
  }

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value
    setContent(value)
    debouncedSave({ content: value })
  }

  const handleCategoryChange = (value: string | null) => {
    if (!value) return
    setCategory(value)
    updateNote(initialNote.id, { category: value })
  }

  const handleAddTag = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault()
      if (!tags.includes(tagInput.trim())) {
        const newTags = [...tags, tagInput.trim()]
        setTags(newTags)
        updateNote(initialNote.id, { tags: newTags })
      }
      setTagInput("")
    }
  }

  const removeTag = (tagToRemove: string) => {
    const newTags = tags.filter(t => t !== tagToRemove)
    setTags(newTags)
    updateNote(initialNote.id, { tags: newTags })
  }

  const handleDelete = async () => {
    if (confirm("Are you sure you want to delete this note?")) {
      await deleteNote(initialNote.id)
      router.push("/notes")
    }
  }

  const handleArchive = async () => {
    await archiveNote(initialNote.id)
    router.push("/notes")
  }

  return (
    <div className="flex flex-col h-full gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header / Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-6 border-border/50">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()} className="rounded-xl">
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            {saveStatus === "saving" && (
              <div className="flex items-center gap-1.5 text-primary animate-pulse">
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                <span>Saving...</span>
              </div>
            )}
            {saveStatus === "saved" && (
              <div className="flex items-center gap-1.5 text-green-500">
                <CheckCircle2 className="h-3.5 w-3.5" />
                <span>Saved</span>
              </div>
            )}
            {saveStatus === "error" && (
              <div className="flex items-center gap-1.5 text-destructive">
                <AlertCircle className="h-3.5 w-3.5" />
                <span>Error saving</span>
              </div>
            )}
            {saveStatus === "idle" && (
              <div className="flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5" />
                <span>Last updated {formatDistanceToNow(new Date(initialNote.updatedAt), { addSuffix: true })}</span>
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Select value={category} onValueChange={handleCategoryChange}>
            <SelectTrigger className="w-[140px] rounded-xl bg-accent/20 border-transparent h-10">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              <SelectItem value="Personal">Personal</SelectItem>
              <SelectItem value="Work">Work</SelectItem>
              <SelectItem value="Ideas">Ideas</SelectItem>
              <SelectItem value="Meeting">Meeting</SelectItem>
              <SelectItem value="Study">Study</SelectItem>
            </SelectContent>
          </Select>
          
          <ShareNoteDialog note={initialNote} />
          
          <ScheduleNoteDialog note={initialNote} />
          
          <Button variant="outline" size="icon" className="rounded-xl h-10 w-10 border-border/50" onClick={handleArchive}>
            <Archive className="h-4 w-4" />
          </Button>
          
          <Button 
            variant={showAIPanel ? "default" : "outline"} 
            size="icon" 
            className={`rounded-xl h-10 w-10 border-border/50 ${showAIPanel ? 'bg-primary/10 text-primary hover:bg-primary/20 border-primary/20' : ''}`} 
            onClick={() => setShowAIPanel(!showAIPanel)}
          >
            <Sparkles className="h-4 w-4" />
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger 
              render={
                <Button variant="outline" size="icon" className="rounded-xl h-10 w-10 border-border/50" />
              }
            >
              <MoreVertical className="h-4 w-4" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="rounded-xl border-border/50">
              <DropdownMenuItem className="rounded-lg gap-2" onClick={() => router.push(`/share/${initialNote.shareId}`)} disabled={!initialNote.isPublic}>
                <ExternalLink className="h-4 w-4" /> View Public Page
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleDelete} className="rounded-lg gap-2 text-destructive">
                <Trash2 className="h-4 w-4" /> Delete Note
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Content Area & AI Panel */}
      <div className={`grid gap-8 ${showAIPanel ? 'lg:grid-cols-3' : 'grid-cols-1'}`}>
        <div className={showAIPanel ? 'lg:col-span-2 space-y-6' : 'space-y-6'}>
          {/* Editor Title */}
          <div className="px-2">
            <input
              type="text"
              value={title}
              onChange={handleTitleChange}
              placeholder="Note Title"
              className="w-full text-4xl font-extrabold bg-transparent border-none outline-none focus:ring-0 placeholder:text-muted-foreground/30"
            />
          </div>

          {/* Tags */}
          <div className="flex flex-wrap items-center gap-2 px-2">
            <TagIcon className="h-4 w-4 text-muted-foreground mr-1" />
            {tags.map((tag) => (
              <Badge key={tag} variant="secondary" className="rounded-lg px-2 py-1 flex items-center gap-1 group">
                {tag}
                <button onClick={() => removeTag(tag)} className="hover:text-destructive transition-colors">
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
            <input
              type="text"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={handleAddTag}
              placeholder="Add tag..."
              className="bg-transparent border-none outline-none focus:ring-0 text-sm w-24 placeholder:text-muted-foreground/50"
            />
          </div>

          {/* Text Area */}
          <div className="px-2">
            <textarea
              value={content}
              onChange={handleContentChange}
              placeholder="Start typing your thoughts..."
              className="w-full h-full min-h-[500px] text-lg leading-relaxed bg-transparent border-none outline-none focus:ring-0 resize-none placeholder:text-muted-foreground/20"
            />
          </div>
        </div>

        {showAIPanel && (
          <aside className="lg:col-span-1 animate-in fade-in slide-in-from-right-4 duration-500">
            <div className="sticky top-6">
              <AIInsightsPanel noteId={initialNote.id} />
            </div>
          </aside>
        )}
      </div>
    </div>
  )
}
