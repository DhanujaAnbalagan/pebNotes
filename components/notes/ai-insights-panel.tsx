"use client";

import { useState } from "react";
import { useNoteStore, AIInsight } from "@/store/use-note-store";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Sparkles, Loader2, AlertCircle, CheckCircle2, Copy, RefreshCw, ChevronDown, ChevronUp, Check } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { motion, AnimatePresence } from "framer-motion";

interface AIInsightsPanelProps {
  noteId: string;
}

export function AIInsightsPanel({ noteId }: AIInsightsPanelProps) {
  const { activeNote, isGeneratingAI, generateAIInsights, aiError } = useNoteStore();
  const [isExpanded, setIsExpanded] = useState(true);

  const insights = activeNote?.aiInsights?.[0]; // Get the latest insight

  const handleGenerate = async () => {
    await generateAIInsights(noteId);
    if (!aiError) {
      toast.success("AI Insights generated successfully!");
    }
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied to clipboard`);
  };

  const parseActionItems = (actionItemsJson: string): string[] => {
    try {
      return JSON.parse(actionItemsJson);
    } catch (e) {
      return [];
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-purple-500" />
          <h3 className="text-lg font-semibold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
            AI Insights
          </h3>
        </div>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => setIsExpanded(!isExpanded)}
          className="h-8 w-8 p-0"
        >
          {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </Button>
      </div>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            {isGeneratingAI ? (
              <div className="space-y-4">
                <Card className="bg-muted/30 border-none">
                  <CardContent className="py-6 space-y-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Loader2 className="h-4 w-4 animate-spin text-primary" />
                      <span className="text-sm font-medium animate-pulse">Analyzing your note...</span>
                    </div>
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-[90%]" />
                    <Skeleton className="h-4 w-[70%]" />
                  </CardContent>
                </Card>
                <div className="grid gap-4">
                  <Skeleton className="h-32 w-full" />
                  <Skeleton className="h-32 w-full" />
                </div>
              </div>
            ) : aiError ? (
              <Card className="border-destructive/50 bg-destructive/5 mb-4">
                <CardContent className="flex flex-col items-center justify-center py-6 text-center space-y-3">
                  <AlertCircle className="h-8 w-8 text-destructive" />
                  <div className="space-y-1">
                    <p className="font-medium text-destructive">Generation Failed</p>
                    <p className="text-xs text-muted-foreground">
                      {aiError}
                    </p>
                  </div>
                  <Button variant="outline" size="sm" onClick={handleGenerate} className="gap-2">
                    <RefreshCw className="h-3 w-3" /> Retry Generation
                  </Button>
                </CardContent>
              </Card>
            ) : !insights ? (
              <Card className="border-dashed border-2 bg-muted/30">
                <CardContent className="flex flex-col items-center justify-center py-8 text-center space-y-4">
                  <div className="p-3 rounded-full bg-primary/10">
                    <Sparkles className="h-6 w-6 text-primary" />
                  </div>
                  <div className="space-y-1">
                    <p className="font-medium">No insights generated yet</p>
                    <p className="text-sm text-muted-foreground">
                      Let Gemini analyze your note for summaries and action items.
                    </p>
                  </div>
                  <Button onClick={handleGenerate} className="w-full sm:w-auto">
                    Generate Insights
                  </Button>
                </CardContent>
              </Card>
            ) : null}

            {insights && !isGeneratingAI && (
              <div className="space-y-4">
                {/* Suggested Title */}
                {insights.suggestedTitle && (
                  <Card className="bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-950/20 dark:to-blue-950/20 border-primary/20">
                    <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
                      <CardTitle className="text-sm font-medium text-primary">Suggested Title</CardTitle>
                      <div className="flex items-center gap-1">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-6 w-6 text-primary hover:text-primary hover:bg-primary/10" 
                          onClick={() => {
                            useNoteStore.getState().updateNote(noteId, { title: insights.suggestedTitle! });
                            toast.success("Title applied!");
                          }}
                          title="Apply title"
                        >
                          <Check className="h-3.5 w-3.5" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-6 w-6" 
                          onClick={() => copyToClipboard(insights.suggestedTitle!, "Title")}
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm font-semibold">{insights.suggestedTitle}</p>
                    </CardContent>
                  </Card>
                )}

                {/* Summary */}
                <Card>
                  <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
                    <CardTitle className="text-sm font-medium">Summary</CardTitle>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-6 w-6" 
                      onClick={() => copyToClipboard(insights.summary, "Summary")}
                    >
                      <Copy className="h-3 w-3" />
                    </Button>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {insights.summary}
                    </p>
                  </CardContent>
                </Card>

                {/* Action Items */}
                <Card>
                  <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
                    <CardTitle className="text-sm font-medium">Action Items</CardTitle>
                    <Badge variant="secondary" className="font-normal">
                      {parseActionItems(insights.actionItems).length} items
                    </Badge>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {parseActionItems(insights.actionItems).map((item, index) => (
                      <div key={index} className="flex gap-2 items-start group">
                        <CheckCircle2 className="h-4 w-4 mt-0.5 text-green-500 shrink-0" />
                        <span className="text-sm leading-tight">{item}</span>
                      </div>
                    ))}
                  </CardContent>
                </Card>

                <div className="flex justify-end">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={handleGenerate}
                    className="gap-2 text-xs"
                    disabled={isGeneratingAI}
                  >
                    <RefreshCw className={`h-3 w-3 ${isGeneratingAI ? "animate-spin" : ""}`} />
                    Regenerate
                  </Button>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
