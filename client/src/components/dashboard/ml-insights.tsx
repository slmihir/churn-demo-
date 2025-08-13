import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { apiRequest } from "@/lib/queryClient";
import { Brain, TrendingUp, Target, Zap, AlertCircle, CheckCircle, Activity, BarChart3, Users, Lightbulb, ArrowUpRight, Sparkles, RefreshCw, Play } from "lucide-react";
import { useState } from "react";

interface FeatureImportance {
  feature: string;
  importance: number;
  impact: 'positive' | 'negative';
  description: string;
  rawImportance?: number;
  confidenceLevel?: 'high' | 'medium' | 'low';
  actionability?: 'high' | 'medium' | 'low';
}

interface ChurnPrediction {
  customerId: number;
  churnProbability: string; // Now a percentage string like "88.83"
  riskLevel: 'low' | 'medium' | 'high';
  confidence: string; // Now a percentage string like "87.39"
  topCauses: Array<{
    factor: string;
    impact: number;
    value: string;
  }>;
  recommendedActions: string[];
  responseTime?: number;
}

interface InterventionRecommendation {
  type: string;
  priority: 'low' | 'medium' | 'high';
  estimatedSuccess: number;
  estimatedRevenueSaved: number;
  description: string;
  reasoning: string;
}

interface MLAnalytics {
  totalCustomers: number;
  modelPerformance: {
    accuracy: number;
    precision: number;
    recall: number;
    f1Score: number;
    mlSuccessRate?: number;
  };
  featureImportances: FeatureImportance[];
  healthScoreAnalytics?: {
    average: number;
    distribution: {
      excellent: number;
      good: number;
      fair: number;
      poor: number;
    };
    percentages: {
      excellent: number;
      good: number;
      fair: number;
      poor: number;
    };
  };
  churnRiskAnalytics?: {
    average: number;
    distribution: {
      high: number;
      medium: number;
      low: number;
    };
    percentages: {
      high: number;
      medium: number;
      low: number;
    };
  };
  insights?: {
    topRiskFactors: Array<{
      factor: string;
      impact: number;
      actionable: boolean;
      recommendation: string;
    }>;
    healthTrends: {
      improving: number;
      declining: number;
      stable: number;
    };
  };
  interventionStats: {
    totalExecutions: number;
    successRate: number;
    avgStepsCompleted: number;
    avgIssuesFound: number;
  };
  riskDistribution: {
    high: number;
    medium: number;
    low: number;
  };
}

