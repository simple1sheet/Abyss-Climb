import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { Sparkles, Award, Target } from "lucide-react";

export default function WhistleProgress() {
  const { user } = useAuth();
  
  const { data: skills } = useQuery({
    queryKey: ["/api/skills"],
    enabled: !!user,
  });

  const getWhistleName = (level: number): string => {
    const whistleNames = {
      1: "Red Whistle",
      2: "Blue Whistle",
      3: "Moon Whistle",
      4: "Black Whistle",
      5: "White Whistle",
    };
    return whistleNames[level as keyof typeof whistleNames] || "Unknown Whistle";
  };

  const getWhistleColor = (level: number): string => {
    const colors = {
      1: "text-red-400",
      2: "text-blue-400",
      3: "text-yellow-400",
      4: "text-gray-800",
      5: "text-white",
    };
    return colors[level as keyof typeof colors] || "text-gray-400";
  };

  const getXPRequiredForNextLevel = (currentLevel: number): number => {
    const requirements = {
      1: 500,   // Red to Blue
      2: 1500,  // Blue to Moon
      3: 3000,  // Moon to Black
      4: 5000,  // Black to White
      5: 10000, // White (max)
    };
    return requirements[currentLevel as keyof typeof requirements] || 10000;
  };

  if (!user) {
    return (
      <section className="px-6 mb-8">
        <Card className="bg-abyss-purple/30 backdrop-blur-sm border-abyss-teal/20">
          <CardContent className="p-4">
            <div className="text-center text-abyss-ethereal">
              <p>Please log in to view your whistle progress</p>
            </div>
          </CardContent>
        </Card>
      </section>
    );
  }

  const currentXP = user.totalXP || 0;
  const currentLevel = user.whistleLevel || 1;
  const nextLevelXP = getXPRequiredForNextLevel(currentLevel);
  const progressPercentage = currentLevel >= 5 ? 100 : (currentXP / nextLevelXP) * 100;

  return (
    <section className="px-6 mb-8 relative z-10">
      <Card className="bg-abyss-purple/30 backdrop-blur-sm border-abyss-teal/20 depth-layer whistle-pulse">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-abyss-ethereal">Whistle Progress</h2>
            <div className="flex items-center space-x-2">
              <Badge className={`${getWhistleColor(currentLevel)} bg-abyss-dark/50`}>
                {getWhistleName(currentLevel)}
              </Badge>
              <Award className={`h-5 w-5 ${getWhistleColor(currentLevel)}`} />
            </div>
          </div>
          
          <div className="mb-4">
            <div className="flex items-center justify-between text-sm text-abyss-ethereal/70 mb-2">
              <span>Total XP: {currentXP.toLocaleString()}</span>
              {currentLevel < 5 && (
                <span>Next Level: {nextLevelXP.toLocaleString()} XP</span>
              )}
            </div>
            <Progress 
              value={progressPercentage} 
              className="h-3 bg-abyss-dark/60"
            />
            {currentLevel < 5 && (
              <p className="text-xs text-abyss-ethereal/60 mt-1">
                {(nextLevelXP - currentXP).toLocaleString()} XP to {getWhistleName(currentLevel + 1)}
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-abyss-amber">{user.currentLayer || 1}</div>
              <div className="text-sm text-abyss-ethereal/70">Current Layer</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-abyss-teal">{skills?.length || 0}</div>
              <div className="text-sm text-abyss-ethereal/70">Skills Tracked</div>
            </div>
          </div>

          {skills && skills.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-abyss-ethereal mb-2 flex items-center">
                <Sparkles className="h-4 w-4 mr-2" />
                Skills Progress
              </h3>
              <div className="grid grid-cols-2 gap-2">
                {skills.map((skill: any) => (
                  <div key={skill.id} className="bg-abyss-dark/40 border border-abyss-teal/10 rounded p-2">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-abyss-ethereal capitalize">{skill.skillType}</span>
                      <span className="text-xs text-abyss-amber">Lv.{skill.level}</span>
                    </div>
                    <Progress 
                      value={(skill.xp % 100)} 
                      className="h-1 bg-abyss-dark/60"
                    />
                    <div className="text-xs text-abyss-ethereal/60 mt-1">
                      {skill.xp} XP
                    </div>
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