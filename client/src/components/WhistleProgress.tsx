import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useQuery } from "@tanstack/react-query";

export default function WhistleProgress() {
  const { user } = useAuth();
  
  const { data: skills } = useQuery({
    queryKey: ["/api/skills"],
    enabled: !!user,
  });

  const getWhistleLevel = (whistleLevel: number) => {
    const levels = {
      1: { name: "Red Whistle", color: "bg-red-500", icon: "fas fa-medal", minSkillLevel: 1 },
      2: { name: "Blue Whistle", color: "bg-blue-500", icon: "fas fa-award", minSkillLevel: 3 },
      3: { name: "Moon Whistle", color: "bg-purple-500", icon: "fas fa-gem", minSkillLevel: 5 },
      4: { name: "Black Whistle", color: "bg-gray-800", icon: "fas fa-crown", minSkillLevel: 8 },
      5: { name: "White Whistle", color: "bg-white", icon: "fas fa-star", minSkillLevel: 12 },
    };
    return levels[whistleLevel as keyof typeof levels] || levels[1];
  };

  const getSkillIcon = (skillType: string) => {
    const icons = {
      crimps: "fas fa-hand-rock",
      dynos: "fas fa-rocket",
      movement: "fas fa-running",
      strength: "fas fa-dumbbell",
      balance: "fas fa-balance-scale",
      flexibility: "fas fa-leaf",
    };
    return icons[skillType as keyof typeof icons] || "fas fa-question";
  };

  const whistleInfo = getWhistleLevel(user?.whistleLevel || 1);
  const totalXP = user?.totalXP || 0;
  const currentLevel = user?.whistleLevel || 1;
  const nextLevelXP = currentLevel * 1000;
  const progress = Math.min((totalXP / nextLevelXP) * 100, 100);

  // Calculate average skill level for whistle progression
  const averageSkillLevel = skills?.length > 0 
    ? skills.reduce((sum: number, skill: any) => sum + skill.level, 0) / skills.length
    : 1;

  return (
    <section className="px-6 mb-8 relative z-10">
      <Card className="bg-abyss-purple/30 backdrop-blur-sm border-abyss-teal/20 depth-layer">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-abyss-ethereal">Whistle Progress</h2>
            <div className="whistle-glow">
              <i className={`${whistleInfo.icon} text-3xl text-abyss-amber`}></i>
            </div>
          </div>
          
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-abyss-ethereal/80">{whistleInfo.name}</span>
              <span className="text-abyss-amber font-medium">Level {currentLevel}</span>
            </div>
            <Progress value={progress} className="h-3" />
            <div className="flex justify-between text-xs text-abyss-ethereal/60">
              <span>{totalXP} XP</span>
              <span>{nextLevelXP} XP</span>
            </div>

            {/* Skills Grid */}
            <div className="pt-4 border-t border-abyss-teal/20">
              <h3 className="text-sm font-medium text-abyss-ethereal mb-3">Cave Raider Skills</h3>
              <div className="grid grid-cols-3 gap-3">
                {skills?.map((skill: any) => (
                  <div key={skill.id} className="bg-abyss-dark/40 rounded-lg p-3 text-center">
                    <div className="flex items-center justify-center mb-1">
                      <i className={`${getSkillIcon(skill.skillType)} text-abyss-amber text-sm`}></i>
                    </div>
                    <p className="text-xs text-abyss-ethereal/80 capitalize">{skill.skillType}</p>
                    <p className="text-xs text-abyss-amber font-medium">Lvl {skill.level}</p>
                    <div className="w-full bg-abyss-dark/60 rounded-full h-1 mt-1">
                      <div 
                        className="bg-abyss-amber h-1 rounded-full transition-all duration-300"
                        style={{ width: `${(skill.xp % 100)}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
              {(!skills || skills.length === 0) && (
                <div className="text-center py-4">
                  <p className="text-abyss-ethereal/60 text-sm">Complete climbs to develop skills</p>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </section>
  );
}
