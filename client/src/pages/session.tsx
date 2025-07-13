import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/hooks/useAuth";
import { useSession } from "@/hooks/useSession";
import SessionTracker from "@/components/SessionTracker";
import SessionControls from "@/components/SessionControls";
import BottomNavigation from "@/components/BottomNavigation";

export default function Session() {
  const { user } = useAuth();
  const { activeSession, createSessionMutation, isLoadingSession } = useSession();
  
  const [sessionType, setSessionType] = useState<"indoor" | "outdoor" | "">("");
  const [location, setLocationValue] = useState("");

  const handleCreateSession = () => {
    if (!sessionType || !location) {
      return;
    }
    
    createSessionMutation.mutate({ sessionType, location });
    
    // Clear form after successful creation
    setSessionType("");
    setLocationValue("");
  };

  // Show loading state while checking for active session
  if (isLoadingSession) {
    return (
      <div className="max-w-md mx-auto bg-abyss-gradient min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-abyss-amber mx-auto"></div>
          <p className="text-abyss-ethereal/70 mt-2">Loading session...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="max-w-md mx-auto bg-abyss-gradient min-h-screen flex items-center justify-center">
        <div className="text-abyss-ethereal">Please log in to start a session.</div>
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
        <h1 className="text-lg font-semibold text-abyss-ethereal">
          {activeSession ? "Active Session" : "Start Session"}
        </h1>
      </header>

      {/* Main Content */}
      <div className="relative z-10 px-6 pb-24">
        {activeSession ? (
          <div className="space-y-6">
            <SessionControls />
            <SessionTracker sessionId={activeSession.id} />
          </div>
        ) : (
          <Card className="bg-abyss-purple/30 backdrop-blur-sm border-abyss-teal/20 mb-6">
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
                onClick={handleCreateSession}
                className="w-full bg-abyss-amber hover:bg-abyss-amber/90 text-abyss-dark font-semibold py-3 abyss-glow"
                disabled={createSessionMutation.isPending}
              >
                {createSessionMutation.isPending ? "Starting..." : "Start Session"}
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
      
      <BottomNavigation />
    </div>
  );
}