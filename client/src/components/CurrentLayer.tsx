import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

export default function CurrentLayer() {
  const { user } = useAuth();
  
  const getLayerInfo = (layer: number) => {
    const layers = {
      1: { 
        name: "Edge of the Abyss", 
        icon: "fas fa-seedling", 
        grades: "V0-V2 | 3-5+ Font",
        color: "bg-layer-1"
      },
      2: { 
        name: "Forest of Temptation", 
        icon: "fas fa-tree", 
        grades: "V3-V5 | 6A-6C Font",
        color: "bg-layer-2"
      },
      3: { 
        name: "Great Fault", 
        icon: "fas fa-mountain", 
        grades: "V6-V8 | 7A-7C Font",
        color: "bg-layer-3"
      },
      4: { 
        name: "Goblets of Giants", 
        icon: "fas fa-gem", 
        grades: "V9-V11 | 8A-8C Font",
        color: "bg-layer-4"
      },
      5: { 
        name: "Sea of Corpses", 
        icon: "fas fa-skull", 
        grades: "V12-V14 | 9A-9C Font",
        color: "bg-layer-5"
      },
      6: { 
        name: "Capital of the Unreturned", 
        icon: "fas fa-crown", 
        grades: "V15+ | 10A+ Font",
        color: "bg-layer-6"
      },
      7: { 
        name: "Final Maelstrom", 
        icon: "fas fa-fire", 
        grades: "Project grades",
        color: "bg-layer-7"
      },
    };
    return layers[layer as keyof typeof layers] || layers[1];
  };

  const currentLayer = user?.currentLayer || 1;
  const layerInfo = getLayerInfo(currentLayer);
  
  // Mock progress - in real app, this would come from quest completion
  const layerProgress = 43; // percentage

  return (
    <section className="px-6 mb-8 relative z-10">
      <Card className="bg-layer-gradient border-abyss-teal/30 depth-layer">
        <CardContent className="p-6">
          <div className="flex items-center space-x-4 mb-4">
            <div className={`w-16 h-16 ${layerInfo.color}/50 rounded-full flex items-center justify-center`}>
              <i className={`${layerInfo.icon} text-2xl text-abyss-amber`}></i>
            </div>
            <div>
              <h3 className="text-xl font-semibold text-abyss-ethereal">Layer {currentLayer}</h3>
              <p className="text-abyss-amber">{layerInfo.name}</p>
              <p className="text-sm text-abyss-ethereal/70">{layerInfo.grades}</p>
            </div>
          </div>
          <div className="bg-abyss-dark/30 rounded-xl p-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-abyss-ethereal/80">Layer Progress</span>
              <span className="text-abyss-amber font-medium">3/7 Quests</span>
            </div>
            <Progress value={layerProgress} className="h-2" />
          </div>
        </CardContent>
      </Card>
    </section>
  );
}
