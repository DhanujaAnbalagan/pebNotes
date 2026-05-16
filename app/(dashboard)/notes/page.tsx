"use client"

import { useEffect, Suspense } from "react"
import { 
  Search, 
  Filter, 
  LayoutGrid, 
  List as ListIcon, 
  Plus, 
  MoreVertical,
  Tag as TagIcon,
  Calendar,
  Sparkles,
  Clock,
  Archive,
  Trash2,
  Undo2,
  FileText
} from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import Link from "next/link"
import { useNoteStore } from "@/store/use-note-store"
import { formatDistanceToNow } from "date-fns"
import { useRouter, useSearchParams } from "next/navigation"
import { EmptyState } from "@/components/ui/empty-state"
import debounce from "lodash/debounce"

function NotesPageContent() {
  const { 
    notes, 
    isLoading, 
    fetchNotes, 
    createNote, 
    archiveNote, 
    deleteNote,
    searchQuery,
    setSearchQuery,
    filterCategory,
    setFilterCategory,
    sortBy,
    setSortBy
  } = useNoteStore()
  const router = useRouter()
  const searchParams = useSearchParams()
  const isScheduledOnly = searchParams.get("scheduled") === "true"

  useEffect(() => {
    fetchNotes(false, isScheduledOnly)
  }, [fetchNotes, isScheduledOnly, filterCategory, sortBy])

  const handleCreateNote = async () => {
    const note = await createNote({ 
      title: "Untitled Note", 
      content: "", 
      category: "Personal" 
    })
    if (note) {
      router.push(`/notes/${note.id}`)
    }
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">All Notes</h1>
          <p className="text-muted-foreground mt-1">Manage and organize your thoughts and AI insights.</p>
        </div>
        <Button 
          onClick={handleCreateNote}
          className="rounded-xl shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 transition-all gap-2 h-11 px-6"
        >
          <Plus className="w-4 h-4" />
          New Note
        </Button>
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col sm:flex-row items-center gap-4">
        <div className="relative w-full sm:max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search notes..." 
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value)
              debounce(() => fetchNotes(), 500)()
            }}
            className="pl-10 h-11 bg-accent/20 border-transparent focus-visible:bg-accent/40 focus-visible:ring-primary/20 rounded-xl"
          />
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <DropdownMenu>
            <DropdownMenuTrigger 
              render={
                <Button variant="outline" className="h-11 rounded-xl border-border/50 gap-2 flex-1 sm:flex-initial" />
              }
            >
              <Filter className="w-4 h-4" />
              {filterCategory === "All" ? "Filter" : filterCategory}
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="rounded-xl border-border/50 w-48">
              <DropdownMenuGroup>
                <DropdownMenuLabel>Category</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {["All", "Personal", "Work", "Ideas", "Meeting", "Study"].map((cat) => (
                  <DropdownMenuItem 
                    key={cat} 
                    onClick={() => setFilterCategory(cat)}
                    className={`rounded-lg ${filterCategory === cat ? 'bg-accent' : ''}`}
                  >
                    {cat}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger 
              render={
                <Button variant="outline" className="h-11 rounded-xl border-border/50 gap-2 flex-1 sm:flex-initial" />
              }
            >
              <LayoutGrid className="w-4 h-4" />
              Sort
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="rounded-xl border-border/50 w-48">
              <DropdownMenuGroup>
                <DropdownMenuLabel>Sort By</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setSortBy("newest")} className={`rounded-lg ${sortBy === "newest" ? 'bg-accent' : ''}`}>
                  Newest First
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSortBy("oldest")} className={`rounded-lg ${sortBy === "oldest" ? 'bg-accent' : ''}`}>
                  Oldest First
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSortBy("a-z")} className={`rounded-lg ${sortBy === "a-z" ? 'bg-accent' : ''}`}>
                  Alphabetical A-Z
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSortBy("z-a")} className={`rounded-lg ${sortBy === "z-a" ? 'bg-accent' : ''}`}>
                  Alphabetical Z-A
                </DropdownMenuItem>
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Notes Grid */}
      {isLoading ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i} className="rounded-2xl border-none bg-accent/10 h-[200px] animate-pulse" />
          ))}
        </div>
      ) : notes.length === 0 ? (
        <EmptyState 
          icon={FileText}
          title={searchQuery || filterCategory !== "All" ? "No results found" : "No notes yet"}
          description={searchQuery || filterCategory !== "All" 
            ? "Try adjusting your search or filters to find what you're looking for." 
            : "Capture your first thought, meeting note, or brainstorm idea and organize it with Peblo AI."}
          action={searchQuery || filterCategory !== "All" ? undefined : {
            label: "Create first note",
            onClick: handleCreateNote
          }}
        />
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {notes.map((note) => (
            <Card key={note.id} className="group border-border/50 bg-card/50 hover:bg-accent/30 transition-all cursor-pointer rounded-2xl overflow-hidden h-full flex flex-col border-none shadow-sm hover:shadow-md relative">
              <Link href={`/notes/${note.id}`} className="absolute inset-0 z-0" />
              <CardContent className="p-6 flex flex-col h-full relative z-10">
                <div className="flex items-start justify-between mb-4">
                  <Badge className="rounded-lg bg-primary/10 text-primary border-none text-[10px] uppercase tracking-wider font-bold">
                    {note.category || "General"}
                  </Badge>
                  <DropdownMenu>
                    <DropdownMenuTrigger 
                      render={
                        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity" />
                      }
                    >
                      <MoreVertical className="h-4 w-4" />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="rounded-xl border-border/50">
                      <DropdownMenuItem onClick={() => archiveNote(note.id)} className="rounded-lg">
                        <Archive className="mr-2 h-4 w-4" /> Archive
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => deleteNote(note.id)} className="rounded-lg text-destructive">
                        <Trash2 className="mr-2 h-4 w-4" /> Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                
                <h3 className="text-xl font-bold mb-2 group-hover:text-primary transition-colors line-clamp-1">
                  {note.title}
                </h3>
                
                <p className="text-muted-foreground text-sm line-clamp-3 mb-6 flex-1 leading-relaxed">
                  {note.content || "No content yet..."}
                </p>
                
                <div className="flex items-center justify-between mt-auto pt-4 border-t border-border/50">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center text-[11px] text-muted-foreground gap-1">
                      <Clock className="w-3 h-3" />
                      {formatDistanceToNow(new Date(note.updatedAt), { addSuffix: true })}
                    </div>
                  </div>
                  <div className="flex -space-x-1">
                    {note.tags.map((tag) => (
                      <Badge key={tag.id} variant="secondary" className="px-1.5 py-0 text-[10px] font-normal">
                        {tag.name}
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
          
          <Card 
            onClick={handleCreateNote}
            className="border-2 border-dashed border-border/50 bg-transparent hover:bg-accent/20 transition-all cursor-pointer rounded-2xl h-full min-h-[200px] flex flex-col items-center justify-center p-8 group"
          >
            <div className="w-12 h-12 rounded-full bg-accent flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Plus className="w-6 h-6 text-muted-foreground" />
            </div>
            <p className="font-medium text-muted-foreground">New Note</p>
          </Card>
        </div>
      )}
    </div>
  )
}

export default function NotesPage() {
  return (
    <Suspense fallback={
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {[1,2,3,4,5,6].map(i => (
          <div key={i} className="rounded-2xl border-none bg-accent/10 h-[200px] animate-pulse" />
        ))}
      </div>
    }>
      <NotesPageContent />
    </Suspense>
  )
}
