import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { useLocation } from "wouter";

export default function RecentSessions() {
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  
  const { data: sessions } = useQuery({
    queryKey: ["/api/sessions", { limit: 3 }],
    enabled: !!user,
  });

  const recentSessions = sessions?.slice(0, 2) || [];

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  const getSessionIcon = (type: string) => {
    return type === "outdoor" ? "fas fa-mountain" : "fas fa-dumbbell";
  };

  const getSessionColor = (type: string) => {
    return type === "outdoor" ? "bg-abyss-brown/30" : "bg-abyss-teal/30";
  };

  return (
    <section className="px-6 mb-8 relative z-10">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-abyss-ethereal">Recent Sessions</h2>
        <button 
          onClick={() => setLocation("/progress")}
          className="text-abyss-amber hover:text-abyss-ethereal transition-colors"
        >
          <i className="fas fa-history text-lg"></i>
        </button>
      </div>
      
      <div className="space-y-3">
        {recentSessions.length === 0 ? (
          <Card className="bg-abyss-purple/30 backdrop-blur-sm border-abyss-teal/20 depth-layer">
            <CardContent className="p-6 text-center">
              <i className="fas fa-mountain text-3xl text-abyss-amber/50 mb-3"></i>
              <p className="text-abyss-ethereal/70">No recent sessions</p>
              <p className="text-sm text-abyss-ethereal/50 mt-1">
                Start your first climbing session!
              </p>
            </CardContent>
          </Card>
        ) : (
          recentSessions.map((session: any) => (
            <Card key={session.id} className="bg-abyss-purple/30 backdrop-blur-sm border-abyss-teal/20 depth-layer">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-3">
                    <div className={`w-10 h-10 ${getSessionColor(session.sessionType)} rounded-full flex items-center justify-center`}>
                      <i className={`${getSessionIcon(session.sessionType)} text-abyss-amber`}></i>
                    </div>
                    <div>
                      <h3 className="text-abyss-ethereal font-medium">
                        {session.sessionType === "outdoor" ? "Outdoor Crag" : "Indoor Gym"}
                      </h3>
                      <p className="text-xs text-abyss-ethereal/60">
                        {session.location} • {new Date(session.startTime).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-abyss-amber font-medium">
                      {session.xpEarned || 0} XP
                    </p>
                    <p className="text-xs text-abyss-ethereal/60">
                      {session.duration ? formatDuration(session.duration) : "In progress"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-4 text-xs text-abyss-ethereal/70">
                  <span>Duration: {session.duration ? formatDuration(session.duration) : "Active"}</span>
                  <span>•</span>
                  <span>XP: +{session.xpEarned || 0}</span>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </section>
  );
}
