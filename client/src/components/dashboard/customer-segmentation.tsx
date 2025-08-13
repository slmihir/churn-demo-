import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function CustomerSegmentation() {
  const { data: segmentation, isLoading } = useQuery({
    queryKey: ["/api/dashboard/segmentation"],
  });

  if (isLoading) {
    return (
      <Card className="shadow-sm border border-gray-200">
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Customer Risk Segmentation</h3>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="p-4 border border-gray-200 rounded-lg">
                <Skeleton className="h-6 w-full" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const segments = [
    {
      label: "High Risk",
      tone: "danger",
      count: segmentation?.highRisk?.count || 0,
      percentage: segmentation?.highRisk?.percentage || "0",
    },
    {
      label: "Medium Risk",
      tone: "warning",
      count: segmentation?.mediumRisk?.count || 0,
      percentage: segmentation?.mediumRisk?.percentage || "0",
    },
    {
      label: "Low Risk",
      tone: "success",
      count: segmentation?.lowRisk?.count || 0,
      percentage: segmentation?.lowRisk?.percentage || "0",
    },
  ];

  return (
    <Card className="shadow-sm border border-gray-200">
      <CardContent className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Customer Risk Segmentation</h3>
        <div className="space-y-4">
          {segments.map((segment) => (
            <div
              key={segment.label}
              className="flex items-center justify-between rounded-lg border border-border bg-background p-4"
              style={{
                boxShadow: "inset 0 0 0 1px color-mix(in oklab, var(--border), transparent 80%)",
              }}
            >
              <div className="flex items-center gap-3">
                <span
                  className="inline-block h-2.5 w-2.5 rounded-full"
                  style={{ background: `var(--${segment.tone})` }}
                />
                <span className="font-medium text-foreground">{segment.label}</span>
              </div>
              <div className="text-right">
                <p className="text-lg font-semibold text-foreground">{segment.count}</p>
                <p className="text-sm text-foreground/60">{segment.percentage}%</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
