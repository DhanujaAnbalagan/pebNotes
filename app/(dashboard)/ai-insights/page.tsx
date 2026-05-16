"use client";

import { useEffect, useState } from "react";
import { Sparkles, FileText, Calendar, ArrowRight, BrainCircuit, Search, ListChecks } from "lucide-react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";

export default function AiInsightsPage() {
  const [insights, setInsights] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    async function fetchInsights() {
      try {
        const res = await fetch("/api/ai/insights");
        const data = await res.json();
        setInsights(data);
      } catch (error) {
        console.error("Failed to fetch insights:", error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchInsights();
  }, []);

  const filteredInsights = insights.filter(insight => 
    insight.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
    insight.note.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">AI Insights</h1>
          <p className="text-muted-foreground mt-1">
            Browse and manage all intelligence generated for your notes.
          </p>
        </div>
        <div className="relative w-full md:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input 
            placeholder="Search insights..." 
            className="pl-9 rounded-xl bg-card/50 border-border/50"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Stats Column */}
        <div className="md:col-span-1 space-y-6">
          <Card className="border-none bg-gradient-to-br from-purple-500/10 to-primary/5 shadow-sm rounded-2xl overflow-hidden">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2 text-purple-500">
                <BrainCircuit className="w-4 h-4" />
                Total Insights
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{insights.length}</div>
              <p className="text-xs text-muted-foreground mt-1">Across your entire workspace</p>
            </CardContent>
          </Card>

          <Card className="border-none bg-card/50 shadow-sm rounded-2xl">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <ListChecks className="w-4 h-4 text-emerald-500" />
                Action Items
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {insights.reduce((acc, curr) => acc + (JSON.parse(curr.actionItems || "[]")).length, 0)}
              </div>
              <p className="text-xs text-muted-foreground mt-1">Extracted from your notes</p>
            </CardContent>
          </Card>
        </div>

        {/* Insights List Column */}
        <div className="md:col-span-3 space-y-4">
          {isLoading ? (
            [1, 2, 3].map(i => (
              <Card key={i} className="border-none bg-card/50 shadow-sm rounded-2xl overflow-hidden">
                <CardHeader>
                  <Skeleton className="h-6 w-1/3 mb-2" />
                  <Skeleton className="h-4 w-full" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-20 w-full rounded-xl" />
                </CardContent>
              </Card>
            ))
          ) : filteredInsights.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center space-y-4 bg-accent/5 rounded-3xl border border-dashed border-border/50">
              <div className="w-16 h-16 rounded-3xl bg-purple-500/10 flex items-center justify-center">
                <Sparkles className="w-8 h-8 text-purple-500" />
              </div>
              <div>
                <h3 className="text-lg font-semibold">No insights found</h3>
                <p className="text-muted-foreground max-w-xs mx-auto">
                  {searchQuery 
                    ? `No insights match your search "${searchQuery}".` 
                    : "Generate your first AI insight within a note to see it here."}
                </p>
              </div>
              {!searchQuery && (
                <Button className="rounded-xl" nativeButton={false} render={<Link href="/notes" />}>
                  Browse Notes
                </Button>
              )}
            </div>
          ) : (
            filteredInsights.map((insight) => {
              const actionItems = JSON.parse(insight.actionItems || "[]");
              return (
                <Card key={insight.id} className="border-none bg-card/50 shadow-sm rounded-2xl overflow-hidden group hover:bg-accent/30 transition-all border border-transparent hover:border-border/50">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between mb-2">
                      <Badge variant="secondary" className="rounded-lg bg-purple-500/10 text-purple-500 border-none">
                        AI Generated
                      </Badge>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Calendar className="w-3 h-3" />
                        {formatDistanceToNow(new Date(insight.createdAt), { addSuffix: true })}
                      </div>
                    </div>
                    <CardTitle className="text-xl font-bold group-hover:text-primary transition-colors">
                      {insight.suggestedTitle || insight.note.title}
                    </CardTitle>
                    <CardDescription className="flex items-center gap-2 mt-1">
                      <FileText className="w-3 h-3" />
                      Note: <Link href={`/notes/${insight.note.id}`} className="hover:underline text-foreground">{insight.note.title}</Link>
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="p-4 rounded-xl bg-background/50 border border-border/50">
                      <p className="text-sm leading-relaxed text-foreground">
                        {insight.summary}
                      </p>
                    </div>

                    {actionItems.length > 0 && (
                      <div className="space-y-2">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground px-1">Action Items</h4>
                        <div className="grid gap-2">
                          {actionItems.map((item: string, idx: number) => (
                            <div key={idx} className="flex items-start gap-3 p-2 rounded-lg bg-accent/20 text-sm">
                              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                              {item}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="rounded-lg group/btn"
                      nativeButton={false}
                      render={<Link href={`/notes/${insight.note.id}`} />}
                    >
                      View Original Note <ArrowRight className="ml-2 w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                    </Button>
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
