import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { CheckCircle, XCircle, Clock, Calendar, Infinity, Trophy, Zap } from "lucide-react";

interface Quest {
  id: number;
  title: string;
  description: string;
  questType: 'daily' | 'weekly' | 'layer';
  xpReward: number;
  baseXP: number;
  gradeDiff: number;
  layerIndex: number;
  progress: number;
  maxProgress: number;
  status: string;
  layer: number;
  difficulty: string;
  expiresAt?: string;
  weekStartDate?: string;
  createdAt: string;
}

export default function QuestTabs() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Get active tab from localStorage, default to daily
  const [activeTab, setActiveTab] = useState(() => {
    return localStorage.getItem('questActiveTab') || 'daily';
  });

  // Save active tab to localStorage
  useEffect(() => {
    localStorage.setItem('questActiveTab', activeTab);
  }, [activeTab]);

  // Fetch quests by type
  const { data: dailyQuests, isLoading: isLoadingDaily } = useQuery({
    queryKey: ["/api/quests", "daily"],
    queryFn: () => apiRequest("GET", "/api/quests?type=daily"),
    enabled: !!user,
  });

  const { data: weeklyQuests, isLoading: isLoadingWeekly } = useQuery({
    queryKey: ["/api/quests", "weekly"],
    queryFn: () => apiRequest("GET", "/api/quests?type=weekly"),
    enabled: !!user,
  });

  const { data: layerQuests, isLoading: isLoadingLayer } = useQuery({
    queryKey: ["/api/quests", "layer"],
    queryFn: () => apiRequest("GET", "/api/quests?type=layer"),
    enabled: !!user,
  });

  // Quest completion limit checks
  const { data: dailyCompletionData } = useQuery({
    queryKey: ["/api/quests/completion-count", "daily"],
    queryFn: () => apiRequest("GET", "/api/quests/completion-count?type=daily"),
    enabled: !!user,
  });

  const { data: weeklyCompletionData } = useQuery({
    queryKey: ["/api/quests/completion-count", "weekly"],
    queryFn: () => apiRequest("GET", "/api/quests/completion-count?type=weekly"),
    enabled: !!user,
  });

  const completeQuest = useMutation({
    mutationFn: async (questId: number) => {
      return await apiRequest("POST", `/api/quests/${questId}/complete`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/quests"] });
      queryClient.invalidateQueries({ queryKey: ["/api/quests/completion-count"] });
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      queryClient.invalidateQueries({ queryKey: ["/api/layer-progress"] });
      toast({
        title: "Quest Completed!",
        description: "Quest completed successfully and XP awarded.",
      });
    },
    onError: (error: any) => {
      if (error.response?.status === 400 && error.response?.data?.completionLimitReached) {
        toast({
          title: "Completion Limit Reached",
          description: error.response.data.message,
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
      queryClient.invalidateQueries({ queryKey: ["/api/quests"] });
      toast({
        title: "Quest Discarded",
        description: "Quest has been discarded successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to discard quest. Try again later.",
        variant: "destructive",
      });
    },
  });

  const generateQuest = useMutation({
    mutationFn: async (questType: string) => {
      return await apiRequest("POST", `/api/quests/generate`, { questType });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/quests"] });
      toast({
        title: "Quest Generated",
        description: "New quest has been generated!",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to generate quest. Try again later.",
        variant: "destructive",
      });
    },
  });

  const getTimeUntilExpiry = (expiresAt: string | undefined, questType: string) => {
    if (!expiresAt && questType === 'layer') return '∞';
    
    const now = new Date().getTime();
    const expiry = expiresAt ? new Date(expiresAt).getTime() : 0;
    const diff = expiry - now;
    
    if (diff <= 0) return 'Expired';
    
    if (questType === 'daily') {
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      return `${hours}h ${minutes}m`;
    } else if (questType === 'weekly') {
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      return `${days}d ${hours}h`;
    }
    
    return '∞';
  };

  const calculateFinalXP = (quest: Quest) => {
    const baseXP = quest.baseXP || 100;
    let multiplier = 1;
    
    if (quest.questType === 'daily') {
      multiplier = 1 + (quest.gradeDiff * 0.3);
    } else if (quest.questType === 'weekly') {
      multiplier = 1 + (quest.gradeDiff * 0.4);
    } else if (quest.questType === 'layer') {
      multiplier = 1 + (quest.layerIndex * 0.5) + (quest.gradeDiff * 0.5);
    }
    
    return Math.round(baseXP * multiplier);
  };

  const renderQuestCard = (quest: Quest, canComplete: boolean = true) => {
    const progressPercentage = quest.maxProgress > 0 ? (quest.progress / quest.maxProgress) * 100 : 0;
    const finalXP = calculateFinalXP(quest);
    
    return (
      <Card key={quest.id} className="bg-abyss-dark/60 border-abyss-teal/20 hover:border-abyss-teal/40 transition-all duration-300">
        <CardHeader className="pb-2">
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <CardTitle className="text-abyss-ethereal text-base font-semibold">
                {quest.title}
              </CardTitle>
              <p className="text-abyss-ethereal/70 text-sm mt-1">
                {quest.description}
              </p>
            </div>
            <div className="flex flex-col items-end gap-1">
              <Badge 
                variant="secondary" 
                className={`${quest.questType === 'daily' ? 'bg-blue-500/20 text-blue-400' : 
                  quest.questType === 'weekly' ? 'bg-purple-500/20 text-purple-400' : 
                  'bg-amber-500/20 text-amber-400'
                } border-0`}
              >
                <Trophy className="w-3 h-3 mr-1" />
                {finalXP} XP
              </Badge>
              <Badge variant="outline" className="border-abyss-teal/30 text-abyss-teal text-xs">
                {quest.questType === 'layer' ? <Infinity className="w-3 h-3 mr-1" /> : <Clock className="w-3 h-3 mr-1" />}
                {getTimeUntilExpiry(quest.expiresAt, quest.questType)}
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-2">
          <div className="mb-3">
            <div className="flex justify-between items-center mb-1">
              <span className="text-abyss-ethereal/70 text-sm">
                Progress: {quest.progress} / {quest.maxProgress}
              </span>
              <span className="text-abyss-ethereal/70 text-sm">
                {Math.round(progressPercentage)}%
              </span>
            </div>
            <Progress value={progressPercentage} className="h-2" />
          </div>
          
          <div className="flex gap-2">
            <Button
              onClick={() => completeQuest.mutate(quest.id)}
              disabled={!canComplete || completeQuest.isPending}
              className="flex-1 bg-abyss-teal hover:bg-abyss-teal/80 text-abyss-dark"
              size="sm"
            >
              <CheckCircle className="w-4 h-4 mr-1" />
              Complete
            </Button>
            
            {quest.questType !== 'layer' && (
              <Button
                onClick={() => discardQuest.mutate(quest.id)}
                disabled={discardQuest.isPending}
                variant="outline"
                className="border-red-500/30 text-red-400 hover:bg-red-500/10"
                size="sm"
              >
                <XCircle className="w-4 h-4 mr-1" />
                Discard
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  const renderQuestList = (quests: Quest[], questType: string, isLoading: boolean, completionData: any) => {
    if (isLoading) {
      return (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="bg-abyss-dark/60 border-abyss-teal/20 animate-pulse">
              <CardContent className="p-4">
                <div className="h-4 bg-abyss-teal/10 rounded mb-2"></div>
                <div className="h-3 bg-abyss-teal/10 rounded w-2/3"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      );
    }

    if (!quests || quests.length === 0) {
      const maxQuests = questType === 'layer' ? 1 : 3;
      const canGenerate = questType === 'layer' || (quests?.length || 0) < maxQuests;
      
      return (
        <div className="text-center py-8">
          <div className="text-abyss-ethereal/70 mb-4">
            <Calendar className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p>No active {questType} quests</p>
          </div>
          {canGenerate && (
            <Button
              onClick={() => generateQuest.mutate(questType)}
              disabled={generateQuest.isPending}
              className="bg-abyss-purple hover:bg-abyss-purple/80 text-abyss-ethereal"
            >
              <Zap className="w-4 h-4 mr-2" />
              Generate {questType.charAt(0).toUpperCase() + questType.slice(1)} Quest
            </Button>
          )}
        </div>
      );
    }

    const canComplete = questType === 'layer' || (completionData?.completedToday || 0) < 3;
    const maxQuests = questType === 'layer' ? 1 : 3;
    const canGenerate = questType === 'layer' || quests.length < maxQuests;

    return (
      <div className="space-y-4">
        {quests.map(quest => renderQuestCard(quest, canComplete))}
        
        {canGenerate && (
          <Card className="bg-abyss-dark/40 border-abyss-teal/10 border-dashed">
            <CardContent className="p-4 text-center">
              <Button
                onClick={() => generateQuest.mutate(questType)}
                disabled={generateQuest.isPending}
                variant="outline"
                className="border-abyss-teal/30 text-abyss-teal hover:bg-abyss-teal/10"
              >
                <Zap className="w-4 h-4 mr-2" />
                Generate {questType.charAt(0).toUpperCase() + questType.slice(1)} Quest
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    );
  };

  return (
    <div className="w-full">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3 bg-abyss-dark/60 border-abyss-teal/20">
          <TabsTrigger 
            value="daily" 
            className="data-[state=active]:bg-abyss-teal data-[state=active]:text-abyss-dark"
          >
            Daily Quests
          </TabsTrigger>
          <TabsTrigger 
            value="weekly"
            className="data-[state=active]:bg-abyss-purple data-[state=active]:text-abyss-ethereal"
          >
            Weekly Quests
          </TabsTrigger>
          <TabsTrigger 
            value="layer"
            className="data-[state=active]:bg-abyss-amber data-[state=active]:text-abyss-dark"
          >
            Layer Quest
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="daily" className="mt-4">
          <div className="mb-4">
            <div className="flex justify-between items-center">
              <h3 className="text-abyss-ethereal text-lg font-semibold">Daily Quests</h3>
              <Badge variant="outline" className="border-blue-500/30 text-blue-400">
                {dailyCompletionData?.completedToday || 0} / 3 completed today
              </Badge>
            </div>
            <p className="text-abyss-ethereal/70 text-sm mt-1">
              Complete up to 3 daily quests. Reset at midnight.
            </p>
          </div>
          {renderQuestList(dailyQuests, 'daily', isLoadingDaily, dailyCompletionData)}
        </TabsContent>
        
        <TabsContent value="weekly" className="mt-4">
          <div className="mb-4">
            <div className="flex justify-between items-center">
              <h3 className="text-abyss-ethereal text-lg font-semibold">Weekly Quests</h3>
              <Badge variant="outline" className="border-purple-500/30 text-purple-400">
                {weeklyCompletionData?.completedThisWeek || 0} / 3 completed this week
              </Badge>
            </div>
            <p className="text-abyss-ethereal/70 text-sm mt-1">
              Complete up to 3 weekly quests. Reset every Monday at midnight.
            </p>
          </div>
          {renderQuestList(weeklyQuests, 'weekly', isLoadingWeekly, weeklyCompletionData)}
        </TabsContent>
        
        <TabsContent value="layer" className="mt-4">
          <div className="mb-4">
            <div className="flex justify-between items-center">
              <h3 className="text-abyss-ethereal text-lg font-semibold">Layer Quest</h3>
              <Badge variant="outline" className="border-amber-500/30 text-amber-400">
                Layer {user?.currentLayer || 1} Challenge
              </Badge>
            </div>
            <p className="text-abyss-ethereal/70 text-sm mt-1">
              Complete the layer-specific challenge. Cannot be discarded.
            </p>
          </div>
          {renderQuestList(layerQuests, 'layer', isLoadingLayer, null)}
        </TabsContent>
      </Tabs>
    </div>
  );
}