import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Mountain, Dumbbell, Plus, Play } from 'lucide-react';
import { useLocation } from 'wouter';
import { useSession } from '@/hooks/useSession';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import WorkoutGenerator from './WorkoutGenerator';
import { motion } from 'framer-motion';

export default function SessionStartPanel() {
  const [, setLocation] = useLocation();
  const { activeSession } = useSession();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showWorkoutGenerator, setShowWorkoutGenerator] = useState(false);
  const [generatedWorkout, setGeneratedWorkout] = useState(null);

  const createClimbingSessionMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest({
        url: '/api/sessions',
        method: 'POST',
        body: {
          sessionType: 'indoor',
          location: 'Local Gym',
          duration: 60,
          notes: '',
          startTime: new Date(),
          status: 'active'
        },
      });
    },
    onSuccess: (session) => {
      queryClient.invalidateQueries({ queryKey: ['/api/sessions'] });
      queryClient.invalidateQueries({ queryKey: ['/api/sessions/active'] });
      
      toast({
        title: "Climbing Session Started!",
        description: "Your climbing session is now active. Start logging your boulder problems!",
      });
      
      setLocation('/session');
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to start climbing session. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleWorkoutGenerated = (workout) => {
    setGeneratedWorkout(workout);
    setShowWorkoutGenerator(false);
    
    // Automatically start the workout
    setLocation('/workout');
  };

  const handleStartClimbingSession = () => {
    if (activeSession) {
      // If there's already an active session, go to it
      setLocation('/session');
    } else {
      // Create a new climbing session
      createClimbingSessionMutation.mutate();
    }
  };

  const handleStartHomeWorkout = () => {
    setShowWorkoutGenerator(true);
  };

  return (
    <div className="space-y-6">
      {/* Session Type Selection */}
      <Card className="bg-layer-gradient backdrop-blur-sm border-abyss-teal/20">
        <CardHeader>
          <CardTitle className="text-abyss-ethereal flex items-center space-x-2">
            <Plus className="w-5 h-5 text-abyss-amber" />
            <span>Start Training Session</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="climbing" className="w-full">
            <TabsList className="grid w-full grid-cols-2 bg-abyss-dark/50 border border-abyss-teal/20">
              <TabsTrigger value="climbing" className="data-[state=active]:bg-abyss-teal/20">
                <Mountain className="w-4 h-4 mr-2" />
                Climbing Session
              </TabsTrigger>
              <TabsTrigger value="workout" className="data-[state=active]:bg-abyss-teal/20">
                <Dumbbell className="w-4 h-4 mr-2" />
                Home Workout
              </TabsTrigger>
            </TabsList>

            <TabsContent value="climbing" className="mt-6">
              <div className="space-y-4">
                <div className="text-center space-y-3">
                  <div className="p-4 bg-abyss-dark/50 rounded-lg">
                    <Mountain className="w-12 h-12 text-abyss-teal mx-auto mb-3" />
                    <h3 className="text-lg font-semibold text-abyss-ethereal">Rock Climbing Session</h3>
                    <p className="text-abyss-muted text-sm mt-2">
                      Start an indoor or outdoor climbing session to track your boulder problems, 
                      progress, and earn XP based on your performance.
                    </p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="bg-abyss-dark/30 p-3 rounded-lg">
                      <div className="text-abyss-ethereal font-medium">Track</div>
                      <div className="text-abyss-muted">Problems & Grades</div>
                    </div>
                    <div className="bg-abyss-dark/30 p-3 rounded-lg">
                      <div className="text-abyss-ethereal font-medium">Earn</div>
                      <div className="text-abyss-muted">XP & Achievements</div>
                    </div>
                  </div>

                  <Button
                    onClick={handleStartClimbingSession}
                    disabled={createClimbingSessionMutation.isPending}
                    className="w-full bg-abyss-teal hover:bg-abyss-teal/80 text-white"
                  >
                    {createClimbingSessionMutation.isPending ? (
                      <>
                        <Play className="w-4 h-4 mr-2 animate-spin" />
                        Starting...
                      </>
                    ) : activeSession ? (
                      <>
                        <Play className="w-4 h-4 mr-2" />
                        Continue Session
                      </>
                    ) : (
                      <>
                        <Play className="w-4 h-4 mr-2" />
                        Start Climbing Session
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="workout" className="mt-6">
              <div className="space-y-4">
                {!showWorkoutGenerator ? (
                  <div className="text-center space-y-3">
                    <div className="p-4 bg-abyss-dark/50 rounded-lg">
                      <Dumbbell className="w-12 h-12 text-abyss-amber mx-auto mb-3" />
                      <h3 className="text-lg font-semibold text-abyss-ethereal">Home Workout Session</h3>
                      <p className="text-abyss-muted text-sm mt-2">
                        Get AI-generated workouts based on your climbing stats, weaknesses, and current needs.
                        Perfect for rest days and supplemental training.
                      </p>
                    </div>

                    <div className="grid grid-cols-3 gap-3 text-sm">
                      <div className="bg-green-500/10 p-3 rounded-lg border border-green-500/20">
                        <div className="text-2xl mb-1">🤸</div>
                        <div className="text-green-400 font-medium">Stretching</div>
                      </div>
                      <div className="bg-purple-500/10 p-3 rounded-lg border border-purple-500/20">
                        <div className="text-2xl mb-1">🧘</div>
                        <div className="text-purple-400 font-medium">Meditation</div>
                      </div>
                      <div className="bg-red-500/10 p-3 rounded-lg border border-red-500/20">
                        <div className="text-2xl mb-1">💪</div>
                        <div className="text-red-400 font-medium">Strength</div>
                      </div>
                    </div>

                    <Button
                      onClick={handleStartHomeWorkout}
                      className="w-full bg-abyss-amber hover:bg-abyss-amber/80 text-abyss-dark"
                    >
                      <Dumbbell className="w-4 h-4 mr-2" />
                      Start Home Workout
                    </Button>
                  </div>
                ) : (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <WorkoutGenerator onWorkoutGenerated={handleWorkoutGenerated} />
                    <Button
                      onClick={() => setShowWorkoutGenerator(false)}
                      variant="outline"
                      className="w-full mt-4 border-abyss-teal/30 text-abyss-ethereal hover:bg-abyss-teal/10"
                    >
                      Back to Workout Options
                    </Button>
                  </motion.div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}