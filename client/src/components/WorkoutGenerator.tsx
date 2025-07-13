import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Brain, Zap, Heart, Target, Sparkles, ArrowRight } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { motion, AnimatePresence } from 'framer-motion';

interface GeneratedWorkout {
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
  xpReward: number;
  generationReason: string;
}

interface WorkoutGeneratorProps {
  onWorkoutGenerated: (workout: any) => void;
}

export default function WorkoutGenerator({ onWorkoutGenerated }: WorkoutGeneratorProps) {
  const [generatedWorkout, setGeneratedWorkout] = useState<GeneratedWorkout | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const generateWorkoutMutation = useMutation({
    mutationFn: async () => {
      console.log("Making API request to generate workout...");
      const response = await apiRequest('POST', '/api/workouts/generate');
      console.log("API response received:", response);
      console.log("Response type:", typeof response);
      console.log("Response keys:", Object.keys(response || {}));
      return response;
    },
    onSuccess: (data) => {
      console.log("Workout generation successful, data received:", data);
      
      // Development-time check for missing workoutType
      if (import.meta.env.DEV && !data.workoutType) {
        console.error('Development Error: Generated workout missing workoutType:', data);
        throw new Error('Generated workout is missing required workoutType field');
      }
      
      setGeneratedWorkout(data);
      toast({
        title: "Workout Generated!",
        description: "Your personalized workout is ready based on your current stats and needs.",
      });
    },
    onError: (error) => {
      console.error("Workout generation failed:", error);
      toast({
        title: "Error",
        description: "Failed to generate workout. Please try again.",
        variant: "destructive",
      });
    },
  });

  const startWorkoutMutation = useMutation({
    mutationFn: async (workoutData: GeneratedWorkout) => {
      return await apiRequest('POST', '/api/workouts', workoutData);
    },
    onSuccess: (data) => {
      onWorkoutGenerated(data);
      queryClient.invalidateQueries({ queryKey: ['/api/workouts'] });
      toast({
        title: "Workout Started!",
        description: "Your workout session has begun. Good luck!",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to start workout. Please try again.",
        variant: "destructive",
      });
    },
  });

  const getWorkoutIcon = (type: string) => {
    switch (type) {
      case 'stretching':
        return <Heart className="w-6 h-6" />;
      case 'meditation':
        return <Brain className="w-6 h-6" />;
      case 'strength':
        return <Zap className="w-6 h-6" />;
      case 'combo':
        return <Target className="w-6 h-6" />;
      default:
        return <Target className="w-6 h-6" />;
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

  const getWorkoutTypeColor = (type: string) => {
    switch (type) {
      case 'stretching':
        return 'text-green-400';
      case 'meditation':
        return 'text-purple-400';
      case 'strength':
        return 'text-red-400';
      case 'combo':
        return 'text-blue-400';
      default:
        return 'text-gray-400';
    }
  };

  return (
    <div className="space-y-6">
      {/* Generate Workout Card */}
      <Card className="bg-layer-gradient backdrop-blur-sm border-abyss-teal/20">
        <CardHeader>
          <CardTitle className="text-abyss-ethereal flex items-center space-x-2">
            <Sparkles className="w-5 h-5 text-abyss-amber" />
            <span>AI Workout Generator</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center space-y-4">
            <p className="text-abyss-muted">
              Get a personalized workout based on your climbing stats, recent activity, and weaknesses.
            </p>
            <Button
              onClick={() => generateWorkoutMutation.mutate()}
              disabled={generateWorkoutMutation.isPending}
              className="bg-abyss-teal hover:bg-abyss-teal/80"
            >
              {generateWorkoutMutation.isPending ? (
                <>
                  <Brain className="w-4 h-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Brain className="w-4 h-4 mr-2" />
                  Generate Workout
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Loading State */}
      {generateWorkoutMutation.isPending && (
        <Card className="bg-layer-gradient backdrop-blur-sm border-abyss-teal/20">
          <CardContent className="pt-6">
            <div className="space-y-4">
              <Skeleton className="h-8 w-3/4" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-2/3" />
              <div className="flex space-x-2">
                <Skeleton className="h-6 w-16" />
                <Skeleton className="h-6 w-20" />
                <Skeleton className="h-6 w-12" />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Generated Workout */}
      <AnimatePresence>
        {generatedWorkout && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="bg-layer-gradient backdrop-blur-sm border-abyss-teal/20">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-abyss-teal/20 rounded-lg">
                      {getWorkoutIcon(generatedWorkout.workoutType || 'combo')}
                    </div>
                    <div>
                      <CardTitle className="text-abyss-ethereal">{generatedWorkout.title || 'Personalized Workout'}</CardTitle>
                      <p className={`text-sm font-medium ${getWorkoutTypeColor(generatedWorkout.workoutType || 'combo')}`}>
                        {(generatedWorkout.workoutType || 'combo').toUpperCase()} WORKOUT
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge className={`${getIntensityColor(generatedWorkout.intensity || 'medium')} text-white`}>
                      {(generatedWorkout.intensity || 'medium').toUpperCase()}
                    </Badge>
                    <Badge variant="outline" className="text-abyss-amber border-abyss-amber">
                      {generatedWorkout.xpReward || 50} XP
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <p className="text-abyss-muted">{generatedWorkout.description || 'A customized workout based on your climbing profile.'}</p>
                  
                  {/* AI Recommendation */}
                  <div className="bg-abyss-dark/50 p-4 rounded-lg border border-abyss-teal/20">
                    <div className="flex items-start space-x-3">
                      <Brain className="w-5 h-5 text-abyss-teal mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-abyss-ethereal">AI Recommendation</p>
                        <p className="text-sm text-abyss-muted mt-1">{generatedWorkout.generationReason || 'Generated based on your climbing profile.'}</p>
                      </div>
                    </div>
                  </div>

                  {/* Workout Details */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-abyss-dark/50 p-3 rounded-lg">
                      <p className="text-sm text-abyss-muted">Duration</p>
                      <p className="text-lg font-semibold text-abyss-ethereal">{generatedWorkout.duration || 20} min</p>
                    </div>
                    <div className="bg-abyss-dark/50 p-3 rounded-lg">
                      <p className="text-sm text-abyss-muted">Exercises</p>
                      <p className="text-lg font-semibold text-abyss-ethereal">{generatedWorkout.exercises?.length || 0}</p>
                    </div>
                  </div>

                  {/* Target Areas */}
                  <div>
                    <p className="text-sm font-medium text-abyss-ethereal mb-2">Target Areas</p>
                    <div className="flex flex-wrap gap-2">
                      {(generatedWorkout.targetAreas || ['general']).map((area, index) => (
                        <Badge key={index} variant="outline" className="text-abyss-teal border-abyss-teal">
                          {area}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* Exercises Preview */}
                  <div>
                    <p className="text-sm font-medium text-abyss-ethereal mb-2">Exercises</p>
                    <div className="space-y-2">
                      {(generatedWorkout.exercises || []).slice(0, 3).map((exercise, index) => (
                        <div key={index} className="flex items-center justify-between p-2 bg-abyss-dark/50 rounded">
                          <span className="text-sm text-abyss-ethereal">{exercise.name || 'Exercise'}</span>
                          <span className="text-xs text-abyss-muted">{exercise.duration || '1 min'}</span>
                        </div>
                      ))}
                      {(generatedWorkout.exercises || []).length > 3 && (
                        <p className="text-xs text-abyss-muted text-center">
                          +{(generatedWorkout.exercises || []).length - 3} more exercises
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Start Workout Button */}
                  <div className="pt-4">
                    <Button
                      onClick={() => startWorkoutMutation.mutate(generatedWorkout)}
                      disabled={startWorkoutMutation.isPending}
                      className="w-full bg-abyss-amber hover:bg-abyss-amber/80 text-abyss-dark"
                    >
                      {startWorkoutMutation.isPending ? (
                        'Starting Workout...'
                      ) : (
                        <>
                          Start Workout
                          <ArrowRight className="w-4 h-4 ml-2" />
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}