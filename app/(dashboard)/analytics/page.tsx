"use client";

import { useEffect, useState } from "react";
import { BarChart3, TrendingUp, Sparkles, FileText, Archive as ArchiveIcon, PieChart as PieChartIcon } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DashboardCharts } from "@/components/dashboard/dashboard-charts";
import { Skeleton } from "@/components/ui/skeleton";

export default function AnalyticsPage() {
  const [analytics, setAnalytics] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchAnalytics() {
      try {
        const res = await fetch("/api/analytics");
        const data = await res.json();
        setAnalytics(data);
      } catch (error) {
        console.error("Failed to fetch analytics:", error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchAnalytics();
  }, []);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>
        <p className="text-muted-foreground mt-1">
          Deep dive into your productivity patterns and note-taking habits.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {isLoading ? (
          [1, 2, 3, 4].map(i => <Skeleton key={i} className="h-32 rounded-2xl" />)
        ) : (
          <>
            <Card className="border-none bg-card/50 shadow-sm rounded-2xl overflow-hidden group hover:bg-accent/30 transition-all">
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle className="text-sm font-medium">Total Notes</CardTitle>
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                  <FileText className="h-4 w-4 text-primary" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{analytics?.stats?.totalNotes || 0}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  Lifetime notes created
                </p>
              </CardContent>
            </Card>

            <Card className="border-none bg-card/50 shadow-sm rounded-2xl overflow-hidden group hover:bg-accent/30 transition-all">
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle className="text-sm font-medium">AI Insights</CardTitle>
                <div className="w-8 h-8 rounded-lg bg-purple-500/10 flex items-center justify-center">
                  <Sparkles className="h-4 w-4 text-purple-500" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{analytics?.stats?.totalAIInsights || 0}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  Intelligent summaries generated
                </p>
              </CardContent>
            </Card>

            <Card className="border-none bg-card/50 shadow-sm rounded-2xl overflow-hidden group hover:bg-accent/30 transition-all">
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle className="text-sm font-medium">Archived</CardTitle>
                <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
                  <ArchiveIcon className="h-4 w-4 text-blue-500" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{analytics?.stats?.archivedNotes || 0}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  Notes in archive
                </p>
              </CardContent>
            </Card>

            <Card className="border-none bg-card/50 shadow-sm rounded-2xl overflow-hidden group hover:bg-accent/30 transition-all">
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle className="text-sm font-medium">Growth</CardTitle>
                <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                  <TrendingUp className="h-4 w-4 text-emerald-500" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {analytics?.activity?.reduce((acc: number, curr: any) => acc + curr.notes, 0) || 0}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  New notes this week
                </p>
              </CardContent>
            </Card>
          </>
        )}
      </div>

      {!isLoading && analytics && (
        <DashboardCharts 
          activity={analytics.activity} 
          categories={analytics.categories} 
        />
      )}

      {/* Top Tags Section */}
      {!isLoading && analytics?.tags && analytics.tags.length > 0 && (
        <Card className="border-none bg-card/50 shadow-sm rounded-2xl overflow-hidden">
          <CardHeader>
            <CardTitle className="text-lg font-bold">Popular Tags</CardTitle>
            <CardDescription>Tags you use most frequently across your notes.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-3">
              {analytics.tags.map((tag: any) => (
                <div key={tag.name} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-accent/20 border border-border/50 group hover:bg-accent/40 transition-all">
                  <span className="font-medium">{tag.name}</span>
                  <span className="text-xs text-muted-foreground bg-background/50 px-1.5 py-0.5 rounded-md">
                    {tag.count}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
