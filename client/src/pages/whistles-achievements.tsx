import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import BottomNavigation from "@/components/BottomNavigation";
import SessionIndicator from "@/components/SessionIndicator";
import { ArrowLeft, Award, Crown, Star, Trophy, Target, Zap, Shield } from "lucide-react";

const WHISTLE_LEVELS = {
  1: { name: "Bell", color: "bg-gray-500", icon: Shield, minGrade: "V0", description: "Every explorer starts with a bell" },
  2: { name: "Red Whistle", color: "bg-red-500", icon: Award, minGrade: "V1", description: "Novice cave raider" },
  3: { name: "Blue Whistle", color: "bg-blue-500", icon: Target, minGrade: "V3", description: "Skilled apprentice" },
  4: { name: "Moon Whistle", color: "bg-purple-500", icon: Crown, minGrade: "V5", description: "Experienced delver" },
  5: { name: "Black Whistle", color: "bg-gray-800", icon: Zap, minGrade: "V7", description: "Expert cave raider" },
  6: { name: "White Whistle", color: "bg-white", icon: Star, minGrade: "V10", description: "Legendary explorer" },
};

const TITLE_CATEGORIES = {
  explorer: {
    name: "Explorer",
    color: "text-blue-400",
    titles: [
      { name: "Surface Walker", requirement: "Complete 10 quests", xpRequired: 100 },
      { name: "Abyss Seeker", requirement: "Complete 50 quests", xpRequired: 500 },
      { name: "Depth Strider", requirement: "Complete 100 quests", xpRequired: 1000 },
      { name: "Void Treader", requirement: "Complete 200 quests", xpRequired: 2000 },
    ]
  },
  climber: {
    name: "Climber",
    color: "text-green-400",
    titles: [
      { name: "Boulder Hopper", requirement: "Complete 25 problems", xpRequired: 150 },
      { name: "Rock Crusher", requirement: "Complete 100 problems", xpRequired: 600 },
      { name: "Stone Master", requirement: "Complete 250 problems", xpRequired: 1500 },
      { name: "Mountain Conqueror", requirement: "Complete 500 problems", xpRequired: 3000 },
    ]
  },
  specialist: {
    name: "Specialist",
    color: "text-purple-400",
    titles: [
      { name: "Flash Master", requirement: "Flash 10 problems", xpRequired: 200 },
      { name: "Endurance Athlete", requirement: "Complete 10 endurance quests", xpRequired: 300 },
      { name: "Technical Wizard", requirement: "Complete 20 technical problems", xpRequired: 400 },
      { name: "Balance Sage", requirement: "Complete 15 balance problems", xpRequired: 350 },
    ]
  },
  legendary: {
    name: "Legendary",
    color: "text-amber-400",
    titles: [
      { name: "Abyss Walker", requirement: "Reach Layer 5", xpRequired: 2400 },
      { name: "Depth Lord", requirement: "Reach Layer 6", xpRequired: 4800 },
      { name: "Void Emperor", requirement: "Reach Layer 7", xpRequired: 12000 },
      { name: "White Whistle Legend", requirement: "Achieve White Whistle", xpRequired: 5000 },
    ]
  }
};

