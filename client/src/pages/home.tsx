import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { BarChart3, History } from "lucide-react";
import { Link } from "wouter";
import { KeywordForm } from "@/components/keyword-form";
import { RankingResults } from "@/components/ranking-results";
import { StatsCards } from "@/components/stats-cards";
import { SavedKeywords } from "@/components/saved-keywords";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import type { BatchKeywordInput, RankingResult } from "@shared/schema";

export default function Home() {
  const [results, setResults] = useState<RankingResult[]>([]);
  const [compareEnabled, setCompareEnabled] = useState(false);
  const { toast } = useToast();

  const checkRankingsMutation = useMutation({
    mutationFn: async (data: BatchKeywordInput) => {
      const response = await apiRequest("POST", "/api/rankings/check", data);
      const json = await response.json();
      return json as RankingResult[];
    },
    onSuccess: (data) => {
      setResults(data);
      toast({
        title: "Rankings Retrieved",
        description: `Found rankings for ${data.length} keyword${data.length !== 1 ? "s" : ""}.`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to check rankings. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (data: BatchKeywordInput) => {
    setCompareEnabled(data.compareEnabled || false);
    checkRankingsMutation.mutate(data);
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <BarChart3 className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h1 className="text-lg font-semibold">RankTracker</h1>
                <p className="text-xs text-muted-foreground hidden sm:block">
                  SEO Keyword Ranking Monitor
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Link href="/history">
                <Button variant="outline" size="sm" data-testid="link-history">
                  <History className="h-4 w-4 mr-2" />
                  History
                </Button>
              </Link>
              <ThemeToggle />
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          <div className="space-y-2">
            <h2 className="text-3xl font-semibold">Keyword Ranking Tracker</h2>
            <p className="text-muted-foreground">
              Track your website's position in Google search results and monitor ranking changes over time.
            </p>
          </div>

          <KeywordForm
            onSubmit={handleSubmit}
            isLoading={checkRankingsMutation.isPending}
          />

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              {(results.length > 0 || checkRankingsMutation.isPending) && (
                <>
                  {results.length > 0 && (
                    <StatsCards results={results} compareEnabled={compareEnabled} />
                  )}
                  <RankingResults
                    results={results}
                    isLoading={checkRankingsMutation.isPending}
                    compareEnabled={compareEnabled}
                  />
                </>
              )}
            </div>
            <div className="lg:col-span-1">
              <SavedKeywords />
            </div>
          </div>
        </div>
      </main>

      <footer className="border-t border-border mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <p className="text-center text-sm text-muted-foreground">
            Powered by Google Search API. Track your rankings with confidence.
          </p>
        </div>
      </footer>
    </div>
  );
}
