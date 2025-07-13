import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { ExternalLink } from "lucide-react";
import { useLocation } from "wouter";
import { LAYER_CONFIG, getLayerInfo } from "@/utils/layerConfig";

export default function CurrentLayer() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  
  const { data: quests } = useQuery({
    queryKey: ["/api/quests"],
    enabled: !!user,
  });

  const { data: layerProgress } = useQuery({
    queryKey: ["/api/layer-progress"],
    enabled: !!user,
  });

  if (!user) {
    return (
      <section className="px-6 mb-8">
        <Card className="bg-abyss-purple/30 backdrop-blur-sm border-abyss-teal/20">
          <CardContent className="p-4">
            <div className="text-center text-abyss-ethereal">
              <p>Please log in to view your current layer</p>
            </div>
          </CardContent>
        </Card>
      </section>
    );
  }

  const currentLayer = layerProgress?.currentLayer || user.currentLayer || 1;
  const layerInfo = getLayerInfo(currentLayer);
  
  // Get XP progress information
  const currentXP = layerProgress?.currentXP || user?.totalXP || 0;
  const currentLayerXP = layerProgress?.currentLayerXP || 0;
  const nextLayerXP = layerProgress?.nextLayerXP || 500;
  const progressToNextLayer = layerProgress?.progressToNextLayer || 0;
  const xpProgress = layerProgress?.layerProgress || 0;
  
  // Calculate active quests for display
  const layerQuests = quests?.filter((quest: any) => 
    quest.status === 'active' && quest.layer === currentLayer
  ) || [];
  
  const IconComponent = layerInfo.icon;

  return (
    <section className="px-6 mb-8 relative z-10">
      <Card className="bg-layer-gradient border-abyss-teal/30 depth-layer">
        <CardContent className="p-6">
          <div className="flex items-center space-x-4 mb-4">
            <div className={`w-16 h-16 ${layerInfo.color}/50 rounded-full flex items-center justify-center`}>
              <IconComponent className="text-2xl text-abyss-amber" size={24} />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-abyss-ethereal">Layer {currentLayer}</h3>
              <p className="text-abyss-amber">{layerInfo.name}</p>
              <p className="text-sm text-abyss-ethereal/70">{layerInfo.grades}</p>
            </div>
          </div>
          
          <div className="bg-abyss-dark/30 rounded-xl p-4 mb-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-abyss-ethereal/80">Layer Progress</span>
              <span className="text-abyss-amber font-medium">
                {progressToNextLayer}/{nextLayerXP - currentLayerXP} XP
              </span>
            </div>
            <Progress value={xpProgress} className="h-2" />
            <p className="text-xs text-abyss-ethereal/60 mt-2">
              {currentLayer === 7 
                ? "Maximum layer reached!" 
                : `${(nextLayerXP - currentXP)} XP needed to advance`}
            </p>
            <div className="text-xs text-abyss-ethereal/50 mt-1">
              Total XP: {currentXP.toLocaleString()}
            </div>
          </div>
          
          <div className="text-sm text-abyss-ethereal/80 bg-abyss-dark/20 rounded-lg p-3">
            <p className="italic">"{layerInfo.description}"</p>
          </div>
          
          <Button
            onClick={() => setLocation("/layers")}
            variant="outline"
            className="w-full mt-4 border-abyss-teal/30 text-abyss-teal hover:bg-abyss-teal/10"
          >
            <ExternalLink className="h-4 w-4 mr-2" />
            View All Layers
          </Button>
          
          {layerQuests.length > 0 && (
            <div className="mt-4">
              <h4 className="text-sm font-medium text-abyss-ethereal mb-2">Current Layer Quests</h4>
              <div className="space-y-2">
                {layerQuests.slice(0, 3).map((quest: any) => (
                  <div key={quest.id} className="bg-abyss-dark/40 border border-abyss-teal/10 rounded p-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-abyss-ethereal">{quest.title}</span>
                      <span className="text-xs text-abyss-amber">
                        {quest.progress}/{quest.maxProgress}
                      </span>
                    </div>
                    <Progress 
                      value={(quest.progress / quest.maxProgress) * 100} 
                      className="h-1 mt-1"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </section>
  );
}