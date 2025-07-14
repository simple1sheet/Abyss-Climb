import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { apiRequest } from '@/lib/queryClient';
import { ChevronUp, ChevronDown, Target, Trophy, TrendingUp, Activity, Clock, Brain, Lightbulb } from 'lucide-react';

interface ProgressionSnapshot {
  id: number;
  userId: string;
  currentMaxGrade: string;
  comfortGrade: string;
  projectGrade: string;
  sendRate: number;
  attemptEfficiency: number;
  consistencyScore: number;
  improvementRate: number;
  styleVersatility: number;
  holdTypeAdaptability: number;
  weaknessImprovement: number;
  totalProblems: number;
  totalSessions: number;
  daysSinceStart: number;
  createdAt: string;
}

interface DifficultyRecommendation {
  id: number;
  userId: string;
  warmupGrade: string;
  comfortGrade: string;
  challengeGrade: string;
  projectGrade: string;
  focusStyles: string;
  weaknessAreas: string;
  trainingPlan: string;
  confidenceScore: number;
  adaptationReason: string;
  createdAt: string;
}

interface LearningPathMilestone {
  id: number;
  userId: string;
  title: string;
  description: string;
  targetGrade?: string;
  targetValue?: number;
  currentValue: number;
  isCompleted: boolean;
  progressPercentage: number;
  category: string;
  difficulty: string;
  motivationText: string;
  tips: string;
  createdAt: string;
}

interface ProgressionDashboardData {
  snapshot: ProgressionSnapshot | null;
  recommendations: DifficultyRecommendation | null;
  milestones: LearningPathMilestone[];
}

