import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

export default function WhistleProgress() {
  const { user } = useAuth();
  
  const getWhistleLevel = (whistleLevel: number) => {
    const levels = {
      1: { name: "Red Whistle", color: "bg-red-500" },
      2: { name: "Blue Whistle", color: "bg-blue-500" },
      3: { name: "Moon Whistle", color: "bg-purple-500" },
      4: { name: "Black Whistle", color: "bg-gray-800" },
      5: { name: "White Whistle", color: "bg-white" },
    };
    return levels[whistleLevel as keyof typeof levels] || levels[1];
  };

  const whistleInfo = getWhistleLevel(user?.whistleLevel || 1);
  const totalXP = user?.totalXP || 0;
  const currentLevel = user?.whistleLevel || 1;
  const nextLevelXP = currentLevel * 1000;
  const progress = Math.min((totalXP / nextLevelXP) * 100, 100);

  return (
    <section className="px-6 mb-8 relative z-10">
      <Card className="bg-abyss-purple/30 backdrop-blur-sm border-abyss-teal/20 depth-layer">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-abyss-ethereal">Whistle Progress</h2>
            <div className="whistle-glow">
              <i className="fas fa-award text-3xl text-abyss-amber"></i>
            </div>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-abyss-ethereal/80">{whistleInfo.name}</span>
              <span className="text-abyss-amber font-medium">Level {currentLevel}</span>
            </div>
            <Progress value={progress} className="h-3" />
            <div className="flex justify-between text-xs text-abyss-ethereal/60">
              <span>{totalXP} XP</span>
              <span>{nextLevelXP} XP</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </section>
  );
}
