import Sidebar from "@/components/layout/sidebar";
import TopBar from "@/components/layout/topbar";
import MetricsGrid from "@/components/dashboard/metrics-grid";
import ChurnChart from "@/components/dashboard/churn-chart";
import RetentionTrends from "@/components/dashboard/retention-trends";
import RiskDistribution from "@/components/dashboard/risk-distribution";
import CustomerSegmentation from "@/components/dashboard/customer-segmentation";
import ChurnCauses from "@/components/dashboard/churn-causes";
import RiskAlerts from "@/components/dashboard/risk-alerts";
import InterventionsTable from "@/components/dashboard/interventions-table";
import ProblemIntake from "@/components/dashboard/problem-intake";

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

          {/* Main Dashboard Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            {/* Left Column - Retention Trends */}
            <div className="lg:col-span-2">
              <RetentionTrends />
            </div>
            
            {/* Right Column - Model Metrics */}
            <div className="space-y-6">
              <RiskDistribution />
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Model Performance</h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Accuracy</span>
                    <span className="font-semibold text-green-600">87.3%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Precision</span>
                    <span className="font-semibold text-blue-600">82.1%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Recall</span>
                    <span className="font-semibold text-purple-600">88.7%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">F1 Score</span>
                    <span className="font-semibold text-orange-600">85.2%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ML Insights Section */}
          <div className="mb-8">
            <MLInsights />
          </div>

          {/* Problem Intake & Prioritization */}
          <div className="mb-8">
            <ProblemIntake />
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

                        <div className="mt-6">
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
