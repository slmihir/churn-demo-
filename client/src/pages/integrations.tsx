import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Sidebar from "@/components/layout/sidebar";
import TopBar from "@/components/layout/topbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function Integrations() {
  const [selectedIntegration, setSelectedIntegration] = useState<any>(null);
  const [isConfigOpen, setIsConfigOpen] = useState(false);
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: integrations } = useQuery({
    queryKey: ["/api/integrations"],
  });

  const availableIntegrations = [
    {
      id: "salesforce",
      name: "Salesforce CRM",
      category: "CRM",
      description: "Sync customer data, opportunities, and account information",
      icon: "fab fa-salesforce",
      color: "blue",
      features: ["Customer sync", "Opportunity tracking", "Account management", "Custom fields"],
      setupTime: "5-10 minutes",
      popularity: 95,
    },
    {
      id: "hubspot",
      name: "HubSpot CRM",
      category: "CRM",
      description: "Import contacts, deals, and customer interaction history",
      icon: "fas fa-hubspot",
      color: "orange",
      features: ["Contact management", "Deal pipeline", "Email tracking", "Marketing automation"],
      setupTime: "3-7 minutes",
      popularity: 87,
    },
    {
      id: "zendesk",
      name: "Zendesk Support",
      category: "Support",
      description: "Track support tickets, satisfaction scores, and resolution times",
      icon: "fas fa-headset",
      color: "green",
      features: ["Ticket tracking", "CSAT scores", "Agent performance", "SLA monitoring"],
      setupTime: "2-5 minutes",
      popularity: 92,
    },
    {
      id: "freshdesk",
      name: "Freshdesk",
      category: "Support",
      description: "Monitor customer support interactions and satisfaction metrics",
      icon: "fas fa-life-ring",
      color: "blue",
      features: ["Ticket management", "Customer feedback", "Response times", "Escalation tracking"],
      setupTime: "3-6 minutes",
      popularity: 76,
    },
    {
      id: "stripe",
      name: "Stripe Payments",
      category: "Payments",
      description: "Track payment failures, subscription changes, and billing events",
      icon: "fab fa-stripe",
      color: "purple",
      features: ["Payment tracking", "Subscription events", "Dunning management", "Revenue analytics"],
      setupTime: "2-4 minutes",
      popularity: 89,
    },
    {
      id: "paypal",
      name: "PayPal",
      category: "Payments",
      description: "Monitor PayPal transactions and subscription status",
      icon: "fab fa-paypal",
      color: "blue",
      features: ["Transaction monitoring", "Subscription tracking", "Dispute management", "Refund tracking"],
      setupTime: "4-8 minutes",
      popularity: 73,
    },
    {
      id: "google-analytics",
      name: "Google Analytics",
      category: "Analytics",
      description: "Track user behavior, engagement metrics, and conversion funnels",
      icon: "fab fa-google",
      color: "red",
      features: ["User behavior", "Conversion tracking", "Event monitoring", "Audience insights"],
      setupTime: "3-5 minutes",
      popularity: 94,
    },
    {
      id: "mixpanel",
      name: "Mixpanel",
      category: "Analytics",
      description: "Advanced product analytics and user engagement tracking",
      icon: "fas fa-chart-bar",
      color: "purple",
      features: ["Event tracking", "Funnel analysis", "Cohort analysis", "A/B testing"],
      setupTime: "5-10 minutes",
      popularity: 81,
    },
    {
      id: "intercom",
      name: "Intercom",
      category: "Communication",
      description: "Customer messaging, chat support, and engagement data",
      icon: "fas fa-comments",
      color: "blue",
      features: ["Live chat", "Message tracking", "User engagement", "Bot interactions"],
      setupTime: "3-7 minutes",
      popularity: 85,
    },
    {
      id: "slack",
      name: "Slack",
      category: "Communication",
      description: "Receive churn alerts and notifications in your Slack channels",
      icon: "fab fa-slack",
      color: "purple",
      features: ["Alert notifications", "Team collaboration", "Automated reports", "Custom workflows"],
      setupTime: "1-3 minutes",
      popularity: 91,
    },
  ];

  const getStatusStyle = (status: string) => {
    switch (status) {
      case "connected":
        return { dot: "bg-green-500", text: "text-green-600", bg: "bg-green-100" };
      case "syncing":
        return { dot: "bg-yellow-500", text: "text-yellow-600", bg: "bg-yellow-100" };
      case "error":
        return { dot: "bg-red-500", text: "text-red-600", bg: "bg-red-100" };
      default:
        return { dot: "bg-gray-500", text: "text-gray-600", bg: "bg-gray-100" };
    }
  };

  const getIntegrationIcon = (name: string) => {
    const integration = availableIntegrations.find(i => i.name.includes(name.split(' ')[0]));
    return integration?.icon || "fas fa-plug";
  };

  const isIntegrationConnected = (integrationId: string) => {
    return integrations?.some((i: any) => 
      i.name.toLowerCase().includes(integrationId) || 
      integrationId.includes(i.name.toLowerCase().split(' ')[0])
    );
  };

  const groupedIntegrations = availableIntegrations.reduce((groups: any, integration) => {
    const category = integration.category;
    if (!groups[category]) {
      groups[category] = [];
    }
    groups[category].push(integration);
    return groups;
  }, {});

  const categoryIcons = {
    "CRM": "fas fa-users",
    "Support": "fas fa-headset",
    "Payments": "fas fa-credit-card",
    "Analytics": "fas fa-chart-line",
    "Communication": "fas fa-comments",
  };

  const formatLastSync = (date: string) => {
    const syncDate = new Date(date);
    const now = new Date();
    const diffMinutes = Math.floor((now.getTime() - syncDate.getTime()) / (1000 * 60));
    
    if (diffMinutes < 60) {
      return `${diffMinutes} minutes ago`;
    } else if (diffMinutes < 1440) {
      const hours = Math.floor(diffMinutes / 60);
      return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    } else {
      return syncDate.toLocaleDateString();
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <TopBar />
        
        <main className="flex-1 overflow-y-auto p-6">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Integrations</h1>
            <p className="text-gray-600">Connect your tools to get comprehensive customer insights and automate churn prevention</p>
          </div>

          <Tabs defaultValue="connected" className="space-y-6">
            <TabsList>
              <TabsTrigger value="connected">Connected ({integrations?.length || 0})</TabsTrigger>
              <TabsTrigger value="available">Available ({availableIntegrations.length})</TabsTrigger>
              <TabsTrigger value="settings">Settings</TabsTrigger>
            </TabsList>

            <TabsContent value="connected" className="space-y-6">
              {integrations && integrations.length > 0 ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {integrations.map((integration: any) => {
                    const statusStyle = getStatusStyle(integration.status);
                    
                    return (
                      <Card key={integration.id} className="hover:shadow-lg transition-shadow">
                        <CardContent className="p-6">
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex items-center space-x-3">
                              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                                <i className={`${getIntegrationIcon(integration.name)} text-blue-600 text-xl`}></i>
                              </div>
                              <div>
                                <h3 className="font-semibold text-gray-900">{integration.name}</h3>
                                <p className="text-sm text-gray-600 capitalize">{integration.type}</p>
                              </div>
                            </div>
                            <Badge className={`${statusStyle.bg} ${statusStyle.text}`}>
                              <span className={`w-2 h-2 ${statusStyle.dot} rounded-full mr-2`}></span>
                              {integration.status}
                            </Badge>
                          </div>
                          
                          <div className="space-y-3">
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-600">Last Sync</span>
                              <span className="text-gray-900">
                                {integration.lastSyncAt ? formatLastSync(integration.lastSyncAt) : "Never"}
                              </span>
                            </div>
                            
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-600">Data Quality</span>
                              <span className="text-green-600 font-medium">98% ✓</span>
                            </div>
                            
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-600">Records Synced</span>
                              <span className="text-gray-900 font-medium">
                                {integration.type === 'crm' ? '1,247 customers' : 
                                 integration.type === 'support' ? '89 tickets' : 
                                 integration.type === 'payment' ? '3,456 transactions' : 
                                 'Active'}
                              </span>
                            </div>
                          </div>
                          
                          <div className="flex space-x-2 mt-4 pt-4 border-t border-gray-200">
                            <Button variant="outline" size="sm" className="flex-1">
                              <i className="fas fa-sync mr-2"></i>
                              Sync Now
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              onClick={() => {
                                setSelectedIntegration(integration);
                                setIsConfigOpen(true);
                              }}
                            >
                              <i className="fas fa-cog"></i>
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              ) : (
                <Card>
                  <CardContent className="p-8 text-center">
                    <i className="fas fa-plug text-4xl text-gray-400 mb-4"></i>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No Integrations Connected</h3>
                    <p className="text-gray-600 mb-4">Connect your first integration to start collecting customer data</p>
                    <Button onClick={() => {/* Switch to available tab */}}>
                      Browse Integrations
                    </Button>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="available" className="space-y-6">
              {Object.entries(groupedIntegrations).map(([category, categoryIntegrations]: [string, any]) => (
                <div key={category}>
                  <div className="flex items-center mb-4">
                    <i className={`${categoryIcons[category as keyof typeof categoryIcons]} text-gray-600 mr-2`}></i>
                    <h3 className="text-lg font-semibold text-gray-900">{category}</h3>
                    <Badge variant="outline" className="ml-2">{categoryIntegrations.length}</Badge>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {categoryIntegrations.map((integration: any) => {
                      const isConnected = isIntegrationConnected(integration.id);
                      
                      return (
                        <Card key={integration.id} className="hover:shadow-lg transition-shadow">
                          <CardContent className="p-6">
                            <div className="flex items-start justify-between mb-3">
                              <div className={`w-10 h-10 bg-${integration.color}-100 rounded-lg flex items-center justify-center`}>
                                <i className={`${integration.icon} text-${integration.color}-600`}></i>
                              </div>
                              {isConnected && (
                                <Badge className="bg-green-100 text-green-800">
                                  <i className="fas fa-check mr-1"></i>
                                  Connected
                                </Badge>
                              )}
                            </div>
                            
                            <h4 className="font-semibold text-gray-900 mb-2">{integration.name}</h4>
                            <p className="text-sm text-gray-600 mb-3">{integration.description}</p>
                            
                            <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
                              <span>Setup: {integration.setupTime}</span>
                              <div className="flex items-center">
                                <Progress value={integration.popularity} className="w-8 h-1 mr-1" />
                                <span>{integration.popularity}%</span>
                              </div>
                            </div>
                            
                            <div className="space-y-1 mb-4">
                              {integration.features.slice(0, 3).map((feature: string, index: number) => (
                                <div key={index} className="flex items-center text-xs text-gray-600">
                                  <i className="fas fa-check text-green-500 mr-2"></i>
                                  {feature}
                                </div>
                              ))}
                              {integration.features.length > 3 && (
                                <div className="text-xs text-gray-500">
                                  +{integration.features.length - 3} more features
                                </div>
                              )}
                            </div>
                            
                            <Button 
                              className="w-full" 
                              variant={isConnected ? "outline" : "default"}
                              disabled={isConnected}
                            >
                              {isConnected ? "Already Connected" : "Connect"}
                            </Button>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                </div>
              ))}
            </TabsContent>

            <TabsContent value="settings" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Sync Settings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-gray-900">Auto Sync</h4>
                      <p className="text-sm text-gray-600">Automatically sync data every 15 minutes</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-gray-900">Real-time Webhooks</h4>
                      <p className="text-sm text-gray-600">Receive instant updates when data changes</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-gray-900">Data Validation</h4>
                      <p className="text-sm text-gray-600">Validate incoming data for quality and completeness</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-gray-900">Error Notifications</h4>
                      <p className="text-sm text-gray-600">Get notified when sync errors occur</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>API Usage</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span>API Calls This Month</span>
                        <span>47,230 / 100,000</span>
                      </div>
                      <Progress value={47} className="h-2" />
                    </div>
                    
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span>Webhook Events</span>
                        <span>12,456 / 50,000</span>
                      </div>
                      <Progress value={25} className="h-2" />
                    </div>
                    
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span>Data Storage</span>
                        <span>3.2 GB / 10 GB</span>
                      </div>
                      <Progress value={32} className="h-2" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </main>
      </div>

      {/* Integration Configuration Modal */}
      <Dialog open={isConfigOpen} onOpenChange={setIsConfigOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Configure {selectedIntegration?.name}</DialogTitle>
          </DialogHeader>
          
          {selectedIntegration && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="status">Connection Status</Label>
                <div className="flex items-center space-x-2 mt-1">
                  <span className={`w-3 h-3 ${getStatusStyle(selectedIntegration.status).dot} rounded-full`}></span>
                  <span className="text-sm capitalize">{selectedIntegration.status}</span>
                </div>
              </div>
              
              <div>
                <Label htmlFor="lastSync">Last Sync</Label>
                <p className="text-sm text-gray-600 mt-1">
                  {selectedIntegration.lastSyncAt ? formatLastSync(selectedIntegration.lastSyncAt) : "Never"}
                </p>
              </div>
              
              <div>
                <Label htmlFor="webhook">Webhook URL</Label>
                <Input 
                  value="https://your-app.com/webhooks/integration"
                  readOnly
                  className="mt-1"
                />
              </div>
              
              <div className="flex justify-end space-x-3 pt-4">
                <Button variant="outline" onClick={() => setIsConfigOpen(false)}>
                  Close
                </Button>
                <Button variant="outline">
                  <i className="fas fa-sync mr-2"></i>
                  Sync Now
                </Button>
                <Button variant="destructive">
                  <i className="fas fa-unlink mr-2"></i>
                  Disconnect
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}