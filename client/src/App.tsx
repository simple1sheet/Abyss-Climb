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
import Nanachi from "@/pages/nanachi";
import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from './components/ui/toaster';
import { useAuth } from './hooks/useAuth';
import { useIsMobile } from './hooks/use-mobile';
import ErrorBoundary from './components/ErrorBoundary';

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
          <Route path="/nanachi" component={Nanachi} />
        </>
      )}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  const { user, isLoading } = useAuth();
  const isMobile = useIsMobile();

  useEffect(() => {
    // Set viewport meta tag for mobile optimization
    let viewport = document.querySelector('meta[name="viewport"]');
    if (!viewport) {
      viewport = document.createElement('meta');
      viewport.name = 'viewport';
      document.head.appendChild(viewport);
    }
    viewport.content = 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover';

    // Add mobile-specific body classes
    document.body.classList.add('mobile-optimized');
    if (isMobile) {
      document.body.classList.add('is-mobile');
    }

    // Prevent zoom on double tap
    let lastTouchEnd = 0;
    const preventZoom = (e: TouchEvent) => {
      const now = Date.now();
      if (now - lastTouchEnd <= 300) {
        e.preventDefault();
      }
      lastTouchEnd = now;
    };

    document.addEventListener('touchend', preventZoom, { passive: false });

    return () => {
      document.removeEventListener('touchend', preventZoom);
    };
  }, [isMobile]);
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