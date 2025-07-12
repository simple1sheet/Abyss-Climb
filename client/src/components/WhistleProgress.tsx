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
      0: "Bell Whistle",
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
      0: "text-gray-400",
      1: "text-red-400",
      2: "text-blue-400",
      3: "text-yellow-400",
      4: "text-gray-800",
      5: "text-white",
    };
    return colors[level as keyof typeof colors] || "text-gray-400";
  };

  const getGradeRequiredForNextLevel = (currentLevel: number): string => {
    const requirements = {
      0: "V1",   // Bell to Red
      1: "V3",   // Red to Blue
      2: "V5",   // Blue to Moon
      3: "V7",   // Moon to Black
      4: "V9",   // Black to White
      5: "V12+", // White (max)
    };
    return requirements[currentLevel as keyof typeof requirements] || "V12+";
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

  const currentLevel = user.whistleLevel || 0;
  const nextLevelGrade = getGradeRequiredForNextLevel(currentLevel);
  
  // Calculate progress to next whistle based on highest skill grade
  const getHighestSkillGrade = (): number => {
    if (!skills || skills.length === 0) return 0;
    let highest = 0;
    for (const skill of skills) {
      const gradeNum = parseInt(skill.maxGrade?.replace('V', '') || '0');
      if (gradeNum > highest) highest = gradeNum;
    }
    return highest;
  };
  
  const highestGrade = getHighestSkillGrade();
  const progressPercentage = currentLevel >= 5 ? 100 : Math.min((highestGrade / parseInt(nextLevelGrade.replace('V', '')) || 1) * 100, 100);

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
              <span>Highest Grade: V{highestGrade}</span>
              {currentLevel < 5 && (
                <span>Next Level: {nextLevelGrade}</span>
              )}
            </div>
            <Progress 
              value={progressPercentage} 
              className="h-3 bg-abyss-dark/60"
            />
            {currentLevel < 5 && (
              <p className="text-xs text-abyss-ethereal/60 mt-1">
                Climb {nextLevelGrade} to reach {getWhistleName(currentLevel + 1)}
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
                      <span className="text-xs text-abyss-amber">{skill.maxGrade || "V0"}</span>
                    </div>
                    <div className="text-xs text-abyss-ethereal/60 mt-1">
                      {skill.category} • {skill.totalProblems || 0} completed
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