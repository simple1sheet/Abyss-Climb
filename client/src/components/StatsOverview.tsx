import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";

export default function StatsOverview() {
  const { user } = useAuth();
  
  const { data: stats } = useQuery({
    queryKey: ["/api/user/stats"],
    enabled: !!user,
  });

  const weeklyStats = stats?.weeklyStats || {
    problems: 0,
    xp: 0,
    time: 0,
  };

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    return hours > 0 ? `${hours}h` : `${minutes}m`;
  };

  return (
    <section className="px-6 mb-20 relative z-10">
      <h2 className="text-xl font-semibold text-abyss-ethereal mb-4">This Week</h2>
      <div className="grid grid-cols-2 gap-4">
        <Card className="bg-abyss-purple/30 backdrop-blur-sm border-abyss-teal/20 depth-layer">
          <CardContent className="p-4">
            <div className="text-center">
              <i className="fas fa-fire text-2xl text-abyss-amber mb-2"></i>
              <p className="text-2xl font-bold text-abyss-ethereal">
                {weeklyStats.problems}
              </p>
              <p className="text-xs text-abyss-ethereal/60">Problems Solved</p>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-abyss-purple/30 backdrop-blur-sm border-abyss-teal/20 depth-layer">
          <CardContent className="p-4">
            <div className="text-center">
              <i className="fas fa-clock text-2xl text-abyss-amber mb-2"></i>
              <p className="text-2xl font-bold text-abyss-ethereal">
                {formatTime(weeklyStats.time)}
              </p>
              <p className="text-xs text-abyss-ethereal/60">Climbing Time</p>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-abyss-purple/30 backdrop-blur-sm border-abyss-teal/20 depth-layer">
          <CardContent className="p-4">
            <div className="text-center">
              <i className="fas fa-trophy text-2xl text-abyss-amber mb-2"></i>
              <p className="text-2xl font-bold text-abyss-ethereal">
                {weeklyStats.xp}
              </p>
              <p className="text-xs text-abyss-ethereal/60">XP Earned</p>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-abyss-purple/30 backdrop-blur-sm border-abyss-teal/20 depth-layer">
          <CardContent className="p-4">
            <div className="text-center">
              <i className="fas fa-chart-line text-2xl text-abyss-amber mb-2"></i>
              <p className="text-2xl font-bold text-abyss-ethereal">
                {stats?.bestGrade || "N/A"}
              </p>
              <p className="text-xs text-abyss-ethereal/60">Best Grade</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
