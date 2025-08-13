import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Sidebar from "@/components/layout/sidebar";
import TopBar from "@/components/layout/topbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function Customers() {
  const [searchTerm, setSearchTerm] = useState("");
  const [riskFilter, setRiskFilter] = useState("all");
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: customers, isLoading } = useQuery({
    queryKey: ["/api/customers"],
  });

  // Get ML predictions for all customers
  const { data: mlPredictions, isLoading: mlLoading } = useQuery({
    queryKey: ["/api/ml/batch-predict", (customers as any[])?.map((c: any) => c.id)],
    queryFn: async () => {
      if (!(customers as any[])?.length) return { predictions: [] };
      const customerIds = (customers as any[]).map((c: any) => c.id);
      const response = await apiRequest("POST", "/api/ml/batch-predict", { customerIds });
      return response.json();
    },
    enabled: !!(customers as any[])?.length,
  });

  // Helper function to get ML churn risk for a customer
  const getMLChurnRisk = (customerId: number): number => {
    const prediction = mlPredictions?.predictions?.find((p: any) => p.customerId === customerId);
    return prediction ? (prediction.churnProbability * 100) : 0;
  };

  // Helper function to get ML risk level for a customer
  const getMLRiskLevel = (customerId: number): string => {
    const prediction = mlPredictions?.predictions?.find((p: any) => p.customerId === customerId);
    return prediction?.riskLevel || 'unknown';
  };

  const predictChurnMutation = useMutation({
    mutationFn: async (customerId: number) => {
      const response = await apiRequest("POST", "/api/v1/churn/predict", { customerId });
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Churn Prediction Complete",
        description: `Customer has ${data.churnProbability}% churn risk (${data.riskLevel} risk)`,
      });
      // Invalidate queries to refresh the ML predictions
      queryClient.invalidateQueries({ queryKey: ["/api/ml/batch-predict"] });
    },
  });

  const filteredCustomers = (customers as any[])?.filter((customer: any) => {
    const matchesSearch = customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         customer.company.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Use ML predictions for risk filtering, fallback to static data if ML not loaded
    const risk = mlPredictions ? getMLChurnRisk(customer.id) : parseFloat(customer.churnRisk);
    const matchesRisk = riskFilter === "all" ||
                       (riskFilter === "high" && risk >= 80) ||
                       (riskFilter === "medium" && risk >= 50 && risk < 80) ||
                       (riskFilter === "low" && risk < 50);
    
    return matchesSearch && matchesRisk;
  }) || [];

  const getRiskLevel = (risk: number) => {
    if (risk >= 80) return { level: "High", style: "bg-red-100 text-red-800" };
    if (risk >= 50) return { level: "Medium", style: "bg-yellow-100 text-yellow-800" };
    return { level: "Low", style: "bg-green-100 text-green-800" };
  };

  const getHealthScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  const formatDate = (date: string | Date) => {
    return new Date(date).toLocaleDateString();
  };

  const formatMRR = (mrr: string) => {
    return `$${parseFloat(mrr).toLocaleString()}`;
  };

  const openCustomerDetails = (customer: any) => {
    setSelectedCustomer(customer);
    setIsDetailsOpen(true);
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <TopBar />
        
        <main className="flex-1 overflow-y-auto p-6">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              Customer Management
              {mlLoading && (
                <span className="ml-3 text-sm text-blue-600 font-normal">
                  <i className="fas fa-spinner fa-spin mr-1"></i>
                  Loading ML predictions...
                </span>
              )}
            </h1>
            
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <div className="flex-1">
                <Input
                  placeholder="Search customers, companies, or emails..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full"
                />
              </div>
              <Select value={riskFilter} onValueChange={setRiskFilter}>
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Risk Levels</SelectItem>
                  <SelectItem value="high">High Risk</SelectItem>
                  <SelectItem value="medium">Medium Risk</SelectItem>
                  <SelectItem value="low">Low Risk</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Customer List ({filteredCustomers.length} customers)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 font-medium text-gray-600">Customer</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-600">Plan</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-600">MRR</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-600">Health Score</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-600">Churn Risk</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-600">Last Login</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-600">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredCustomers.map((customer: any) => {
                      // Use ML predictions for display, fallback to static data
                      const mlRisk = mlPredictions ? getMLChurnRisk(customer.id) : parseFloat(customer.churnRisk);
                      const riskInfo = getRiskLevel(mlRisk);
                      
                      return (
                        <tr key={customer.id} className="border-b border-gray-100 hover:bg-gray-50">
                          <td className="py-4 px-4">
                            <div>
                              <p className="font-medium text-gray-900">{customer.name}</p>
                              <p className="text-sm text-gray-600">{customer.email}</p>
                              <p className="text-xs text-gray-500">{customer.company}</p>
                            </div>
                          </td>
                          <td className="py-4 px-4">
                            <Badge variant="outline">{customer.plan}</Badge>
                          </td>
                          <td className="py-4 px-4">
                            <span className="font-medium">{formatMRR(customer.mrr)}</span>
                          </td>
                          <td className="py-4 px-4">
                            <span className={`font-medium ${getHealthScoreColor(customer.healthScore)}`}>
                              {customer.healthScore}%
                            </span>
                          </td>
                          <td className="py-4 px-4">
                            <Badge className={riskInfo.style}>
                              {mlRisk.toFixed(1)}% {riskInfo.level}
                              {mlPredictions && (
                                <span className="ml-1 text-xs opacity-75">(ML)</span>
                              )}
                            </Badge>
                          </td>
                          <td className="py-4 px-4">
                            <span className="text-sm text-gray-600">
                              {customer.lastLogin ? formatDate(customer.lastLogin) : "Never"}
                            </span>
                          </td>
                          <td className="py-4 px-4">
                            <div className="flex space-x-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => openCustomerDetails(customer)}
                              >
                                <i className="fas fa-eye mr-1"></i>
                                View
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => predictChurnMutation.mutate(customer.id)}
                                disabled={predictChurnMutation.isPending}
                              >
                                <i className="fas fa-chart-line mr-1"></i>
                                Predict
                              </Button>
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
        </main>
      </div>

      {/* Customer Details Modal */}
      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Customer Details: {selectedCustomer?.name}</DialogTitle>
          </DialogHeader>
          
          {selectedCustomer && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Customer Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-600">Company</label>
                    <p className="text-gray-900">{selectedCustomer.company}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Email</label>
                    <p className="text-gray-900">{selectedCustomer.email}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Plan</label>
                    <p className="text-gray-900">{selectedCustomer.plan}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Signup Date</label>
                    <p className="text-gray-900">{formatDate(selectedCustomer.signupDate)}</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Risk Analysis</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-600">Churn Risk</label>
                    <p className={`text-2xl font-bold ${
                      parseFloat(selectedCustomer.churnRisk) >= 80 ? "text-red-600" :
                      parseFloat(selectedCustomer.churnRisk) >= 50 ? "text-yellow-600" : "text-green-600"
                    }`}>
                      {selectedCustomer.churnRisk}%
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Health Score</label>
                    <p className={`text-xl font-medium ${getHealthScoreColor(selectedCustomer.healthScore)}`}>
                      {selectedCustomer.healthScore}%
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">NPS Score</label>
                    <p className="text-gray-900">{selectedCustomer.npsScore || "Not available"}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Support Tickets</label>
                    <p className="text-gray-900">{selectedCustomer.supportTickets}</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="md:col-span-2">
                <CardHeader>
                  <CardTitle className="text-lg">Revenue & Usage</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-600">Monthly Recurring Revenue</label>
                      <p className="text-2xl font-bold text-green-600">{formatMRR(selectedCustomer.mrr)}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">Last Login</label>
                      <p className="text-gray-900">
                        {selectedCustomer.lastLogin ? formatDate(selectedCustomer.lastLogin) : "Never"}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">Account Status</label>
                      <Badge className={selectedCustomer.isActive ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}>
                        {selectedCustomer.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}