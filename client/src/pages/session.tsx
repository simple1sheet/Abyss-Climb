import React from "react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useSession } from "@/hooks/useSession";
import SessionTracker from "@/components/SessionTracker";
import SessionControls from "@/components/SessionControls";
import SessionStartPanel from "@/components/SessionStartPanel";
import BottomNavigation from "@/components/BottomNavigation";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { ArrowLeft } from "lucide-react";
import { useLocation } from "wouter";

function Session() {
  const { user } = useAuth();
  const { activeSession, isLoadingSession } = useSession();
  const [, setLocation] = useLocation();

  // Show loading state while checking for active session
  if (isLoadingSession) {
    return (
      <div className="max-w-md mx-auto bg-abyss-gradient min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" text="Loading session..." />
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
    <ErrorBoundary>
      <div className="max-w-md mx-auto bg-abyss-gradient min-h-screen relative overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 right-10 w-32 h-32 bg-abyss-amber rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 left-10 w-40 h-40 bg-abyss-teal rounded-full blur-3xl"></div>
        </div>

        <div className="relative z-10 container mx-auto px-4 py-6 pb-20">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                onClick={() => setLocation("/")}
                className="text-abyss-ethereal hover:bg-abyss-teal/10"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Home
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-abyss-ethereal">
                  {activeSession ? "Active Session" : "Start Training"}
                </h1>
                <p className="text-abyss-muted">
                  {activeSession ? "Manage your current session" : "Choose your training type"}
                </p>
              </div>
            </div>
          </div>

          {/* Session Content */}
          {activeSession ? (
            <div className="space-y-6">
              <ErrorBoundary>
                <SessionControls />
              </ErrorBoundary>
              <ErrorBoundary>
                <SessionTracker />
              </ErrorBoundary>
            </div>
          ) : (
            <SessionStartPanel />
          )}
        </div>

        <BottomNavigation />
      </div>
    </ErrorBoundary>
  );
}

export default React.memo(Session);