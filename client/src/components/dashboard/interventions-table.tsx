import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { apiRequest } from "@/lib/queryClient";

interface InterventionsTableProps {
  onNewIntervention: () => void;
}

export default function InterventionsTable({ onNewIntervention }: InterventionsTableProps) {
  const queryClient = useQueryClient();
  
  const { data: interventions, isLoading } = useQuery({
    queryKey: ["/api/interventions"],
  });

  const { data: customers } = useQuery({
    queryKey: ["/api/customers"],
  });

  const completeInterventionMutation = useMutation({
    mutationFn: async (interventionId: number) => {
      return apiRequest("PATCH", `/api/interventions/${interventionId}`, {
        status: "completed",
        completedAt: new Date().toISOString(),
      });
    },
    onMutate: async (interventionId: number) => {
      await queryClient.cancelQueries({ queryKey: ["/api/interventions"] });
      const previous = queryClient.getQueryData<any[]>(["/api/interventions"]);
      queryClient.setQueryData<any[]>(["/api/interventions"], (old) =>
        (old || []).map((i: any) => (i.id === interventionId ? { ...i, status: "completed", completedAt: new Date().toISOString() } : i))
      );
      return { previous } as { previous?: any[] };
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) queryClient.setQueryData(["/api/interventions"], context.previous);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/interventions"] });
    },
  });

  if (isLoading) {
    return (
      <Card className="shadow-sm border border-gray-200 mb-8">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">CX Rescue Playbook - Active Interventions</h3>
          </div>
          <div className="space-y-4">
            {[...Array(2)].map((_, i) => (
              <div key={i} className="border rounded-lg p-4">
                <Skeleton className="h-6 w-full" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const getCustomerName = (customerId: number) => {
    const customer = customers?.find((c: any) => c.id === customerId);
    return customer ? customer.name : `Customer ${customerId}`;
  };

  const getCustomerEmail = (customerId: number) => {
    const customer = customers?.find((c: any) => c.id === customerId);
    return customer ? customer.email : `customer${customerId}@example.com`;
  };

  const getCustomerRisk = (customerId: number) => {
    const customer = customers?.find((c: any) => c.id === customerId);
    if (!customer) return { risk: "0", level: "low" };
    
    const risk = parseFloat(customer.churnRisk);
    let level = "low";
    if (risk >= 80) level = "high";
    else if (risk >= 50) level = "medium";
    
    return { risk: `${risk}%`, level };
  };

  const getStatusStyle = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800";
      case "active":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getRiskStyle = (level: string) => {
    switch (level) {
      case "high":
        return "bg-red-100 text-red-800";
      case "medium":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-green-100 text-green-800";
    }
  };

  const formatDueDate = (date: string | null) => {
    if (!date) return "No due date";
    
    const dueDate = new Date(date);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    if (dueDate.toDateString() === today.toDateString()) {
      return "Due today";
    } else if (dueDate.toDateString() === tomorrow.toDateString()) {
      return "Due tomorrow";
    } else {
      return dueDate.toLocaleDateString();
    }
  };

  return (
    <Card className="shadow-sm border border-gray-200 mb-8">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">CX Rescue Playbook - Active Interventions</h3>
          <Button onClick={onNewIntervention} className="bg-primary hover:bg-primary/90">
            <i className="fas fa-plus mr-2"></i>
            New Intervention
          </Button>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-medium text-gray-600">Customer</th>
                <th className="text-left py-3 px-4 font-medium text-gray-600">Risk Score</th>
                <th className="text-left py-3 px-4 font-medium text-gray-600">Intervention</th>
                <th className="text-left py-3 px-4 font-medium text-gray-600">Status</th>
                <th className="text-left py-3 px-4 font-medium text-gray-600">CSM</th>
                <th className="text-left py-3 px-4 font-medium text-gray-600">Next Action</th>
                <th className="text-left py-3 px-4 font-medium text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody>
              {interventions?.map((intervention: any) => {
                const customerRisk = getCustomerRisk(intervention.customerId);
                
                return (
                  <tr key={intervention.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-4 px-4">
                      <div>
                        <p className="font-medium text-gray-900">{getCustomerName(intervention.customerId)}</p>
                        <p className="text-sm text-gray-600">{getCustomerEmail(intervention.customerId)}</p>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <Badge className={`${getRiskStyle(customerRisk.level)} font-medium`}>
                        {customerRisk.risk} {customerRisk.level}
                      </Badge>
                    </td>
                    <td className="py-4 px-4">
                      <p className="text-sm font-medium text-gray-900">{intervention.type}</p>
                      <p className="text-xs text-gray-600">{intervention.description}</p>
                    </td>
                    <td className="py-4 px-4">
                      <Badge className={getStatusStyle(intervention.status)}>
                        {intervention.status}
                      </Badge>
                    </td>
                    <td className="py-4 px-4">
                      <p className="text-sm font-medium text-gray-900">{intervention.assignedCsm}</p>
                    </td>
                    <td className="py-4 px-4">
                      <p className="text-sm text-gray-900">{intervention.nextAction}</p>
                      <p className="text-xs text-gray-600">{formatDueDate(intervention.dueDate)}</p>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex space-x-2">
                        <button className="text-primary hover:text-primary/80">
                          <i className="fas fa-eye"></i>
                        </button>
                        {intervention.status === "active" && (
                          <button 
                            className="text-green-600 hover:text-green-700"
                            onClick={() => completeInterventionMutation.mutate(intervention.id)}
                            disabled={completeInterventionMutation.isPending}
                          >
                            <i className="fas fa-check"></i>
                          </button>
                        )}
                        <button className="text-gray-600 hover:text-gray-700">
                          <i className="fas fa-edit"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
