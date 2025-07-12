import { useAuth } from "@/hooks/useAuth";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useLocation } from "wouter";
import BottomNavigation from "@/components/BottomNavigation";
import { CheckCircle, X } from "lucide-react";

export default function Quests() {
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const { data: quests, isLoading } = useQuery({
    queryKey: ["/api/quests"],
    enabled: !!user,
  });

  const { data: dailyCount } = useQuery({
    queryKey: ["/api/quests/daily-count"],
    enabled: !!user,
  });

  const generateQuestMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest("POST", "/api/quests/generate", {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/quests"] });
      queryClient.invalidateQueries({ queryKey: ["/api/quests/daily-count"] });
      toast({
        title: "Quest Generated",
        description: "A new quest has been added to your journey!",
      });
    },
    onError: (error: any) => {
      if (error.response?.status === 400 && error.response?.data?.limitReached) {
        toast({
          title: "Daily Quest Limit Reached",
          description: "You've reached your daily limit of 3 quests. Come back tomorrow!",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Error",
          description: "Failed to generate quest. Please try again.",
          variant: "destructive",
        });
      }
    },
  });

  const completeQuest = useMutation({
    mutationFn: async (questId: number) => {
      return await apiRequest("POST", `/api/quests/${questId}/complete`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/quests"] });
      queryClient.invalidateQueries({ queryKey: ["/api/quests/daily-count"] });
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      toast({
        title: "Quest Completed!",
        description: "Quest completed successfully and removed from active quests.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to complete quest. Try again later.",
        variant: "destructive",
      });
    },
  });

  const discardQuest = useMutation({
    mutationFn: async (questId: number) => {
      return await apiRequest("POST", `/api/quests/${questId}/discard`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/quests"] });
      queryClient.invalidateQueries({ queryKey: ["/api/quests/daily-count"] });
      toast({
        title: "Quest Discarded",
        description: "The quest has been removed from your active quests.",
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

  const getLayerIcon = (layer: number) => {
    const icons = {
      1: "fas fa-seedling",
      2: "fas fa-tree",
      3: "fas fa-mountain",
      4: "fas fa-gem",
      5: "fas fa-skull",
      6: "fas fa-crown",
      7: "fas fa-fire",
    };
    return icons[layer as keyof typeof icons] || "fas fa-question";
  };

  const getLayerName = (layer: number) => {
    const names = {
      1: "Edge of the Abyss",
      2: "Forest of Temptation",
      3: "Great Fault",
      4: "Goblets of Giants",
      5: "Sea of Corpses",
      6: "Capital of the Unreturned",
      7: "Final Maelstrom",
    };
    return names[layer as keyof typeof names] || "Unknown Layer";
  };

  const getDifficultyColor = (difficulty: string) => {
    const colors = {
      easy: "bg-green-500",
      medium: "bg-yellow-500",
      hard: "bg-orange-500",
      extreme: "bg-red-500",
    };
    return colors[difficulty as keyof typeof colors] || "bg-gray-500";
  };

  const activeQuests = quests?.filter((q: any) => q.status === "active") || [];
  const completedQuests = quests?.filter((q: any) => q.status === "completed") || [];

  return (
    <div className="max-w-md mx-auto bg-abyss-gradient min-h-screen relative overflow-hidden">
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
              <i className="fas fa-arrow-left text-xl"></i>
            </button>
            <div>
              <h1 className="text-lg font-semibold text-abyss-ethereal">Quests</h1>
              {dailyCount && (
                <p className="text-sm text-abyss-ethereal/60">
                  Daily: {dailyCount.dailyCount}/{dailyCount.maxDaily}
                </p>
              )}
            </div>
          </div>
          <Button
            onClick={() => generateQuestMutation.mutate()}
            className="bg-abyss-amber hover:bg-abyss-amber/90 text-abyss-dark font-semibold disabled:opacity-50"
            disabled={generateQuestMutation.isPending || (dailyCount?.limitReached)}
            title={dailyCount?.limitReached ? "Daily quest limit reached. Come back tomorrow!" : "Generate new quest"}
          >
            <i className="fas fa-plus mr-2"></i>
            {generateQuestMutation.isPending ? "Generating..." : "New Quest"}
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <div className="relative z-10 px-6 pb-24 space-y-6">
        {/* Active Quests */}
        <div>
          <h2 className="text-xl font-semibold text-abyss-ethereal mb-4">Active Quests</h2>
          {activeQuests.length === 0 ? (
            <Card className="bg-abyss-purple/30 backdrop-blur-sm border-abyss-teal/20 depth-layer">
              <CardContent className="p-6 text-center">
                <i className="fas fa-scroll text-4xl text-abyss-amber/50 mb-4"></i>
                <p className="text-abyss-ethereal/70">No active quests</p>
                <p className="text-sm text-abyss-ethereal/50 mt-2">
                  {dailyCount?.limitReached 
                    ? "Daily quest limit reached. Come back tomorrow!" 
                    : "Generate a new quest to begin your journey"}
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {activeQuests.map((quest: any) => (
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
                    <p className="text-sm text-abyss-ethereal/80 mb-3">{quest.description}</p>
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
                        disabled={completeQuest.isPending}
                        size="sm"
                        className="bg-green-500/20 text-green-300 hover:bg-green-500/30 border-green-500/50"
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

        {/* Completed Quests */}
        {completedQuests.length > 0 && (
          <div>
            <h2 className="text-xl font-semibold text-abyss-ethereal mb-4">Completed Quests</h2>
            <div className="space-y-4">
              {completedQuests.slice(0, 5).map((quest: any) => (
                <Card key={quest.id} className="bg-abyss-purple/20 backdrop-blur-sm border-abyss-teal/20 opacity-70">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-green-500/30 rounded-full flex items-center justify-center">
                          <i className="fas fa-check text-sm text-green-400"></i>
                        </div>
                        <div>
                          <h3 className="text-abyss-ethereal font-medium">{quest.title}</h3>
                          <p className="text-xs text-abyss-amber">{getLayerName(quest.layer)}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-1">
                        <i className="fas fa-coins text-abyss-amber text-sm"></i>
                        <span className="text-sm text-abyss-amber">{quest.xpReward} XP</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>

      <BottomNavigation />
    </div>
  );
}
