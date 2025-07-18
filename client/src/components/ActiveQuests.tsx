import React, { useMemo } from 'react';
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { CheckCircle, X, Plus, Clock, Target } from "lucide-react";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { useAchievementNotification } from "@/hooks/useAchievementNotification";

function ActiveQuests() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { showMultipleAchievementNotifications } = useAchievementNotification();
  
  const { data: quests, isLoading: isLoadingQuests } = useQuery({
    queryKey: ["/api/quests?status=active"],
    enabled: !!user,
  });

  // Filter and separate quest types
  const { dailyQuests, weeklyQuests } = useMemo(() => {
    if (!quests) return { dailyQuests: [], weeklyQuests: [] };
    
    const filtered = quests.filter((quest: any) => quest.questType !== "layer");
    return {
      dailyQuests: filtered.filter((quest: any) => quest.questType === "daily"),
      weeklyQuests: filtered.filter((quest: any) => quest.questType === "weekly")
    };
  }, [quests]);

  const { data: dailyCount, isLoading: isLoadingDailyCount } = useQuery({
    queryKey: ["/api/quests/daily-count"],
    enabled: !!user,
  });

  const { data: completionCount, isLoading: isLoadingCompletionCount } = useQuery({
    queryKey: ["/api/quests/completion-count"],
    enabled: !!user,
  });

  // Removed manual quest generation mutations - quests are now generated automatically

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

  const getLayerName = (layer: number): string => {
    const layerNames = {
      1: "Edge of the Abyss",
      2: "Forest of Temptation",
      3: "Great Fault",
      4: "Goblets of Giants",
      5: "Sea of Corpses",
      6: "Capital of the Unreturned",
      7: "Final Maelstrom",
    };
    return layerNames[layer as keyof typeof layerNames] || "Unknown Layer";
  };

  const getDifficultyColor = (difficulty: string): string => {
    switch (difficulty) {
      case "easy": return "bg-green-500/20 text-green-300";
      case "medium": return "bg-yellow-500/20 text-yellow-300";
      case "hard": return "bg-red-500/20 text-red-300";
      default: return "bg-gray-500/20 text-gray-300";
    }
  };

  const getTimeRemaining = (expiresAt: string): string => {
    const now = new Date();
    const expiry = new Date(expiresAt);
    const diff = expiry.getTime() - now.getTime();
    
    if (diff <= 0) return "Expired";
    
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours > 24) {
      const days = Math.floor(hours / 24);
      return `${days}d ${hours % 24}h`;
    }
    
    return `${hours}h ${minutes}m`;
  };

  if (!user) {
    return (
      <section className="px-6 mb-8">
        <Card className="bg-abyss-purple/30 backdrop-blur-sm border-abyss-teal/20">
          <CardContent className="p-4">
            <div className="text-center text-abyss-ethereal">
              <p>Please log in to view your quests</p>
            </div>
          </CardContent>
        </Card>
      </section>
    );
  }

  if (isLoadingQuests || isLoadingDailyCount || isLoadingCompletionCount) {
    return (
      <section className="px-6 mb-8 relative z-10">
        <Card className="bg-abyss-purple/30 backdrop-blur-sm border-abyss-teal/20">
          <CardContent className="p-4">
            <LoadingSpinner size="md" text="Loading active quests..." />
          </CardContent>
        </Card>
      </section>
    );
  }

  return (
    <section className="px-6 mb-8 relative z-10">
      <Card className="bg-abyss-purple/30 backdrop-blur-sm border-abyss-teal/20 depth-layer">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl font-semibold text-abyss-ethereal">Active Quests</h2>
              <div className="text-sm text-abyss-ethereal/60 mt-1 space-y-1">
                {dailyCount && (
                  <p>Daily quests: {dailyCount.dailyCount}/{dailyCount.maxDaily}</p>
                )}
                {completionCount && (
                  <p>Completed today: {completionCount.completedToday}/{completionCount.maxCompletions}</p>
                )}
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-abyss-amber">{getLayerName(user.currentLayer || 1)}</span>
              <Target className="h-4 w-4 text-abyss-amber" />
            </div>
          </div>
          
          {/* Daily Quests Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-abyss-amber flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Daily Quests
            </h3>
            {!dailyQuests || dailyQuests.length === 0 ? (
              <div className="text-center py-6 text-abyss-ethereal/70">
                <Clock className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="mb-2">No daily quests</p>
                <p className="text-sm">
                  {dailyCount?.limitReached 
                    ? "Daily quest limit reached. Come back tomorrow!" 
                    : "Daily quests are generated automatically when you visit the app"}
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {dailyQuests.map((quest: any) => (
                  <div
                    key={quest.id}
                    className="bg-abyss-dark/40 border border-abyss-teal/20 rounded-lg p-4 relic-shimmer"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h3 className="font-semibold text-abyss-ethereal mb-1">{quest.title}</h3>
                        <p className="text-sm text-abyss-ethereal/80 mb-2">{quest.description}</p>
                        <div className="flex items-center space-x-2 mb-2">
                          <Badge className={getDifficultyColor(quest.difficulty)}>
                            {quest.difficulty}
                          </Badge>
                          <span className="text-xs text-abyss-amber">{quest.xpReward} XP</span>
                          {quest.expiresAt && (
                            <span className="text-xs text-abyss-ethereal/60">
                              <Clock className="h-3 w-3 inline mr-1" />
                              {getTimeRemaining(quest.expiresAt)}
                            </span>
                          )}
                        </div>
                        <div className="mb-2">
                          <div className="flex items-center justify-between text-xs text-abyss-ethereal/70 mb-1">
                            <span>Progress</span>
                            <span>{quest.progress || 0}/{quest.maxProgress}</span>
                          </div>
                          <Progress 
                            value={((quest.progress || 0) / quest.maxProgress) * 100} 
                            className="h-2 bg-abyss-dark/60"
                          />
                        </div>
                      </div>
                      <div className="flex items-center space-x-2 ml-4">
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
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Weekly Quests Section */}
          <div className="space-y-4 mt-6">
            <h3 className="text-lg font-semibold text-purple-400 flex items-center gap-2">
              <Target className="h-5 w-5" />
              Weekly Quests
            </h3>
            {!weeklyQuests || weeklyQuests.length === 0 ? (
              <div className="text-center py-6 text-abyss-ethereal/70">
                <Target className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="mb-2">No weekly quests</p>
                <p className="text-sm">Weekly quests are generated automatically when available</p>
              </div>
            ) : (
              <div className="space-y-3">
                {weeklyQuests.map((quest: any) => (
                  <div
                    key={quest.id}
                    className="bg-abyss-dark/40 border border-purple-500/20 rounded-lg p-4 relic-shimmer"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge className="bg-purple-500/20 text-purple-300">Weekly</Badge>
                          <h3 className="font-semibold text-abyss-ethereal">{quest.title}</h3>
                        </div>
                        <p className="text-sm text-abyss-ethereal/80 mb-2">{quest.description}</p>
                        <div className="flex items-center space-x-2 mb-2">
                          <Badge className={getDifficultyColor(quest.difficulty)}>
                            {quest.difficulty}
                          </Badge>
                          <span className="text-xs text-purple-400 font-semibold">{quest.xpReward} XP</span>
                          {quest.expiresAt && (
                            <span className="text-xs text-abyss-ethereal/60">
                              <Clock className="h-3 w-3 inline mr-1" />
                              {getTimeRemaining(quest.expiresAt)}
                            </span>
                          )}
                        </div>
                        <div className="mb-2">
                          <div className="flex items-center justify-between text-xs text-abyss-ethereal/70 mb-1">
                            <span>Progress</span>
                            <span>{quest.progress || 0}/{quest.maxProgress}</span>
                          </div>
                          <Progress 
                            value={((quest.progress || 0) / quest.maxProgress) * 100} 
                            className="h-2 bg-abyss-dark/60"
                          />
                        </div>
                      </div>
                      <div className="flex items-center space-x-2 ml-4">
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
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </section>
  );
}

export default React.memo(ActiveQuests);