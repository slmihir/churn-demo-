import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function Integrations() {
  const { data: integrations, isLoading } = useQuery({
    queryKey: ["/api/integrations"],
  });

  if (isLoading) {
    return (
      <Card className="shadow-sm border border-gray-200">
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Active Integrations</h3>
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

  const getIntegrationIcon = (type: string, name: string) => {
    if (name.includes("Salesforce")) return "fab fa-salesforce text-blue-600";
    if (name.includes("Zendesk")) return "fas fa-headset text-orange-600";
    if (name.includes("Stripe")) return "fab fa-stripe text-purple-600";
    return "fas fa-plug text-gray-600";
  };

  const getIntegrationIconBg = (type: string, name: string) => {
    if (name.includes("Salesforce")) return "bg-blue-100";
    if (name.includes("Zendesk")) return "bg-orange-100";
    if (name.includes("Stripe")) return "bg-purple-100";
    return "bg-gray-100";
  };

  const getStatusStyle = (status: string) => {
    switch (status) {
      case "connected":
        return { dot: "bg-green-500", text: "text-green-600" };
      case "syncing":
        return { dot: "bg-yellow-500", text: "text-yellow-600" };
      case "error":
        return { dot: "bg-red-500", text: "text-red-600" };
      default:
        return { dot: "bg-gray-500", text: "text-gray-600" };
    }
  };

  const getStatusLabel = (status: string) => {
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  const getDescription = (type: string, name: string) => {
    if (name.includes("Salesforce")) return "Customer data sync";
    if (name.includes("Zendesk")) return "Ticket and satisfaction data";
    if (name.includes("Stripe")) return "Payment and billing events";
    return "Data synchronization";
  };

  return (
    <Card className="shadow-sm border border-gray-200">
      <CardContent className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Active Integrations</h3>
        <div className="space-y-4">
          {integrations?.map((integration: any) => {
            const statusStyle = getStatusStyle(integration.status);
            
            return (
              <div key={integration.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className={`w-8 h-8 ${getIntegrationIconBg(integration.type, integration.name)} rounded-lg flex items-center justify-center`}>
                    <i className={getIntegrationIcon(integration.type, integration.name)}></i>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{integration.name}</p>
                    <p className="text-sm text-gray-600">{getDescription(integration.type, integration.name)}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <span className={`w-2 h-2 ${statusStyle.dot} rounded-full`}></span>
                  <span className={`text-sm ${statusStyle.text}`}>{getStatusLabel(integration.status)}</span>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
