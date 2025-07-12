import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useQuery } from "@tanstack/react-query";
import { Shield, Mountain, Zap, Skull, Crown, Eye, Flame } from "lucide-react";

const LAYER_CONFIG = {
  1: {
    name: "Edge of Abyss",
    color: "bg-green-500",
    icon: Shield,
    grades: "V0-V1",
    description: "The surface layer where all adventures begin"
  },
  2: {
    name: "Forest of Temptation",
    color: "bg-blue-500",
    icon: Mountain,
    grades: "V2-V3",
    description: "Dense woods with challenging terrain"
  },
  3: {
    name: "Great Fault",
    color: "bg-yellow-500",
    icon: Zap,
    grades: "V4-V5",
    description: "A massive vertical cliff face"
  },
  4: {
    name: "The Goblets of Giants",
    color: "bg-orange-500",
    icon: Eye,
    grades: "V6-V7",
    description: "Mysterious formations that test your limits"
  },
  5: {
    name: "Sea of Corpses",
    color: "bg-red-500",
    icon: Skull,
    grades: "V8-V9",
    description: "A dangerous expanse of crystalline waters"
  },
  6: {
    name: "The Capital of the Unreturned",
    color: "bg-purple-500",
    icon: Crown,
    grades: "V10-V11",
    description: "The point of no return for most"
  },
  7: {
    name: "The Final Maelstrom",
    color: "bg-pink-500",
    icon: Flame,
    grades: "V12+",
    description: "The deepest layer, shrouded in mystery"
  }
};

export default function CurrentLayer() {
  const { user } = useAuth();
  
  const { data: quests } = useQuery({
    queryKey: ["/api/quests"],
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

  const currentLayer = user.currentLayer || 1;
  const layerInfo = LAYER_CONFIG[currentLayer as keyof typeof LAYER_CONFIG] || LAYER_CONFIG[1];
  
  // Calculate layer progress based on quests
  const layerQuests = quests?.filter((quest: any) => 
    quest.status === 'active' && quest.targetLayer === currentLayer
  ) || [];
  
  const completedLayerQuests = quests?.filter((quest: any) => 
    quest.status === 'completed' && quest.targetLayer === currentLayer
  ) || [];
  
  const totalQuestsNeeded = 7; // Standard quests needed per layer
  const questsCompleted = completedLayerQuests.length;
  const layerProgress = Math.min((questsCompleted / totalQuestsNeeded) * 100, 100);
  
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
                {questsCompleted}/{totalQuestsNeeded} Quests
              </span>
            </div>
            <Progress value={layerProgress} className="h-2" />
            <p className="text-xs text-abyss-ethereal/60 mt-2">
              {layerProgress >= 100 
                ? "Ready to advance to the next layer!" 
                : `${totalQuestsNeeded - questsCompleted} more quests needed`}
            </p>
          </div>
          
          <div className="text-sm text-abyss-ethereal/80 bg-abyss-dark/20 rounded-lg p-3">
            <p className="italic">"{layerInfo.description}"</p>
          </div>
          
          {layerQuests.length > 0 && (
            <div className="mt-4">
              <h4 className="text-sm font-medium text-abyss-ethereal mb-2">Current Layer Quests</h4>
              <div className="space-y-2">
                {layerQuests.slice(0, 3).map((quest: any) => (
                  <div key={quest.id} className="bg-abyss-dark/40 border border-abyss-teal/10 rounded p-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-abyss-ethereal">{quest.title}</span>
                      <span className="text-xs text-abyss-amber">
                        {quest.currentProgress}/{quest.targetValue}
                      </span>
                    </div>
                    <Progress 
                      value={(quest.currentProgress / quest.targetValue) * 100} 
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