export default function WhistlesAchievements() {
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  
  const { data: layerProgress, isLoading: layerLoading } = useQuery({
    queryKey: ["/api/layer-progress"],
    enabled: !!user,
  });

  const { data: skills } = useQuery({
    queryKey: ["/api/skills"],
    enabled: !!user,
  });

  const { data: achievements } = useQuery({
    queryKey: ["/api/achievements"],
    enabled: !!user,
  });

  const { data: userStats } = useQuery({
    queryKey: ["/api/user/stats"],
    enabled: !!user,
  });

  const getCurrentWhistleLevel = () => {
    if (!skills || skills.length === 0) return 1;
    
    // Find the highest grade achieved
    const highestGrade = skills.reduce((highest, skill) => {
      const gradeValue = getGradeNumeric(skill.grade);
      return gradeValue > highest ? gradeValue : highest;
    }, 0);
    
    // Determine whistle level based on highest grade
    if (highestGrade >= 17) return 6; // V10+
    if (highestGrade >= 13) return 5; // V7+
    if (highestGrade >= 9) return 4;  // V5+
    if (highestGrade >= 5) return 3;  // V3+
    if (highestGrade >= 3) return 2;  // V1+
    return 1; // V0
  };

  const getGradeNumeric = (grade: string): number => {
    const gradeMap: { [key: string]: number } = {
      'V0': 1, 'V1': 2, 'V2': 3, 'V3': 4, 'V4': 5, 'V5': 6,
      'V6': 7, 'V7': 8, 'V8': 9, 'V9': 10, 'V10': 11, 'V11': 12,
      'V12': 13, 'V13': 14, 'V14': 15, 'V15': 16, 'V16': 17, 'V17': 18
    };
    return gradeMap[grade] || 0;
  };

  const getUnlockedTitles = () => {
    if (!layerProgress || !userStats) return [];
    
    const unlocked = [];
    const currentXP = layerProgress.currentXP;
    const totalSessions = parseInt(userStats.totalSessions) || 0;
    const totalProblems = parseInt(userStats.totalProblems) || 0;
    const completedAchievements = achievements?.length || 0;
    
    // Check each title category
    Object.entries(TITLE_CATEGORIES).forEach(([categoryKey, category]) => {
      category.titles.forEach(title => {
        let isUnlocked = false;
        
        // Check XP requirement
        if (currentXP >= title.xpRequired) {
          // Check specific requirements
          if (title.requirement.includes("quests")) {
            const questsNeeded = parseInt(title.requirement.match(/\d+/)?.[0] || "0");
            isUnlocked = completedAchievements >= questsNeeded;
          } else if (title.requirement.includes("problems")) {
            const problemsNeeded = parseInt(title.requirement.match(/\d+/)?.[0] || "0");
            isUnlocked = totalProblems >= problemsNeeded;
          } else if (title.requirement.includes("Layer")) {
            const layerNeeded = parseInt(title.requirement.match(/\d+/)?.[0] || "0");
            isUnlocked = layerProgress.currentLayer >= layerNeeded;
          } else if (title.requirement.includes("White Whistle")) {
            isUnlocked = getCurrentWhistleLevel() >= 6;
          } else {
            isUnlocked = true; // Default for other requirements
          }
        }
        
        if (isUnlocked) {
          unlocked.push({
            ...title,
            category: categoryKey,
            categoryName: category.name,
            categoryColor: category.color
          });
        }
      });
    });
    
    return unlocked;
  };

  const getActiveTitle = () => {
    const unlockedTitles = getUnlockedTitles();
    if (unlockedTitles.length === 0) return null;
    
    // Get the highest XP title as the active one
    return unlockedTitles.reduce((highest, title) => {
      return title.xpRequired > (highest?.xpRequired || 0) ? title : highest;
    });
  };

  if (layerLoading) {
    return (
      <div className="max-w-md mx-auto bg-abyss-gradient min-h-screen relative overflow-hidden">
        <div className="flex items-center justify-center h-screen">
          <div className="text-abyss-ethereal">Loading whistles and achievements...</div>
        </div>
      </div>
    );
  }

  const currentWhistleLevel = getCurrentWhistleLevel();
  const currentWhistle = WHISTLE_LEVELS[currentWhistleLevel as keyof typeof WHISTLE_LEVELS];
  const nextWhistle = WHISTLE_LEVELS[(currentWhistleLevel + 1) as keyof typeof WHISTLE_LEVELS];
  const unlockedTitles = getUnlockedTitles();
  const activeTitle = getActiveTitle();

  return (
    <div className="max-w-md mx-auto bg-abyss-gradient min-h-screen relative overflow-hidden">
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
            <h1 className="text-xl font-bold text-abyss-ethereal">Whistles & Achievements</h1>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="relative z-10 px-6 pb-24 space-y-6">
        <SessionIndicator />
        
        {/* Active Title */}
        {activeTitle && (
          <Card className="bg-abyss-purple/30 backdrop-blur-sm border-abyss-teal/20 depth-layer">
            <CardContent className="p-6 text-center">
              <div className="flex items-center justify-center mb-3">
                <Crown className="h-8 w-8 text-abyss-amber mr-2" />
                <h2 className="text-2xl font-bold text-abyss-ethereal">Current Title</h2>
              </div>
              <div className={`text-xl font-semibold ${activeTitle.categoryColor} mb-2`}>
                {activeTitle.name}
              </div>
              <div className="text-sm text-abyss-ethereal/70">
                {activeTitle.categoryName} • {activeTitle.requirement}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Current Whistle */}
        <Card className="bg-abyss-purple/30 backdrop-blur-sm border-abyss-teal/20 depth-layer">
          <CardHeader>
            <CardTitle className="text-abyss-ethereal flex items-center">
              <Trophy className="h-5 w-5 mr-2 text-abyss-amber" />
              Current Whistle
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-4 mb-4">
              <div className={`p-3 rounded-full ${currentWhistle.color}`}>
                <currentWhistle.icon className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-abyss-ethereal">
                  {currentWhistle.name}
                </h3>
                <p className="text-sm text-abyss-ethereal/70">
                  {currentWhistle.description}
                </p>
                <p className="text-xs text-abyss-amber">
                  Minimum Grade: {currentWhistle.minGrade}
                </p>
              </div>
            </div>
            
            {nextWhistle && (
              <div className="bg-abyss-dark/30 rounded-lg p-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-abyss-ethereal/80">Next Whistle</span>
                  <span className="text-sm text-abyss-teal">
                    {nextWhistle.name} ({nextWhistle.minGrade})
                  </span>
                </div>
                <div className="text-xs text-abyss-ethereal/60">
                  Keep climbing higher grades to unlock!
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Unlocked Titles */}
        <Card className="bg-abyss-purple/30 backdrop-blur-sm border-abyss-teal/20 depth-layer">
          <CardHeader>
            <CardTitle className="text-abyss-ethereal flex items-center">
              <Award className="h-5 w-5 mr-2 text-abyss-amber" />
              Unlocked Titles ({unlockedTitles.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {unlockedTitles.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-abyss-ethereal/60">No titles unlocked yet</p>
                <p className="text-sm text-abyss-ethereal/50 mt-2">
                  Keep climbing and completing quests to earn titles!
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {unlockedTitles.map((title, index) => (
                  <div
                    key={index}
                    className={`flex items-center justify-between p-3 rounded-lg border transition-all ${
                      title.name === activeTitle?.name
                        ? "bg-abyss-amber/10 border-abyss-amber/30"
                        : "bg-abyss-dark/30 border-abyss-teal/20"
                    }`}
                  >
                    <div>
                      <div className={`font-semibold ${title.categoryColor}`}>
                        {title.name}
                      </div>
                      <div className="text-xs text-abyss-ethereal/70">
                        {title.categoryName} • {title.requirement}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {title.name === activeTitle?.name && (
                        <Badge className="bg-abyss-amber/20 text-abyss-amber border-abyss-amber/30">
                          Active
                        </Badge>
                      )}
                      <div className="text-xs text-abyss-teal">
                        {title.xpRequired} XP
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Achievements */}
        <Card className="bg-abyss-purple/30 backdrop-blur-sm border-abyss-teal/20 depth-layer">
          <CardHeader>
            <CardTitle className="text-abyss-ethereal flex items-center">
              <Star className="h-5 w-5 mr-2 text-abyss-amber" />
              Achievements ({achievements?.length || 0})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {!achievements || achievements.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-abyss-ethereal/60">No achievements unlocked yet</p>
                <p className="text-sm text-abyss-ethereal/50 mt-2">
                  Complete quests and reach milestones to unlock achievements!
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {achievements.slice(0, 5).map((achievement: any) => (
                  <div
                    key={achievement.id}
                    className="flex items-center space-x-3 p-3 bg-abyss-dark/30 rounded-lg border border-abyss-teal/20"
                  >
                    <div className="text-2xl">{achievement.icon}</div>
                    <div className="flex-1">
                      <div className="font-semibold text-abyss-ethereal">
                        {achievement.title}
                      </div>
                      <div className="text-sm text-abyss-ethereal/70">
                        {achievement.description}
                      </div>
                    </div>
                    <div className="text-xs text-abyss-amber">
                      +{achievement.xpReward} XP
                    </div>
                  </div>
                ))}
                {achievements.length > 5 && (
                  <div className="text-center">
                    <Button
                      onClick={() => setLocation("/profile")}
                      variant="outline"
                      className="border-abyss-teal/30 text-abyss-teal hover:bg-abyss-teal/10"
                    >
                      View All Achievements
                    </Button>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <BottomNavigation />
    </div>
  );
}