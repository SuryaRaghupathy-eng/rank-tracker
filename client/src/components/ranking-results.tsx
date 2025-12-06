import { ExternalLink, Search, AlertCircle, Bookmark, Loader2, Download, FileText } from "lucide-react";
import { format } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { RankingResult } from "@shared/schema";

interface RankingResultsProps {
  results: RankingResult[];
  isLoading?: boolean;
}

function PositionBadge({ position }: { position: number | null }) {
  if (position === null) {
    return (
      <div className="flex items-center justify-center h-10 w-10 rounded-full bg-muted text-muted-foreground text-sm font-medium">
        N/A
      </div>
    );
  }

  let bgClass = "bg-muted text-muted-foreground";
  if (position === 1) {
    bgClass = "bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30";
  } else if (position === 2) {
    bgClass = "bg-slate-400/15 text-slate-600 dark:text-slate-300 border border-slate-400/30";
  } else if (position === 3) {
    bgClass = "bg-orange-500/15 text-orange-600 dark:text-orange-400 border border-orange-500/30";
  } else if (position <= 10) {
    bgClass = "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20";
  }

  return (
    <div
      className={`flex items-center justify-center h-10 w-10 rounded-full text-sm font-bold ${bgClass}`}
    >
      {position}
    </div>
  );
}

function ResultsTableSkeleton({ rows = 3 }: { rows?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 p-4">
          <Skeleton className="h-10 w-10 rounded-full" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-48" />
            <Skeleton className="h-3 w-64" />
          </div>
          <Skeleton className="h-8 w-20 rounded-full" />
        </div>
      ))}
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mb-4">
        <Search className="h-8 w-8 text-muted-foreground" />
      </div>
      <h3 className="text-lg font-medium mb-2">No Rankings Yet</h3>
      <p className="text-sm text-muted-foreground max-w-sm">
        Enter your keywords and website URL above to start tracking your search rankings.
      </p>
    </div>
  );
}

