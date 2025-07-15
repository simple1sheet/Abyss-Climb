
import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  Calendar, 
  Target, 
  Focus, 
  Battery, 
  Heart, 
  Shield,
  Sparkles,
  ChevronRight,
  RefreshCw
} from "lucide-react";

interface DailyRecommendations {
  dailyGoal: string;
  focusArea: string;
  energyLevel: string;
  recoveryAdvice: string;
  motivationalMessage: string;
  specificActions: string[];
  nanachiPersonality: string;
}

export default function ForTodayWindow() {
  const { user } = useAuth();
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [isNewDay, setIsNewDay] = useState(false);

  const { data: dailyRecommendations, isLoading, refetch } = useQuery({
    queryKey: ["/api/nanachi/daily-recommendations"],
    enabled: !!user,
    refetchOnWindowFocus: false,
    staleTime: 1000 * 60 * 60 * 12, // 12 hours
  });

  // Check if it's a new day since last update
  useEffect(() => {
    const today = new Date().toDateString();
    const lastUpdate = localStorage.getItem('lastDailyUpdate');
    
    if (!lastUpdate || lastUpdate !== today) {
      setIsNewDay(true);
      localStorage.setItem('lastDailyUpdate', today);
      setLastUpdated(new Date());
    } else {
      setIsNewDay(false);
    }
  }, []);

  const handleRefresh = () => {
    refetch();
    setLastUpdated(new Date());
    setIsNewDay(false);
  };

  if (isLoading) {
    return (
      <div className="px-6 mb-6">
        <Card className="nature-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-center">
              <RefreshCw className="w-5 h-5 animate-spin text-abyss-amber mr-2" />
              <span className="text-abyss-ethereal">Nanachi is preparing your daily insights...</span>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!dailyRecommendations) {
    return null;
  }

  return (
    <div className="px-6 mb-6">
      <Card className="nature-card border-abyss-amber/30 bg-gradient-to-br from-abyss-purple/20 to-abyss-teal/20">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-abyss-ethereal flex items-center space-x-2">
              <div className="text-xl">🐰</div>
              <span className="ancient-text">For Today</span>
              {isNewDay && (
                <Badge className="bg-abyss-amber/20 text-abyss-amber border-abyss-amber/30">
                  New
                </Badge>
              )}
            </CardTitle>
            <div className="flex items-center space-x-2">
              <Calendar className="w-4 h-4 text-abyss-amber" />
              <span className="text-sm text-abyss-muted">
                {new Date().toLocaleDateString()}
              </span>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Nanachi's Daily Message */}
          <div className="bg-abyss-dark/40 rounded-lg p-4">
            <p className="text-abyss-ethereal/90 italic text-sm">
              "{dailyRecommendations.nanachiPersonality}"
            </p>
          </div>

          {/* Daily Goal */}
          <div className="flex items-start space-x-3">
            <Target className="w-5 h-5 text-abyss-amber mt-1 flex-shrink-0" />
            <div>
              <h4 className="font-medium text-abyss-ethereal">Today's Goal</h4>
              <p className="text-sm text-abyss-ethereal/80">{dailyRecommendations.dailyGoal}</p>
            </div>
          </div>

          <Separator className="bg-abyss-amber/20" />

          {/* Focus Area */}
          <div className="flex items-start space-x-3">
            <Focus className="w-5 h-5 text-abyss-teal mt-1 flex-shrink-0" />
            <div>
              <h4 className="font-medium text-abyss-ethereal">Focus Area</h4>
              <Badge className="bg-abyss-teal/20 text-abyss-teal border-abyss-teal/30 mt-1">
                {dailyRecommendations.focusArea}
              </Badge>
            </div>
          </div>

          {/* Energy & Recovery */}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-start space-x-2">
              <Battery className="w-4 h-4 text-green-400 mt-1 flex-shrink-0" />
              <div>
                <h5 className="text-sm font-medium text-abyss-ethereal">Energy</h5>
                <p className="text-xs text-abyss-ethereal/70">{dailyRecommendations.energyLevel}</p>
              </div>
            </div>
            <div className="flex items-start space-x-2">
              <Heart className="w-4 h-4 text-red-400 mt-1 flex-shrink-0" />
              <div>
                <h5 className="text-sm font-medium text-abyss-ethereal">Recovery</h5>
                <p className="text-xs text-abyss-ethereal/70">{dailyRecommendations.recoveryAdvice}</p>
              </div>
            </div>
          </div>

          {/* Specific Actions */}
          <div>
            <h4 className="font-medium text-abyss-ethereal mb-2 flex items-center">
              <Sparkles className="w-4 h-4 mr-2 text-abyss-amber" />
              Action Items
            </h4>
            <div className="space-y-1">
              {dailyRecommendations.specificActions.map((action, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <ChevronRight className="w-3 h-3 text-abyss-amber flex-shrink-0" />
                  <span className="text-sm text-abyss-ethereal/80">{action}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Motivational Message */}
          <div className="bg-abyss-amber/10 rounded-lg p-3">
            <p className="text-sm text-abyss-ethereal/90 text-center italic">
              {dailyRecommendations.motivationalMessage}
            </p>
          </div>

          {/* Refresh Button */}
          <div className="flex justify-center pt-2">
            <Button
              onClick={handleRefresh}
              variant="outline"
              size="sm"
              className="border-abyss-amber/30 text-abyss-amber hover:bg-abyss-amber/10"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh Insights
            </Button>
          </div>

          {lastUpdated && (
            <p className="text-xs text-abyss-muted text-center">
              Last updated: {lastUpdated.toLocaleTimeString()}
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
