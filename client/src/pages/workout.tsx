import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft, Calendar, Clock, Zap, Target, History, Brain } from 'lucide-react';
import { useLocation } from 'wouter';
import { format } from 'date-fns';
import WorkoutGenerator from '@/components/WorkoutGenerator';
import WorkoutSession from '@/components/WorkoutSession';
import BottomNavigation from '@/components/BottomNavigation';
import SessionIndicator from '@/components/SessionIndicator';
import { motion } from 'framer-motion';

interface WorkoutSessionData {
  id: number;
  workoutType: string;
  title: string;
  description: string;
  duration: number;
  intensity: string;
  intensityRating: number;
  targetAreas: string[];
  exercises: Array<{
    name: string;
    description: string;
    duration: string;
    targetArea: string;
  }>;
  xpEarned: number;
  completed: boolean;
  generationReason: string;
  createdAt: string;
  completedAt: string | null;
}

export default function WorkoutPage() {
  const [, setLocation] = useLocation();
  const [currentWorkout, setCurrentWorkout] = useState<WorkoutSessionData | null>(null);
  const [activeTab, setActiveTab] = useState('generator');

  const { data: workoutHistory, isLoading: isLoadingHistory } = useQuery<WorkoutSessionData[]>({
    queryKey: ['/api/workouts'],
    queryFn: async () => {
      const response = await fetch('/api/workouts');
      if (!response.ok) throw new Error('Failed to fetch workouts');
      return response.json();
    },
  });

  const handleWorkoutGenerated = (workout: WorkoutSessionData) => {
    setCurrentWorkout(workout);
    setActiveTab('session');
  };

  const handleWorkoutCompleted = (completedWorkout: WorkoutSessionData) => {
    setCurrentWorkout(completedWorkout);
    // Could add confetti or celebration animation here
  };

  const getWorkoutTypeColor = (type: string) => {
    switch (type) {
      case 'stretching':
        return 'text-green-400 bg-green-400/10';
      case 'meditation':
        return 'text-purple-400 bg-purple-400/10';
      case 'strength':
        return 'text-red-400 bg-red-400/10';
      case 'combo':
        return 'text-blue-400 bg-blue-400/10';
      default:
        return 'text-gray-400 bg-gray-400/10';
    }
  };

  const getIntensityColor = (intensity: string) => {
    switch (intensity) {
      case 'low':
        return 'bg-green-500';
      case 'medium':
        return 'bg-yellow-500';
      case 'high':
        return 'bg-orange-500';
      case 'extreme':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  return (
    <div className="min-h-screen nature-background text-abyss-ethereal relative overflow-hidden">
      {/* Moss Overlay */}
      <div className="moss-overlay"></div>
      
      {/* Forest Canopy Shadow */}
      <div className="forest-shadow"></div>
      
      {/* Natural Floating Particles */}
      <div className="nature-spore" style={{left: '10%', animationDelay: '1s'}}></div>
      <div className="nature-spore" style={{left: '40%', animationDelay: '6s'}}></div>
      <div className="nature-spore" style={{left: '70%', animationDelay: '11s'}}></div>
      <div className="nature-spore" style={{left: '90%', animationDelay: '16s'}}></div>
      
      {/* Firefly Particles */}
      <div className="firefly" style={{left: '15%', bottom: '50%', animationDelay: '2s'}}></div>
      <div className="firefly" style={{left: '35%', bottom: '75%', animationDelay: '8s'}}></div>
      <div className="firefly" style={{left: '65%', bottom: '35%', animationDelay: '14s'}}></div>
      <div className="firefly" style={{left: '85%', bottom: '60%', animationDelay: '19s'}}></div>
      
      {/* Layer Fog Effect */}
      <div className="layer-fog"></div>
      
      <div className="relative z-10 container mx-auto px-4 py-6 pb-20">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              onClick={() => setLocation('/')}
              className="text-abyss-ethereal hover:bg-abyss-teal/10"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-abyss-ethereal">Home Workout</h1>
              <p className="text-abyss-muted">AI-powered training for climbers</p>
            </div>
          </div>
          <SessionIndicator />
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-abyss-dark/50 border border-abyss-teal/20">
            <TabsTrigger value="generator" className="data-[state=active]:bg-abyss-teal/20">
              <Brain className="w-4 h-4 mr-2" />
              Generate
            </TabsTrigger>
            <TabsTrigger value="session" disabled={!currentWorkout}>
              <Zap className="w-4 h-4 mr-2" />
              Session
            </TabsTrigger>
            <TabsTrigger value="history">
              <History className="w-4 h-4 mr-2" />
              History
            </TabsTrigger>
          </TabsList>

          <TabsContent value="generator" className="mt-6">
            <WorkoutGenerator onWorkoutGenerated={handleWorkoutGenerated} />
          </TabsContent>

          <TabsContent value="session" className="mt-6">
            {currentWorkout ? (
              <WorkoutSession
                workout={currentWorkout}
                onComplete={handleWorkoutCompleted}
              />
            ) : (
              <Card className="bg-layer-gradient backdrop-blur-sm border-abyss-teal/20">
                <CardContent className="pt-6">
                  <div className="text-center text-abyss-muted">
                    <Target className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>No active workout session</p>
                    <p className="text-sm mt-2">Generate a workout to start your session</p>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="history" className="mt-6">
            <div className="space-y-4">
              {isLoadingHistory ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <Card key={i} className="bg-layer-gradient backdrop-blur-sm border-abyss-teal/20">
                      <CardContent className="pt-6">
                        <div className="space-y-2">
                          <Skeleton className="h-6 w-3/4" />
                          <Skeleton className="h-4 w-full" />
                          <Skeleton className="h-4 w-1/2" />
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : workoutHistory && workoutHistory.length > 0 ? (
                <div className="space-y-4">
                  {workoutHistory.map((workout, index) => (
                    <motion.div
                      key={workout.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <Card className="bg-layer-gradient backdrop-blur-sm border-abyss-teal/20 hover:border-abyss-teal/40 transition-colors">
                        <CardHeader>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <div className={`p-2 rounded-lg ${getWorkoutTypeColor(workout.workoutType)}`}>
                                <Target className="w-4 h-4" />
                              </div>
                              <div>
                                <CardTitle className="text-abyss-ethereal text-lg">{workout.title}</CardTitle>
                                <p className="text-sm text-abyss-muted">
                                  {workout.workoutType.charAt(0).toUpperCase() + workout.workoutType.slice(1)} Workout
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center space-x-2">
                              {workout.completed ? (
                                <Badge className="bg-green-500 text-white">Completed</Badge>
                              ) : (
                                <Badge variant="outline" className="text-abyss-muted">Incomplete</Badge>
                              )}
                              <Badge className={`${getIntensityColor(workout.intensity)} text-white`}>
                                {workout.intensity.toUpperCase()}
                              </Badge>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-3">
                            <p className="text-sm text-abyss-muted">{workout.description}</p>
                            
                            <div className="grid grid-cols-3 gap-4">
                              <div className="flex items-center space-x-2">
                                <Clock className="w-4 h-4 text-abyss-teal" />
                                <span className="text-sm">{workout.duration} min</span>
                              </div>
                              <div className="flex items-center space-x-2">
                                <Zap className="w-4 h-4 text-abyss-amber" />
                                <span className="text-sm">{workout.xpEarned} XP</span>
                              </div>
                              <div className="flex items-center space-x-2">
                                <Calendar className="w-4 h-4 text-abyss-ethereal" />
                                <span className="text-sm">{format(new Date(workout.createdAt), 'MMM dd')}</span>
                              </div>
                            </div>

                            <div className="flex flex-wrap gap-1">
                              {workout.targetAreas.slice(0, 3).map((area, i) => (
                                <Badge key={i} variant="outline" className="text-xs text-abyss-teal border-abyss-teal">
                                  {area}
                                </Badge>
                              ))}
                              {workout.targetAreas.length > 3 && (
                                <Badge variant="outline" className="text-xs text-abyss-muted">
                                  +{workout.targetAreas.length - 3} more
                                </Badge>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <Card className="bg-layer-gradient backdrop-blur-sm border-abyss-teal/20">
                  <CardContent className="pt-6">
                    <div className="text-center text-abyss-muted">
                      <History className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>No workout history</p>
                      <p className="text-sm mt-2">Complete your first workout to see it here</p>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>

      <BottomNavigation />
    </div>
  );
}