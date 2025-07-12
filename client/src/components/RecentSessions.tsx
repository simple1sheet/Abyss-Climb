import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { Calendar, Clock, MapPin, Target, Plus } from "lucide-react";
import { format } from "date-fns";
import { useLocation } from "wouter";

export default function RecentSessions() {
  const { user } = useAuth();
  const [, navigate] = useLocation();
  
  const { data: sessions } = useQuery({
    queryKey: ["/api/sessions"],
    enabled: !!user,
  });

  if (!user) {
    return (
      <section className="px-6 mb-8">
        <Card className="bg-abyss-purple/30 backdrop-blur-sm border-abyss-teal/20">
          <CardContent className="p-4">
            <div className="text-center text-abyss-ethereal">
              <p>Please log in to view your climbing sessions</p>
            </div>
          </CardContent>
        </Card>
      </section>
    );
  }

  const getSessionDuration = (startTime: string, endTime?: string): string => {
    if (!endTime) return "In Progress";
    
    const start = new Date(startTime);
    const end = new Date(endTime);
    const diff = end.getTime() - start.getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  const getSessionTypeColor = (type: string): string => {
    switch (type) {
      case "indoor": return "bg-blue-500/20 text-blue-300";
      case "outdoor": return "bg-green-500/20 text-green-300";
      default: return "bg-gray-500/20 text-gray-300";
    }
  };

  return (
    <section className="px-6 mb-8 relative z-10">
      <Card className="bg-abyss-purple/30 backdrop-blur-sm border-abyss-teal/20 depth-layer">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-abyss-ethereal">Recent Sessions</h2>
            <Button
              onClick={() => navigate("/session")}
              size="sm"
              className="bg-abyss-amber/20 text-abyss-amber hover:bg-abyss-amber/30 border-abyss-amber/50"
            >
              <Plus className="h-4 w-4 mr-2" />
              New Session
            </Button>
          </div>
          
          <div className="space-y-4">
            {!sessions || sessions.length === 0 ? (
              <div className="text-center py-8 text-abyss-ethereal/70">
                <Target className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p className="mb-2">No climbing sessions yet</p>
                <p className="text-sm">Start your first session to begin tracking your progress!</p>
                <Button
                  onClick={() => navigate("/session")}
                  className="mt-4 bg-abyss-amber/20 text-abyss-amber hover:bg-abyss-amber/30 border-abyss-amber/50"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Start First Session
                </Button>
              </div>
            ) : (
              sessions.slice(0, 5).map((session: any) => (
                <div
                  key={session.id}
                  className="bg-abyss-dark/40 border border-abyss-teal/20 rounded-lg p-4 relic-shimmer hover:border-abyss-teal/40 transition-colors cursor-pointer"
                  onClick={() => navigate(`/session/${session.id}`)}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <Badge className={getSessionTypeColor(session.sessionType)}>
                          {session.sessionType}
                        </Badge>
                        <span className="text-sm text-abyss-ethereal">
                          {format(new Date(session.startTime), "MMM dd, yyyy")}
                        </span>
                      </div>
                      <div className="flex items-center space-x-4 text-sm text-abyss-ethereal/70">
                        <div className="flex items-center space-x-1">
                          <Calendar className="h-4 w-4" />
                          <span>{format(new Date(session.startTime), "h:mm a")}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Clock className="h-4 w-4" />
                          <span>{getSessionDuration(session.startTime, session.endTime)}</span>
                        </div>
                        {session.location && (
                          <div className="flex items-center space-x-1">
                            <MapPin className="h-4 w-4" />
                            <span>{session.location}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-abyss-amber">
                        {session.xpEarned || 0} XP
                      </div>
                      <div className="text-sm text-abyss-ethereal/60">
                        {session.endTime ? "Completed" : "In Progress"}
                      </div>
                    </div>
                  </div>
                  {session.notes && (
                    <div className="mt-2 text-sm text-abyss-ethereal/80 bg-abyss-dark/20 rounded p-2">
                      {session.notes}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
          
          {sessions && sessions.length > 5 && (
            <div className="mt-4 text-center">
              <Button
                onClick={() => navigate("/progress")}
                variant="outline"
                className="text-abyss-ethereal/70 hover:text-abyss-ethereal border-abyss-ethereal/30"
              >
                View All Sessions
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </section>
  );
}