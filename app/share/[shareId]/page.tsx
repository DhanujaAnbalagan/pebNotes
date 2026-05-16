import { NoteService } from "@/services/note.service";
import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, Tag as TagIcon, Sparkles, CheckCircle2, User } from "lucide-react";
import { format } from "date-fns";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";

export default async function PublicNotePage(props: { params: Promise<{ shareId: string }> }) {
  const params = await props.params;
  const note = await NoteService.getNoteByShareId(params.shareId);

  if (!note) {
    notFound();
  }

  const latestInsight = note.aiInsights?.[0];
  const actionItems = latestInsight?.actionItems ? JSON.parse(latestInsight.actionItems) : [];

  return (
    <div className="min-h-screen bg-background">
      {/* Public Header */}
      <nav className="border-b bg-background/60 backdrop-blur-xl sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-primary-foreground font-bold italic">
              P
            </div>
            <span className="font-bold tracking-tight text-xl">Peblo AI</span>
          </div>
          <Badge variant="outline" className="rounded-full bg-accent/30 border-transparent px-3 py-1 text-xs font-medium">
            Shared Note
          </Badge>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-6 py-12 md:py-20 animate-in fade-in slide-in-from-bottom-4 duration-700">
        <article className="space-y-12">
          {/* Note Metadata */}
          <header className="space-y-6">
            <div className="flex items-center gap-3">
              <Badge className="rounded-lg bg-primary/10 text-primary border-none text-[10px] uppercase tracking-wider font-bold">
                {note.category || "General"}
              </Badge>
              <div className="flex items-center text-muted-foreground text-sm gap-1.5">
                <Calendar className="w-3.5 h-3.5" />
                {format(new Date(note.createdAt), "MMMM dd, yyyy")}
              </div>
            </div>

            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight leading-tight">
              {note.title}
            </h1>

            <div className="flex items-center justify-between pt-4 border-t border-border/50">
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10 border border-border/50">
                  <AvatarImage src={note.user?.avatar || ""} />
                  <AvatarFallback>{note.user?.name?.substring(0, 2).toUpperCase()}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-semibold">{note.user?.name}</p>
                  <p className="text-xs text-muted-foreground">Author</p>
                </div>
              </div>

              <div className="flex gap-2">
                {note.tags.map((tag) => (
                  <Badge key={tag.id} variant="secondary" className="rounded-lg px-2.5 py-0.5 text-xs font-normal">
                    {tag.name}
                  </Badge>
                ))}
              </div>
            </div>
          </header>

          {/* Note Content */}
          <div className="prose prose-slate dark:prose-invert max-w-none">
            <div className="text-xl leading-relaxed text-foreground/90 whitespace-pre-wrap">
              {note.content || "This note has no content."}
            </div>
          </div>

          <Separator className="my-12 opacity-50" />

          {/* AI Insights Section */}
          {latestInsight && (
            <section className="space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-300">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-purple-500/10">
                  <Sparkles className="w-5 h-5 text-purple-500" />
                </div>
                <h2 className="text-2xl font-bold">AI Insights</h2>
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                <Card className="bg-muted/30 border-none rounded-2xl p-2">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Summary</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-lg leading-relaxed">{latestInsight.summary}</p>
                  </CardContent>
                </Card>

                <Card className="bg-muted/30 border-none rounded-2xl p-2">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Action Items</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {actionItems.map((item: string, index: number) => (
                      <div key={index} className="flex gap-3 items-start">
                        <CheckCircle2 className="h-5 w-5 mt-0.5 text-green-500 shrink-0" />
                        <span className="text-md leading-tight">{item}</span>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>
            </section>
          )}

          {/* Footer Call to Action */}
          <footer className="pt-20 text-center space-y-6">
            <Separator className="opacity-30" />
            <p className="text-muted-foreground text-sm">
              Shared via Peblo AI Notes — The intelligent workspace for your thoughts.
            </p>
            <div className="flex justify-center gap-4">
              <Badge variant="outline" className="rounded-full px-4 py-1.5 border-border/50 text-xs cursor-default">
                AI Powered
              </Badge>
              <Badge variant="outline" className="rounded-full px-4 py-1.5 border-border/50 text-xs cursor-default">
                Securely Shared
              </Badge>
            </div>
          </footer>
        </article>
      </main>
    </div>
  );
}
