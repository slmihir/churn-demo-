import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertTriangle, Users, PlayCircle, DollarSign, ArrowDownRight, ArrowUpRight } from "lucide-react";

export default function MetricsGrid() {
  const { data: metrics, isLoading } = useQuery({
    queryKey: ["/api/dashboard/metrics"],
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <Skeleton className="h-8 w-24 mb-2" />
              <Skeleton className="h-12 w-16 mb-2" />
              <Skeleton className="h-4 w-32" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const metricCards = [
    {
      title: "Overall Churn Risk",
      value: `${metrics?.churnRisk || 0}%`,
      change: `${metrics?.churnChange || 0}%`,
      changeType: (metrics?.churnChange ?? 0) < 0 ? "positive" : "negative",
      changeLabel: "vs last month",
      icon: AlertTriangle,
    },
    {
      title: "Customers at Risk",
      value: metrics?.customersAtRisk || 0,
      change: `+${metrics?.riskChange || 0}`,
      changeType: "negative",
      changeLabel: "since yesterday",
      icon: Users,
    },
    {
      title: "Active Interventions",
      value: metrics?.activeInterventions || 0,
      change: `${metrics?.successRate || 0}%`,
      changeType: "neutral",
      changeLabel: "success rate",
      icon: PlayCircle,
    },
    {
      title: "Revenue Saved",
      value: `$${metrics?.revenueSaved || 0}K`,
      change: `+${metrics?.revenueIncrease || 0}%`,
      changeType: "positive",
      changeLabel: "this quarter",
      icon: DollarSign,
    },
  ] as const;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {metricCards.map((metric, index) => {
        const Icon = metric.icon;
        const isPositive = metric.changeType === "positive";
        const isNegative = metric.changeType === "negative";
        return (
          <Card key={index}>
            <CardContent className="p-5">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-[12px] font-medium text-foreground/70">{metric.title}</p>
                  <p className="mt-1 text-[28px] font-semibold tracking-[-0.01em] text-foreground">{metric.value}</p>
                  <span className="mt-2 inline-flex items-center gap-1 rounded-full border border-border bg-background px-2 py-0.5 text-[11px] text-foreground/70">
                    {isPositive && <ArrowDownRight size={14} style={{ color: "var(--success)" }} />}
                    {isNegative && <ArrowUpRight size={14} style={{ color: "var(--danger)" }} />}
                    <span>{metric.change}</span>
                    <span className="text-foreground/50">{metric.changeLabel}</span>
                  </span>
                </div>
                <div className="flex h-10 w-10 items-center justify-center rounded-md border border-border bg-muted text-foreground/60">
                  <Icon size={18} />
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
