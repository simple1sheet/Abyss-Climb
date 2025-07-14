import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, Calendar, Clock, MapPin, Plus, Target, Trophy } from "lucide-react";
import { format } from "date-fns";
import BottomNavigation from "@/components/BottomNavigation";
import { useGradeSystem } from "@/hooks/useGradeSystem";
import { gradeConverter } from "@/utils/gradeConverter";

export default function Sessions() {
  const [, setLocation] = useLocation();
  const { gradeSystem } = useGradeSystem();

  const { data: sessions, isLoading } = useQuery({
    queryKey: ["/api/sessions"],
    queryFn: async () => {
      const response = await fetch("/api/sessions?limit=50", {
        credentials: "include",
      });
      if (!response.ok) {
        throw new Error("Failed to fetch sessions");
      }
      return response.json();
    },
  });

  const getSessionTypeColor = (type: string) => {
    switch (type) {
      case "indoor":
        return "bg-blue-500/20 text-blue-400 border-blue-500/30";
      case "outdoor":
        return "bg-green-500/20 text-green-400 border-green-500/30";
      case "competition":
        return "bg-purple-500/20 text-purple-400 border-purple-500/30";
      default:
        return "bg-gray-500/20 text-gray-400 border-gray-500/30";
    }
  };

  const getSessionDuration = (startTime: string, endTime: string | null) => {
    if (!endTime) return "In Progress";
    const duration = new Date(endTime).getTime() - new Date(startTime).getTime();
    const hours = Math.floor(duration / (1000 * 60 * 60));
    const minutes = Math.floor((duration % (1000 * 60 * 60)) / (1000 * 60));
    return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
  };

  const groupSessionsByMonth = (sessions: any[]) => {
    const grouped: { [key: string]: any[] } = {};
    sessions.forEach((session) => {
      const monthKey = format(new Date(session.startTime), "MMMM yyyy");
      if (!grouped[monthKey]) {
        grouped[monthKey] = [];
      }
      grouped[monthKey].push(session);
    });
    return grouped;
  };

  return (
    <div className="max-w-md mx-auto nature-background min-h-screen relative overflow-hidden">
      {/* Moss Overlay */}
      <div className="moss-overlay"></div>
      
      {/* Natural Floating Particles */}
      <div className="nature-spore" style={{left: '20%', animationDelay: '2s'}}></div>
      <div className="nature-spore" style={{left: '50%', animationDelay: '7s'}}></div>
      <div className="nature-spore" style={{left: '80%', animationDelay: '12s'}}></div>
      
      {/* Layer Fog Effect */}
      <div className="layer-fog"></div>

      {/* Header */}
      <header className="relative z-20 px-6 pt-12 pb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Button
              onClick={() => setLocation("/")}
              variant="ghost"
              size="sm"
              className="text-abyss-amber hover:text-abyss-ethereal"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-lg font-semibold text-abyss-ethereal">All Sessions</h1>
          </div>
          <Button
            onClick={() => setLocation("/session")}
            size="sm"
            className="bg-abyss-amber/20 text-abyss-amber hover:bg-abyss-amber/30 border-abyss-amber/50"
          >
            <Plus className="h-4 w-4 mr-2" />
            New Session
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <div className="relative z-10 px-6 pb-24">
        {isLoading ? (
          <div className="space-y-6">
            <Card className="bg-abyss-purple/30 backdrop-blur-sm border-abyss-teal/20">
              <CardHeader>
                <Skeleton className="h-6 w-32" />
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="p-4 bg-abyss-dark/20 rounded-lg">
                      <Skeleton className="h-6 w-16 mb-2" />
                      <Skeleton className="h-4 w-32 mb-2" />
                      <Skeleton className="h-4 w-24" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        ) : !sessions || sessions.length === 0 ? (
          <Card className="bg-abyss-purple/30 backdrop-blur-sm border-abyss-teal/20">
            <CardContent className="p-8 text-center">
              <Target className="h-16 w-16 mx-auto mb-4 text-abyss-ethereal/50" />
              <h2 className="text-xl font-semibold text-abyss-ethereal mb-2">No Sessions Yet</h2>
              <p className="text-abyss-ethereal/70 mb-6">
                Start your first climbing session to begin tracking your progress!
              </p>
              <Button
                onClick={() => setLocation("/session")}
                className="bg-abyss-amber/20 text-abyss-amber hover:bg-abyss-amber/30 border-abyss-amber/50"
              >
                <Plus className="h-4 w-4 mr-2" />
                Start First Session
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {Object.entries(groupSessionsByMonth(sessions)).map(([month, monthSessions]) => (
              <Card key={month} className="bg-abyss-purple/30 backdrop-blur-sm border-abyss-teal/20 depth-layer">
                <CardHeader className="pb-3">
                  <CardTitle className="text-abyss-ethereal text-lg">{month}</CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="space-y-3">
                    {monthSessions.map((session: any) => (
                      <div
                        key={session.id}
                        className="bg-abyss-dark/40 border border-abyss-teal/20 rounded-lg p-4 relic-shimmer hover:border-abyss-teal/40 transition-all duration-300 cursor-pointer hover:scale-[1.02]"
                        onClick={() => setLocation(`/session/${session.id}`)}
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-2">
                              <Badge className={getSessionTypeColor(session.sessionType)}>
                                {session.sessionType}
                              </Badge>
                              <span className="text-sm text-abyss-ethereal/70">
                                {format(new Date(session.startTime), "MMM dd")}
                              </span>
                            </div>
                            <div className="flex items-center space-x-4 text-sm text-abyss-ethereal/70">
                              <div className="flex items-center space-x-1">
                                <Calendar className="h-3 w-3" />
                                <span>{format(new Date(session.startTime), "h:mm a")}</span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <Clock className="h-3 w-3" />
                                <span>{getSessionDuration(session.startTime, session.endTime)}</span>
                              </div>
                              {session.location && (
                                <div className="flex items-center space-x-1">
                                  <MapPin className="h-3 w-3" />
                                  <span className="truncate max-w-20">{session.location}</span>
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-lg font-bold text-abyss-amber">
                              {session.xpEarned || 0} XP
                            </div>
                            <div className="text-xs text-abyss-ethereal/60">
                              {session.endTime ? "Completed" : "In Progress"}
                            </div>
                          </div>
                        </div>
                        
                        {session.notes && (
                          <div className="mt-3 text-sm text-abyss-ethereal/80 bg-abyss-dark/20 rounded p-3 border border-abyss-teal/10">
                            <p className="line-clamp-2">{session.notes}</p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}

            {/* Summary Stats */}
            <Card className="bg-abyss-purple/30 backdrop-blur-sm border-abyss-teal/20">
              <CardContent className="p-4">
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold text-abyss-amber">
                      {sessions.length}
                    </div>
                    <div className="text-sm text-abyss-ethereal/70">Total Sessions</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-abyss-teal">
                      {sessions.reduce((sum: number, session: any) => sum + (session.xpEarned || 0), 0)}
                    </div>
                    <div className="text-sm text-abyss-ethereal/70">Total XP</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-abyss-purple">
                      {sessions.filter((s: any) => s.endTime).length}
                    </div>
                    <div className="text-sm text-abyss-ethereal/70">Completed</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      <BottomNavigation />
    </div>
  );
}