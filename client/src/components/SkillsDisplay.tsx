import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";

export default function SkillsDisplay() {
  const { data: skills = [], isLoading } = useQuery({
    queryKey: ["/api/skills"],
  });

  if (isLoading) {
    return <div>Loading skills...</div>;
  }

  const skillCategories = {
    "Core Movement": ["movement", "balance", "flexibility"],
    "Grip Strength": ["crimps", "strength"],
    "Techniques": ["dynos", "technical"],
    "Terrain": ["overhangs", "slabs"],
    "Endurance": ["endurance"]
  };

  const getSkillColor = (level: number) => {
    if (level >= 10) return "bg-yellow-500"; // White Whistle
    if (level >= 7) return "bg-gray-900"; // Black Whistle
    if (level >= 5) return "bg-yellow-600"; // Moon Whistle
    if (level >= 3) return "bg-blue-600"; // Blue Whistle
    return "bg-red-600"; // Red Whistle
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">Climbing Skills</h2>
        <p className="text-muted-foreground">Level up your skills to progress deeper into the Abyss</p>
      </div>

      {Object.entries(skillCategories).map(([category, skillTypes]) => (
        <Card key={category} className="dark:bg-gray-800">
          <CardHeader>
            <CardTitle className="text-lg">{category}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {skillTypes.map((skillType) => {
                const skill = skills.find((s: any) => s.skillType === skillType);
                if (!skill) return null;

                const progressToNextLevel = ((skill.xp || 0) % 100) / 100 * 100;

                return (
                  <div key={skillType} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={`w-3 h-3 rounded-full ${getSkillColor(skill.level)}`} />
                      <div>
                        <div className="font-medium capitalize">{skillType}</div>
                        <div className="text-sm text-muted-foreground">
                          {skill.xp || 0} XP
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant="secondary">Level {skill.level}</Badge>
                      <div className="w-20">
                        <Progress value={progressToNextLevel} className="h-2" />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}