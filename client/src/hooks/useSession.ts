import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { apiRequest } from "@/lib/queryClient";
import { useLocation } from "wouter";

export function useSession() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [, setLocation] = useLocation();
  const [currentTime, setCurrentTime] = useState(new Date());

  // Get active session
  const { data: activeSession, isLoading: isLoadingSession } = useQuery({
    queryKey: ["/api/sessions/active"],
    enabled: !!user,
  });

  // Update timer every second for active sessions only
  useEffect(() => {
    if (activeSession && activeSession.status === "active") {
      const interval = setInterval(() => {
        setCurrentTime(new Date());
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [activeSession]);

  // Session mutations
  const createSessionMutation = useMutation({
    mutationFn: async (data: { sessionType: string; location: string }) => {
      const response = await apiRequest("POST", "/api/sessions", {
        sessionType: data.sessionType,
        location: data.location,
        startTime: new Date().toISOString(),
      });
      return response.json();
    },
    onSuccess: (session) => {
      queryClient.invalidateQueries({ queryKey: ["/api/sessions/active"] });
      toast({
        title: "Session Started",
        description: "Your climbing session has begun!",
      });
      setLocation("/session");
    },
    onError: (error: any) => {
      console.error("Session creation error:", error);
      let errorMessage = "Failed to start session. Please try again.";
      
      try {
        const errorData = typeof error === 'string' ? JSON.parse(error) : error;
        if (errorData.message && errorData.message.includes("active session")) {
          errorMessage = "You already have an active session.";
          // Force refresh the active session query
          queryClient.invalidateQueries({ queryKey: ["/api/sessions/active"] });
        }
      } catch (e) {
        // Keep default error message
      }
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    },
  });

  const endSessionMutation = useMutation({
    mutationFn: async (sessionId: number) => {
      const response = await apiRequest("PATCH", `/api/sessions/${sessionId}`, {
        endTime: new Date().toISOString(),
        status: "completed",
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/sessions/active"] });
      queryClient.invalidateQueries({ queryKey: ["/api/sessions"] });
      toast({
        title: "Session Ended",
        description: "Your climbing session has been completed!",
      });
      setLocation("/");
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to end session. Please try again.",
        variant: "destructive",
      });
    },
  });

  const pauseSessionMutation = useMutation({
    mutationFn: async (sessionId: number) => {
      const response = await apiRequest("POST", `/api/sessions/${sessionId}/pause`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/sessions/active"] });
      toast({
        title: "Session Paused",
        description: "Your session has been paused. You can resume it anytime.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to pause session. Please try again.",
        variant: "destructive",
      });
    },
  });

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
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to resume session. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Timer formatting helper
  const formatDuration = (session: any) => {
    if (!session) return "0m";
    
    const start = new Date(session.startTime);
    const totalElapsedMs = currentTime.getTime() - start.getTime();
    const totalElapsedMinutes = Math.floor(totalElapsedMs / (1000 * 60));
    
    const totalPausedTime = session.totalPausedTime || 0;
    
    let activeMinutes;
    if (session.status === "paused" && session.pausedAt) {
      const pauseStart = new Date(session.pausedAt);
      const timeToPauseMinutes = Math.floor((pauseStart.getTime() - start.getTime()) / (1000 * 60));
      activeMinutes = Math.max(0, timeToPauseMinutes - totalPausedTime);
    } else {
      activeMinutes = Math.max(0, totalElapsedMinutes - totalPausedTime);
    }
    
    if (activeMinutes < 60) {
      return `${activeMinutes}m`;
    }
    
    const hours = Math.floor(activeMinutes / 60);
    const minutes = activeMinutes % 60;
    return `${hours}h ${minutes}m`;
  };

  return {
    activeSession,
    isLoadingSession,
    currentTime,
    createSessionMutation,
    endSessionMutation,
    pauseSessionMutation,
    resumeSessionMutation,
    formatDuration,
  };
}