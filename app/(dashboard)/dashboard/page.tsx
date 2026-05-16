"use client"

import { useEffect } from "react"
import { 
  FileText, 
  Sparkles, 
  Clock, 
  ArrowUpRight, 
  Plus,
  Calendar,
  Zap,
  Layout,
  Archive
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useNoteStore } from "@/store/use-note-store"
import { useAuthStore } from "@/store/use-auth-store"
import { formatDistanceToNow } from "date-fns"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { DashboardCharts } from "@/components/dashboard/dashboard-charts"
import { useState } from "react"

export default function DashboardPage() {
  const { notes, fetchNotes, createNote, isLoading } = useNoteStore()
  const { user } = useAuthStore()
  const router = useRouter()
  const [analytics, setAnalytics] = useState<any>(null)
  const [isAnalyticsLoading, setIsAnalyticsLoading] = useState(true)

  useEffect(() => {
    fetchNotes()
    
    const fetchAnalytics = async () => {
      try {
        const res = await fetch("/api/analytics")
        const data = await res.json()
        setAnalytics(data)
      } catch (error) {
        console.error("Failed to fetch analytics:", error)
      } finally {
        setIsAnalyticsLoading(false)
      }
    }
    
    fetchAnalytics()
  }, [fetchNotes])

  const handleCreateNote = async () => {
    const note = await createNote({ title: "Untitled Note", content: "", category: "Personal" })
    if (note) {
      router.push(`/notes/${note.id}`)
    }
  }

  const recentNotes = notes.slice(0, 3)
  const totalNotes = notes.length
  const recentUpdates = notes.filter(n => {
    const lastUpdate = new Date(n.updatedAt).getTime()
    const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000
    return lastUpdate > oneDayAgo
  }).length

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Welcome back, {user?.name?.split(' ')[0] || 'User'}!</h1>
          <p className="text-muted-foreground mt-1">Here's what's happening with your workspace today.</p>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/notes?scheduled=true">
            <Button variant="outline" className="rounded-xl border-border/50 gap-2">
              <Calendar className="w-4 h-4" />
              Schedule
            </Button>
          </Link>
          <Button onClick={handleCreateNote} className="rounded-xl shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 transition-all gap-2">
            <Plus className="w-4 h-4" />
            New Note
          </Button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-none bg-card/50 shadow-sm rounded-2xl overflow-hidden group hover:bg-accent/30 transition-all">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Total Notes</CardTitle>
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform">
              <FileText className="h-4 w-4 text-primary" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics?.stats?.totalNotes ?? 0}</div>
            <p className="text-xs text-muted-foreground mt-1">
              All notes in your workspace
            </p>
          </CardContent>
        </Card>
        <Card className="border-none bg-card/50 shadow-sm rounded-2xl overflow-hidden group hover:bg-accent/30 transition-all">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">AI Insights</CardTitle>
            <div className="w-8 h-8 rounded-lg bg-purple-500/10 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Sparkles className="h-4 w-4 text-purple-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics?.stats?.totalAIInsights ?? 0}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Powered by Gemini AI
            </p>
          </CardContent>
        </Card>
        <Card className="border-none bg-card/50 shadow-sm rounded-2xl overflow-hidden group hover:bg-accent/30 transition-all">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Archived</CardTitle>
            <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Archive className="h-4 w-4 text-blue-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics?.stats?.archivedNotes ?? 0}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Safely stored away
            </p>
          </CardContent>
        </Card>
        <Card className="border-none bg-card/50 shadow-sm rounded-2xl overflow-hidden group hover:bg-accent/30 transition-all">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Weekly Focus</CardTitle>
            <div className="w-8 h-8 rounded-lg bg-orange-500/10 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Zap className="h-4 w-4 text-orange-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {analytics?.activity?.reduce((acc: number, curr: any) => acc + curr.notes, 0) || 0}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Activity this week
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Analytics Charts */}
      {!isAnalyticsLoading && analytics && (
        <DashboardCharts 
          activity={analytics.activity} 
          categories={analytics.categories} 
        />
      )}

      <div className="grid gap-6 md:grid-cols-7">
        {/* Recent Notes List */}
        <Card className="md:col-span-4 border-none bg-card/50 shadow-sm rounded-2xl overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Recent Notes</CardTitle>
              <CardDescription>Quick access to your latest thoughts.</CardDescription>
            </div>
            <Button 
              variant="ghost" 
              size="sm" 
              className="rounded-lg gap-1"
              nativeButton={false}
              render={<Link href="/notes" />}
            >
              View All <ArrowUpRight className="w-4 h-4" />
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            {isLoading ? (
              [1, 2, 3].map(i => <div key={i} className="h-16 bg-accent/10 animate-pulse rounded-xl" />)
            ) : recentNotes.length === 0 ? (
              <div className="py-12 text-center flex flex-col items-center gap-4 text-muted-foreground bg-accent/5 rounded-2xl">
                <Layout className="w-10 h-10 opacity-20" />
                <p>No notes found. Start by creating one!</p>
                <Button variant="outline" size="sm" onClick={handleCreateNote}>Create Note</Button>
              </div>
            ) : (
              recentNotes.map((note) => (
                <Link key={note.id} href={`/notes/${note.id}`}>
                  <div className="flex items-center justify-between p-4 rounded-xl hover:bg-accent/30 transition-all group mb-2 border border-transparent hover:border-border/50">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-lg bg-background shadow-sm border border-border/50 flex items-center justify-center group-hover:text-primary transition-colors">
                        <FileText className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="font-semibold line-clamp-1">{note.title}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-xs text-muted-foreground">
                            {formatDistanceToNow(new Date(note.updatedAt), { addSuffix: true })}
                          </span>
                          <span className="text-xs text-muted-foreground/30">•</span>
                          <Badge variant="ghost" className="h-4 px-1 text-[10px] font-normal text-muted-foreground uppercase tracking-tight">
                            {note.category || "General"}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    <ArrowUpRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </Link>
              ))
            )}
          </CardContent>
        </Card>

        {/* AI Insight Teaser */}
        <Card className="md:col-span-3 border-none bg-gradient-to-br from-purple-500/5 to-primary/5 shadow-sm rounded-2xl overflow-hidden relative group">
          <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform duration-500">
            <Sparkles className="w-24 h-24 text-primary" />
          </div>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-purple-500" />
              AI Summary
            </CardTitle>
            <CardDescription>Intelligent overview of your activity.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 relative z-10">
            <div className="p-4 rounded-xl bg-background/50 border border-border/50 backdrop-blur-sm">
              <p className="text-sm font-medium mb-2 flex items-center gap-2">
                <Zap className="h-3 w-3 text-yellow-500" />
                Latest Productivity
              </p>
              <p className="text-xs text-muted-foreground leading-relaxed">
                You've created {analytics?.stats?.totalNotes || 0} notes so far. 
                {analytics?.stats?.totalAIInsights > 0 
                  ? ` You've generated ${analytics.stats.totalAIInsights} AI insights to boost your workflow.`
                  : " Generate your first AI insight to see advanced analytics here."}
              </p>
            </div>
            <Button 
              className="w-full rounded-xl bg-gradient-to-r from-purple-600 to-primary hover:from-purple-700 hover:to-primary/90 shadow-lg shadow-primary/20"
              nativeButton={false}
              render={<Link href="/notes" />}
            >
              Manage Notes
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
