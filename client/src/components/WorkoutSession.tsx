import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { CheckCircle, Clock, Target, Brain, Heart, Zap } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { motion, AnimatePresence } from 'framer-motion';

interface Exercise {
  name: string;
  description: string;
  duration: string;
  targetArea: string;
}

interface WorkoutSessionProps {
  workout: {
    id: number;
    workoutType: string;
    title: string;
    description: string;
    duration: number;
    intensity: string;
    intensityRating: number;
    targetAreas: string[];
    exercises: Exercise[];
    xpEarned: number;
    generationReason: string;
    completed: boolean;
  };
  onComplete: (completedWorkout: any) => void;
}

export default function WorkoutSession({ workout, onComplete }: WorkoutSessionProps) {
  const [isActive, setIsActive] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(workout.duration * 60); // Convert to seconds
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [isCompleted, setIsCompleted] = useState(workout.completed);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const completeWorkoutMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest({
        url: `/api/workouts/${workout.id}/complete`,
        method: 'POST',
      });
    },
    onSuccess: (data) => {
      setIsCompleted(true);
      onComplete(data.workout);
      
      // Invalidate relevant caches
      queryClient.invalidateQueries({ queryKey: ['/api/workouts'] });
      queryClient.invalidateQueries({ queryKey: ['/api/auth/user'] });
      queryClient.invalidateQueries({ queryKey: ['/api/layer-progress'] });
      
      toast({
        title: "Workout Complete! 🎉",
        description: `You earned ${data.xpEarned} XP for completing this workout!`,
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to complete workout. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isActive && timeRemaining > 0) {
      interval = setInterval(() => {
        setTimeRemaining(time => time - 1);
      }, 1000);
    } else if (timeRemaining === 0 && isActive) {
      setIsActive(false);
      toast({
        title: "Time's up!",
        description: "Great job completing your workout session!",
      });
    }
    return () => clearInterval(interval);
  }, [isActive, timeRemaining, toast]);

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const getWorkoutIcon = (type: string) => {
    switch (type) {
      case 'stretching':
        return <Heart className="w-5 h-5" />;
      case 'meditation':
        return <Brain className="w-5 h-5" />;
      case 'strength':
        return <Zap className="w-5 h-5" />;
      case 'combo':
        return <Target className="w-5 h-5" />;
      default:
        return <Target className="w-5 h-5" />;
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

  const progress = ((workout.duration * 60 - timeRemaining) / (workout.duration * 60)) * 100;

  return (
    <div className="space-y-6">
      {/* Workout Header */}
      <Card className="bg-layer-gradient backdrop-blur-sm border-abyss-teal/20">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-abyss-teal/20 rounded-lg">
                {getWorkoutIcon(workout.workoutType)}
              </div>
              <div>
                <CardTitle className="text-abyss-ethereal">{workout.title}</CardTitle>
                <p className="text-abyss-muted text-sm mt-1">{workout.description}</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Badge className={`${getIntensityColor(workout.intensity)} text-white`}>
                {workout.intensity.toUpperCase()}
              </Badge>
              <Badge variant="outline" className="text-abyss-amber border-abyss-amber">
                {workout.xpEarned} XP
              </Badge>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Generation Reason */}
      <Card className="bg-layer-gradient backdrop-blur-sm border-abyss-teal/20">
        <CardContent className="pt-6">
          <div className="flex items-start space-x-3">
            <Brain className="w-5 h-5 text-abyss-teal mt-0.5" />
            <div>
              <p className="text-sm font-medium text-abyss-ethereal">AI Recommendation</p>
              <p className="text-sm text-abyss-muted mt-1">{workout.generationReason}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Timer and Controls */}
      <Card className="bg-layer-gradient backdrop-blur-sm border-abyss-teal/20">
        <CardContent className="pt-6">
          <div className="text-center space-y-4">
            <div className="text-4xl font-bold text-abyss-ethereal">
              {formatTime(timeRemaining)}
            </div>
            <Progress value={progress} className="h-2" />
            <div className="flex justify-center space-x-3">
              {!isCompleted ? (
                <>
                  <Button
                    onClick={() => setIsActive(!isActive)}
                    variant={isActive ? "secondary" : "default"}
                    className="bg-abyss-teal hover:bg-abyss-teal/80"
                  >
                    {isActive ? 'Pause' : 'Start'}
                  </Button>
                  <Button
                    onClick={() => completeWorkoutMutation.mutate()}
                    disabled={completeWorkoutMutation.isPending}
                    className="bg-abyss-amber hover:bg-abyss-amber/80 text-abyss-dark"
                  >
                    {completeWorkoutMutation.isPending ? 'Completing...' : 'Complete Workout'}
                  </Button>
                </>
              ) : (
                <div className="flex items-center space-x-2 text-green-500">
                  <CheckCircle className="w-5 h-5" />
                  <span className="font-medium">Workout Completed!</span>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Target Areas */}
      <Card className="bg-layer-gradient backdrop-blur-sm border-abyss-teal/20">
        <CardHeader>
          <CardTitle className="text-abyss-ethereal text-lg">Target Areas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {workout.targetAreas.map((area, index) => (
              <Badge key={index} variant="outline" className="text-abyss-teal border-abyss-teal">
                {area}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Exercises */}
      <Card className="bg-layer-gradient backdrop-blur-sm border-abyss-teal/20">
        <CardHeader>
          <CardTitle className="text-abyss-ethereal text-lg">Exercises</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {workout.exercises.map((exercise, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`p-4 rounded-lg border ${
                  index === currentExerciseIndex && isActive
                    ? 'bg-abyss-teal/10 border-abyss-teal'
                    : 'bg-abyss-dark/50 border-abyss-teal/20'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-abyss-ethereal">{exercise.name}</h4>
                  <div className="flex items-center space-x-2">
                    <Badge variant="outline" className="text-xs">
                      {exercise.duration}
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      {exercise.targetArea}
                    </Badge>
                  </div>
                </div>
                <p className="text-sm text-abyss-muted">{exercise.description}</p>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}