import { TrendingUp, TrendingDown, Target, Search, Award } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import type { RankingResult } from "@shared/schema";

interface StatsCardsProps {
  results: RankingResult[];
  compareEnabled?: boolean;
}

export function StatsCards({ results, compareEnabled = false }: StatsCardsProps) {
  if (results.length === 0) return null;

  const totalKeywords = results.length;
  const foundCount = results.filter((r) => r.currentPosition !== null).length;
  const top10Count = results.filter(
    (r) => r.currentPosition !== null && r.currentPosition <= 10
  ).length;
  
  const positionsSum = results
    .filter((r) => r.currentPosition !== null)
    .reduce((sum, r) => sum + (r.currentPosition || 0), 0);
  const avgPosition = foundCount > 0 ? positionsSum / foundCount : 0;

  const improved = compareEnabled
    ? results.filter((r) => r.change !== null && r.change > 0).length
    : 0;
  const declined = compareEnabled
    ? results.filter((r) => r.change !== null && r.change < 0).length
    : 0;

  const stats = [
    {
      label: "Total Keywords",
      value: totalKeywords,
      icon: Search,
      color: "text-primary",
      bgColor: "bg-primary/10",
    },
    {
      label: "Found in Results",
      value: foundCount,
      suffix: `/ ${totalKeywords}`,
      icon: Target,
      color: "text-emerald-600 dark:text-emerald-400",
      bgColor: "bg-emerald-500/10",
    },
    {
      label: "In Top 10",
      value: top10Count,
      icon: Award,
      color: "text-amber-600 dark:text-amber-400",
      bgColor: "bg-amber-500/10",
    },
    {
      label: "Avg Position",
      value: foundCount > 0 ? avgPosition.toFixed(1) : "N/A",
      icon: Target,
      color: "text-blue-600 dark:text-blue-400",
      bgColor: "bg-blue-500/10",
    },
  ];

  if (compareEnabled) {
    stats.push(
      {
        label: "Improved",
        value: improved,
        icon: TrendingUp,
        color: "text-emerald-600 dark:text-emerald-400",
        bgColor: "bg-emerald-500/10",
      },
      {
        label: "Declined",
        value: declined,
        icon: TrendingDown,
        color: "text-red-600 dark:text-red-400",
        bgColor: "bg-red-500/10",
      }
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
      {stats.map((stat, index) => (
        <Card key={stat.label} className="border-card-border" data-testid={`card-stat-${index}`}>
          <CardContent className="p-4">
            <div className="flex items-start justify-between gap-2">
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">
                  {stat.label}
                </p>
                <div className="flex items-baseline gap-1">
                  <p className="text-2xl font-bold">{stat.value}</p>
                  {stat.suffix && (
                    <span className="text-sm text-muted-foreground">{stat.suffix}</span>
                  )}
                </div>
              </div>
              <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
