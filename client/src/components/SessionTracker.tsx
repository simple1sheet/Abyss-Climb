import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { XPDisplay, SessionXPCounter, XPGainAnimation } from "./XPDisplay";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { Trophy, Target, Zap, AlertCircle } from "lucide-react";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { useGradeSystem } from "@/hooks/useGradeSystem";
import { gradeConverter } from "@/utils/gradeConverter";
import { useAchievementNotification } from "@/hooks/useAchievementNotification";
import { useAuth } from "@/hooks/useAuth";
import { useIsMobile } from "@/hooks/use-mobile";

interface SessionTrackerProps {
  sessionId: number;
}

const GRADE_OPTIONS = {
  "V-Scale": ["V0", "V1", "V2", "V3", "V4", "V5", "V6", "V7", "V8", "V9", "V10", "V11", "V12", "V13", "V14", "V15", "V16", "V17"],
  "Font": ["4", "5", "5+", "6A", "6A+", "6B", "6B+", "6C", "6C+", "7A", "7A+", "7B", "7B+", "7C", "7C+", "8A", "8A+", "8B", "8B+"],
  "German": ["3", "4", "5", "6", "6+", "7-", "7", "7+", "8-", "8", "8+", "9-", "9", "9+", "10-", "10", "10+", "11-", "11"],
};

const STYLE_OPTIONS = [
  "Crimps", "Jugs", "Pinches", "Slopers", "Pockets", "Dynos", "Mantles", 
  "Overhangs", "Slabs", "Roofs", "Aretes", "Compression", "Coordination"
];

