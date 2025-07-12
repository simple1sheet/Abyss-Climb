import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useLocation } from "wouter";

export default function ActiveQuests() {
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  
  const { data: quests } = useQuery({
    queryKey: ["/api/quests", { status: "active" }],
    enabled: !!user,
  });

  const activeQuests = quests?.filter((q: any) => q.status === "active").slice(0, 2) || [];

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

  return (
    <section className="px-6 mb-8 relative z-10">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-abyss-ethereal">Active Quests</h2>
        <button 
          onClick={() => setLocation("/quests")}
          className="text-abyss-amber hover:text-abyss-ethereal transition-colors"
        >
          <i className="fas fa-plus text-lg"></i>
        </button>
      </div>
      
      <div className="space-y-4">
        {activeQuests.length === 0 ? (
          <Card className="bg-abyss-purple/30 backdrop-blur-sm border-abyss-teal/20 depth-layer">
            <CardContent className="p-6 text-center">
              <i className="fas fa-scroll text-3xl text-abyss-amber/50 mb-3"></i>
              <p className="text-abyss-ethereal/70">No active quests</p>
              <p className="text-sm text-abyss-ethereal/50 mt-1">
                Tap the + to generate a new quest
              </p>
            </CardContent>
          </Card>
        ) : (
          activeQuests.map((quest: any) => (
            <Card key={quest.id} className={`bg-abyss-purple/30 backdrop-blur-sm border-abyss-teal/20 depth-layer quest-entrance ${quest.questType === 'daily' ? 'relic-shimmer' : ''}`}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <div className={`w-8 h-8 ${quest.questType === 'daily' ? 'bg-abyss-amber/50 curse-effect' : 'bg-abyss-teal/50'} rounded-full flex items-center justify-center`}>
                      <i className={`${getLayerIcon(quest.layer)} text-sm text-abyss-amber`}></i>
                    </div>
                    <div>
                      <h3 className="text-abyss-ethereal font-medium">{quest.title}</h3>
                      <div className="flex items-center space-x-2">
                        <p className="text-xs text-abyss-amber">{getLayerName(quest.layer)}</p>
                        {quest.questType === 'daily' && (
                          <span className="text-xs bg-abyss-amber/20 text-abyss-amber px-2 py-1 rounded-full">
                            Daily
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <span className="text-xs text-abyss-ethereal/60">
                    {quest.expiresAt ? `${Math.ceil((new Date(quest.expiresAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24))} days left` : ""}
                  </span>
                </div>
                <p className="text-sm text-abyss-ethereal/80 mb-3">{quest.description}</p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2 flex-1">
                    <Progress 
                      value={(quest.progress / quest.maxProgress) * 100} 
                      className="h-2 flex-1"
                    />
                    <span className="text-xs text-abyss-ethereal/60">
                      {quest.progress}/{quest.maxProgress}
                    </span>
                  </div>
                  <div className="flex items-center space-x-1 ml-4">
                    <i className="fas fa-coins text-abyss-amber text-sm"></i>
                    <span className="text-sm text-abyss-amber">{quest.xpReward} XP</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </section>
  );
}
