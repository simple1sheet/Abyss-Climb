import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { CheckCircle, X, Plus, Clock, Target } from "lucide-react";

export default function ActiveQuests() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const { data: quests } = useQuery({
    queryKey: ["/api/quests", { status: "active" }],
    enabled: !!user,
  });

  const generateQuest = useMutation({
    mutationFn: async () => {
      return await apiRequest({
        url: "/api/quests/generate",
        method: "POST",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/quests"] });
      toast({
        title: "New Quest Generated!",
        description: "A new quest has been added to your active quests.",
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

  const completeQuest = useMutation({
    mutationFn: async (questId: number) => {
      return await apiRequest({
        url: `/api/quests/${questId}/complete`,
        method: "POST",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/quests"] });
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      toast({
        title: "Quest Completed!",
        description: "You've earned XP for completing this quest.",
      });
    },
  });

  const discardQuest = useMutation({
    mutationFn: async (questId: number) => {
      return await apiRequest({
        url: `/api/quests/${questId}/discard`,
        method: "POST",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/quests"] });
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

  return (
    <section className="px-6 mb-8 relative z-10">
      <Card className="bg-abyss-purple/30 backdrop-blur-sm border-abyss-teal/20 depth-layer">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-abyss-ethereal">Active Quests</h2>
            <div className="flex items-center space-x-2">
              <Button
                onClick={() => generateQuest.mutate()}
                disabled={generateQuest.isPending}
                size="sm"
                className="bg-abyss-amber/20 text-abyss-amber hover:bg-abyss-amber/30 border-abyss-amber/50"
              >
                {generateQuest.isPending ? (
                  <Clock className="h-4 w-4 animate-spin" />
                ) : (
                  <Plus className="h-4 w-4" />
                )}
              </Button>
              <span className="text-sm text-abyss-amber">{getLayerName(user.currentLayer || 1)}</span>
              <Target className="h-4 w-4 text-abyss-amber" />
            </div>
          </div>
          
          <div className="space-y-4">
            {!quests || quests.length === 0 ? (
              <div className="text-center py-8 text-abyss-ethereal/70">
                <Target className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p className="mb-2">No active quests</p>
                <p className="text-sm">Click the + button to generate a new quest</p>
              </div>
            ) : (
              quests.map((quest: any) => (
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
                      {quest.progress >= quest.maxProgress ? (
                        <Button
                          onClick={() => completeQuest.mutate(quest.id)}
                          disabled={completeQuest.isPending}
                          size="sm"
                          className="bg-green-500/20 text-green-300 hover:bg-green-500/30 border-green-500/50"
                        >
                          <CheckCircle className="h-4 w-4" />
                        </Button>
                      ) : (
                        <Button
                          onClick={() => discardQuest.mutate(quest.id)}
                          disabled={discardQuest.isPending}
                          size="sm"
                          variant="outline"
                          className="text-abyss-ethereal/60 hover:text-abyss-ethereal border-abyss-ethereal/30"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </section>
  );
}