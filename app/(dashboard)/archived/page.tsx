"use client"

import { useEffect } from "react"
import { 
  Search, 
  Filter, 
  LayoutGrid, 
  List as ListIcon, 
  MoreVertical,
  Calendar,
  Clock,
  Trash2,
  Undo2,
  Archive
} from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import Link from "next/link"
import { useNoteStore } from "@/store/use-note-store"
import { formatDistanceToNow } from "date-fns"
import { EmptyState } from "@/components/ui/empty-state"
import { FileText } from "lucide-react"

export default function ArchivedPage() {
  const { archivedNotes, isLoading, fetchNotes, restoreNote, deleteNote, searchQuery, setSearchQuery } = useNoteStore()

  useEffect(() => {
    fetchNotes(true) // Fetch archived notes
  }, [fetchNotes, searchQuery])

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-muted-foreground">Archived Notes</h1>
          <p className="text-muted-foreground mt-1">Review or restore your archived thoughts.</p>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col sm:flex-row items-center gap-4 opacity-70">
        <div className="relative w-full sm:max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search archived notes..." 
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value)
            }}
            className="pl-10 h-11 bg-accent/20 border-transparent focus-visible:bg-accent/40 focus-visible:ring-primary/20 rounded-xl"
          />
        </div>
      </div>

      {/* Notes Grid */}
      {isLoading ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="rounded-2xl border-none bg-accent/10 h-[200px] animate-pulse" />
          ))}
        </div>
      ) : archivedNotes.length === 0 ? (
        <EmptyState 
          icon={Archive}
          title="Archive is empty"
          description="Notes you archive will appear here. You can restore them anytime or delete them permanently."
        />
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {archivedNotes.map((note) => (
            <Card key={note.id} className="group border-border/50 bg-card/30 hover:bg-accent/10 transition-all rounded-2xl overflow-hidden h-full flex flex-col border-none shadow-sm relative grayscale opacity-80 hover:grayscale-0 hover:opacity-100 transition-all duration-300">
              <CardContent className="p-6 flex flex-col h-full relative z-10">
                <div className="flex items-start justify-between mb-4">
                  <Badge className="rounded-lg bg-muted text-muted-foreground border-none text-[10px] uppercase tracking-wider font-bold">
                    {note.category || "General"}
                  </Badge>
                  <DropdownMenu>
                    <DropdownMenuTrigger 
                      render={
                        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg" />
                      }
                    >
                      <MoreVertical className="h-4 w-4" />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="rounded-xl border-border/50">
                      <DropdownMenuItem onClick={() => restoreNote(note.id)} className="rounded-lg">
                        <Undo2 className="mr-2 h-4 w-4" /> Restore Note
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => deleteNote(note.id)} className="rounded-lg text-destructive">
                        <Trash2 className="mr-2 h-4 w-4" /> Delete Permanently
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                
                <h3 className="text-xl font-bold mb-2 line-clamp-1">
                  {note.title}
                </h3>
                
                <p className="text-muted-foreground text-sm line-clamp-3 mb-6 flex-1 leading-relaxed">
                  {note.content || "No content..."}
                </p>
                
                <div className="flex items-center justify-between mt-auto pt-4 border-t border-border/50">
                  <div className="flex items-center text-[11px] text-muted-foreground gap-1">
                    <Calendar className="w-3 h-3" />
                    Archived on {new Date(note.updatedAt).toLocaleDateString()}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
