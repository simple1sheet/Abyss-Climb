import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import SkillsDisplay from "@/components/SkillsDisplay";
import CoachFeedback from "@/components/CoachFeedback";
import { useQuery } from "@tanstack/react-query";

export default function Skills() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading } = useAuth();

  const { data: skills = [] } = useQuery({
    queryKey: ["/api/skills"],
  });

  // Redirect to home if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
      return;
    }
  }, [isAuthenticated, isLoading, toast]);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-4xl font-bold text-white mb-2">Skills & Mastery</h1>
          <p className="text-gray-300">Master your climbing techniques to progress deeper into the Abyss</p>
        </div>

        {/* Skills Display */}
        <SkillsDisplay />

        {/* Coach Feedback for Skills */}
        <div className="mt-8">
          <CoachFeedback 
            type="skills" 
            data={skills} 
            triggerText="Get Skills Analysis from AI Coach"
          />
        </div>
      </div>
    </div>
  );
}