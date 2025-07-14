import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";
import { GradeSystemProvider } from "@/hooks/useGradeSystem";
import ErrorBoundary from "@/components/ErrorBoundary";
import NotFound from "@/pages/not-found";
import Landing from "@/pages/landing";
import Home from "@/pages/home";
import Session from "@/pages/session";
import SessionDetail from "@/pages/session-detail";
import Sessions from "@/pages/sessions";
import Quests from "@/pages/quests";
import Progress from "@/pages/progress";
import Profile from "@/pages/profile";
import LayerOverview from "@/pages/layer-overview";
import WhistleOverview from "@/pages/whistle-overview";
import WorkoutPage from "@/pages/workout";
import Skills from "@/pages/skills";
import SessionForm from "@/components/SessionForm";
import AbyssMap from "@/components/AbyssMap";

function Router() {
  const { isAuthenticated, isLoading } = useAuth();

  return (
    <Switch>
      {isLoading || !isAuthenticated ? (
        <Route path="/" component={Landing} />
      ) : (
        <>
          <Route path="/" component={Home} />
          <Route path="/session" component={Session} />
          <Route path="/session/new" component={SessionForm} />
          <Route path="/session/:id" component={SessionDetail} />
          <Route path="/sessions" component={Sessions} />
          <Route path="/quests" component={Quests} />
          <Route path="/progress" component={Progress} />
          <Route path="/layers" component={LayerOverview} />
          <Route path="/abyss-map" component={AbyssMap} />
          <Route path="/whistles" component={WhistleOverview} />
          <Route path="/workout" component={WorkoutPage} />
          <Route path="/skills" component={Skills} />
          <Route path="/profile" component={Profile} />
        </>
      )}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <GradeSystemProvider>
            <Toaster />
            <Router />
          </GradeSystemProvider>
        </TooltipProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;
