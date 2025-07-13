import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";
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
import WhistlesAchievements from "@/pages/whistles-achievements";
import SessionForm from "@/components/SessionForm";

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
          <Route path="/whistles" component={WhistlesAchievements} />
          <Route path="/progress" component={Progress} />
          <Route path="/layers" component={LayerOverview} />
          <Route path="/profile" component={Profile} />
        </>
      )}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
