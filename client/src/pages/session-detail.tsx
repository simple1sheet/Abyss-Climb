import { useParams, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, Clock, Calendar, MapPin, Target, Trophy, Star, Zap } from "lucide-react";
import { format } from "date-fns";
import BottomNavigation from "@/components/BottomNavigation";
import { XPDisplay } from "@/components/XPDisplay";

export default function SessionDetail() {
  const { id } = useParams();
  const [, setLocation] = useLocation();

  const { data: session, isLoading: isLoadingSession } = useQuery({
    queryKey: ["/api/sessions", id],
    enabled: !!id,
  });

  const { data: problems, isLoading: isLoadingProblems } = useQuery({
    queryKey: ["/api/sessions", id, "problems"],
    enabled: !!id,
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

  const getGradeColor = (grade: string) => {
    const gradeNum = parseInt(grade.replace(/\D/g, ""));
    if (gradeNum <= 2) return "bg-green-500/20 text-green-400 border-green-500/30";
    if (gradeNum <= 4) return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
    if (gradeNum <= 6) return "bg-orange-500/20 text-orange-400 border-orange-500/30";
    return "bg-red-500/20 text-red-400 border-red-500/30";
  };

  if (isLoadingSession) {
    return (
      <div className="max-w-md mx-auto bg-abyss-gradient min-h-screen relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 right-10 w-32 h-32 bg-abyss-amber rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 left-10 w-40 h-40 bg-abyss-teal rounded-full blur-3xl"></div>
        </div>

        <header className="relative z-20 px-6 pt-12 pb-6">
          <div className="flex items-center space-x-3">
            <Button
              onClick={() => setLocation("/")}
              variant="ghost"
              size="sm"
              className="text-abyss-amber hover:text-abyss-ethereal"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-lg font-semibold text-abyss-ethereal">Session Details</h1>
          </div>
        </header>

        <div className="relative z-10 px-6 pb-24 space-y-6">
          <Card className="bg-abyss-purple/30 backdrop-blur-sm border-abyss-teal/20">
            <CardContent className="p-6">
              <Skeleton className="h-8 w-32 mb-4" />
              <Skeleton className="h-4 w-48 mb-2" />
              <Skeleton className="h-4 w-36" />
            </CardContent>
          </Card>
        </div>

        <BottomNavigation />
      </div>
    );
  }

  if (!session) {
    return (
      <div className="max-w-md mx-auto bg-abyss-gradient min-h-screen relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 right-10 w-32 h-32 bg-abyss-amber rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 left-10 w-40 h-40 bg-abyss-teal rounded-full blur-3xl"></div>
        </div>

        <header className="relative z-20 px-6 pt-12 pb-6">
          <div className="flex items-center space-x-3">
            <Button
              onClick={() => setLocation("/")}
              variant="ghost"
              size="sm"
              className="text-abyss-amber hover:text-abyss-ethereal"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-lg font-semibold text-abyss-ethereal">Session Details</h1>
          </div>
        </header>

        <div className="relative z-10 px-6 pb-24">
          <Card className="bg-abyss-purple/30 backdrop-blur-sm border-abyss-teal/20">
            <CardContent className="p-6 text-center">
              <Target className="h-12 w-12 mx-auto mb-3 text-abyss-ethereal/50" />
              <h2 className="text-xl font-semibold text-abyss-ethereal mb-2">Session Not Found</h2>
              <p className="text-abyss-ethereal/70 mb-4">
                The session you're looking for doesn't exist or has been deleted.
              </p>
              <Button
                onClick={() => setLocation("/")}
                className="bg-abyss-amber/20 text-abyss-amber hover:bg-abyss-amber/30"
              >
                Go Back Home
              </Button>
            </CardContent>
          </Card>
        </div>

        <BottomNavigation />
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto bg-abyss-gradient min-h-screen relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-10 right-10 w-32 h-32 bg-abyss-amber rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 left-10 w-40 h-40 bg-abyss-teal rounded-full blur-3xl"></div>
      </div>

      {/* Header */}
      <header className="relative z-20 px-6 pt-12 pb-6">
        <div className="flex items-center space-x-3">
          <Button
            onClick={() => setLocation("/")}
            variant="ghost"
            size="sm"
            className="text-abyss-amber hover:text-abyss-ethereal"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-lg font-semibold text-abyss-ethereal">Session Details</h1>
        </div>
      </header>

      {/* Main Content */}
      <div className="relative z-10 px-6 pb-24 space-y-6">
        {/* Session Header */}
        <Card className="bg-abyss-purple/30 backdrop-blur-sm border-abyss-teal/20 depth-layer">
          <CardContent className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-2">
                  <Badge className={getSessionTypeColor(session.sessionType)}>
                    {session.sessionType}
                  </Badge>
                  <span className="text-sm text-abyss-ethereal/70">
                    {format(new Date(session.startTime), "EEEE, MMM dd, yyyy")}
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
                <div className="flex items-center space-x-1 justify-end mb-1">
                  <Zap className="h-5 w-5 text-abyss-amber" />
                  <span className="text-2xl font-bold text-abyss-amber">
                    {session.xpEarned || 0} XP
                  </span>
                </div>
                <div className="text-sm text-abyss-ethereal/60">
                  {session.endTime ? "Completed" : "In Progress"}
                </div>
              </div>
            </div>
            
            {session.notes && (
              <div className="mt-4 p-4 bg-abyss-dark/20 rounded-lg border border-abyss-teal/20">
                <p className="text-sm text-abyss-ethereal/80">{session.notes}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Boulder Problems */}
        <Card className="bg-abyss-purple/30 backdrop-blur-sm border-abyss-teal/20 depth-layer">
          <CardHeader>
            <CardTitle className="text-abyss-ethereal flex items-center space-x-2">
              <Target className="h-5 w-5" />
              <span>Boulder Problems</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 pt-0">
            {isLoadingProblems ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="p-4 bg-abyss-dark/20 rounded-lg">
                    <Skeleton className="h-6 w-16 mb-2" />
                    <Skeleton className="h-4 w-32" />
                  </div>
                ))}
              </div>
            ) : problems && problems.length > 0 ? (
              <div className="space-y-4">
                {problems.map((problem: any) => (
                  <div
                    key={problem.id}
                    className="p-4 bg-abyss-dark/20 rounded-lg border border-abyss-teal/20"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <Badge className={getGradeColor(problem.grade)}>
                          {problem.grade}
                        </Badge>
                        <span className="text-sm text-abyss-ethereal/70 capitalize">
                          {problem.style}
                        </span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <XPDisplay xpEarned={problem.xpEarned || 0} size="sm" />
                        <div className="flex items-center space-x-1">
                          {problem.completed ? (
                            <Trophy className="h-4 w-4 text-abyss-amber" />
                          ) : (
                            <Star className="h-4 w-4 text-abyss-ethereal/50" />
                          )}
                          <span className="text-sm text-abyss-ethereal/70">
                            {problem.attempts} attempts
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-4 text-xs text-abyss-ethereal/60">
                      <span className="capitalize">{problem.holdType}</span>
                      <span>{problem.wallAngle}</span>
                      <span className="capitalize">{problem.gradeSystem}</span>
                    </div>
                    
                    {problem.notes && (
                      <div className="mt-2 text-sm text-abyss-ethereal/80">
                        {problem.notes}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-abyss-ethereal/70">
                <Target className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>No problems logged for this session</p>
                <p className="text-sm text-abyss-ethereal/50 mt-2">
                  Start climbing to earn XP!
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <BottomNavigation />
    </div>
  );
}