import { useQuery } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import type { RiskAlert } from "@shared/schema";

export default function TopBar() {
  const { data: alerts } = useQuery<RiskAlert[]>({
    queryKey: ["/api/alerts"],
  });

  const unreadCount = alerts?.filter((alert: any) => !alert.isRead).length || 0;

  return (
    <header className="sticky top-0 z-30 bg-background/70 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border px-6 py-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h2 className="text-[15px] font-semibold tracking-[-0.01em] text-foreground">Churn Dashboard</h2>
          <Badge variant="outline" className="h-5 rounded-full border-border text-[11px] leading-none text-foreground/70">
            Live
          </Badge>
        </div>
        <div className="flex items-center gap-3">
          <button className="relative inline-flex h-8 w-8 items-center justify-center rounded-md border border-transparent text-foreground/60 hover:text-foreground/90 hover:border-border">
            <span className="sr-only">Notifications</span>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8a6 6 0 1 0-12 0c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-medium text-destructive-foreground">
                {unreadCount}
              </span>
            )}
          </button>
          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-[13px] font-medium text-foreground">Sarah Chen</p>
              <p className="text-[11px] text-foreground/60">Customer Success</p>
            </div>
            <div className="h-8 w-8 rounded-md bg-muted" />
          </div>
        </div>
      </div>
    </header>
  );
}
