import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { CheckCircle, Clock, Star, ArrowRight } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface LayerQuest {
  id: number;
  layer: number;
  title: string;
  description: string;
  xpReward: number;
  completed: boolean;
  progress: number;
  maxProgress: number;
  completedAt?: string;
}

interface LayerQuestProps {
  layer: number;
  xpProgress: {
    currentXP: number;
    nextLayerXP: number;
    hasEnoughXP: boolean;
  };
}

export function LayerQuest({ layer, xpProgress }: LayerQuestProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isCompleting, setIsCompleting] = useState(false);
  const [isProgressing, setIsProgressing] = useState(false);

  const { data: layerQuest, isLoading } = useQuery<LayerQuest>({
    queryKey: [`/api/layer-quest/${layer}`],
    enabled: layer > 0,
  });

  const { data: progressCheck } = useQuery<{
    canProgress: boolean;
    hasEnoughXP: boolean;
    hasCompletedQuest: boolean;
  }>({
    queryKey: [`/api/layer-progress/${layer}/check`],
    enabled: layer > 0,
  });

  const updateProgressMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest("POST", `/api/layer-quest/${layer}/progress`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/layer-quest/${layer}`] });
      queryClient.invalidateQueries({ queryKey: [`/api/layer-progress/${layer}/check`] });
    },
  });

  const completeQuestMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest("POST", `/api/layer-quest/${layer}/complete`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/layer-quest/${layer}`] });
      queryClient.invalidateQueries({ queryKey: [`/api/layer-progress/${layer}/check`] });
      queryClient.invalidateQueries({ queryKey: ["/api/layer-progress"] });
      toast({
        title: "Quest Completed!",
        description: `You earned ${layerQuest?.xpReward} XP for completing the layer quest.`,
      });
    },
  });

  const advanceLayerMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest("POST", "/api/layer-progress/advance");
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/layer-progress"] });
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      toast({
        title: "Layer Advanced!",
        description: `You have progressed to Layer ${data.newLayer}!`,
      });
    },
  });

  const handleUpdateProgress = async () => {
    setIsProgressing(true);
    try {
      await updateProgressMutation.mutateAsync();
    } finally {
      setIsProgressing(false);
    }
  };

  const handleCompleteQuest = async () => {
    if (!layerQuest || layerQuest.completed) return;
    
    setIsCompleting(true);
    try {
      await completeQuestMutation.mutateAsync();
    } finally {
      setIsCompleting(false);
    }
  };

  const handleAdvanceLayer = async () => {
    if (!progressCheck?.canProgress) return;
    
    try {
      await advanceLayerMutation.mutateAsync();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to advance to next layer",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <Card className="border-purple-900/20 bg-purple-950/10">
        <CardHeader>
          <div className="animate-pulse">
            <div className="h-6 bg-purple-900/20 rounded w-3/4 mb-2"></div>
            <div className="h-4 bg-purple-900/20 rounded w-1/2"></div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse">
            <div className="h-4 bg-purple-900/20 rounded w-full mb-2"></div>
            <div className="h-4 bg-purple-900/20 rounded w-3/4"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!layerQuest) {
    return null;
  }

  const progressPercentage = (layerQuest.progress / layerQuest.maxProgress) * 100;
  const isQuestComplete = layerQuest.completed || layerQuest.progress >= layerQuest.maxProgress;

  return (
    <Card className="border-purple-900/20 bg-purple-950/10">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-purple-300 flex items-center gap-2">
            {isQuestComplete ? (
              <CheckCircle className="w-5 h-5 text-green-400" />
            ) : (
              <Clock className="w-5 h-5 text-yellow-400" />
            )}
            {layerQuest.title}
          </CardTitle>
          <Badge variant="secondary" className="bg-purple-900/30 text-purple-300">
            <Star className="w-3 h-3 mr-1" />
            {layerQuest.xpReward} XP
          </Badge>
        </div>
        <CardDescription className="text-purple-300/70">
          {layerQuest.description}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-purple-300">Progress</span>
            <span className="text-purple-300">
              {layerQuest.progress}/{layerQuest.maxProgress}
            </span>
          </div>
          <Progress 
            value={progressPercentage} 
            className="h-2 bg-purple-900/20"
          />
        </div>

        <div className="flex flex-col gap-2">
          {!isQuestComplete && (
            <Button
              onClick={handleUpdateProgress}
              disabled={isProgressing}
              variant="outline"
              className="border-purple-700 text-purple-300 hover:bg-purple-900/20"
            >
              {isProgressing ? "Checking..." : "Update Progress"}
            </Button>
          )}

          {isQuestComplete && !layerQuest.completed && (
            <Button
              onClick={handleCompleteQuest}
              disabled={isCompleting}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              {isCompleting ? "Completing..." : "Complete Quest"}
            </Button>
          )}

          {progressCheck?.canProgress && (
            <Button
              onClick={handleAdvanceLayer}
              disabled={advanceLayerMutation.isPending}
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
            >
              <ArrowRight className="w-4 h-4 mr-2" />
              {advanceLayerMutation.isPending ? "Advancing..." : "Proceed to Next Layer"}
            </Button>
          )}
        </div>

        {progressCheck && !progressCheck.canProgress && (
          <div className="text-sm text-purple-300/70 p-3 bg-purple-900/10 rounded border border-purple-900/20">
            <p className="font-medium mb-1">Requirements to proceed:</p>
            <ul className="space-y-1">
              <li className="flex items-center gap-2">
                {progressCheck.hasEnoughXP ? (
                  <CheckCircle className="w-4 h-4 text-green-400" />
                ) : (
                  <Clock className="w-4 h-4 text-yellow-400" />
                )}
                <span>Earn {xpProgress.nextLayerXP} XP ({xpProgress.currentXP}/{xpProgress.nextLayerXP})</span>
              </li>
              <li className="flex items-center gap-2">
                {progressCheck.hasCompletedQuest ? (
                  <CheckCircle className="w-4 h-4 text-green-400" />
                ) : (
                  <Clock className="w-4 h-4 text-yellow-400" />
                )}
                <span>Complete the layer quest</span>
              </li>
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
}