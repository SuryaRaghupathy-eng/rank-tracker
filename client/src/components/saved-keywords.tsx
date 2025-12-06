import { useQuery, useMutation } from "@tanstack/react-query";
import { Bookmark, Trash2, RefreshCw, Loader2, Plus, History } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { SavedKeyword, RankingHistory } from "@shared/schema";
import { format } from "date-fns";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useState } from "react";

interface SavedKeywordsProps {
  onAddKeyword?: (keyword: string, websiteUrl: string) => void;
}

export function SavedKeywords({ onAddKeyword }: SavedKeywordsProps) {
  const { toast } = useToast();
  const [selectedKeyword, setSelectedKeyword] = useState<SavedKeyword | null>(null);

  const { data: keywords = [], isLoading } = useQuery<SavedKeyword[]>({
    queryKey: ["/api/keywords"],
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/keywords/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/keywords"] });
      toast({
        title: "Keyword Removed",
        description: "The keyword has been removed from your saved list.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete keyword.",
        variant: "destructive",
      });
    },
  });

  const checkMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await apiRequest("POST", `/api/keywords/${id}/check`);
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/keywords"] });
      queryClient.invalidateQueries({ queryKey: ["/api/keywords", selectedKeyword?.id, "history"] });
      const position = data.result?.position;
      toast({
        title: "Ranking Checked",
        description: position 
          ? `Current position: #${position}` 
          : "Website not found in top results.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to check ranking.",
        variant: "destructive",
      });
    },
  });

  const { data: historyData, isLoading: isHistoryLoading } = useQuery<{
    keyword: SavedKeyword;
    history: RankingHistory[];
  }>({
    queryKey: ["/api/keywords", selectedKeyword?.id, "history"],
    enabled: !!selectedKeyword,
  });

  if (isLoading) {
    return (
      <Card className="border-card-border">
        <CardHeader className="pb-4">
          <CardTitle className="text-xl font-medium flex items-center gap-2">
            <Bookmark className="h-5 w-5 text-primary" />
            Saved Keywords
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (keywords.length === 0) {
    return (
      <Card className="border-card-border">
        <CardHeader className="pb-4">
          <CardTitle className="text-xl font-medium flex items-center gap-2">
            <Bookmark className="h-5 w-5 text-primary" />
            Saved Keywords
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <Bookmark className="h-12 w-12 mx-auto mb-4 opacity-30" />
            <p>No saved keywords yet.</p>
            <p className="text-sm mt-1">Save keywords from search results to track them over time.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-card-border">
      <CardHeader className="pb-4">
        <CardTitle className="text-xl font-medium flex items-center gap-2">
          <Bookmark className="h-5 w-5 text-primary" />
          Saved Keywords
          <Badge variant="secondary" className="ml-auto">
            {keywords.length}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {keywords.map((kw) => (
            <div
              key={kw.id}
              className="flex items-center justify-between gap-3 p-3 rounded-lg bg-muted/30 border border-border"
              data-testid={`saved-keyword-${kw.id}`}
            >
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate" data-testid={`text-keyword-${kw.id}`}>
                  {kw.keyword}
                </p>
                <p className="text-sm text-muted-foreground truncate">
                  {kw.websiteUrl}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Added {format(new Date(kw.createdAt), "MMM d, yyyy")}
                </p>
              </div>
              <div className="flex items-center gap-1">
                <Dialog>
                  <DialogTrigger asChild>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => setSelectedKeyword(kw)}
                      data-testid={`button-history-${kw.id}`}
                    >
                      <History className="h-4 w-4" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-md">
                    <DialogHeader>
                      <DialogTitle>Ranking History</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-2">
                      <p className="text-sm font-medium">{selectedKeyword?.keyword}</p>
                      <p className="text-xs text-muted-foreground">{selectedKeyword?.websiteUrl}</p>
                    </div>
                    <ScrollArea className="h-64 mt-4">
                      {isHistoryLoading ? (
                        <div className="flex items-center justify-center py-8">
                          <Loader2 className="h-6 w-6 animate-spin" />
                        </div>
                      ) : historyData?.history.length === 0 ? (
                        <p className="text-center text-muted-foreground py-8">
                          No ranking history yet. Check the ranking to start tracking.
                        </p>
                      ) : (
                        <div className="space-y-2">
                          {historyData?.history.map((h) => (
                            <div
                              key={h.id}
                              className="flex items-center justify-between p-2 rounded bg-muted/50"
                            >
                              <span className="text-sm">
                                {format(new Date(h.checkedAt), "MMM d, yyyy h:mm a")}
                              </span>
                              <Badge variant={h.position ? "default" : "secondary"}>
                                {h.position ? `#${h.position}` : "Not found"}
                              </Badge>
                            </div>
                          ))}
                        </div>
                      )}
                    </ScrollArea>
                  </DialogContent>
                </Dialog>
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => checkMutation.mutate(kw.id)}
                  disabled={checkMutation.isPending}
                  data-testid={`button-check-${kw.id}`}
                >
                  {checkMutation.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <RefreshCw className="h-4 w-4" />
                  )}
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => deleteMutation.mutate(kw.id)}
                  disabled={deleteMutation.isPending}
                  data-testid={`button-delete-${kw.id}`}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
