"use client";

import { useEffect, useState } from "react";
import { Share2, FileText, Globe, Copy, ExternalLink, Link2Off, Search, Clock } from "lucide-react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";

export default function SharedPage() {
  const [notes, setNotes] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  const fetchSharedNotes = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/notes?isPublic=true");
      const data = await res.json();
      setNotes(data);
    } catch (error) {
      console.error("Failed to fetch shared notes:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSharedNotes();
  }, []);

  const handleUnshare = async (noteId: string) => {
    try {
      const res = await fetch(`/api/notes/${noteId}/share`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "unshare" }),
      });
      if (res.ok) {
        toast.success("Note access set to private");
        fetchSharedNotes();
      }
    } catch (error) {
      toast.error("Failed to unshare note");
    }
  };

  const copyShareLink = (shareId: string) => {
    const url = `${window.location.origin}/share/${shareId}`;
    navigator.clipboard.writeText(url);
    toast.success("Share link copied to clipboard!");
  };

  const filteredNotes = notes.filter(note => 
    note.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Shared Notes</h1>
          <p className="text-muted-foreground mt-1">
            Manage your publicly accessible notes and share links.
          </p>
        </div>
        <div className="relative w-full md:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input 
            placeholder="Search shared notes..." 
            className="pl-9 rounded-xl bg-card/50 border-border/50"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="grid gap-6">
        {isLoading ? (
          [1, 2].map(i => (
            <Card key={i} className="border-none bg-card/50 shadow-sm rounded-2xl overflow-hidden">
              <CardHeader>
                <Skeleton className="h-6 w-1/3 mb-2" />
                <Skeleton className="h-4 w-1/2" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-10 w-full rounded-xl" />
              </CardContent>
            </Card>
          ))
        ) : filteredNotes.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center space-y-4 bg-accent/5 rounded-3xl border border-dashed border-border/50">
            <div className="w-16 h-16 rounded-3xl bg-blue-500/10 flex items-center justify-center">
              <Share2 className="w-8 h-8 text-blue-500" />
            </div>
            <div>
              <h3 className="text-lg font-semibold">No shared notes</h3>
              <p className="text-muted-foreground max-w-xs mx-auto">
                {searchQuery 
                  ? `No shared notes match "${searchQuery}".` 
                  : "You haven't shared any notes yet. Mark a note as public to see it here."}
              </p>
            </div>
            {!searchQuery && (
              <Button className="rounded-xl" nativeButton={false} render={<Link href="/notes" />}>
                Browse All Notes
              </Button>
            )}
          </div>
        ) : (
          filteredNotes.map((note) => (
            <Card key={note.id} className="border-none bg-card/50 shadow-sm rounded-2xl overflow-hidden group border border-transparent hover:border-border/50 transition-all">
              <CardHeader className="flex flex-row items-start justify-between pb-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Globe className="w-4 h-4 text-blue-500" />
                    <CardTitle className="text-xl font-bold">{note.title}</CardTitle>
                  </div>
                  <CardDescription className="flex items-center gap-2">
                    <Clock className="w-3 h-3" />
                    Shared {formatDistanceToNow(new Date(note.updatedAt), { addSuffix: true })}
                  </CardDescription>
                </div>
                <Badge variant="secondary" className="rounded-lg bg-blue-500/10 text-blue-500 border-none">
                  Live
                </Badge>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-col md:flex-row items-center gap-3 p-3 rounded-xl bg-background/50 border border-border/50">
                  <div className="flex-1 flex items-center gap-2 px-2 overflow-hidden">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                    <span className="text-sm truncate text-muted-foreground font-mono">
                      {typeof window !== "undefined" ? `${window.location.origin}/share/${note.shareId}` : ""}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Button 
                      variant="secondary" 
                      size="sm" 
                      className="rounded-lg h-9 gap-2"
                      onClick={() => copyShareLink(note.shareId)}
                    >
                      <Copy className="w-3.5 h-3.5" /> Copy Link
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="rounded-lg h-9 gap-2"
                      nativeButton={false}
                      render={<Link href={`/share/${note.shareId}`} target="_blank" />}
                    >
                      <ExternalLink className="w-3.5 h-3.5" /> Open
                    </Button>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <Button variant="ghost" size="sm" className="rounded-lg gap-2" nativeButton={false} render={<Link href={`/notes/${note.id}`} />}>
                    <FileText className="w-4 h-4" /> Edit Original
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="rounded-lg gap-2 text-destructive hover:bg-destructive/10 hover:text-destructive"
                    onClick={() => handleUnshare(note.id)}
                  >
                    <Link2Off className="w-4 h-4" /> Disable Sharing
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
