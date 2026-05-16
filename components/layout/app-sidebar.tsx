"use client"

import * as React from "react"
import {
  LayoutDashboard,
  FileText,
  Archive,
  Sparkles,
  Share2,
  BarChart3,
  Settings,
  ChevronLeft,
  ChevronRight,
  Plus,
  Search,
} from "lucide-react"
import { usePathname } from "next/navigation"
import Link from "next/link"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "All Notes", href: "/notes", icon: FileText },
  { name: "Archived", href: "/archived", icon: Archive },
  { name: "AI Insights", href: "/ai-insights", icon: Sparkles },
  { name: "Shared Notes", href: "/shared", icon: Share2 },
  { name: "Analytics", href: "/analytics", icon: BarChart3 },
  { name: "Settings", href: "/settings", icon: Settings },
]

import { logoutAction } from "@/app/actions/auth"
import { useAuthStore } from "@/store/use-auth-store"

export function AppSidebar() {
  const pathname = usePathname()
  const { state } = useSidebar()
  const { user, logout } = useAuthStore()

  const [mounted, setMounted] = React.useState(false)
  
  React.useEffect(() => {
    setMounted(true)
  }, [])

  const handleLogout = async () => {
    await logoutAction()
    logout()
  }

  if (!mounted) return null

  return (
    <Sidebar collapsible="icon" className="border-r border-border/50 bg-sidebar/50 backdrop-blur-xl">
      <SidebarHeader className="h-16 border-b border-border/50 flex flex-row items-center justify-between px-4">
        <div className={cn("flex items-center gap-3 transition-all duration-300", state === "collapsed" && "opacity-0")}>
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-primary-foreground" />
          </div>
          <span className="font-bold text-lg tracking-tight whitespace-nowrap">Peblo AI</span>
        </div>
        <SidebarTrigger className="h-8 w-8 hover:bg-accent" />
      </SidebarHeader>

      <SidebarContent className="p-2">
        <div className="mb-4">
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton 
                render={<Link href="/notes/new" />}
                className="w-full h-10 bg-primary/5 hover:bg-primary/10 text-primary border border-primary/10 transition-all duration-200"
              >
                <Plus className="w-4 h-4 mr-2" />
                <span className={cn("font-medium", state === "collapsed" && "hidden")}>New Note</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </div>

        <SidebarMenu>
          {navigation.map((item) => (
            <SidebarMenuItem key={item.name}>
              <SidebarMenuButton
                render={<Link href={item.href} />}
                isActive={pathname === item.href}
                className={cn(
                  "h-10 transition-all duration-200",
                  pathname === item.href 
                    ? "bg-accent/50 text-accent-foreground font-medium shadow-sm" 
                    : "text-muted-foreground hover:bg-accent/30 hover:text-foreground"
                )}
              >
                <item.icon className="w-4 h-4 mr-2" />
                <span>{item.name}</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>

      <SidebarFooter className="p-4 border-t border-border/50 bg-sidebar/20">
        <DropdownMenu>
          <DropdownMenuTrigger 
            render={
              <SidebarMenuButton className="h-12 w-full flex items-center gap-3 hover:bg-accent/50 rounded-xl transition-all" />
            }
          >
            <Avatar className="h-8 w-8 border border-border/50">
                <AvatarImage src={user?.avatar || `https://avatar.vercel.sh/${user?.email}.png`} />
                <AvatarFallback>{user?.name?.substring(0, 2).toUpperCase() || "JD"}</AvatarFallback>
              </Avatar>
              <div className={cn("flex flex-col items-start transition-all duration-300", state === "collapsed" && "opacity-0 w-0 overflow-hidden")}>
                <span className="text-sm font-semibold leading-none">{user?.name || "User"}</span>
                <span className="text-xs text-muted-foreground mt-1 truncate max-w-[120px]">{user?.email || "user@example.com"}</span>
              </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent side="right" align="end" className="w-56 rounded-xl p-2 shadow-2xl border-border/50">
            <DropdownMenuGroup>
              <DropdownMenuLabel className="font-normal px-2 py-1.5">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">{user?.name || "User"}</p>
                  <p className="text-xs leading-none text-muted-foreground">{user?.email || "user@example.com"}</p>
                </div>
              </DropdownMenuLabel>
            </DropdownMenuGroup>
            <DropdownMenuSeparator className="my-2 bg-border/50" />
            <DropdownMenuItem className="rounded-lg cursor-pointer hover:bg-accent focus:bg-accent">
              Profile Settings
            </DropdownMenuItem>
            <DropdownMenuItem className="rounded-lg cursor-pointer hover:bg-accent focus:bg-accent">
              Subscription
            </DropdownMenuItem>
            <DropdownMenuSeparator className="my-2 bg-border/50" />
            <DropdownMenuItem 
              className="rounded-lg cursor-pointer text-destructive focus:text-destructive hover:bg-destructive/10 focus:bg-destructive/10"
              onClick={handleLogout}
            >
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarFooter>
    </Sidebar>
  )
}
