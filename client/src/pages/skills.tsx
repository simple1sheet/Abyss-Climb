import { useAuth } from "@/hooks/useAuth";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import SkillTree from "@/components/SkillTree";
import BottomNavigation from "@/components/BottomNavigation";
import SessionIndicator from "@/components/SessionIndicator";
import { RefreshCw, TreePine } from "lucide-react";

export default function Skills() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: skills, isLoading } = useQuery({
    queryKey: ["/api/skills"],
    enabled: !!user,
  });

  const initializeSkillTree = useMutation({
    mutationFn: async () => {
      return await apiRequest("POST", "/api/skills/initialize", {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/skills"] });
      toast({
        title: "Skill Tree Initialized",
        description: "Your climbing skill tree has been set up!",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to initialize skill tree. Please try again.",
        variant: "destructive",
      });
    },
  });

  const hasNoSkills = skills && skills.length === 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white">
      <SessionIndicator />
      
      <div className="container mx-auto px-4 pb-20 pt-6">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <TreePine className="w-8 h-8 text-green-400" />
            <h1 className="text-3xl font-bold">Climbing Skills</h1>
          </div>
          <p className="text-gray-300 max-w-2xl mx-auto">
            Track your climbing progression across six core skill categories. 
            Each skill develops through practice and gains levels as you climb harder grades.
          </p>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400"></div>
          </div>
        ) : hasNoSkills ? (
          <Card className="max-w-2xl mx-auto bg-slate-800/50 border-slate-700">
            <CardHeader className="text-center">
              <CardTitle className="text-xl">Initialize Your Skill Tree</CardTitle>
            </CardHeader>
            <CardContent className="text-center space-y-4">
              <p className="text-gray-300">
                Your climbing skill tree hasn't been set up yet. 
                Initialize it to start tracking your progression across all climbing disciplines.
              </p>
              <Button
                onClick={() => initializeSkillTree.mutate()}
                disabled={initializeSkillTree.isPending}
                className="bg-green-600 hover:bg-green-700"
              >
                {initializeSkillTree.isPending ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Initializing...
                  </>
                ) : (
                  <>
                    <TreePine className="w-4 h-4 mr-2" />
                    Initialize Skill Tree
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        ) : (
          <SkillTree />
        )}
      </div>

      <BottomNavigation />
    </div>
  );
}