export default function MLInsights() {
  const [selectedCustomerId, setSelectedCustomerId] = useState<number>(1);
  const queryClient = useQueryClient();

  const { data: analytics, isLoading: analyticsLoading } = useQuery<MLAnalytics>({
    queryKey: ["/api/ml/analytics"],
  });

  const { data: featureImportance, isLoading: featuresLoading } = useQuery<{features: FeatureImportance[]}>({
    queryKey: ["/api/ml/feature-importance"],
  });

  const { data: prediction, isLoading: predictionLoading } = useQuery<ChurnPrediction>({
    queryKey: ["/api/v1/churn/predict", selectedCustomerId],
    queryFn: async () => {
      const response = await apiRequest("POST", "/api/v1/churn/predict", { customerId: selectedCustomerId });
      return response.json();
    },
  });

  const { data: recommendation, isLoading: recommendationLoading } = useQuery<InterventionRecommendation>({
    queryKey: ["/api/ml/recommend-intervention", selectedCustomerId],
    queryFn: () => apiRequest("POST", "/api/ml/recommend-intervention", { customerId: selectedCustomerId }),
  });

  const retrainMutation = useMutation({
    mutationFn: () => apiRequest("POST", "/api/ml/retrain"),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/ml/"] });
    },
  });

  const updateOutcomeMutation = useMutation({
    mutationFn: (data: { customerId: number; intervention: string; success: boolean; revenueImpact?: number }) =>
      apiRequest("POST", "/api/ml/update-outcome", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/ml/analytics"] });
    },
  });

  const getRiskColor = (risk: string | undefined) => {
    switch (risk) {
      case 'high': return 'text-red-600 bg-red-50 border-red-200';
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      default: return 'text-green-600 bg-green-50 border-green-200';
    }
  };

  const getPriorityColor = (priority: string | undefined) => {
    switch (priority) {
      case 'high': return 'text-red-600 bg-red-50';
      case 'medium': return 'text-yellow-600 bg-yellow-50';
      default: return 'text-green-600 bg-green-50';
    }
  };

  if (analyticsLoading || featuresLoading) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-6">
              <Brain className="h-6 w-6 text-blue-600" />
              <h3 className="text-lg font-semibold">ML Insights & Analytics</h3>
            </div>
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <Skeleton key={i} className="h-20 w-full" />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-md border border-border bg-muted text-foreground/60">
                <Brain size={18} />
              </div>
              <h3 className="text-[15px] font-semibold tracking-[-0.01em] text-foreground">ML Insights & Analytics</h3>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => retrainMutation.mutate()}
                disabled={retrainMutation.isPending}
                className="text-[12px]"
              >
                {retrainMutation.isPending ? (
                  <RefreshCw className="h-3 w-3 mr-2 animate-spin" />
                ) : (
                  <Zap className="h-3 w-3 mr-2" />
                )}
                {retrainMutation.isPending ? 'Retraining...' : 'Retrain Model'}
              </Button>
            </div>
          </div>

          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="predictions">Predictions</TabsTrigger>
              <TabsTrigger value="features">Feature Analysis</TabsTrigger>
              <TabsTrigger value="interventions">Interventions</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              {/* Model Performance Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card>
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-[12px] font-medium text-foreground/70">Accuracy</p>
                        <p className="mt-1 text-[28px] font-semibold tracking-[-0.01em] text-foreground">
                          {(analytics?.modelPerformance.accuracy * 100).toFixed(1)}%
                        </p>
                      </div>
                      <div className="flex h-10 w-10 items-center justify-center rounded-md border border-border bg-muted text-foreground/60">
                        <CheckCircle size={18} />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-[12px] font-medium text-foreground/70">Precision</p>
                        <p className="mt-1 text-[28px] font-semibold tracking-[-0.01em] text-foreground">
                          {(analytics?.modelPerformance.precision * 100).toFixed(1)}%
                        </p>
                      </div>
                      <div className="flex h-10 w-10 items-center justify-center rounded-md border border-border bg-muted text-foreground/60">
                        <Target size={18} />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-[12px] font-medium text-foreground/70">Recall</p>
                        <p className="mt-1 text-[28px] font-semibold tracking-[-0.01em] text-foreground">
                          {(analytics?.modelPerformance.recall * 100).toFixed(1)}%
                        </p>
                      </div>
                      <div className="flex h-10 w-10 items-center justify-center rounded-md border border-border bg-muted text-foreground/60">
                        <TrendingUp size={18} />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-[12px] font-medium text-foreground/70">F1 Score</p>
                        <p className="mt-1 text-[28px] font-semibold tracking-[-0.01em] text-foreground">
                          {(analytics?.modelPerformance.f1Score * 100).toFixed(1)}%
                        </p>
                      </div>
                      <div className="flex h-10 w-10 items-center justify-center rounded-md border border-border bg-muted text-foreground/60">
                        <Brain size={18} />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Risk Distribution */}
              <Card>
                <CardContent className="p-6">
                  <h4 className="text-[15px] font-semibold tracking-[-0.01em] text-foreground mb-4">Customer Risk Distribution</h4>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-4 h-4 bg-red-500 rounded"></div>
                        <span>High Risk</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <Progress value={(analytics?.riskDistribution.high / analytics?.totalCustomers) * 100} className="w-32" />
                        <span className="font-semibold">{analytics?.riskDistribution.high}</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-4 h-4 bg-yellow-500 rounded"></div>
                        <span>Medium Risk</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <Progress value={(analytics?.riskDistribution.medium / analytics?.totalCustomers) * 100} className="w-32" />
                        <span className="font-semibold">{analytics?.riskDistribution.medium}</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-4 h-4 bg-green-500 rounded"></div>
                        <span>Low Risk</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <Progress value={(analytics?.riskDistribution.low / analytics?.totalCustomers) * 100} className="w-32" />
                        <span className="font-semibold">{analytics?.riskDistribution.low}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="predictions" className="space-y-6">
              <div className="flex items-center gap-4 mb-4">
                <label htmlFor="customer-select" className="text-[12px] font-medium text-foreground/70">
                  Select Customer:
                </label>
                <select
                  id="customer-select"
                  value={selectedCustomerId}
                  onChange={(e) => setSelectedCustomerId(Number(e.target.value))}
                  className="px-3 py-2 border border-border rounded-md bg-background text-foreground text-[12px]"
                >
                  {[...Array(20)].map((_, i) => (
                    <option key={i + 1} value={i + 1}>
                      Customer {i + 1}
                    </option>
                  ))}
                </select>
              </div>

              {predictionLoading ? (
                <Skeleton className="h-40 w-full" />
              ) : prediction ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card>
                    <CardContent className="p-6">
                      <h4 className="text-[15px] font-semibold tracking-[-0.01em] text-foreground mb-4">Churn Prediction</h4>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <span className="text-[12px] font-medium text-foreground/70">Churn Probability</span>
                          <div className="flex items-center gap-2">
                            <Progress value={parseFloat(prediction.churnProbability || "0")} className="w-24" />
                            <span className="text-[14px] font-semibold text-foreground">{prediction.churnProbability || "0"}%</span>
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-[12px] font-medium text-foreground/70">Risk Level</span>
                          <Badge className={getRiskColor(prediction.riskLevel || 'low')}>
                            {(prediction.riskLevel || 'low').toUpperCase()}
                          </Badge>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-[12px] font-medium text-foreground/70">Confidence</span>
                          <span className="text-[14px] font-semibold text-foreground">{prediction.confidence || "0"}%</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-6">
                      <h4 className="text-[15px] font-semibold tracking-[-0.01em] text-foreground mb-4">Top Risk Factors</h4>
                      <div className="space-y-3">
                        {(prediction.topCauses || []).map((factor, index) => (
                          <div key={index} className="flex items-center justify-between">
                            <div>
                              <p className="text-[14px] font-medium text-foreground">{factor.factor || 'Unknown Factor'}</p>
                              <p className="text-[12px] text-foreground/70">{factor.value || 'No description available'}</p>
                            </div>
                            <div className="text-right">
                              <div className="flex items-center gap-2">
                                <Progress value={factor.impact || 0} className="w-16" />
                                <span className="text-[12px] font-medium text-foreground">{(factor.impact || 0).toFixed(0)}%</span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              ) : null}

              {recommendationLoading ? (
                <Skeleton className="h-32 w-full" />
              ) : recommendation ? (
                <Card>
                  <CardContent className="p-6">
                    <h4 className="text-[15px] font-semibold tracking-[-0.01em] text-foreground mb-4">AI-Recommended Intervention</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-[12px] font-medium text-foreground/70">Intervention Type</span>
                          <span className="text-[14px] font-semibold text-foreground">{recommendation.type}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-[12px] font-medium text-foreground/70">Priority</span>
                          <Badge className={getPriorityColor(recommendation.priority)}>
                            {(recommendation.priority || 'medium').toUpperCase()}
                          </Badge>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-[12px] font-medium text-foreground/70">Success Probability</span>
                          <span className="text-[14px] font-semibold text-foreground">{((recommendation.estimatedSuccess || 0) * 100).toFixed(1)}%</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-[12px] font-medium text-foreground/70">Potential Revenue Saved</span>
                          <span className="text-[14px] font-semibold text-foreground">${(recommendation.estimatedRevenueSaved || 0).toLocaleString()}</span>
                        </div>
                      </div>
                      <div className="space-y-3">
                        <div>
                          <p className="text-[14px] font-medium text-foreground mb-2">Description</p>
                          <p className="text-[12px] text-foreground/70">{recommendation.description || 'No description available'}</p>
                        </div>
                        <div>
                          <p className="text-[14px] font-medium text-foreground mb-2">Reasoning</p>
                          <p className="text-[12px] text-foreground/70">{recommendation.reasoning || 'No reasoning available'}</p>
                        </div>
                      </div>
                    </div>
                    <div className="mt-4 flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => updateOutcomeMutation.mutate({
                          customerId: selectedCustomerId,
                          intervention: recommendation.type || 'Unknown',
                          success: true,
                          revenueImpact: recommendation.estimatedRevenueSaved || 0,
                        })}
                      >
                        Mark Successful
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => updateOutcomeMutation.mutate({
                          customerId: selectedCustomerId,
                          intervention: recommendation.type || 'Unknown',
                          success: false,
                        })}
                      >
                        Mark Failed
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ) : null}
            </TabsContent>

            <TabsContent value="features" className="space-y-6">
              {/* Health Score Analytics */}
              {analytics?.healthScoreAnalytics && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card>
                    <CardContent className="p-6">
                      <h4 className="text-lg font-semibold mb-4">Health Score Distribution</h4>
                      <div className="space-y-4">
                        <div className="text-center">
                          <p className="text-3xl font-bold text-blue-600">
                            {analytics.healthScoreAnalytics.average}%
                          </p>
                          <p className="text-sm text-gray-600">Average Health Score</p>
                        </div>
                        <div className="space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="text-sm">Excellent (90%+)</span>
                            <div className="flex items-center gap-2">
                              <div className="w-16 bg-gray-200 rounded-full h-2">
                                <div 
                                  className="bg-green-600 h-2 rounded-full" 
                                  style={{ width: `${analytics.healthScoreAnalytics.percentages.excellent}%` }}
                                ></div>
                              </div>
                              <span className="text-sm font-medium">{analytics.healthScoreAnalytics.percentages.excellent}%</span>
                            </div>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm">Good (70-89%)</span>
                            <div className="flex items-center gap-2">
                              <div className="w-16 bg-gray-200 rounded-full h-2">
                                <div 
                                  className="bg-blue-600 h-2 rounded-full" 
                                  style={{ width: `${analytics.healthScoreAnalytics.percentages.good}%` }}
                                ></div>
                              </div>
                              <span className="text-sm font-medium">{analytics.healthScoreAnalytics.percentages.good}%</span>
                            </div>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm">Fair (50-69%)</span>
                            <div className="flex items-center gap-2">
                              <div className="w-16 bg-gray-200 rounded-full h-2">
                                <div 
                                  className="bg-yellow-600 h-2 rounded-full" 
                                  style={{ width: `${analytics.healthScoreAnalytics.percentages.fair}%` }}
                                ></div>
                              </div>
                              <span className="text-sm font-medium">{analytics.healthScoreAnalytics.percentages.fair}%</span>
                            </div>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm">Poor (&lt;50%)</span>
                            <div className="flex items-center gap-2">
                              <div className="w-16 bg-gray-200 rounded-full h-2">
                                <div 
                                  className="bg-red-600 h-2 rounded-full" 
                                  style={{ width: `${analytics.healthScoreAnalytics.percentages.poor}%` }}
                                ></div>
                              </div>
                              <span className="text-sm font-medium">{analytics.healthScoreAnalytics.percentages.poor}%</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-6">
                      <h4 className="text-lg font-semibold mb-4">Churn Risk Analytics</h4>
                      <div className="space-y-4">
                        <div className="text-center">
                          <p className="text-3xl font-bold text-orange-600">
                            {analytics.churnRiskAnalytics?.average}%
                          </p>
                          <p className="text-sm text-gray-600">Average Churn Risk</p>
                        </div>
                        <div className="grid grid-cols-3 gap-2 text-center">
                          <div className="p-3 bg-red-50 rounded-lg">
                            <p className="text-lg font-bold text-red-600">{analytics.churnRiskAnalytics?.distribution.high}</p>
                            <p className="text-xs text-red-700">High Risk</p>
                          </div>
                          <div className="p-3 bg-yellow-50 rounded-lg">
                            <p className="text-lg font-bold text-yellow-600">{analytics.churnRiskAnalytics?.distribution.medium}</p>
                            <p className="text-xs text-yellow-700">Medium Risk</p>
                          </div>
                          <div className="p-3 bg-green-50 rounded-lg">
                            <p className="text-lg font-bold text-green-600">{analytics.churnRiskAnalytics?.distribution.low}</p>
                            <p className="text-xs text-green-700">Low Risk</p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}

              {/* Enhanced Feature Importance */}
              <Card>
                <CardContent className="p-6">
                  <h4 className="text-lg font-semibold mb-4">Advanced Feature Analysis</h4>
                  <div className="space-y-4">
                    {featureImportance?.features.map((feature, index) => (
                      <div key={index} className="p-4 border rounded-lg bg-gradient-to-r from-gray-50 to-white">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h5 className="font-semibold text-lg">{feature.feature}</h5>
                              <Badge variant={feature.impact === 'positive' ? 'default' : 'destructive'}>
                                {feature.impact}
                              </Badge>
                              {feature.confidenceLevel && (
                                <Badge variant={
                                  feature.confidenceLevel === 'high' ? 'default' : 
                                  feature.confidenceLevel === 'medium' ? 'secondary' : 'outline'
                                }>
                                  {feature.confidenceLevel} confidence
                                </Badge>
                              )}
                              {feature.actionability && (
                                <Badge variant={
                                  feature.actionability === 'high' ? 'default' : 
                                  feature.actionability === 'medium' ? 'secondary' : 'outline'
                                }>
                                  {feature.actionability} actionability
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm text-gray-600 mb-3">{feature.description}</p>
                          </div>
                          <div className="text-right">
                            <div className="flex items-center gap-2 mb-1">
                              <Progress value={feature.importance} className="w-32" />
                              <span className="font-bold text-xl text-blue-600">{feature.importance.toFixed(1)}%</span>
                            </div>
                            <p className="text-xs text-gray-500">Feature Impact</p>
                          </div>
                        </div>
                        
                        {/* Recommendations from insights */}
                        {analytics?.insights?.topRiskFactors.find(f => f.factor === feature.feature) && (
                          <div className="mt-3 p-3 bg-blue-50 rounded-lg border-l-4 border-blue-400">
                            <p className="text-sm text-blue-800">
                              <strong>AI Recommendation:</strong> {analytics.insights.topRiskFactors.find(f => f.factor === feature.feature)?.recommendation}
                            </p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Health Trends Insights */}
              {analytics?.insights?.healthTrends && (
                <Card>
                  <CardContent className="p-6">
                    <h4 className="text-lg font-semibold mb-4">Customer Health Trends</h4>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="text-center p-4 bg-green-50 rounded-lg">
                        <TrendingUp className="h-8 w-8 text-green-600 mx-auto mb-2" />
                        <p className="text-2xl font-bold text-green-600">{analytics.insights.healthTrends.improving}</p>
                        <p className="text-sm text-green-700">Improving</p>
                      </div>
                      <div className="text-center p-4 bg-red-50 rounded-lg">
                        <AlertCircle className="h-8 w-8 text-red-600 mx-auto mb-2" />
                        <p className="text-2xl font-bold text-red-600">{analytics.insights.healthTrends.declining}</p>
                        <p className="text-sm text-red-700">Declining</p>
                      </div>
                      <div className="text-center p-4 bg-gray-50 rounded-lg">
                        <CheckCircle className="h-8 w-8 text-gray-600 mx-auto mb-2" />
                        <p className="text-2xl font-bold text-gray-600">{analytics.insights.healthTrends.stable}</p>
                        <p className="text-sm text-gray-700">Stable</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="interventions" className="space-y-6">
              <Card>
                <CardContent className="p-6">
                  <h4 className="text-lg font-semibold mb-4">Intervention Analytics</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="p-4 border rounded-lg">
                      <p className="text-sm font-medium text-gray-600">Total Executions</p>
                      <p className="text-2xl font-bold">{analytics?.interventionStats.totalExecutions}</p>
                    </div>
                    <div className="p-4 border rounded-lg">
                      <p className="text-sm font-medium text-gray-600">Success Rate</p>
                      <p className="text-2xl font-bold text-green-600">
                        {analytics?.interventionStats.successRate.toFixed(1)}%
                      </p>
                    </div>
                    <div className="p-4 border rounded-lg">
                      <p className="text-sm font-medium text-gray-600">Avg Steps Completed</p>
                      <p className="text-2xl font-bold">
                        {analytics?.interventionStats.avgStepsCompleted.toFixed(1)}
                      </p>
                    </div>
                    <div className="p-4 border rounded-lg">
                      <p className="text-sm font-medium text-gray-600">Avg Issues Found</p>
                      <p className="text-2xl font-bold text-orange-600">
                        {analytics?.interventionStats.avgIssuesFound.toFixed(1)}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}