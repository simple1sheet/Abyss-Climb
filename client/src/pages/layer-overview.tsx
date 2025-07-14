import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import BottomNavigation from "@/components/BottomNavigation";
import SessionIndicator from "@/components/SessionIndicator";
import { Shield, Mountain, Zap, Eye, Skull, Crown, Flame, ArrowLeft, Lock, Check, Clock } from "lucide-react";

const LAYER_CONFIG = {
  1: {
    name: "Edge of Abyss",
    fullName: "Layer 1 – The Edge of the Abyss",
    color: "bg-green-500",
    borderColor: "border-green-500/50",
    icon: Shield,
    grades: "V0-V1",
    description: "The surface layer where all adventures begin",
    xpRequired: 0,
    xpToNext: 800
  },
  2: {
    name: "Forest of Temptation",
    fullName: "Layer 2 – Forest of Temptation",
    color: "bg-blue-500",
    borderColor: "border-blue-500/50",
    icon: Mountain,
    grades: "V2-V3",
    description: "Dense woods with challenging terrain",
    xpRequired: 800,
    xpToNext: 2500
  },
  3: {
    name: "Great Fault",
    fullName: "Layer 3 – The Great Fault",
    color: "bg-yellow-500",
    borderColor: "border-yellow-500/50",
    icon: Zap,
    grades: "V4-V5",
    description: "A massive vertical cliff face",
    xpRequired: 2500,
    xpToNext: 5500
  },
  4: {
    name: "The Goblets of Giants",
    fullName: "Layer 4 – The Goblets of Giants",
    color: "bg-orange-500",
    borderColor: "border-orange-500/50",
    icon: Eye,
    grades: "V6-V7",
    description: "Mysterious formations that test your limits",
    xpRequired: 5500,
    xpToNext: 10000
  },
  5: {
    name: "Sea of Corpses",
    fullName: "Layer 5 – Sea of Corpses",
    color: "bg-red-500",
    borderColor: "border-red-500/50",
    icon: Skull,
    grades: "V8-V9",
    description: "A dangerous expanse of crystalline waters",
    xpRequired: 10000,
    xpToNext: 18000
  },
  6: {
    name: "The Capital of the Unreturned",
    fullName: "Layer 6 – The Capital of the Unreturned",
    color: "bg-purple-500",
    borderColor: "border-purple-500/50",
    icon: Crown,
    grades: "V10-V11",
    description: "The point of no return for most",
    xpRequired: 18000,
    xpToNext: 35000
  },
  7: {
    name: "The Final Maelstrom",
    fullName: "Layer 7 – The Final Maelstrom",
    color: "bg-pink-500",
    borderColor: "border-pink-500/50",
    icon: Flame,
    grades: "V12+",
    description: "The deepest layer, shrouded in mystery",
    xpRequired: 35000,
    xpToNext: null // Max layer
  }
};

