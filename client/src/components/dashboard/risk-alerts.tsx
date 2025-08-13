import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { apiRequest } from "@/lib/queryClient";

interface RiskAlertsProps {
  onLaunchPlaybook: () => void;
}

interface RiskAlertItem {
  id: number;
  title: string;
  description: string;
  severity: "critical" | "high" | "medium" | "low";
  createdAt: string;
  isRead?: boolean;
}

export default function RiskAlerts({ onLaunchPlaybook }: RiskAlertsProps) {
  const queryClient = useQueryClient();
  
  const { data: alerts, isLoading } = useQuery<RiskAlertItem[]>({
    queryKey: ["/api/alerts"],
  });

  const markAllReadMutation = useMutation({
    mutationFn: async () => {
      const unreadAlerts = alerts?.filter((alert) => !alert.isRead) || [];
      await Promise.all(
        unreadAlerts.map((alert: any) =>
          apiRequest("PATCH", `/api/alerts/${alert.id}/read`)
        )
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/alerts"] });
    },
  });

  if (isLoading) {
    return (
      <Card className="shadow-sm border border-gray-200">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Real-time Risk Alerts</h3>
          </div>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="p-4 border rounded-lg">
                <Skeleton className="h-6 w-full mb-2" />
                <Skeleton className="h-4 w-3/4" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const getSeverityStyle = (severity: string) => {
    switch (severity) {
      case "critical":
        return "border-border bg-background";
      case "high":
        return "border-border bg-background";
      case "medium":
        return "border-border bg-background";
      default:
        return "border-border bg-background";
    }
  };

  const getSeverityDotColor = (severity: string) => {
    switch (severity) {
      case "critical":
        return "var(--danger)";
      case "high":
        return "var(--warning)";
      case "medium":
        return "var(--muted-foreground)";
      default:
        return "var(--muted-foreground)";
    }
  };

  const getActionButton = (severity: string) => {
    switch (severity) {
      case "critical":
        return "Launch CX Rescue";
      case "high":
        return "Payment Recovery";
      default:
        return "Engagement Boost";
    }
  };

  const formatTimeAgo = (date: string) => {
    const now = new Date();
    const alertDate = new Date(date);
    const diffInMinutes = Math.floor((now.getTime() - alertDate.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 60) {
      return `${diffInMinutes} minutes ago`;
    } else if (diffInMinutes < 1440) {
      const hours = Math.floor(diffInMinutes / 60);
      return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    } else {
      const days = Math.floor(diffInMinutes / 1440);
      return `${days} day${days > 1 ? 's' : ''} ago`;
    }
  };

  return (
    <Card className="shadow-sm border border-gray-200">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Real-time Risk Alerts</h3>
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => markAllReadMutation.mutate()}
            disabled={markAllReadMutation.isPending}
          >
            Mark all read
          </Button>
        </div>
        <div className="space-y-4">
          {alerts?.slice(0, 3).map((alert) => (
            <div key={alert.id} className={`group flex items-start gap-3 rounded-lg border p-4 ${getSeverityStyle(alert.severity)}`}>
              <div className="mt-2 h-2 w-2 rounded-full" style={{ background: getSeverityDotColor(alert.severity) }}></div>
              <div className="flex-1">
                <p className="font-medium text-foreground">{alert.title}</p>
                <p className="mt-1 text-sm text-foreground/70">{alert.description}</p>
                <p className="mt-2 text-xs text-foreground/50">{formatTimeAgo(alert.createdAt)}</p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="text-foreground/70 hover:text-foreground"
                onClick={onLaunchPlaybook}
              >
                {getActionButton(alert.severity)}
              </Button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
