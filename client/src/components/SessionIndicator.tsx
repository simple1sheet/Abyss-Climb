import React from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useLocation } from "wouter";
import { useSession } from "@/hooks/useSession";

function SessionIndicator() {
  const [, setLocation] = useLocation();
  const { activeSession, formatDuration, resumeSessionMutation } = useSession();

  const handleResumeSession = () => {
    if (activeSession) {
      if (activeSession.status === "paused") {
        resumeSessionMutation.mutate(activeSession.id);
      } else {
        setLocation("/session");
      }
    }
  };

  const handleViewSession = () => {
    setLocation("/session");
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
      return "bg-yellow-500/20 border-yellow-500/20";
    }
    return "bg-green-500/20 border-green-500/20";
  };

  // Only show indicator if there's an active or paused session (not completed)
  if (!activeSession || activeSession.status === "completed") {
    return null;
  }

  return (
    <Card className={`${getSessionStatusColor()} backdrop-blur-sm border mb-4`}>
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
          <div className="flex items-center space-x-2">
            {activeSession.status === "paused" && (
              <Button
                onClick={handleResumeSession}
                size="sm"
                className="bg-green-500/20 text-green-400 hover:bg-green-500/30"
                disabled={resumeSessionMutation.isPending}
              >
                {resumeSessionMutation.isPending ? "Resuming..." : "Resume"}
              </Button>
            )}
            <Button
              onClick={handleViewSession}
              size="sm"
              className="bg-abyss-amber hover:bg-abyss-amber/90 text-abyss-dark font-semibold"
            >
              View Session
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default React.memo(SessionIndicator);