export default function LayerOverview() {
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  
  const { data: layerProgress, isLoading } = useQuery({
    queryKey: ["/api/layer-progress"],
    enabled: !!user,
  });

  const getLayerStatus = (layerNumber: number) => {
    if (!layerProgress) return "locked";
    
    const currentLayer = layerProgress.currentLayer;
    const currentXP = layerProgress.currentXP;
    const layerInfo = LAYER_CONFIG[layerNumber as keyof typeof LAYER_CONFIG];
    
    if (currentXP >= layerInfo.xpRequired) {
      if (layerNumber === currentLayer) {
        return "current";
      } else if (layerNumber < currentLayer) {
        return "completed";
      }
    }
    
    return "locked";
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <Check className="h-5 w-5 text-green-400" />;
      case "current":
        return <Clock className="h-5 w-5 text-amber-400" />;
      case "locked":
        return <Lock className="h-5 w-5 text-gray-500" />;
      default:
        return <Lock className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return <Badge className="bg-green-500/20 text-green-400 border-green-500/30">Completed</Badge>;
      case "current":
        return <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30">Current</Badge>;
      case "locked":
        return <Badge className="bg-gray-500/20 text-gray-400 border-gray-500/30">Locked</Badge>;
      default:
        return <Badge className="bg-gray-500/20 text-gray-400 border-gray-500/30">Locked</Badge>;
    }
  };

  const getProgressForLayer = (layerNumber: number) => {
    if (!layerProgress) return 0;
    
    const currentLayer = layerProgress.currentLayer;
    const currentXP = layerProgress.currentXP;
    const layerInfo = LAYER_CONFIG[layerNumber as keyof typeof LAYER_CONFIG];
    
    if (layerNumber === currentLayer) {
      // Current layer - show actual progress
      return layerProgress.layerProgress || 0;
    } else if (layerNumber < currentLayer) {
      // Completed layer
      return 100;
    } else {
      // Locked layer
      return 0;
    }
  };

  const getXPText = (layerNumber: number) => {
    if (!layerProgress) return "";
    
    const currentLayer = layerProgress.currentLayer;
    const currentXP = layerProgress.currentXP;
    const layerInfo = LAYER_CONFIG[layerNumber as keyof typeof LAYER_CONFIG];
    const status = getLayerStatus(layerNumber);
    
    if (status === "completed") {
      return `${layerInfo.xpRequired.toLocaleString()} XP - Completed`;
    } else if (status === "current") {
      const xpInCurrentLayer = currentXP - layerInfo.xpRequired;
      const xpNeeded = layerInfo.xpToNext ? (layerInfo.xpToNext - layerInfo.xpRequired) : 0;
      if (layerNumber === 7) {
        return `${layerInfo.xpRequired.toLocaleString()} XP - Final Layer`;
      }
      return `${xpInCurrentLayer.toLocaleString()} / ${xpNeeded.toLocaleString()} XP`;
    } else {
      return `${layerInfo.xpRequired.toLocaleString()} XP required`;
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-md mx-auto bg-abyss-gradient min-h-screen relative overflow-hidden">
        <div className="flex items-center justify-center h-screen">
          <div className="text-abyss-ethereal">Loading layer information...</div>
        </div>
      </div>
    );
  }

  return (
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
              <ArrowLeft className="h-6 w-6" />
            </button>
            <h1 className="text-xl font-bold text-abyss-ethereal">Layer Overview</h1>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="relative z-10 px-6 pb-24 space-y-4">
        <SessionIndicator />
        
        {/* Current Progress Summary */}
        {layerProgress && (
          <Card className="bg-abyss-purple/30 backdrop-blur-sm border-abyss-teal/20 depth-layer">
            <CardContent className="p-6">
              <div className="text-center">
                <h2 className="text-xl font-bold text-abyss-ethereal mb-2">
                  Current Progress
                </h2>
                <div className="flex items-center justify-center space-x-4 mb-4">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-abyss-amber">
                      {layerProgress.currentLayer}
                    </div>
                    <div className="text-sm text-abyss-ethereal/70">Current Layer</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-abyss-teal">
                      {layerProgress.currentXP.toLocaleString()}
                    </div>
                    <div className="text-sm text-abyss-ethereal/70">Total XP</div>
                  </div>
                </div>
                
                {layerProgress.currentLayer < 7 && (
                  <div className="bg-abyss-dark/30 rounded-lg p-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm text-abyss-ethereal/80">Progress to Next Layer</span>
                      <span className="text-sm text-abyss-amber">
                        {layerProgress.progressToNextLayer}/{layerProgress.nextLayerXP - layerProgress.currentLayerXP} XP
                      </span>
                    </div>
                    <Progress value={layerProgress.layerProgress} className="h-2" />
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Layer List */}
        <div className="space-y-4">
          {Object.entries(LAYER_CONFIG).map(([layerNum, layerInfo]) => {
            const layerNumber = parseInt(layerNum);
            const status = getLayerStatus(layerNumber);
            const progress = getProgressForLayer(layerNumber);
            const IconComponent = layerInfo.icon;
            
            return (
              <Card 
                key={layerNumber} 
                className={`bg-abyss-purple/30 backdrop-blur-sm border-2 depth-layer transition-all duration-300 ${
                  status === "current" 
                    ? `${layerInfo.borderColor} shadow-lg` 
                    : status === "completed"
                    ? "border-green-500/30"
                    : "border-abyss-teal/20"
                }`}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={`p-2 rounded-lg ${layerInfo.color}/20`}>
                        <IconComponent className={`h-6 w-6 ${layerInfo.color.replace('bg-', 'text-')}`} />
                      </div>
                      <div>
                        <CardTitle className="text-abyss-ethereal text-sm">
                          {layerInfo.fullName}
                        </CardTitle>
                        <p className="text-xs text-abyss-ethereal/60">{layerInfo.grades}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(status)}
                      {getStatusBadge(status)}
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="pt-0">
                  <p className="text-sm text-abyss-ethereal/80 mb-3 italic">
                    "{layerInfo.description}"
                  </p>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-abyss-ethereal/70">XP Progress</span>
                      <span className="text-sm text-abyss-amber">
                        {getXPText(layerNumber)}
                      </span>
                    </div>
                    
                    <Progress 
                      value={progress} 
                      className={`h-2 ${
                        status === "current" ? "bg-abyss-amber/20" : "bg-abyss-dark/30"
                      }`}
                    />
                    
                    {status === "current" && layerProgress && layerProgress.currentLayer < 7 && (
                      <div className="text-xs text-abyss-ethereal/60 mt-1">
                        {layerProgress.nextLayerXP - layerProgress.currentXP} XP needed to advance
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      <BottomNavigation />
    </div>
  );
}