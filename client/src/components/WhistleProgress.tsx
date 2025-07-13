import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { useQuery } from "@tanstack/react-query";
import { Sparkles, Award, Target, ChevronDown, ChevronRight, ExternalLink } from "lucide-react";
import { useState } from "react";
import { useLocation } from "wouter";
import { useGradeSystem } from "@/hooks/useGradeSystem";
import { gradeConverter } from "@/utils/gradeConverter";

export default function WhistleProgress() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const [openCategories, setOpenCategories] = useState<string[]>([]);
  const { gradeSystem } = useGradeSystem();
  
  const { data: skills } = useQuery({
    queryKey: ["/api/skills"],
    enabled: !!user,
  });

  const { data: whistleStats } = useQuery({
    queryKey: ["/api/whistle-progress"],
    enabled: !!user,
  });

  const toggleCategory = (category: string) => {
    setOpenCategories(prev => 
      prev.includes(category) 
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  const groupSkillsByCategory = (skills: any[]) => {
    const categories = {
      'Grip & Handwork': [],
      'Body & Power': [],
      'Balance & Flow': [],
      'Mind & Strategy': [],
      'Skill Challenges': []
    };
    
    if (!skills) return categories;
    
    skills.forEach(skill => {
      const skillType = skill.skillType.toLowerCase();
      
      // Map skills to new categories
      if (['jugs', 'crimps', 'endurance', 'pinches', 'slopers', 'pockets', 'underclings', 'gaston'].includes(skillType)) {
        categories['Grip & Handwork'].push(skill);
      } else if (['strength', 'dynos', 'mantles', 'campus', 'lockoffs', 'core', 'roofs'].includes(skillType)) {
        categories['Body & Power'].push(skill);
      } else if (['movement', 'balance', 'flexibility', 'stemming', 'flagging', 'heel_hooks', 'toe_hooks'].includes(skillType)) {
        categories['Balance & Flow'].push(skill);
      } else if (['slabs', 'technical', 'reading', 'sequencing', 'risk_management', 'mental_game'].includes(skillType)) {
        categories['Mind & Strategy'].push(skill);
      } else if (['overhangs'].includes(skillType)) {
        categories['Skill Challenges'].push(skill);
      } else {
        // Default fallback based on original category
        const originalCategory = skill.category || 'Technique';
        if (originalCategory === 'Technique') {
          categories['Grip & Handwork'].push(skill);
        } else if (originalCategory === 'Strength') {
          categories['Body & Power'].push(skill);
        } else if (originalCategory === 'Movement') {
          categories['Balance & Flow'].push(skill);
        } else if (originalCategory === 'Mind') {
          categories['Mind & Strategy'].push(skill);
        } else {
          categories['Skill Challenges'].push(skill);
        }
      }
    });
    
    return categories;
  };

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
    const vScaleGrade = requirements[currentLevel as keyof typeof requirements] || "V12+";
    return gradeConverter.convertGrade(vScaleGrade, 'V-Scale', gradeSystem);
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
              <span>Highest Grade: {gradeConverter.convertGrade(`V${highestGrade}`, 'V-Scale', gradeSystem)}</span>
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
              <div className="text-2xl font-bold text-abyss-amber">
                {whistleStats?.averageGradePast7Days 
                  ? gradeConverter.convertGrade(whistleStats.averageGradePast7Days, 'V-Scale', gradeSystem)
                  : gradeConverter.convertGrade("V0", 'V-Scale', gradeSystem)
                }
              </div>
              <div className="text-sm text-abyss-ethereal/70">📊 Avg Grade (7d)</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-abyss-teal">
                {whistleStats?.questsCompletedToday || 0} / {whistleStats?.maxDailyQuests || 3}
              </div>
              <div className="text-sm text-abyss-ethereal/70">🏆 Quests Today</div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="text-center">
              <div className="text-sm font-bold text-abyss-purple leading-tight">
                {whistleStats?.topSkillCategory || "Grip & Handwork"}
              </div>
              <div className="text-sm text-abyss-ethereal/70">🔥 Top Skill</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-abyss-amber">{whistleStats?.sessionsThisWeek || 0}</div>
              <div className="text-sm text-abyss-ethereal/70">🧗 Sessions/Week</div>
            </div>
          </div>

          <div className="mb-4">
            <Button 
              onClick={() => setLocation("/whistles")}
              variant="outline"
              className="w-full bg-abyss-dark/30 border-abyss-teal/30 text-abyss-ethereal hover:bg-abyss-teal/20 hover:border-abyss-teal/50"
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              View All Whistles
            </Button>
          </div>

          {skills && skills.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-abyss-ethereal mb-2 flex items-center">
                <Sparkles className="h-4 w-4 mr-2" />
                Skills Progress
              </h3>
              <div className="space-y-2">
                {Object.entries(groupSkillsByCategory(skills)).map(([category, categorySkills]) => (
                  categorySkills.length > 0 && (
                    <Collapsible key={category} open={openCategories.includes(category)}>
                      <CollapsibleTrigger 
                        className="w-full" 
                        onClick={() => toggleCategory(category)}
                      >
                        <div className="bg-abyss-dark/40 border border-abyss-teal/10 rounded-lg p-3 flex items-center justify-between hover:bg-abyss-dark/60 transition-colors">
                          <div className="flex items-center space-x-2">
                            <span className="text-sm font-medium text-abyss-ethereal">{category}</span>
                            <Badge variant="outline" className="text-xs text-abyss-amber border-abyss-amber/30">
                              {categorySkills.length} skills
                            </Badge>
                          </div>
                          {openCategories.includes(category) ? (
                            <ChevronDown className="h-4 w-4 text-abyss-ethereal/60" />
                          ) : (
                            <ChevronRight className="h-4 w-4 text-abyss-ethereal/60" />
                          )}
                        </div>
                      </CollapsibleTrigger>
                      <CollapsibleContent className="mt-2">
                        <div className="ml-4 space-y-1">
                          {categorySkills.map((skill: any) => (
                            <div key={skill.id} className="bg-abyss-dark/20 border border-abyss-teal/5 rounded p-2 flex items-center justify-between">
                              <div className="flex items-center space-x-2">
                                <span className="text-xs text-abyss-ethereal/90">⤷</span>
                                <span className="text-sm text-abyss-ethereal capitalize">{skill.skillType}</span>
                                <span className="text-xs text-abyss-ethereal/50">
                                  ({skill.category} – {skill.totalProblems || 0} completed)
                                </span>
                              </div>
                              <div className="flex items-center space-x-2">
                                <Badge variant="outline" className="text-xs text-abyss-amber border-abyss-amber/30">
                                  {gradeConverter.convertGrade(skill.maxGrade || "V0", 'V-Scale', gradeSystem)}
                                </Badge>
                              </div>
                            </div>
                          ))}
                        </div>
                      </CollapsibleContent>
                    </Collapsible>
                  )
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </section>
  );
}