function SessionTracker({ sessionId }: SessionTrackerProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { gradeSystem: userGradeSystem } = useGradeSystem();
  const { showMultipleAchievementNotifications } = useAchievementNotification();
  const { user } = useAuth();

  const [grade, setGrade] = useState("");
  const [styles, setStyles] = useState<string[]>([]);
  const [completed, setCompleted] = useState(false);
  const [attempts, setAttempts] = useState(1);
  const [notes, setNotes] = useState("");
  const [showXPAnimation, setShowXPAnimation] = useState(false);
  const [lastXPGained, setLastXPGained] = useState(0);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const { data: problems, isLoading } = useQuery({
    queryKey: ["/api/sessions", sessionId, "problems"],
    enabled: !!sessionId,
  });

  const { data: session } = useQuery({
    queryKey: ["/api/sessions", sessionId],
    enabled: !!sessionId,
  });

  const addProblemMutation = useMutation({
    mutationFn: async (problemData: {
      sessionId: number;
      grade: string;
      gradeSystem: string;
      style?: string;
      completed: boolean;
      attempts: number;
      notes?: string;
    }) => {
      return await apiRequest("POST", "/api/problems", problemData);
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/sessions", sessionId, "problems"] });
      queryClient.invalidateQueries({ queryKey: ["/api/sessions", sessionId] });
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      queryClient.invalidateQueries({ queryKey: ["/api/skills"] });
      queryClient.invalidateQueries({ queryKey: ["/api/layer-progress"] });
      queryClient.invalidateQueries({ queryKey: ["/api/whistle-progress"] });
      queryClient.invalidateQueries({ queryKey: ["/api/achievements"] });
      queryClient.invalidateQueries({ queryKey: ["/api/relics"] });
      queryClient.invalidateQueries({ queryKey: ["/api/relics/stats"] });

      // Handle both old format (just problem) and new format (problem + achievements + relic)
      const problem = data.problem || data;
      const achievements = data.newAchievements || [];
      const foundRelic = data.foundRelic;

      // Show XP animation if XP was earned
      if (problem.xpEarned && problem.xpEarned > 0) {
        setLastXPGained(problem.xpEarned);
        setShowXPAnimation(true);
      }

      // Check if notifications are enabled before showing any notifications
      const notificationsEnabled = user?.notificationsEnabled ?? true;

      // Show achievement notifications first
      if (achievements.length > 0 && notificationsEnabled) {
        showMultipleAchievementNotifications(achievements);
      }

      // Show relic notification if found
      if (foundRelic && notificationsEnabled) {
        console.log("🏺 RELIC FOUND! Showing toast notification:", foundRelic);
        toast({
          title: "🏺 Relic Found!",
          description: `${foundRelic.rarity.toUpperCase()}: ${foundRelic.name}`,
          duration: 3000, // Show for 3 seconds
          className: "border-yellow-400 bg-yellow-50 text-yellow-900 text-sm max-w-xs",
        });
      }

      // Show minimal XP notification if XP was earned
      if (problem.xpEarned && notificationsEnabled) {
        setTimeout(() => {
          toast({
            title: `+${problem.xpEarned} XP`,
            description: undefined,
            duration: 1500, // Show for 1.5 seconds
            className: "text-xs bg-black/70 text-white border-none shadow-none max-w-fit px-2 py-1 rounded-full",
          });
        }, foundRelic ? 500 : 0);
      }

      // Reset form
      setGrade("");
      setStyles([]);
      setCompleted(false);
      setAttempts(1);
      setNotes("");
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
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
      toast({
        title: "Error",
        description: "Failed to add problem. Please try again.",
        variant: "destructive",
      });
    },
  });

  const validateForm = () => {
    const errors: Record<string, string> = {};

    if (!grade) {
      errors.grade = "Please select a grade for this problem.";
    }

    if (attempts < 1 || attempts > 50) {
      errors.attempts = "Attempts must be between 1 and 50.";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleAddProblem = () => {
    if (!validateForm()) {
      const firstError = Object.values(formErrors)[0];
      toast({
        title: "Form Error",
        description: firstError,
        variant: "destructive",
      });
      return;
    }

    // Convert grade from user's preferred system to V-Scale for server storage
    const gradeInVScale = gradeConverter.convertGrade(grade, userGradeSystem, 'V-Scale');

    addProblemMutation.mutate({
      sessionId,
      grade: gradeInVScale,
      gradeSystem: 'V-Scale',
      style: styles.length > 0 ? styles.join(', ') : undefined,
      completed,
      attempts,
      notes: notes || undefined,
    });
  };

  // Moved constants to top of file for better organization

  const getGradeColor = (grade: string) => {
    const vGrade = parseInt(grade.replace("V", ""));
    if (vGrade <= 2) return "bg-green-500";
    if (vGrade <= 5) return "bg-yellow-500";
    if (vGrade <= 8) return "bg-orange-500";
    if (vGrade <= 11) return "bg-red-500";
    return "bg-purple-500";
  };

  // Calculate session XP and stats
  const sessionXP = session?.xpEarned || 0;
  const completedProblems = problems?.filter(p => p.completed).length || 0;
  const totalProblems = problems?.length || 0;

  return (
    <div className="space-y-6">
      {/* XP Animation */}
      {showXPAnimation && (
        <XPGainAnimation
          xpGained={lastXPGained}
          onAnimationComplete={() => setShowXPAnimation(false)}
        />
      )}

      {/* Session XP Counter */}
      <SessionXPCounter
        currentXP={sessionXP}
        totalProblems={totalProblems}
        completedProblems={completedProblems}
      />

      {/* Add Problem Form */}
      <Card className="bg-abyss-purple/30 backdrop-blur-sm border-abyss-teal/20 depth-layer">
        <CardHeader>
          <CardTitle className="text-abyss-ethereal">Log Boulder Problem</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-abyss-ethereal">Grade System</Label>
              <div className="bg-[#1a1a1a] border border-abyss-teal/30 rounded-md px-3 py-2">
                <span className="text-abyss-ethereal">{userGradeSystem}</span>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-abyss-ethereal">Grade</Label>
              <Select value={grade} onValueChange={(value) => {
                setGrade(value);
                setFormErrors(prev => ({ ...prev, grade: "" }));
              }}>
                <SelectTrigger className={`bg-[#1a1a1a] border-abyss-teal/30 text-abyss-ethereal ${formErrors.grade ? 'border-red-500' : ''}`}>
                  <SelectValue placeholder="Select grade" />
                </SelectTrigger>
                <SelectContent>
                  {GRADE_OPTIONS[userGradeSystem as keyof typeof GRADE_OPTIONS].map((g) => (
                    <SelectItem key={g} value={g}>
                      {g}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {formErrors.grade && (
                <p className="text-red-400 text-sm flex items-center space-x-1">
                  <AlertCircle className="h-3 w-3" />
                  <span>{formErrors.grade}</span>
                </p>
              )}
            </div>
          </div>

          <div className="space-y-3">
            <Label className="text-abyss-ethereal">Climbing Styles (Optional)</Label>
            <div className="max-h-48 overflow-y-auto bg-[#1a1a1a] border border-abyss-teal/30 rounded-lg p-3">
              <div className="grid grid-cols-2 gap-3">
                {STYLE_OPTIONS.map((styleName) => (
                  <div key={styleName} className="flex items-center space-x-2">
                    <Checkbox
                      id={styleName}
                      checked={styles.includes(styleName)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setStyles([...styles, styleName]);
                        } else {
                          setStyles(styles.filter(s => s !== styleName));
                        }
                      }}
                      className="data-[state=checked]:bg-abyss-amber data-[state=checked]:border-abyss-amber"
                    />
                    <Label htmlFor={styleName} className="text-sm text-abyss-ethereal cursor-pointer">
                      {styleName}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
            {styles.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {styles.map((styleName) => (
                  <Badge key={styleName} variant="secondary" className="text-xs bg-abyss-teal/20 text-abyss-teal">
                    {styleName}
                  </Badge>
                ))}
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-abyss-ethereal">Attempts</Label>
              <Input
                type="number"
                min="1"
                max="50"
                value={attempts}
                onChange={(e) => {
                  const value = parseInt(e.target.value) || 1;
                  setAttempts(value);
                  setFormErrors(prev => ({ ...prev, attempts: "" }));
                }}
                className={`bg-[#1a1a1a] border-abyss-teal/30 text-abyss-ethereal ${formErrors.attempts ? 'border-red-500' : ''}`}
              />
              {formErrors.attempts && (
                <p className="text-red-400 text-sm flex items-center space-x-1">
                  <AlertCircle className="h-3 w-3" />
                  <span>{formErrors.attempts}</span>
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label className="text-abyss-ethereal">Completed</Label>
              <div className="flex items-center space-x-2 mt-2">
                <Switch
                  checked={completed}
                  onCheckedChange={setCompleted}
                  className="data-[state=checked]:bg-abyss-amber"
                />
                <span className="text-sm text-abyss-ethereal/70">
                  {completed ? "Sent!" : "Project"}
                </span>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-abyss-ethereal">Notes (Optional)</Label>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add notes about the climb..."
              className="bg-[#1a1a1a] border-abyss-teal/30 text-abyss-ethereal placeholder:text-abyss-ethereal/50"
            />
          </div>

          <Button
            onClick={handleAddProblem}
            className="w-full bg-abyss-amber hover:bg-abyss-amber/90 text-abyss-dark font-semibold py-3"
            disabled={addProblemMutation.isPending}
          >
            {addProblemMutation.isPending ? "Adding..." : "Add Problem"}
          </Button>
        </CardContent>
      </Card>

      {/* Problems List */}
      <Card className="bg-abyss-purple/30 backdrop-blur-sm border-abyss-teal/20 depth-layer">
        <CardHeader>
          <CardTitle className="text-abyss-ethereal">Session Problems</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="py-8">
              <LoadingSpinner size="md" text="Loading problems..." />
            </div>
          ) : problems && problems.length > 0 ? (
            <div className="space-y-3">
              {problems.map((problem: any) => (
                <div
                  key={problem.id}
                  className="flex items-center justify-between p-3 bg-abyss-dark/30 rounded-lg"
                >
                  <div className="flex items-center space-x-3">
                    <Badge className={`${getGradeColor(problem.grade)} text-white`}>
                      {gradeConverter.convertGrade(problem.grade, 'V-Scale', userGradeSystem)}
                    </Badge>
                    <div>
                      <div className="flex items-center space-x-2">
                        {problem.completed ? (
                          <Trophy className="h-4 w-4 text-green-400" />
                        ) : (
                          <Target className="h-4 w-4 text-yellow-400" />
                        )}
                        <div className="flex flex-wrap gap-1">
                          {problem.style ? (
                            problem.style.split(', ').map((style, index) => (
                              <Badge key={index} variant="secondary" className="text-xs bg-abyss-teal/20 text-abyss-teal">
                                {style}
                              </Badge>
                            ))
                          ) : (
                            <span className="text-sm text-abyss-ethereal">Mixed</span>
                          )}
                        </div>
                      </div>
                      <p className="text-xs text-abyss-ethereal/60">
                        {problem.attempts} attempt{problem.attempts !== 1 ? 's' : ''}
                      </p>
                    </div>
                  </div>
                  <div className="text-right space-y-1">
                    <XPDisplay xpEarned={problem.xpEarned || 0} size="sm" />
                    <span className="text-xs text-abyss-ethereal/70 block">
                      {userGradeSystem}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Target className="h-12 w-12 text-abyss-amber/50 mb-3 mx-auto" />
              <p className="text-abyss-ethereal/70">No problems logged yet</p>
              <p className="text-sm text-abyss-ethereal/50 mt-1">
                Add your first climb above to start earning XP!
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default React.memo(SessionTracker);