import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useLocation } from "wouter";
import BottomNavigation from "@/components/BottomNavigation";
import { useGradeSystem } from "@/hooks/useGradeSystem";
import { gradeConverter } from "@/utils/gradeConverter";
import { Award, Trophy, Target, Calendar, TrendingUp, Clock } from "lucide-react";

export default function ProgressPage() {
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const { gradeSystem } = useGradeSystem();
  
  const { data: enhancedProgress } = useQuery({
    queryKey: ["/api/enhanced-progress"],
    enabled: !!user,
  });

  const { data: analysis } = useQuery({
    queryKey: ["/api/analysis/progress"],
    enabled: !!user,
  });

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

  const whistleInfo = getWhistleLevel(enhancedProgress?.whistleLevel || 1);
  const currentLayer = user?.currentLayer || 1;

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
              <i className="fas fa-arrow-left text-xl"></i>
            </button>
            <h1 className="text-lg font-semibold text-abyss-ethereal">Progress</h1>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="relative z-10 px-6 pb-24 space-y-6">
        {/* Enhanced Whistle Level */}
        <Card className="bg-abyss-purple/30 backdrop-blur-sm border-abyss-teal/20 depth-layer">
          <CardHeader>
            <CardTitle className="text-abyss-ethereal flex items-center space-x-3">
              <div className="whistle-glow">
                <Award className="text-2xl text-abyss-amber" />
              </div>
              <span>{enhancedProgress?.whistleName || "Red Whistle"}</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-abyss-ethereal/80">Level {enhancedProgress?.whistleLevel || 1}</span>
              <span className="text-abyss-amber font-medium">{enhancedProgress?.currentXP || 0} XP</span>
            </div>
            <Progress value={Math.min(enhancedProgress?.whistleProgress || 0, 100)} className="h-3" />
            <div className="flex justify-between text-xs text-abyss-ethereal/60">
              <span>Current XP: {enhancedProgress?.currentXP || 0}</span>
              <span>Next Level: {enhancedProgress?.nextLevelXP || 500} XP</span>
            </div>
            
            {/* XP Breakdown Tooltip */}
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="bg-abyss-dark/40 rounded-lg p-3 cursor-help">
                    <div className="text-sm text-abyss-ethereal">
                      <div className="flex justify-between">
                        <span>Weekly XP:</span>
                        <span className="text-abyss-amber">{enhancedProgress?.xpBreakdown.weeklyXP || 0}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Problems:</span>
                        <span className="text-abyss-amber">{enhancedProgress?.xpBreakdown.problemsSolved || 0}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Avg Grade:</span>
                        <span className="text-abyss-amber">
                          {enhancedProgress?.xpBreakdown.averageGrade 
                            ? gradeConverter.convertGrade(enhancedProgress.xpBreakdown.averageGrade, 'V-Scale', gradeSystem)
                            : gradeConverter.convertGrade("V0", 'V-Scale', gradeSystem)
                          }
                        </span>
                      </div>
                    </div>
                  </div>
                </TooltipTrigger>
                <TooltipContent className="bg-abyss-dark border-abyss-teal/30">
                  <p className="text-abyss-ethereal">
                    You gained {enhancedProgress?.xpBreakdown.weeklyXP || 0} XP from solving {enhancedProgress?.xpBreakdown.problemsSolved || 0} problems this week.
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </CardContent>
        </Card>

        {/* Current Layer */}
        <Card className="bg-layer-gradient backdrop-blur-sm border-abyss-teal/20 depth-layer">
          <CardContent className="p-6">
            <div className="flex items-center space-x-4 mb-4">
              <div className="w-16 h-16 bg-abyss-teal/50 rounded-full flex items-center justify-center">
                <i className="fas fa-layer-group text-2xl text-abyss-amber"></i>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-abyss-ethereal">Layer {currentLayer}</h3>
                <p className="text-abyss-amber">{getLayerName(currentLayer)}</p>
              </div>
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
                <div className="text-sm text-abyss-ethereal/70">Total Sessions</div>
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
                  🧠 {enhancedProgress?.enhancedStats.bestGrade 
                    ? gradeConverter.convertGrade(enhancedProgress.enhancedStats.bestGrade, 'V-Scale', gradeSystem)
                    : "N/A"
                  }
                </div>
                <div className="text-sm text-abyss-ethereal/70">Best Grade</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-abyss-amber">
                  📈 {enhancedProgress?.enhancedStats.averageGrade7d 
                    ? gradeConverter.convertGrade(enhancedProgress.enhancedStats.averageGrade7d, 'V-Scale', gradeSystem)
                    : gradeConverter.convertGrade("V0", 'V-Scale', gradeSystem)
                  }
                </div>
                <div className="text-sm text-abyss-ethereal/70">Avg Grade (7d)</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-abyss-amber">
                  🔁 {enhancedProgress?.enhancedStats.sessionConsistency || 0}
                </div>
                <div className="text-sm text-abyss-ethereal/70">Sessions/Week</div>
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

        {/* AI Analysis */}
        {analysis && (
          <Card className="bg-abyss-purple/30 backdrop-blur-sm border-abyss-teal/20 depth-layer">
            <CardHeader>
              <CardTitle className="text-abyss-ethereal flex items-center space-x-2">
                <i className="fas fa-brain text-abyss-amber"></i>
                <span>AI Analysis</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {analysis.strengths?.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-abyss-ethereal mb-2">Strengths</h4>
                  <div className="flex flex-wrap gap-2">
                    {analysis.strengths.map((strength: string, index: number) => (
                      <Badge key={index} className="bg-green-500/20 text-green-400 border-green-500/30">
                        {strength}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
              
              {analysis.weaknesses?.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-abyss-ethereal mb-2">Areas for Improvement</h4>
                  <div className="flex flex-wrap gap-2">
                    {analysis.weaknesses.map((weakness: string, index: number) => (
                      <Badge key={index} className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">
                        {weakness}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
              
              {analysis.recommendations?.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-abyss-ethereal mb-2">Recommendations</h4>
                  <ul className="space-y-1">
                    {analysis.recommendations.map((rec: string, index: number) => (
                      <li key={index} className="text-sm text-abyss-ethereal/80 flex items-start space-x-2">
                        <i className="fas fa-arrow-right text-abyss-amber text-xs mt-1"></i>
                        <span>{rec}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>

      <BottomNavigation />
    </div>
  );
}
