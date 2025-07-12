import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useSession } from "@/hooks/useSession";
import { useLocation } from "wouter";

export default function SessionControls() {
  const { activeSession, formatDuration, pauseSessionMutation, endSessionMutation } = useSession();
  const [, setLocation] = useLocation();

  if (!activeSession) return null;

  const getStatusColor = () => {
    switch (activeSession.status) {
      case "active":
        return "bg-green-500";
      case "paused":
        return "bg-yellow-500";
      default:
        return "bg-gray-500";
    }
  };

  const getStatusText = () => {
    switch (activeSession.status) {
      case "active":
        return "Active";
      case "paused":
        return "Paused";
      default:
        return "Unknown";
    }
  };

  return (
    <Card className="bg-abyss-purple/30 backdrop-blur-sm border-abyss-teal/20">
      <CardHeader>
        <CardTitle className="text-abyss-ethereal flex items-center justify-between">
          <span>Session Controls</span>
          <Badge className={`${getStatusColor()} text-white`}>
            {getStatusText()}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-center">
          <div className="text-2xl font-bold text-abyss-amber mb-1">
            {formatDuration(activeSession)}
          </div>
          <div className="text-sm text-abyss-ethereal/70">
            {activeSession.sessionType} • {activeSession.location}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {activeSession.status === "active" ? (
            <Button
              onClick={() => pauseSessionMutation.mutate(activeSession.id)}
              disabled={pauseSessionMutation.isPending}
              variant="outline"
              className="border-yellow-500 text-yellow-500 hover:bg-yellow-500/10"
            >
              {pauseSessionMutation.isPending ? "Pausing..." : "Pause"}
            </Button>
          ) : (
            <Button
              onClick={() => setLocation("/session")}
              variant="outline"
              className="border-abyss-amber text-abyss-amber hover:bg-abyss-amber/10"
            >
              Resume
            </Button>
          )}

          <Button
            onClick={() => endSessionMutation.mutate(activeSession.id)}
            disabled={endSessionMutation.isPending}
            variant="destructive"
          >
            {endSessionMutation.isPending ? "Ending..." : "End Session"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}