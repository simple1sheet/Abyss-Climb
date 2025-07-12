import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useLocation } from "wouter";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { useState, useEffect } from "react";

export default function SessionIndicator() {
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [currentTime, setCurrentTime] = useState(new Date());

  const { data: activeSession } = useQuery({
    queryKey: ["/api/sessions/active"],
    enabled: !!user,
  });

  // Update timer every second for active sessions
  useEffect(() => {
    if (activeSession && activeSession.status === "active") {
      const interval = setInterval(() => {
        setCurrentTime(new Date());
      }, 1000); // Update every second for accuracy

      return () => clearInterval(interval);
    }
  }, [activeSession]);

  const resumeSessionMutation = useMutation({
    mutationFn: async (sessionId: number) => {
      const response = await apiRequest("POST", `/api/sessions/${sessionId}/resume`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/sessions/active"] });
      toast({
        title: "Session Resumed",
        description: "Your climbing session has been resumed!",
      });
      setLocation("/session");
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to resume session. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleResumeSession = () => {
    if (activeSession) {
      if (activeSession.status === "paused") {
        resumeSessionMutation.mutate(activeSession.id);
      } else {
        setLocation("/session");
      }
    }
  };

  const getSessionStatusText = () => {
    if (!activeSession) return "";
    
    if (activeSession.status === "paused") {
      return "Session Paused";
    }
    return "Session Active";
  };

  const getSessionStatusColor = () => {
    if (!activeSession) return "";
    
    if (activeSession.status === "paused") {
      return "bg-yellow-500/20 border-yellow-500/30";
    }
    return "bg-green-500/20 border-green-500/30";
  };

  const formatDuration = (session: any) => {
    const start = new Date(session.startTime);
    
    // Calculate total elapsed time from start
    const totalElapsedMs = currentTime.getTime() - start.getTime();
    const totalElapsedMinutes = Math.floor(totalElapsedMs / (1000 * 60));
    
    // Subtract total paused time
    const totalPausedTime = session.totalPausedTime || 0;
    
    // If currently paused, don't add current pause time to active time
    let activeMinutes;
    if (session.status === "paused" && session.pausedAt) {
      // When paused, freeze the timer at the point it was paused
      const pauseStart = new Date(session.pausedAt);
      const timePausedMs = pauseStart.getTime() - start.getTime();
      const timePausedMinutes = Math.floor(timePausedMs / (1000 * 60));
      activeMinutes = Math.max(0, timePausedMinutes - totalPausedTime);
    } else {
      // When active, show real-time counting
      activeMinutes = Math.max(0, totalElapsedMinutes - totalPausedTime);
    }
    
    if (activeMinutes < 60) {
      return `${activeMinutes}m`;
    }
    
    const hours = Math.floor(activeMinutes / 60);
    const minutes = activeMinutes % 60;
    return `${hours}h ${minutes}m`;
  };

  // Only show indicator if there's an active or paused session (not completed)
  if (!activeSession || activeSession.status === "completed") {
    return null;
  }

  return (
    <Card className={`${getSessionStatusColor()} backdrop-blur-sm depth-layer mb-4`}>
      <CardContent className="p-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2">
              <div className={`w-2 h-2 rounded-full ${activeSession.status === "paused" ? "bg-yellow-500" : "bg-green-500"}`}></div>
              <span className="text-sm font-medium text-abyss-ethereal">
                {getSessionStatusText()}
              </span>
            </div>
            <div className="text-xs text-abyss-ethereal/70">
              {activeSession.sessionType} • {formatDuration(activeSession)}
            </div>
          </div>
          <Button
            onClick={handleResumeSession}
            size="sm"
            className="bg-abyss-amber hover:bg-abyss-amber/90 text-abyss-dark font-semibold"
            disabled={resumeSessionMutation.isPending}
          >
            {resumeSessionMutation.isPending ? "Resuming..." : activeSession.status === "paused" ? "Resume" : "Continue"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}