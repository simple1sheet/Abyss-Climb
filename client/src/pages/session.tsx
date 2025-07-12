import { useState } from "react";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/hooks/useAuth";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import SessionTracker from "@/components/SessionTracker";

export default function Session() {
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [sessionType, setSessionType] = useState<"indoor" | "outdoor" | "">("");
  const [location, setLocationValue] = useState("");
  const [activeSessionId, setActiveSessionId] = useState<number | null>(null);

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
      setActiveSessionId(session.id);
      toast({
        title: "Session Started",
        description: "Your climbing session has begun!",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to start session. Please try again.",
        variant: "destructive",
      });
    },
  });

  const endSessionMutation = useMutation({
    mutationFn: async (sessionId: number) => {
      const response = await apiRequest("PATCH", `/api/sessions/${sessionId}`, {
        endTime: new Date().toISOString(),
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/sessions"] });
      toast({
        title: "Session Ended",
        description: "Your climbing session has been saved!",
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

  const handleStartSession = () => {
    if (!sessionType || !location) {
      toast({
        title: "Missing Information",
        description: "Please select session type and location.",
        variant: "destructive",
      });
      return;
    }

    createSessionMutation.mutate({ sessionType, location });
  };

  const handleEndSession = () => {
    if (activeSessionId) {
      endSessionMutation.mutate(activeSessionId);
    }
  };

  return (
    <div className="max-w-md mx-auto bg-abyss-gradient min-h-screen relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-10 right-10 w-32 h-32 bg-abyss-amber rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 left-10 w-40 h-40 bg-abyss-teal rounded-full blur-3xl"></div>
      </div>

      {/* Header */}
      <header className="relative z-20 px-6 pt-12 pb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setLocation("/")}
              className="text-abyss-amber hover:text-abyss-ethereal transition-colors"
            >
              <i className="fas fa-arrow-left text-xl"></i>
            </button>
            <h1 className="text-lg font-semibold text-abyss-ethereal">
              {activeSessionId ? "Active Session" : "Start Session"}
            </h1>
          </div>
          {activeSessionId && (
            <Button
              onClick={handleEndSession}
              className="bg-abyss-amber hover:bg-abyss-amber/90 text-abyss-dark font-semibold"
              disabled={endSessionMutation.isPending}
            >
              End Session
            </Button>
          )}
        </div>
      </header>

      {/* Main Content */}
      <div className="relative z-10 px-6 pb-24">
        {!activeSessionId ? (
          <Card className="bg-abyss-purple/30 backdrop-blur-sm border-abyss-teal/20 depth-layer">
            <CardHeader>
              <CardTitle className="text-abyss-ethereal">Session Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label className="text-abyss-ethereal">Session Type</Label>
                <Select value={sessionType} onValueChange={setSessionType}>
                  <SelectTrigger className="bg-[#1a1a1a] border-abyss-teal/30 text-abyss-ethereal">
                    <SelectValue placeholder="Select session type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="indoor">Indoor Gym</SelectItem>
                    <SelectItem value="outdoor">Outdoor Crag</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-abyss-ethereal">Location</Label>
                <Input
                  value={location}
                  onChange={(e) => setLocationValue(e.target.value)}
                  placeholder="Enter location name"
                  className="bg-[#1a1a1a] border-abyss-teal/30 text-abyss-ethereal placeholder:text-abyss-ethereal/50"
                />
              </div>

              <Button
                onClick={handleStartSession}
                className="w-full bg-abyss-amber hover:bg-abyss-amber/90 text-abyss-dark font-semibold py-3 abyss-glow"
                disabled={createSessionMutation.isPending}
              >
                {createSessionMutation.isPending ? "Starting..." : "Start Session"}
              </Button>
            </CardContent>
          </Card>
        ) : (
          <SessionTracker sessionId={activeSessionId} />
        )}
      </div>
    </div>
  );
}
