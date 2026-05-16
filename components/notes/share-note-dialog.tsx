"use client";

import { useState } from "react";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Share2, Copy, Check, Globe, Lock, ExternalLink } from "lucide-react";
import { useNoteStore, Note } from "@/store/use-note-store";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

interface ShareNoteDialogProps {
  note: Note;
}

export function ShareNoteDialog({ note }: ShareNoteDialogProps) {
  const { toggleShareNote } = useNoteStore();
  const [copied, setCopied] = useState(false);
  
  const shareUrl = typeof window !== "undefined" 
    ? `${window.location.origin}/share/${note.shareId}` 
    : "";

  const handleShareToggle = async () => {
    const action = note.isPublic ? "unshare" : "share";
    await toggleShareNote(note.id, action);
    toast.success(action === "share" ? "Note shared publicly!" : "Note unshared.");
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    toast.success("Link copied to clipboard");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Dialog>
      <DialogTrigger 
        render={
          <Button variant="outline" size="sm" className="rounded-xl h-10 gap-2 border-border/50" />
        }
      >
        <Share2 className="h-4 w-4" />
        Share
      </DialogTrigger>
      <DialogContent className="sm:max-w-md rounded-2xl border-border/50">
        <DialogHeader>
          <DialogTitle>Share Note</DialogTitle>
          <DialogDescription>
            Make this note public to share it with anyone.
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex flex-col space-y-6 py-4">
          <div className="flex items-center justify-between p-4 rounded-xl bg-accent/20 border border-border/50">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${note.isPublic ? 'bg-green-500/10 text-green-500' : 'bg-muted text-muted-foreground'}`}>
                {note.isPublic ? <Globe className="h-5 w-5" /> : <Lock className="h-5 w-5" />}
              </div>
              <div>
                <p className="text-sm font-semibold">{note.isPublic ? 'Publicly Shared' : 'Private Note'}</p>
                <p className="text-xs text-muted-foreground">
                  {note.isPublic ? 'Anyone with the link can view' : 'Only you can see this note'}
                </p>
              </div>
            </div>
            <Button 
              variant={note.isPublic ? "outline" : "default"} 
              size="sm" 
              className="rounded-lg h-9"
              onClick={handleShareToggle}
            >
              {note.isPublic ? 'Stop Sharing' : 'Share Now'}
            </Button>
          </div>

          {note.isPublic && (
            <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
              <div className="space-y-2">
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider ml-1">
                  Public Link
                </label>
                <div className="flex items-center space-x-2">
                  <div className="relative flex-1">
                    <Input
                      readOnly
                      value={shareUrl}
                      className="bg-accent/10 border-border/50 rounded-xl pr-10 focus-visible:ring-0"
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute right-1 top-1 h-8 w-8 rounded-lg"
                      onClick={copyToClipboard}
                    >
                      {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                    </Button>
                  </div>
                  <Button 
                    variant="outline" 
                    size="icon" 
                    className="h-10 w-10 rounded-xl border-border/50" 
                    nativeButton={false}
                    render={<a href={shareUrl} target="_blank" rel="noopener noreferrer" />}
                  >
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="p-4 rounded-xl border-2 border-dashed border-border/50 text-center space-y-2">
                <p className="text-xs text-muted-foreground">
                  The public page will show the title, content, tags, and AI insights.
                </p>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
