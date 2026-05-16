"use client"

import * as React from "react"
import { Search, Bell, Moon, Sun, Monitor, X, Clock } from "lucide-react"
import { useTheme } from "next-themes"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { useAuthStore } from "@/store/use-auth-store"
import { useNoteStore } from "@/store/use-note-store"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { usePathname } from "next/navigation"
import debounce from "lodash/debounce"
import { useNotificationStore } from "@/store/use-notification-store"
import { formatDistanceToNow } from "date-fns"
import Link from "next/link"
import { ScrollArea } from "@/components/ui/scroll-area"

import { SidebarTrigger } from "@/components/ui/sidebar"

export function TopNavbar() {
  const { setTheme } = useTheme()
  const { user } = useAuthStore()
  const { searchQuery, setSearchQuery, fetchNotes } = useNoteStore()
  const pathname = usePathname()
  
  const { 
    notifications, 
    fetchNotifications, 
    dismissNotification, 
    dismissAll 
  } = useNotificationStore()
  
  // Only show search on notes related pages
  const isNotesPage = pathname.includes("/notes") || pathname.includes("/dashboard") || pathname.includes("/archived")

  const debouncedFetch = React.useMemo(
    () => debounce(() => fetchNotes(pathname.includes("/archived")), 500),
    [fetchNotes, pathname]
  )

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value)
    debouncedFetch()
  }

  const [mounted, setMounted] = React.useState(false)
  
  React.useEffect(() => {
    setMounted(true)
    fetchNotifications()
    
    // Poll for notifications every minute
    const interval = setInterval(fetchNotifications, 60000)
    
    return () => {
      debouncedFetch.cancel()
      clearInterval(interval)
    }
  }, [debouncedFetch, fetchNotifications])

  if (!mounted) {
    return (
      <header className="sticky top-0 z-30 h-16 w-full border-b border-border/50 bg-background/60 backdrop-blur-xl">
        <div className="flex h-full items-center justify-between px-6">
          <div className="flex items-center gap-4 w-full max-w-md">
            <SidebarTrigger className="md:hidden" />
            <div className="flex w-full items-center relative">
              <Search className="absolute left-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search notes..."
                value=""
                className="w-full bg-accent/30 border-transparent pl-10 rounded-xl"
                disabled
              />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-accent/30 animate-pulse" />
            <div className="w-10 h-10 rounded-xl bg-accent/30 animate-pulse" />
          </div>
        </div>
      </header>
    )
  }

  return (
    <header className="sticky top-0 z-30 h-16 w-full border-b border-border/50 bg-background/60 backdrop-blur-xl">
      <div className="flex h-full items-center justify-between px-6">
        <div className="flex items-center gap-4 w-full max-w-md">
          <SidebarTrigger className="md:hidden" />
          <div className="flex w-full items-center relative">
            <Search className="absolute left-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search notes..."
              value={searchQuery}
              onChange={handleSearchChange}
              className="w-full bg-accent/30 border-transparent focus-visible:bg-accent/50 focus-visible:ring-1 focus-visible:ring-primary/20 pl-10 rounded-xl transition-all"
              disabled={!isNotesPage}
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger 
              render={
                <Button variant="ghost" size="icon" className="relative rounded-xl hover:bg-accent/50" />
              }
            >
              <Bell className="h-4 w-4" />
              {notifications.length > 0 && (
                <Badge className="absolute -top-1 -right-1 h-4 w-4 p-0 flex items-center justify-center bg-primary text-[10px] border-2 border-background">
                  {notifications.length}
                </Badge>
              )}
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80 rounded-2xl border-border/50 p-0 overflow-hidden shadow-2xl">
              <div className="p-4 border-b border-border/50 flex items-center justify-between bg-accent/10">
                <h3 className="font-bold">Notifications</h3>
                {notifications.length > 0 && (
                  <Button variant="ghost" size="sm" onClick={() => dismissAll()} className="h-8 text-[11px] font-bold uppercase tracking-wider hover:bg-primary/10 hover:text-primary transition-colors">
                    Clear All
                  </Button>
                )}
              </div>
              <ScrollArea className="h-[350px]">
                {notifications.length === 0 ? (
                  <div className="p-8 text-center">
                    <div className="w-12 h-12 rounded-full bg-accent/30 flex items-center justify-center mx-auto mb-3">
                      <Bell className="w-6 h-6 text-muted-foreground/50" />
                    </div>
                    <p className="text-sm text-muted-foreground font-medium">No new notifications</p>
                    <p className="text-xs text-muted-foreground/60 mt-1">We'll notify you when a reminder is due.</p>
                  </div>
                ) : (
                  <div className="py-2">
                    {notifications.map((n) => (
                      <div key={n.id} className="px-4 py-3 hover:bg-accent/30 transition-colors flex items-start gap-4 group">
                        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center mt-0.5 shrink-0 group-hover:scale-110 transition-transform">
                          <Clock className="w-4 h-4 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <Link href={`/notes/${n.id}`} className="block" onClick={() => dismissNotification(n.id)}>
                            <p className="text-sm font-semibold line-clamp-1 group-hover:text-primary transition-colors">{n.title}</p>
                            <p className="text-[11px] text-muted-foreground mt-0.5">
                              Reminder was set for {formatDistanceToNow(new Date(n.reminderAt), { addSuffix: true })}
                            </p>
                          </Link>
                        </div>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => dismissNotification(n.id)}
                          className="h-6 w-6 rounded-md opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="w-3 h-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>
              {notifications.length > 0 && (
                <div className="p-2 border-t border-border/50 bg-accent/5">
                  <Button variant="ghost" className="w-full h-9 text-xs font-medium rounded-xl" nativeButton={false} render={<Link href="/notes" />}>
                    View All Activity
                  </Button>
                </div>
              )}
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger 
              render={
                <Button variant="ghost" size="icon" className="rounded-xl hover:bg-accent/50" />
              }
            >
              <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
              <span className="sr-only">Toggle theme</span>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="rounded-xl border-border/50">
              <DropdownMenuItem onClick={() => setTheme("light")} className="rounded-lg">
                <Sun className="mr-2 h-4 w-4" /> Light
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTheme("dark")} className="rounded-lg">
                <Moon className="mr-2 h-4 w-4" /> Dark
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTheme("system")} className="rounded-lg">
                <Monitor className="mr-2 h-4 w-4" /> System
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <div className="h-6 w-[1px] bg-border/50 mx-2" />

          <Avatar className="h-8 w-8 border border-border/50 cursor-pointer hover:opacity-80 transition-opacity">
            <AvatarImage src={user?.avatar || `https://avatar.vercel.sh/${user?.email}.png`} />
            <AvatarFallback>{user?.name?.substring(0, 2).toUpperCase() || "JD"}</AvatarFallback>
          </Avatar>
        </div>
      </div>
    </header>
  )
}