function escapeCSV(value: string): string {
  if (value.includes('"') || value.includes(',') || value.includes('\n')) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

function exportResultsToCSV(results: RankingResult[]) {
  const rows: string[] = ["Keyword,Website URL,Position,Title,Time Frame,Checked At"];
  
  results.forEach((result) => {
    rows.push(
      `${escapeCSV(result.keyword)},${escapeCSV(result.websiteUrl)},${result.position ?? "Not Found"},${escapeCSV(result.title ?? "")},${result.timeFrame},${escapeCSV(result.checkedAt)}`
    );
  });
  
  const csv = rows.join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `ranking-results-${format(new Date(), "yyyy-MM-dd")}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

function escapeHTML(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function exportResultsToPDF(results: RankingResult[]) {
  const printWindow = window.open("", "_blank");
  if (!printWindow) return;
  
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Ranking Results Report</title>
      <style>
        body { font-family: Arial, sans-serif; padding: 20px; }
        h1 { color: #333; }
        table { width: 100%; border-collapse: collapse; margin-top: 20px; }
        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        th { background-color: #f4f4f4; }
        .not-found { color: #999; }
      </style>
    </head>
    <body>
      <h1>Ranking Results Report</h1>
      <p>Generated on ${format(new Date(), "MMMM d, yyyy 'at' h:mm a")}</p>
      <table>
        <thead>
          <tr>
            <th>Keyword</th>
            <th>Website URL</th>
            <th>Position</th>
            <th>Title</th>
          </tr>
        </thead>
        <tbody>
          ${results.map(r => `
            <tr>
              <td>${escapeHTML(r.keyword)}</td>
              <td>${escapeHTML(r.websiteUrl)}</td>
              <td>${r.position ? `#${r.position}` : '<span class="not-found">Not Found</span>'}</td>
              <td>${escapeHTML(r.title ?? '-')}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </body>
    </html>
  `;
  
  printWindow.document.write(html);
  printWindow.document.close();
  printWindow.print();
}

export function RankingResults({
  results,
  isLoading = false,
}: RankingResultsProps) {
  const { toast } = useToast();
  
  const saveKeywordMutation = useMutation({
    mutationFn: async (data: { keyword: string; websiteUrl: string }) => {
      const response = await apiRequest("POST", "/api/keywords", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/keywords"] });
      toast({
        title: "Keyword Saved",
        description: "The keyword has been saved for tracking.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to save keyword. It may already be saved.",
        variant: "destructive",
      });
    },
  });

  if (isLoading) {
    return (
      <Card className="border-card-border">
        <CardHeader>
          <CardTitle className="text-xl font-medium">Ranking Results</CardTitle>
        </CardHeader>
        <CardContent>
          <ResultsTableSkeleton rows={3} />
        </CardContent>
      </Card>
    );
  }

  if (results.length === 0) {
    return (
      <Card className="border-card-border">
        <CardHeader>
          <CardTitle className="text-xl font-medium">Ranking Results</CardTitle>
        </CardHeader>
        <CardContent>
          <EmptyState />
        </CardContent>
      </Card>
    );
  }

  const foundResults = results.filter((r) => r.position !== null);
  const notFoundResults = results.filter((r) => r.position === null);

  return (
    <Card className="border-card-border">
      <CardHeader className="flex flex-row items-center justify-between gap-4 flex-wrap">
        <CardTitle className="text-xl font-medium">Ranking Results</CardTitle>
        <div className="flex items-center gap-3 flex-wrap">
          <Badge variant="secondary" className="text-xs">
            {foundResults.length} found
          </Badge>
          {notFoundResults.length > 0 && (
            <Badge variant="outline" className="text-xs text-muted-foreground">
              {notFoundResults.length} not ranked
            </Badge>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={() => exportResultsToCSV(results)}
            data-testid="button-export-results-csv"
          >
            <Download className="h-4 w-4 mr-1" />
            CSV
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => exportResultsToPDF(results)}
            data-testid="button-export-results-pdf"
          >
            <FileText className="h-4 w-4 mr-1" />
            PDF
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="rounded-lg border border-border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/30">
                <TableHead className="w-1/4 font-semibold text-xs uppercase tracking-wide">
                  Keyword
                </TableHead>
                <TableHead className="w-1/4 font-semibold text-xs uppercase tracking-wide">
                  Website URL
                </TableHead>
                <TableHead className="w-1/6 text-center font-semibold text-xs uppercase tracking-wide">
                  Position
                </TableHead>
                <TableHead className="w-20 text-center font-semibold text-xs uppercase tracking-wide">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {results.map((result, index) => (
                <TableRow
                  key={`${result.keyword}-${index}`}
                  className="group"
                  data-testid={`row-result-${index}`}
                >
                  <TableCell className="py-4">
                    <div className="space-y-1">
                      <p className="font-medium" data-testid={`text-keyword-${index}`}>
                        {result.keyword}
                      </p>
                      {result.title && (
                        <p className="text-xs text-muted-foreground line-clamp-1">
                          {result.title}
                        </p>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="py-4">
                    {result.foundUrl ? (
                      <a
                        href={result.foundUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
                        data-testid={`link-website-${index}`}
                      >
                        <span className="truncate max-w-[200px]">
                          {result.foundUrl.replace(/^https?:\/\//, "").split("/")[0]}
                        </span>
                        <ExternalLink className="h-3 w-3 shrink-0" />
                      </a>
                    ) : (
                      <span className="text-sm text-muted-foreground flex items-center gap-1">
                        <AlertCircle className="h-3.5 w-3.5" />
                        Not found in top 100 results
                      </span>
                    )}
                  </TableCell>
                  <TableCell className="py-4">
                    <div className="flex justify-center">
                      <PositionBadge position={result.position} />
                    </div>
                  </TableCell>
                  <TableCell className="py-4">
                    <div className="flex justify-center">
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => saveKeywordMutation.mutate({
                          keyword: result.keyword,
                          websiteUrl: result.websiteUrl
                        })}
                        disabled={saveKeywordMutation.isPending}
                        data-testid={`button-save-${index}`}
                      >
                        {saveKeywordMutation.isPending ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Bookmark className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
