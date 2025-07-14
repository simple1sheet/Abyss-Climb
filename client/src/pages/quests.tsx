import React, { useState } from 'react';
import { useAuth } from "@/hooks/useAuth";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useLocation } from "wouter";
import BottomNavigation from "@/components/BottomNavigation";
import { CheckCircle, X, ArrowLeft, Camera, Utensils, Target, TrendingUp, Gem } from "lucide-react";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { useGradeSystem } from "@/hooks/useGradeSystem";
import { gradeConverter } from "@/utils/gradeConverter";
import { useAchievementNotification } from "@/hooks/useAchievementNotification";
import RelicsTab from "@/components/RelicsTab";

// Quest Content Component for the tabbed interface
function QuestContent() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { gradeSystem } = useGradeSystem();
  const { showMultipleAchievementNotifications } = useAchievementNotification();

  // Helper function to convert grade mentions in quest descriptions
  const convertGradesInText = (text: string): string => {
    // Match V-scale grades in the format "V0", "V1", etc.
    return text.replace(/V(\d+)/g, (match) => {
      return gradeConverter.convertGrade(match, 'V-Scale', gradeSystem);
    });
  };
  
  const { data: quests, isLoading } = useQuery({
    queryKey: ["/api/quests?status=active"],
    enabled: !!user,
  });

  // Filter and separate quest types
  const { dailyQuests, weeklyQuests } = React.useMemo(() => {
    if (!quests) return { dailyQuests: [], weeklyQuests: [] };
    
    const filtered = quests.filter((quest: any) => quest.questType !== "layer");
    return {
      dailyQuests: filtered.filter((quest: any) => quest.questType === "daily"),
      weeklyQuests: filtered.filter((quest: any) => quest.questType === "weekly")
    };
  }, [quests]);

  const { data: dailyCount } = useQuery({
    queryKey: ["/api/quests/daily-count"],
    enabled: !!user,
  });

  const { data: completionCount } = useQuery({
    queryKey: ["/api/quests/completion-count"],
    enabled: !!user,
  });

  const completeQuest = useMutation({
    mutationFn: async (questId: number) => {
      return await apiRequest("POST", `/api/quests/${questId}/complete`, {});
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/quests?status=active"] });
      queryClient.invalidateQueries({ queryKey: ["/api/quests"] });
      queryClient.invalidateQueries({ queryKey: ["/api/quests/daily-count"] });
      queryClient.invalidateQueries({ queryKey: ["/api/quests/completion-count"] });
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      queryClient.invalidateQueries({ queryKey: ["/api/layer-progress"] });
      queryClient.invalidateQueries({ queryKey: ["/api/achievements"] });
      
      // Handle both old format (just quest) and new format (quest + achievements)
      const quest = data.quest || data;
      const achievements = data.newAchievements || [];
      
      // Show achievement notifications first
      if (achievements.length > 0) {
        showMultipleAchievementNotifications(achievements);
      }
      
      toast({
        title: "Quest Completed!",
        description: `Quest completed successfully! +${quest.xpReward} XP`,
      });
    },
    onError: (error: any) => {
      if (error.response?.status === 400 && error.response?.data?.completionLimitReached) {
        toast({
          title: "Daily Completion Limit Reached",
          description: "You can only complete 3 quests per day. Come back tomorrow!",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Error",
          description: "Failed to complete quest. Try again later.",
          variant: "destructive",
        });
      }
    },
  });

  const discardQuest = useMutation({
    mutationFn: async (questId: number) => {
      return await apiRequest("POST", `/api/quests/${questId}/discard`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/quests?status=active"] });
      queryClient.invalidateQueries({ queryKey: ["/api/quests"] });
      queryClient.invalidateQueries({ queryKey: ["/api/quests/daily-count"] });
      toast({
        title: "Quest Discarded",
        description: "The quest has been removed from your active quests.",
      });
    },
  });

  const getLayerIcon = (layer: number) => {
    const icons = {
      1: "fas fa-mountain",
      2: "fas fa-tree",
      3: "fas fa-bolt",
      4: "fas fa-wine-glass",
      5: "fas fa-skull",
      6: "fas fa-crown",
      7: "fas fa-tornado"
    };
    return icons[layer as keyof typeof icons] || "fas fa-question";
  };

  const getLayerName = (layer: number) => {
    const names = {
      1: "Edge of Abyss",
      2: "Forest of Temptation", 
      3: "Great Fault",
      4: "Goblets of Giants",
      5: "Sea of Corpses",
      6: "Capital of Unreturned",
      7: "Final Maelstrom"
    };
    return names[layer as keyof typeof names] || "Unknown Layer";
  };

  const getDifficultyColor = (difficulty: string) => {
    const colors = {
      "Easy": "bg-green-500",
      "Medium": "bg-yellow-500", 
      "Hard": "bg-red-500",
      "Expert": "bg-purple-500"
    };
    return colors[difficulty as keyof typeof colors] || "bg-gray-500";
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Quest Stats */}
      <div className="text-center">
        <p className="text-sm text-abyss-ethereal/60">
          {dailyCount?.dailyCount || 0} / {dailyCount?.maxDaily || 3} Daily Quests | 
          {completionCount?.completedToday || 0} / {completionCount?.maxCompletions || 10} Completed Today
        </p>
      </div>

      {/* Daily Quests */}
      <div>
        <h2 className="text-xl font-semibold text-abyss-ethereal mb-4 flex items-center gap-2">
          <Target className="h-5 w-5" />
          Daily Quests
        </h2>
        {dailyQuests.length === 0 ? (
          <Card className="bg-abyss-purple/30 backdrop-blur-sm border-abyss-teal/20 depth-layer">
            <CardContent className="p-6 text-center">
              <Target className="h-12 w-12 mx-auto mb-4 text-abyss-amber/50" />
              <p className="text-abyss-ethereal/70">No daily quests</p>
              <p className="text-sm text-abyss-ethereal/50 mt-2">
                Daily quests are generated automatically when you visit the app
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {dailyQuests.map((quest: any) => (
              <Card key={quest.id} className="bg-abyss-purple/30 backdrop-blur-sm border-abyss-teal/20 depth-layer">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-abyss-teal/50 rounded-full flex items-center justify-center">
                        <i className={`${getLayerIcon(quest.layer)} text-sm text-abyss-amber`}></i>
                      </div>
                      <div>
                        <h3 className="text-abyss-ethereal font-medium">{quest.title}</h3>
                        <p className="text-xs text-abyss-amber">{getLayerName(quest.layer)}</p>
                      </div>
                    </div>
                    <Badge className={`${getDifficultyColor(quest.difficulty)} text-white`}>
                      {quest.difficulty}
                    </Badge>
                  </div>
                  <p className="text-sm text-abyss-ethereal/80 mb-3">{convertGradesInText(quest.description)}</p>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-abyss-ethereal/70">Progress</span>
                      <span className="text-sm text-abyss-ethereal/70">
                        {quest.progress}/{quest.maxProgress}
                      </span>
                    </div>
                    <Progress 
                      value={(quest.progress / quest.maxProgress) * 100} 
                      className="h-2"
                    />
                  </div>
                  <div className="flex items-center justify-between mt-3">
                    <div className="flex items-center space-x-2">
                      <div className="flex items-center space-x-1">
                        <i className="fas fa-coins text-abyss-amber text-sm"></i>
                        <span className="text-sm text-abyss-amber">{quest.xpReward} XP</span>
                      </div>
                      {quest.expiresAt && (
                        <span className="text-xs text-abyss-ethereal/50">
                          Expires: {new Date(quest.expiresAt).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center justify-end space-x-2 mt-3">
                    <Button
                      onClick={() => completeQuest.mutate(quest.id)}
                      disabled={completeQuest.isPending || (completionCount?.completionLimitReached)}
                      size="sm"
                      className="bg-green-500/20 text-green-300 hover:bg-green-500/30 border-green-500/50 disabled:opacity-50"
                      title={completionCount?.completionLimitReached ? "Daily completion limit reached. Come back tomorrow!" : "Complete Quest"}
                    >
                      <CheckCircle className="h-4 w-4" />
                    </Button>
                    <Button
                      onClick={() => discardQuest.mutate(quest.id)}
                      disabled={discardQuest.isPending}
                      size="sm"
                      variant="outline"
                      className="text-red-400 hover:text-red-300 border-red-400/50 hover:border-red-300/50"
                      title="Discard Quest"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Weekly Quests */}
      <div>
        <h2 className="text-xl font-semibold text-purple-400 mb-4 flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          Weekly Quests
        </h2>
        {weeklyQuests.length === 0 ? (
          <Card className="bg-abyss-purple/30 backdrop-blur-sm border-purple-500/20 depth-layer">
            <CardContent className="p-6 text-center">
              <TrendingUp className="h-12 w-12 mx-auto mb-4 text-purple-400/50" />
              <p className="text-abyss-ethereal/70">No weekly quests</p>
              <p className="text-sm text-abyss-ethereal/50 mt-2">
                Weekly quests are generated automatically when available
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {weeklyQuests.map((quest: any) => (
              <Card key={quest.id} className="bg-abyss-purple/30 backdrop-blur-sm border-purple-500/20 depth-layer">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-purple-600/50 rounded-full flex items-center justify-center">
                        <TrendingUp className="h-4 w-4 text-purple-400" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <Badge className="bg-purple-500/20 text-purple-300">Weekly</Badge>
                          <h3 className="text-abyss-ethereal font-medium">{quest.title}</h3>
                        </div>
                        <p className="text-xs text-abyss-amber">{getLayerName(quest.layer)}</p>
                      </div>
                    </div>
                    <Badge className={`${getDifficultyColor(quest.difficulty)} text-white`}>
                      {quest.difficulty}
                    </Badge>
                  </div>
                  <p className="text-sm text-abyss-ethereal/80 mb-3">{convertGradesInText(quest.description)}</p>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-abyss-ethereal/70">Progress</span>
                      <span className="text-sm text-abyss-ethereal/70">
                        {quest.progress}/{quest.maxProgress}
                      </span>
                    </div>
                    <Progress 
                      value={(quest.progress / quest.maxProgress) * 100} 
                      className="h-2"
                    />
                  </div>
                  <div className="flex items-center justify-between mt-3">
                    <div className="flex items-center space-x-2">
                      <div className="flex items-center space-x-1">
                        <i className="fas fa-coins text-purple-400 text-sm"></i>
                        <span className="text-sm text-purple-400 font-semibold">{quest.xpReward} XP</span>
                      </div>
                      {quest.expiresAt && (
                        <span className="text-xs text-abyss-ethereal/50">
                          Expires: {new Date(quest.expiresAt).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center justify-end space-x-2 mt-3">
                    <Button
                      onClick={() => completeQuest.mutate(quest.id)}
                      disabled={completeQuest.isPending}
                      size="sm"
                      className="bg-green-500/20 text-green-300 hover:bg-green-500/30 border-green-500/50 disabled:opacity-50"
                      title="Complete Quest"
                    >
                      <CheckCircle className="h-4 w-4" />
                    </Button>
                    <Button
                      onClick={() => discardQuest.mutate(quest.id)}
                      disabled={discardQuest.isPending}
                      size="sm"
                      variant="outline"
                      className="text-red-400 hover:text-red-300 border-red-400/50 hover:border-red-300/50"
                      title="Discard Quest"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// Nutrition Component Import
import NutritionTab from "@/components/NutritionTab";

// Main Delver Tent Component
function Quests() {
  const [activeTab, setActiveTab] = useState<'quests' | 'nutrition' | 'relics'>('quests');
  const [, setLocation] = useLocation();

  return (
    <ErrorBoundary>
      <div className="max-w-md mx-auto nature-background min-h-screen relative overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 right-10 w-32 h-32 bg-abyss-amber rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 left-10 w-40 h-40 bg-abyss-teal rounded-full blur-3xl"></div>
        </div>

        {/* Header */}
        <header className="relative z-20 px-6 pt-12 pb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setLocation("/")}
                className="text-abyss-amber hover:text-abyss-ethereal transition-colors"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
              <div>
                <h1 className="text-lg font-semibold text-abyss-ethereal">Delver Tent</h1>
                <p className="text-sm text-abyss-ethereal/60">
                  Quests, Nutrition & Relics
                </p>
              </div>
            </div>
          </div>
        </header>

        {/* Tabs Navigation */}
        <div className="relative z-10 px-6 mb-6">
          <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'quests' | 'nutrition' | 'relics')}>
            <TabsList className="grid w-full grid-cols-3 bg-abyss-dark/30 backdrop-blur-sm border-abyss-teal/20">
              <TabsTrigger 
                value="quests"
                className="data-[state=active]:bg-abyss-teal data-[state=active]:text-abyss-dark text-abyss-ethereal"
              >
                <Target className="h-4 w-4 mr-2" />
                Quests
              </TabsTrigger>
              <TabsTrigger 
                value="nutrition"
                className="data-[state=active]:bg-abyss-teal data-[state=active]:text-abyss-dark text-abyss-ethereal"
              >
                <Utensils className="h-4 w-4 mr-2" />
                Nutrition
              </TabsTrigger>
              <TabsTrigger 
                value="relics"
                className="data-[state=active]:bg-abyss-teal data-[state=active]:text-abyss-dark text-abyss-ethereal"
              >
                <Gem className="h-4 w-4 mr-2" />
                Relics
              </TabsTrigger>
            </TabsList>
            
            {/* Quest Tab Content */}
            <TabsContent value="quests" className="mt-0">
              <div className="pb-24">
                <QuestContent />
              </div>
            </TabsContent>
            
            {/* Nutrition Tab Content */}
            <TabsContent value="nutrition" className="mt-0">
              <div className="pb-24">
                <NutritionTab />
              </div>
            </TabsContent>

            {/* Relics Tab Content */}
            <TabsContent value="relics" className="mt-0">
              <div className="pb-24">
                <RelicsTab />
              </div>
            </TabsContent>
          </Tabs>
        </div>

        <BottomNavigation />
      </div>
    </ErrorBoundary>
  );
}

export default React.memo(Quests);
