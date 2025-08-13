import Sidebar from "@/components/layout/sidebar";
import TopBar from "@/components/layout/topbar";
import MetricsGrid from "@/components/dashboard/metrics-grid";
import ChurnChart from "@/components/dashboard/churn-chart";
import CustomerSegmentation from "@/components/dashboard/customer-segmentation";
import ChurnCauses from "@/components/dashboard/churn-causes";
import RiskAlerts from "@/components/dashboard/risk-alerts";
import InterventionsTable from "@/components/dashboard/interventions-table";
import Integrations from "@/components/dashboard/integrations";
import APIEndpoints from "@/components/dashboard/api-endpoints";
import PlaybookModal from "@/components/dashboard/playbook-modal";
import MLInsights from "@/components/dashboard/ml-insights";
import { useState } from "react";

export default function Dashboard() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <TopBar />
        
        <main className="flex-1 overflow-y-auto p-6">
          <MetricsGrid />
          
          {/* ML Insights Section */}
          <div className="mb-8">
            <MLInsights />
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <ChurnChart />
            <CustomerSegmentation />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <ChurnCauses />
            <RiskAlerts onLaunchPlaybook={() => setIsModalOpen(true)} />
          </div>

          <InterventionsTable onNewIntervention={() => setIsModalOpen(true)} />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
            <Integrations />
            <APIEndpoints />
          </div>
        </main>
      </div>

      <PlaybookModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
      />
    </div>
  );
}
