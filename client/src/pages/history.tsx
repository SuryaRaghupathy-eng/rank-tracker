import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { format } from "date-fns";
import { ArrowLeft, TrendingUp, TrendingDown, Minus, Loader2, Download, FileText } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ThemeToggle } from "@/components/theme-toggle";
import { BarChart3 } from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import type { SavedKeyword, RankingHistory } from "@shared/schema";

interface KeywordWithHistory {
  keyword: SavedKeyword;
  history: RankingHistory[];
}

function escapeCSV(value: string): string {
  if (value.includes('"') || value.includes(',') || value.includes('\n')) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

function exportToCSV(keywords: KeywordWithHistory[]) {
  const rows: string[] = ["Keyword,Website URL,Date,Position"];
  
  keywords.forEach(({ keyword, history }) => {
    history.forEach((h) => {
      rows.push(
        `${escapeCSV(keyword.keyword)},${escapeCSV(keyword.websiteUrl)},${escapeCSV(format(new Date(h.checkedAt), "yyyy-MM-dd HH:mm"))},${h.position ?? "Not Found"}`
      );
    });
  });
  
  const csv = rows.join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `ranking-history-${format(new Date(), "yyyy-MM-dd")}.csv`;
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

function exportToPDF(keywords: KeywordWithHistory[]) {
  const printWindow = window.open("", "_blank");
  if (!printWindow) return;
  
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Ranking History Report</title>
      <style>
        body { font-family: Arial, sans-serif; padding: 20px; }
        h1 { color: #333; }
        table { width: 100%; border-collapse: collapse; margin-top: 20px; }
        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        th { background-color: #f4f4f4; }
        .keyword-section { margin-bottom: 30px; }
        .keyword-title { font-size: 16px; font-weight: bold; margin-bottom: 10px; }
        .website-url { color: #666; font-size: 12px; }
        .not-found { color: #999; }
      </style>
    </head>
    <body>
      <h1>Ranking History Report</h1>
      <p>Generated on ${format(new Date(), "MMMM d, yyyy 'at' h:mm a")}</p>
      ${keywords.map(({ keyword, history }) => `
        <div class="keyword-section">
          <div class="keyword-title">${escapeHTML(keyword.keyword)}</div>
          <div class="website-url">${escapeHTML(keyword.websiteUrl)}</div>
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Position</th>
              </tr>
            </thead>
            <tbody>
              ${history.length === 0 
                ? '<tr><td colspan="2" class="not-found">No history data</td></tr>'
                : history.map(h => `
                  <tr>
                    <td>${format(new Date(h.checkedAt), "MMM d, yyyy h:mm a")}</td>
                    <td>${h.position ? `#${h.position}` : 'Not Found'}</td>
                  </tr>
                `).join('')
              }
            </tbody>
          </table>
        </div>
      `).join('')}
    </body>
    </html>
  `;
  
  printWindow.document.write(html);
  printWindow.document.close();
  printWindow.print();
}

function RankingChart({ data }: { data: { date: string; position: number | null }[] }) {
  const chartData = data.map(d => ({
    date: d.date,
    position: d.position ?? null,
  })).reverse();
  
  if (chartData.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-muted-foreground">
        No ranking data available. Check rankings to start tracking.
      </div>
    );
  }
  
  const validPositions = chartData.filter(d => d.position !== null).map(d => d.position as number);
  const minPos = Math.min(...validPositions);
  const maxPos = Math.max(...validPositions);
  
  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
        <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
        <XAxis 
          dataKey="date" 
          tick={{ fontSize: 12 }}
          className="fill-muted-foreground"
        />
        <YAxis 
          reversed 
          domain={[Math.max(1, minPos - 5), maxPos + 5]}
          tick={{ fontSize: 12 }}
          className="fill-muted-foreground"
          label={{ value: 'Position', angle: -90, position: 'insideLeft', className: 'fill-muted-foreground' }}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: 'hsl(var(--card))',
            border: '1px solid hsl(var(--border))',
            borderRadius: '8px',
          }}
          labelStyle={{ color: 'hsl(var(--foreground))' }}
          formatter={(value: number | null) => [value ? `#${value}` : 'Not Found', 'Position']}
        />
        <Legend />
        <Line
          type="monotone"
          dataKey="position"
          stroke="hsl(var(--primary))"
          strokeWidth={2}
          dot={{ fill: 'hsl(var(--primary))', strokeWidth: 2 }}
          activeDot={{ r: 6 }}
          connectNulls
          name="Position"
        />
      </LineChart>
    </ResponsiveContainer>
  );
}

function ChangeIndicator({ current, previous }: { current: number | null; previous: number | null }) {
  if (current === null || previous === null) {
    return <Minus className="h-4 w-4 text-muted-foreground" />;
  }
  
  const change = previous - current;
  if (change === 0) {
    return <Minus className="h-4 w-4 text-muted-foreground" />;
  }
  if (change > 0) {
    return (
      <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
        <TrendingUp className="h-4 w-4" />
        +{change}
      </span>
    );
  }
  return (
    <span className="flex items-center gap-1 text-red-600 dark:text-red-400">
      <TrendingDown className="h-4 w-4" />
      {change}
    </span>
  );
}

export default function HistoryPage() {
  const { data: keywords = [], isLoading } = useQuery<SavedKeyword[]>({
    queryKey: ["/api/keywords"],
  });
  
  const keywordIds = keywords.map(k => k.id).join(",");
  
  const keywordHistories = useQuery<KeywordWithHistory[]>({
    queryKey: ["/api/keywords/all-history", keywordIds],
    queryFn: async () => {
      const results: KeywordWithHistory[] = [];
      for (const kw of keywords) {
        const response = await fetch(`/api/keywords/${kw.id}/history`);
        if (response.ok) {
          const data = await response.json();
          results.push(data);
        }
      }
      return results;
    },
    enabled: keywords.length > 0,
  });
  
  const allKeywordHistories = keywordHistories.data ?? [];

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
                  Ranking History
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Link href="/">
                <Button variant="outline" size="sm" data-testid="link-back">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back
                </Button>
              </Link>
              <ThemeToggle />
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="space-y-2">
              <h2 className="text-3xl font-semibold">Ranking History</h2>
              <p className="text-muted-foreground">
                View ranking changes over time for your saved keywords.
              </p>
            </div>
            {allKeywordHistories.length > 0 && (
              <div className="flex items-center gap-2 flex-wrap">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => exportToCSV(allKeywordHistories)}
                  data-testid="button-export-csv"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Export CSV
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => exportToPDF(allKeywordHistories)}
                  data-testid="button-export-pdf"
                >
                  <FileText className="h-4 w-4 mr-2" />
                  Export PDF
                </Button>
              </div>
            )}
          </div>

          {isLoading || keywordHistories.isLoading ? (
            <Card className="border-card-border">
              <CardContent className="py-16">
                <div className="flex flex-col items-center justify-center">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">Loading history...</p>
                </div>
              </CardContent>
            </Card>
          ) : keywords.length === 0 ? (
            <Card className="border-card-border">
              <CardContent className="py-16">
                <div className="flex flex-col items-center justify-center text-center">
                  <BarChart3 className="h-16 w-16 text-muted-foreground/30 mb-4" />
                  <h3 className="text-lg font-medium mb-2">No Saved Keywords</h3>
                  <p className="text-sm text-muted-foreground max-w-sm">
                    Save keywords from search results to start tracking their ranking history over time.
                  </p>
                  <Link href="/">
                    <Button className="mt-4" data-testid="button-go-home">
                      Start Tracking
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-6">
              {allKeywordHistories.map(({ keyword, history }) => {
                const chartData = history.map(h => ({
                  date: format(new Date(h.checkedAt), "MMM d"),
                  position: h.position,
                }));
                
                const latestPosition = history[0]?.position ?? null;
                const previousPosition = history[1]?.position ?? null;
                
                return (
                  <Card key={keyword.id} className="border-card-border" data-testid={`card-history-${keyword.id}`}>
                    <CardHeader className="flex flex-row items-start justify-between gap-4 flex-wrap">
                      <div className="space-y-1">
                        <CardTitle className="text-lg font-medium" data-testid={`text-keyword-${keyword.id}`}>
                          {keyword.keyword}
                        </CardTitle>
                        <p className="text-sm text-muted-foreground">{keyword.websiteUrl}</p>
                      </div>
                      <div className="flex items-center gap-3 flex-wrap">
                        <Badge variant={latestPosition ? "default" : "secondary"}>
                          {latestPosition ? `#${latestPosition}` : "Not Ranked"}
                        </Badge>
                        <ChangeIndicator current={latestPosition} previous={previousPosition} />
                      </div>
                    </CardHeader>
                    <CardContent>
                      <RankingChart data={chartData} />
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
