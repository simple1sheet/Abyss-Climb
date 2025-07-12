import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { useLocation } from "wouter";
import BottomNavigation from "@/components/BottomNavigation";

export default function ProgressPage() {
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  
  const { data: stats } = useQuery({
    queryKey: ["/api/user/stats"],
    enabled: !!user,
  });

  const { data: sessions } = useQuery({
    queryKey: ["/api/sessions"],
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

  const whistleInfo = getWhistleLevel(user?.whistleLevel || 1);
  const currentLayer = user?.currentLayer || 1;
  const totalXP = user?.totalXP || 0;
  const nextWhistleXP = (user?.whistleLevel || 1) * 1000;
  const whistleProgress = (totalXP / nextWhistleXP) * 100;

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
        {/* Whistle Level */}
        <Card className="bg-abyss-purple/30 backdrop-blur-sm border-abyss-teal/20 depth-layer">
          <CardHeader>
            <CardTitle className="text-abyss-ethereal flex items-center space-x-3">
              <div className="whistle-glow">
                <i className="fas fa-award text-2xl text-abyss-amber"></i>
              </div>
              <span>{whistleInfo.name}</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-abyss-ethereal/80">Level {user?.whistleLevel || 1}</span>
              <span className="text-abyss-amber font-medium">{totalXP} XP</span>
            </div>
            <Progress value={Math.min(whistleProgress, 100)} className="h-3" />
            <div className="flex justify-between text-xs text-abyss-ethereal/60">
              <span>Current XP: {totalXP}</span>
              <span>Next Level: {nextWhistleXP} XP</span>
            </div>
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

        {/* Statistics */}
        <Card className="bg-abyss-purple/30 backdrop-blur-sm border-abyss-teal/20 depth-layer">
          <CardHeader>
            <CardTitle className="text-abyss-ethereal">Statistics</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-abyss-amber">
                  {stats?.totalSessions || 0}
                </div>
                <div className="text-sm text-abyss-ethereal/70">Total Sessions</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-abyss-amber">
                  {stats?.totalProblems || 0}
                </div>
                <div className="text-sm text-abyss-ethereal/70">Problems Solved</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-abyss-amber">
                  {stats?.weeklyStats?.time || 0}h
                </div>
                <div className="text-sm text-abyss-ethereal/70">Weekly Time</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-abyss-amber">
                  {stats?.bestGrade || "N/A"}
                </div>
                <div className="text-sm text-abyss-ethereal/70">Best Grade</div>
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