const ProgressionDashboard: React.FC = () => {
  const queryClient = useQueryClient();
  
  const { data: dashboardData, isLoading, refetch } = useQuery<ProgressionDashboardData>({
    queryKey: ['/api/progression/dashboard'],
    staleTime: 30000, // 30 seconds
  });

  const generateSnapshotMutation = useMutation({
    mutationFn: () => apiRequest('/api/progression/snapshot', { method: 'POST' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/progression/dashboard'] });
    },
  });

  const generateRecommendationsMutation = useMutation({
    mutationFn: () => apiRequest('/api/progression/recommendations', { method: 'POST' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/progression/dashboard'] });
    },
  });

  const generateMilestonesMutation = useMutation({
    mutationFn: () => apiRequest('/api/progression/milestones', { method: 'POST' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/progression/dashboard'] });
    },
  });

  const completeMilestoneMutation = useMutation({
    mutationFn: (data: { id: number; isCompleted: boolean }) => 
      apiRequest(`/api/progression/milestones/${data.id}`, { 
        method: 'PATCH', 
        body: { isCompleted: data.isCompleted, completedAt: new Date().toISOString() }
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/progression/dashboard'] });
    },
  });

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'technique': return <Brain className="w-4 h-4" />;
      case 'strength': return <Activity className="w-4 h-4" />;
      case 'endurance': return <Clock className="w-4 h-4" />;
      case 'mental': return <Lightbulb className="w-4 h-4" />;
      case 'style': return <Target className="w-4 h-4" />;
      default: return <Target className="w-4 h-4" />;
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'advanced': return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
      case 'expert': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const formatMetric = (value: number, isPercentage: boolean = false) => {
    if (isPercentage) {
      return `${Math.round(value * 100)}%`;
    }
    return value.toFixed(2);
  };

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="nature-card">
              <CardHeader>
                <Skeleton className="h-6 w-32" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-3/4" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 nature-background">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-white ancient-text">
          🔮 Adaptive Progression Tracker
        </h1>
        <Button 
          onClick={() => refetch()}
          className="abyss-button"
        >
          <TrendingUp className="w-4 h-4 mr-2" />
          Refresh Analysis
        </Button>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
          <TabsTrigger value="milestones">Learning Path</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {dashboardData?.snapshot ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card className="nature-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Trophy className="w-5 h-5" />
                    Current Performance
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Max Grade</p>
                      <p className="text-2xl font-bold text-white">{dashboardData.snapshot.currentMaxGrade}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Comfort Grade</p>
                      <p className="text-2xl font-bold text-white">{dashboardData.snapshot.comfortGrade}</p>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Send Rate</p>
                    <Progress value={dashboardData.snapshot.sendRate * 100} className="h-2" />
                    <p className="text-sm text-right mt-1">{formatMetric(dashboardData.snapshot.sendRate, true)}</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="nature-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="w-5 h-5" />
                    Efficiency Metrics
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Attempt Efficiency</p>
                    <Progress value={dashboardData.snapshot.attemptEfficiency * 100} className="h-2" />
                    <p className="text-sm text-right mt-1">{formatMetric(dashboardData.snapshot.attemptEfficiency, true)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Consistency Score</p>
                    <Progress value={dashboardData.snapshot.consistencyScore * 100} className="h-2" />
                    <p className="text-sm text-right mt-1">{formatMetric(dashboardData.snapshot.consistencyScore, true)}</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="nature-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Brain className="w-5 h-5" />
                    Learning Metrics
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Style Versatility</p>
                    <Progress value={dashboardData.snapshot.styleVersatility * 100} className="h-2" />
                    <p className="text-sm text-right mt-1">{formatMetric(dashboardData.snapshot.styleVersatility, true)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Weakness Improvement</p>
                    <Progress value={dashboardData.snapshot.weaknessImprovement * 100} className="h-2" />
                    <p className="text-sm text-right mt-1">{formatMetric(dashboardData.snapshot.weaknessImprovement, true)}</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            <Card className="nature-card">
              <CardContent className="py-12 text-center">
                <Activity className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                <p className="text-gray-600 dark:text-gray-400 mb-4">No progression data available</p>
                <Button
                  onClick={() => generateSnapshotMutation.mutate()}
                  disabled={generateSnapshotMutation.isPending}
                  className="abyss-button"
                >
                  Generate Progression Snapshot
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="recommendations" className="space-y-6">
          {dashboardData?.recommendations ? (
            <div className="space-y-6">
              <Card className="nature-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="w-5 h-5" />
                    Difficulty Recommendations
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    <div className="text-center">
                      <p className="text-sm text-gray-600 dark:text-gray-400">Warm-up</p>
                      <p className="text-xl font-bold text-white">{dashboardData.recommendations.warmupGrade}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-gray-600 dark:text-gray-400">Comfort</p>
                      <p className="text-xl font-bold text-white">{dashboardData.recommendations.comfortGrade}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-gray-600 dark:text-gray-400">Challenge</p>
                      <p className="text-xl font-bold text-white">{dashboardData.recommendations.challengeGrade}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-gray-600 dark:text-gray-400">Project</p>
                      <p className="text-xl font-bold text-white">{dashboardData.recommendations.projectGrade}</p>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <p className="font-semibold mb-2">Focus Areas</p>
                      <div className="flex flex-wrap gap-2">
                        {JSON.parse(dashboardData.recommendations.focusStyles || '[]').map((style: string, index: number) => (
                          <Badge key={index} variant="outline">{style}</Badge>
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      <p className="font-semibold mb-2">Weakness Areas</p>
                      <div className="flex flex-wrap gap-2">
                        {JSON.parse(dashboardData.recommendations.weaknessAreas || '[]').map((area: string, index: number) => (
                          <Badge key={index} variant="destructive">{area}</Badge>
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      <p className="font-semibold mb-2">Adaptation Reason</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{dashboardData.recommendations.adaptationReason}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            <Card className="nature-card">
              <CardContent className="py-12 text-center">
                <Target className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                <p className="text-gray-600 dark:text-gray-400 mb-4">No difficulty recommendations available</p>
                <Button
                  onClick={() => generateRecommendationsMutation.mutate()}
                  disabled={generateRecommendationsMutation.isPending}
                  className="abyss-button"
                >
                  Generate Recommendations
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="milestones" className="space-y-6">
          {dashboardData?.milestones && dashboardData.milestones.length > 0 ? (
            <div className="space-y-4">
              {dashboardData.milestones.map((milestone) => (
                <Card key={milestone.id} className="nature-card">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        {getCategoryIcon(milestone.category)}
                        <div>
                          <h3 className="font-semibold text-white">{milestone.title}</h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400">{milestone.description}</p>
                        </div>
                      </div>
                      <Badge className={getDifficultyColor(milestone.difficulty)}>
                        {milestone.difficulty}
                      </Badge>
                    </div>
                    
                    <div className="mb-4">
                      <Progress value={milestone.progressPercentage} className="h-2" />
                      <p className="text-sm text-right mt-1">{Math.round(milestone.progressPercentage)}%</p>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-gray-600 dark:text-gray-400">{milestone.motivationText}</p>
                      <Button
                        onClick={() => completeMilestoneMutation.mutate({
                          id: milestone.id,
                          isCompleted: !milestone.isCompleted
                        })}
                        disabled={completeMilestoneMutation.isPending}
                        variant={milestone.isCompleted ? "secondary" : "default"}
                        size="sm"
                      >
                        {milestone.isCompleted ? "Mark Incomplete" : "Mark Complete"}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="nature-card">
              <CardContent className="py-12 text-center">
                <Trophy className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                <p className="text-gray-600 dark:text-gray-400 mb-4">No learning path milestones available</p>
                <Button
                  onClick={() => generateMilestonesMutation.mutate()}
                  disabled={generateMilestonesMutation.isPending}
                  className="abyss-button"
                >
                  Generate Learning Path
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ProgressionDashboard;