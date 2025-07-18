import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useLocation } from "wouter";
import BottomNavigation from "@/components/BottomNavigation";
import { useGradeSystem } from "@/hooks/useGradeSystem";
import { gradeConverter } from "@/utils/gradeConverter";
import { getLayerInfo } from "@/utils/layerConfig";
import { Award, Trophy, Target, Calendar, TrendingUp, Clock } from "lucide-react";
import SkillTree from "@/components/SkillTree";

export default function ProgressPage() {
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const { gradeSystem } = useGradeSystem();
  
  const { data: enhancedProgress } = useQuery({
    queryKey: ["/api/enhanced-progress"],
    enabled: !!user,
  });

  const { data: skills } = useQuery({
    queryKey: ["/api/skills"],
    enabled: !!user,
  });

  const { data: layerProgress } = useQuery({
    queryKey: ["/api/layer-progress"],
    enabled: !!user,
  });

  const { data: analysis } = useQuery({
    queryKey: ["/api/analysis/progress"],
    enabled: !!user,
  });

  // Grade-based whistle system
  const getWhistleFromGrade = (highestGrade: string) => {
    const gradeNum = parseInt(highestGrade.replace('V', '')) || 0;
    
    if (gradeNum >= 9) return { level: 5, name: "White Whistle", color: "text-white", title: "Legendary Delver" };
    if (gradeNum >= 7) return { level: 4, name: "Black Whistle", color: "text-gray-800", title: "Expert Delver" };
    if (gradeNum >= 5) return { level: 3, name: "Moon Whistle", color: "text-yellow-400", title: "Senior Delver" };
    if (gradeNum >= 3) return { level: 2, name: "Blue Whistle", color: "text-blue-400", title: "Apprentice Delver" };
    if (gradeNum >= 1) return { level: 1, name: "Red Whistle", color: "text-red-400", title: "Cave Raider" };
    return { level: 0, name: "Bell Whistle", color: "text-gray-400", title: "Novice" };
  };

  const getNextWhistleGoal = (currentGrade: string) => {
    const gradeNum = parseInt(currentGrade.replace('V', '')) || 0;
    
    if (gradeNum >= 9) return null; // Already at max
    if (gradeNum >= 7) return { grade: "V9", whistle: "White Whistle" };
    if (gradeNum >= 5) return { grade: "V7", whistle: "Black Whistle" };
    if (gradeNum >= 3) return { grade: "V5", whistle: "Moon Whistle" };
    if (gradeNum >= 1) return { grade: "V3", whistle: "Blue Whistle" };
    return { grade: "V1", whistle: "Red Whistle" };
  };


  // Calculate highest grade from skills
  const getHighestGrade = (): string => {
    if (!skills || skills.length === 0) return "V0";
    let highest = 0;
    for (const skill of skills) {
      const gradeNum = parseInt(skill.maxGrade?.replace('V', '') || '0');
      if (gradeNum > highest) highest = gradeNum;
    }
    return `V${highest}`;
  };

  const highestGrade = getHighestGrade();
  const whistleInfo = getWhistleFromGrade(highestGrade);
  const nextGoal = getNextWhistleGoal(highestGrade);
  
  // Use dynamic layer calculation like Home tab
  const currentLayer = layerProgress?.currentLayer || user?.currentLayer || 1;
  const layerInfo = getLayerInfo(currentLayer);
  const LayerIcon = layerInfo.icon;

  const formatDate = (date: Date | string | undefined) => {
    if (!date) return "Not achieved";
    const d = new Date(date);
    return d.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  return (
    <div className="max-w-md mx-auto nature-background min-h-screen relative overflow-hidden">
      {/* Moss Overlay */}
      <div className="moss-overlay"></div>
      
      {/* Waterfall Mist Effect for Progress Page */}
      <div className="waterfall-mist" style={{opacity: 0.3}}></div>
      
      {/* Background Elements */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-10 right-10 w-32 h-32 bg-abyss-amber rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 left-10 w-40 h-40 bg-abyss-teal rounded-full blur-3xl"></div>
      </div>
      
      {/* Natural Floating Particles */}
      <div className="nature-spore" style={{left: '15%', animationDelay: '1s'}}></div>
      <div className="nature-spore" style={{left: '45%', animationDelay: '5s'}}></div>
      <div className="nature-spore" style={{left: '75%', animationDelay: '10s'}}></div>
      
      {/* Firefly Particles */}
      <div className="firefly" style={{left: '12%', bottom: '70%', animationDelay: '2s'}}></div>
      <div className="firefly" style={{left: '38%', bottom: '40%', animationDelay: '7s'}}></div>
      <div className="firefly" style={{left: '68%', bottom: '85%', animationDelay: '12s'}}></div>
      <div className="firefly" style={{left: '78%', bottom: '55%', animationDelay: '17s'}}></div>
      
      {/* Layer Fog Effect */}
      <div className="layer-fog"></div>

      {/* Header */}
      <header className="relative z-20 px-6 pt-12 pb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setLocation("/")}
              className="text-abyss-amber hover:text-abyss-ethereal transition-colors"
            >
              <i className="fas fa-arrow-left text-xl"></i>
            </button>
            <h1 className="text-lg font-semibold text-abyss-ethereal">Progress & Skills</h1>
          </div>
        </div>
      </header>

      {/* Tabs */}
      <div className="relative z-10 px-6 mb-6">
        <Tabs defaultValue="progress" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="progress">Progress</TabsTrigger>
            <TabsTrigger value="skills">Skills</TabsTrigger>
          </TabsList>
          
          <TabsContent value="progress" className="mt-6">
            <div className="space-y-6">{/* Progress content */}

      {/* Main Content */}
        {/* Grade-Based Whistle Level */}
        <Card className="bg-abyss-purple/30 backdrop-blur-sm border-abyss-teal/20 depth-layer">
          <CardHeader>
            <CardTitle className="text-abyss-ethereal flex items-center space-x-3">
              <div className="whistle-glow">
                <Award className={`text-2xl ${whistleInfo.color}`} />
              </div>
              <div>
                <span>{whistleInfo.name}</span>
                <div className="text-sm text-abyss-ethereal/70 font-normal">{whistleInfo.title}</div>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-abyss-ethereal/80">🧗 Highest Grade Reached</span>
              <span className="text-abyss-amber font-medium">
                {gradeConverter.convertGrade(highestGrade, 'V-Scale', gradeSystem)}
              </span>
            </div>
            
            {nextGoal && (
              <div className="bg-abyss-dark/40 rounded-lg p-3">
                <div className="text-sm text-abyss-ethereal">
                  <div className="flex items-center justify-between">
                    <span>🎯 Next Goal:</span>
                    <span className="text-abyss-amber font-medium">
                      {gradeConverter.convertGrade(nextGoal.grade, 'V-Scale', gradeSystem)}
                    </span>
                  </div>
                  <div className="text-xs text-abyss-ethereal/70 mt-1">
                    Climb {gradeConverter.convertGrade(nextGoal.grade, 'V-Scale', gradeSystem)} to reach {nextGoal.whistle}
                  </div>
                </div>
              </div>
            )}
            
            {!nextGoal && (
              <div className="bg-abyss-dark/40 rounded-lg p-3">
                <div className="text-sm text-abyss-ethereal text-center">
                  <div className="text-abyss-amber font-medium">🏆 Maximum Whistle Achieved!</div>
                  <div className="text-xs text-abyss-ethereal/70 mt-1">
                    You've reached the legendary White Whistle status
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Current Layer */}
        <Card className="bg-layer-gradient backdrop-blur-sm border-abyss-teal/20 depth-layer">
          <CardContent className="p-6">
            <div className="flex items-center space-x-4 mb-4">
              <div className={`w-16 h-16 ${layerInfo.color}/50 rounded-full flex items-center justify-center`}>
                <LayerIcon className="text-2xl text-abyss-amber" size={24} />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-abyss-ethereal">Layer {currentLayer}</h3>
                <p className="text-abyss-amber">{layerInfo.name}</p>
                <p className="text-sm text-abyss-ethereal/70">{layerInfo.grades}</p>
              </div>
            </div>
            
            {/* Layer Progress */}
            {layerProgress && (
              <div className="bg-abyss-dark/30 rounded-xl p-4 mb-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-abyss-ethereal/80">Layer Progress</span>
                  <span className="text-abyss-amber font-medium">
                    {layerProgress.progressToNextLayer}/{layerProgress.nextLayerXP - layerProgress.currentLayerXP} XP
                  </span>
                </div>
                <Progress value={layerProgress.layerProgress} className="h-2" />
                <p className="text-xs text-abyss-ethereal/60 mt-2">
                  {currentLayer === 7 
                    ? "Maximum layer reached!" 
                    : `${(layerProgress.nextLayerXP - layerProgress.currentXP)} XP needed to advance`}
                </p>
                <div className="text-xs text-abyss-ethereal/50 mt-1">
                  Total XP: {layerProgress.currentXP.toLocaleString()}
                </div>
              </div>
            )}
            
            <div className="text-sm text-abyss-ethereal/80 bg-abyss-dark/20 rounded-lg p-3">
              <p className="italic">"{layerInfo.description}"</p>
            </div>
          </CardContent>
        </Card>

        {/* Enhanced Statistics */}
        <Card className="bg-abyss-purple/30 backdrop-blur-sm border-abyss-teal/20 depth-layer">
          <CardHeader>
            <CardTitle className="text-abyss-ethereal flex items-center space-x-2">
              <TrendingUp className="text-abyss-amber" />
              <span>Enhanced Statistics</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-abyss-amber">
                  🧗 {enhancedProgress?.enhancedStats.totalSessions || 0}
                </div>
                <div className="text-sm text-abyss-ethereal/70">Climbing Sessions</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-abyss-amber">
                  💪 {enhancedProgress?.enhancedStats.totalWorkouts || 0}
                </div>
                <div className="text-sm text-abyss-ethereal/70">Home Workouts</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-abyss-amber">
                  🧩 {enhancedProgress?.enhancedStats.totalProblems || 0}
                </div>
                <div className="text-sm text-abyss-ethereal/70">Problems Solved</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-abyss-amber">
                  ⏱️ {Math.round((enhancedProgress?.enhancedStats.weeklyTime || 0) * 10) / 10}h
                </div>
                <div className="text-sm text-abyss-ethereal/70">Weekly Time</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-abyss-amber">
                  🧠 {enhancedProgress?.enhancedStats.bestGrade === "N/A" || !enhancedProgress?.enhancedStats.bestGrade
                    ? "N/A"
                    : gradeConverter.convertGrade(enhancedProgress.enhancedStats.bestGrade, 'V-Scale', gradeSystem)
                  }
                </div>
                <div className="text-sm text-abyss-ethereal/70">Best Grade</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-abyss-amber">
                  📈 {enhancedProgress?.enhancedStats.averageGrade7d === "N/A" || !enhancedProgress?.enhancedStats.averageGrade7d
                    ? "N/A"
                    : gradeConverter.convertGrade(enhancedProgress.enhancedStats.averageGrade7d, 'V-Scale', gradeSystem)
                  }
                </div>
                <div className="text-sm text-abyss-ethereal/70">Avg Grade (7d)</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Personal Milestones */}
        <Card className="bg-abyss-purple/30 backdrop-blur-sm border-abyss-teal/20 depth-layer">
          <CardHeader>
            <CardTitle className="text-abyss-ethereal flex items-center space-x-2">
              <Trophy className="text-abyss-amber" />
              <span>Personal Milestones</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-abyss-dark/40 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="text-2xl">🥇</div>
                  <div>
                    <div className="text-sm font-medium text-abyss-ethereal">First V5 Send</div>
                    <div className="text-xs text-abyss-ethereal/70">
                      {formatDate(enhancedProgress?.milestones.firstV5Send)}
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-abyss-dark/40 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="text-2xl">📍</div>
                  <div>
                    <div className="text-sm font-medium text-abyss-ethereal">First Outdoor Session</div>
                    <div className="text-xs text-abyss-ethereal/70">
                      {formatDate(enhancedProgress?.milestones.firstOutdoorSession)}
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-abyss-dark/40 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="text-2xl">💥</div>
                  <div>
                    <div className="text-sm font-medium text-abyss-ethereal">Longest Send Streak</div>
                    <div className="text-xs text-abyss-ethereal/70">
                      {enhancedProgress?.milestones.longestStreak || 0} days
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-abyss-dark/40 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="text-2xl">🧗</div>
                  <div>
                    <div className="text-sm font-medium text-abyss-ethereal">Personal Best Session</div>
                    <div className="text-xs text-abyss-ethereal/70">
                      {enhancedProgress?.milestones.bestSession.xp || 0} XP, {enhancedProgress?.milestones.bestSession.problems || 0} problems
                    </div>
                    <div className="text-xs text-abyss-ethereal/50">
                      {formatDate(enhancedProgress?.milestones.bestSession.date)}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Nanachi's Analysis */}
        {analysis && (
          <Card className="bg-abyss-purple/30 backdrop-blur-sm border-abyss-teal/20 depth-layer">
            <CardHeader>
              <CardTitle className="text-abyss-ethereal flex items-center space-x-2">
                <div className="text-xl">🐰</div>
                <span>Nanachi's Analysis</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {analysis.personalizedGreeting && (
                <div className="p-3 bg-abyss-dark/40 rounded-lg">
                  <p className="text-sm text-abyss-ethereal/90 italic">
                    "{analysis.personalizedGreeting}"
                  </p>
                </div>
              )}
              
              {analysis.progressInsights && (
                <div>
                  <h4 className="text-sm font-medium text-abyss-ethereal mb-2">Progress Insights</h4>
                  <p className="text-sm text-abyss-ethereal/80">
                    {analysis.progressInsights}
                  </p>
                </div>
              )}
              
              {analysis.encouragement && (
                <div>
                  <h4 className="text-sm font-medium text-abyss-ethereal mb-2">Encouragement</h4>
                  <p className="text-sm text-abyss-ethereal/80">
                    {analysis.encouragement}
                  </p>
                </div>
              )}
              
              {analysis.nextSteps && (
                <div>
                  <h4 className="text-sm font-medium text-abyss-ethereal mb-2">Next Steps</h4>
                  <p className="text-sm text-abyss-ethereal/80">
                    {analysis.nextSteps}
                  </p>
                </div>
              )}
              
              {analysis.personalTouch && (
                <div className="p-3 bg-abyss-dark/40 rounded-lg border-l-4 border-abyss-amber">
                  <p className="text-sm text-abyss-ethereal/90 italic">
                    "{analysis.personalTouch}"
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        )}
            </div>
          </TabsContent>
          
          <TabsContent value="skills" className="mt-6">
            <SkillTree />
          </TabsContent>
        </Tabs>
      </div>

      <BottomNavigation />
    </div>
  );
}
