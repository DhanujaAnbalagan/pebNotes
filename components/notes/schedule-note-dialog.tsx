"use client"

import { useState } from "react"
import { Calendar as CalendarIcon, Clock, Bell, X, CalendarDays } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useNoteStore, Note } from "@/store/use-note-store"
import { format } from "date-fns"
import { toast } from "sonner"

interface ScheduleNoteDialogProps {
  note: Note
}

export function ScheduleNoteDialog({ note }: ScheduleNoteDialogProps) {
  const { updateNote } = useNoteStore()
  const [open, setOpen] = useState(false)
  const [date, setDate] = useState(
    note.reminderAt ? format(new Date(note.reminderAt), "yyyy-MM-dd'T'HH:mm") : ""
  )

  const handleSchedule = async () => {
    if (!date) {
      toast.error("Please select a date and time")
      return
    }

    try {
      await updateNote(note.id, { 
        reminderAt: new Date(date) as any,
        reminderDismissed: false 
      })
      toast.success("Note scheduled successfully")
      setOpen(false)
    } catch (error) {
      toast.error("Failed to schedule note")
    }
  }

  const handleRemoveSchedule = async () => {
    try {
      await updateNote(note.id, { 
        reminderAt: null as any,
        reminderDismissed: false 
      })
      toast.success("Schedule removed")
      setDate("")
      setOpen(false)
    } catch (error) {
      toast.error("Failed to remove schedule")
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button variant="outline" size="icon" className="rounded-xl h-10 w-10 border-border/50 relative">
            <CalendarIcon className="h-4 w-4" />
            {note.reminderAt && (
              <span className="absolute -top-1 -right-1 flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
              </span>
            )}
          </Button>
        }
      />
      <DialogContent className="sm:max-w-[425px] rounded-2xl border-border/50 bg-background/95 backdrop-blur-xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl font-bold">
            <Bell className="w-5 h-5 text-primary" />
            Schedule Reminder
          </DialogTitle>
          <DialogDescription>
            Set a time to be notified about this note.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-6 py-4">
          <div className="space-y-2">
            <Label htmlFor="reminder-time" className="text-sm font-medium ml-1">Reminder Date & Time</Label>
            <div className="relative group">
              <CalendarDays className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
              <Input
                id="reminder-time"
                type="datetime-local"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="pl-10 h-12 bg-accent/20 border-transparent focus-visible:bg-accent/40 focus-visible:ring-primary/20 rounded-xl transition-all"
              />
            </div>
          </div>

          {note.reminderAt && (
            <div className="p-4 rounded-xl bg-primary/5 border border-primary/10 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Clock className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <p className="text-xs font-medium text-primary">Currently Scheduled</p>
                  <p className="text-sm text-muted-foreground">
                    {format(new Date(note.reminderAt), "MMM d, yyyy 'at' h:mm a")}
                  </p>
                </div>
              </div>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={handleRemoveSchedule}
                className="h-8 w-8 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          )}
        </div>
        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="ghost" onClick={() => setOpen(false)} className="rounded-xl h-11 px-6">
            Cancel
          </Button>
          <Button onClick={handleSchedule} className="rounded-xl h-11 px-6 shadow-lg shadow-primary/20">
            {note.reminderAt ? "Update Schedule" : "Schedule Note"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
