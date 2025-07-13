import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { Trash2, AlertTriangle, Code, Database } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { useLocation } from 'wouter';

export default function DeveloperTools() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [, setLocation] = useLocation();
  const [isResetting, setIsResetting] = useState(false);

  // Only show in development mode
  const isDevelopment = import.meta.env.MODE === 'development';

  const resetDataMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest('POST', '/api/dev/reset-data');
    },
    onSuccess: () => {
      // Clear all cached data
      queryClient.clear();
      
      toast({
        title: "Dev Reset Complete",
        description: "All user data has been reset. Redirecting to home...",
        variant: "default",
      });
      
      console.log("Dev reset complete - all user data cleared");
      
      // Redirect to home after a short delay
      setTimeout(() => {
        setLocation('/');
        window.location.reload();
      }, 1500);
    },
    onError: (error) => {
      console.error("Dev reset failed:", error);
      toast({
        title: "Reset Failed",
        description: "Failed to reset user data. Check console for details.",
        variant: "destructive",
      });
    },
  });

  const handleResetData = async () => {
    setIsResetting(true);
    try {
      await resetDataMutation.mutateAsync();
    } finally {
      setIsResetting(false);
    }
  };

  if (!isDevelopment) {
    return null;
  }

  return (
    <Card className="bg-red-500/10 border-red-500/20">
      <CardHeader>
        <CardTitle className="text-red-400 flex items-center gap-2">
          <Code className="w-5 h-5" />
          Developer Tools
          <Badge variant="destructive" className="ml-2">
            DEV ONLY
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-sm text-red-300/80 mb-4">
          These tools are only available in development mode and will not appear in production builds.
        </div>

        <div className="grid gap-4">
          <div className="bg-red-500/5 border border-red-500/20 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Database className="w-4 h-4 text-red-400" />
              <span className="font-medium text-red-300">Reset User Data</span>
            </div>
            <p className="text-sm text-red-300/70 mb-3">
              This will permanently delete all of your climbing data including sessions, problems, quests, achievements, and workouts. This action cannot be undone.
            </p>
            
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="destructive"
                  size="sm"
                  disabled={isResetting}
                  className="bg-red-600 hover:bg-red-700"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  {isResetting ? "Resetting..." : "Reset My Data"}
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle className="flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-red-500" />
                    Confirm Data Reset
                  </AlertDialogTitle>
                  <AlertDialogDescription>
                    <div>
                      This will permanently delete all of your climbing data including:
                      <ul className="list-disc pl-6 mt-2 space-y-1">
                        <li>All climbing sessions and boulder problems</li>
                        <li>Quest progress and achievements</li>
                        <li>Skill levels and XP progress</li>
                        <li>Workout history and sessions</li>
                        <li>Profile settings and preferences</li>
                      </ul>
                      <br />
                      <strong className="text-red-500">This action cannot be undone.</strong>
                    </div>
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleResetData}
                    className="bg-red-600 hover:bg-red-700"
                  >
                    Yes, Reset All Data
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>

          <div className="bg-gray-500/5 border border-gray-500/20 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="font-medium text-gray-300">Environment Info</span>
            </div>
            <div className="text-sm text-gray-400 space-y-1">
              <div>Mode: {import.meta.env.MODE}</div>
              <div>Dev Mode: {isDevelopment ? 'Yes' : 'No'}</div>
              <div>Build: {import.meta.env.VITE_BUILD_TIME || 'Unknown'}</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}