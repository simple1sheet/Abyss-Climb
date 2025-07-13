import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { TrendingUp, Clock, Target, Award, Activity } from "lucide-react";
import { useGradeSystem } from "@/hooks/useGradeSystem";
import { gradeConverter } from "@/utils/gradeConverter";

export default function StatsOverview() {
  const { user } = useAuth();
  const { gradeSystem } = useGradeSystem();
  
  const { data: stats } = useQuery({
    queryKey: ["/api/user/stats"],
    enabled: !!user,
  });

  if (!user) {
    return (
      <section className="px-6 mb-8">
        <Card className="bg-abyss-purple/30 backdrop-blur-sm border-abyss-teal/20">
          <CardContent className="p-4">
            <div className="text-center text-abyss-ethereal">
              <p>Please log in to view your climbing stats</p>
            </div>
          </CardContent>
        </Card>
      </section>
    );
  }

  const getGradeDisplay = (grade: string): string => {
    if (!grade || grade === "N/A") return "No climbs yet";
    return gradeConverter.convertGrade(grade, 'V-Scale', gradeSystem);
  };

  const getTimeDisplay = (minutes: number): string => {
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  return (
    <section className="px-6 mb-8 relative z-10">
      <Card className="bg-abyss-purple/30 backdrop-blur-sm border-abyss-teal/20 depth-layer">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-abyss-ethereal">Climbing Stats</h2>
            <TrendingUp className="h-5 w-5 text-abyss-amber" />
          </div>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="bg-abyss-dark/40 border border-abyss-teal/10 rounded-lg p-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-abyss-ethereal/70">Total Sessions</span>
                <Activity className="h-4 w-4 text-abyss-teal" />
              </div>
              <div className="text-2xl font-bold text-abyss-ethereal">
                {stats?.totalSessions || 0}
              </div>
            </div>

            <div className="bg-abyss-dark/40 border border-abyss-teal/10 rounded-lg p-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-abyss-ethereal/70">Problems Solved</span>
                <Target className="h-4 w-4 text-abyss-amber" />
              </div>
              <div className="text-2xl font-bold text-abyss-ethereal">
                {stats?.totalProblems || 0}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="bg-abyss-dark/40 border border-abyss-teal/10 rounded-lg p-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-abyss-ethereal/70">Best Grade</span>
                <Award className="h-4 w-4 text-abyss-purple" />
              </div>
              <div className="text-lg font-bold text-abyss-ethereal">
                {getGradeDisplay(stats?.bestGrade)}
              </div>
            </div>

            <div className="bg-abyss-dark/40 border border-abyss-teal/10 rounded-lg p-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-abyss-ethereal/70">Whistle Level</span>
                <Award className="h-4 w-4 text-abyss-amber" />
              </div>
              <div className="text-lg font-bold text-abyss-ethereal">
                {user?.whistleLevel || 0}
              </div>
            </div>
          </div>

          {stats?.weeklyStats && (
            <div className="bg-abyss-dark/40 border border-abyss-teal/10 rounded-lg p-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-abyss-ethereal/70">This Week</span>
                <Clock className="h-4 w-4 text-abyss-teal" />
              </div>
              <div className="grid grid-cols-3 gap-2">
                <div className="text-center">
                  <div className="text-lg font-bold text-abyss-ethereal">
                    {stats.weeklyStats.problems || 0}
                  </div>
                  <div className="text-xs text-abyss-ethereal/60">Problems</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-abyss-ethereal">
                    {user?.currentLayer || 1}
                  </div>
                  <div className="text-xs text-abyss-ethereal/60">Layer</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-abyss-ethereal">
                    {stats.weeklyStats.time ? getTimeDisplay(stats.weeklyStats.time) : "0m"}
                  </div>
                  <div className="text-xs text-abyss-ethereal/60">Time</div>
                </div>
              </div>
            </div>
          )}

          {(!stats || (stats.totalSessions === 0 && stats.totalProblems === 0)) && (
            <div className="text-center py-4 text-abyss-ethereal/60">
              <Target className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">Start your first climbing session to see your stats!</p>
            </div>
          )}
        </CardContent>
      </Card>
    </section>
  );
}