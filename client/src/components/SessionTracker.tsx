import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";

interface SessionTrackerProps {
  sessionId: number;
}

export default function SessionTracker({ sessionId }: SessionTrackerProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [grade, setGrade] = useState("");
  const [gradeSystem, setGradeSystem] = useState("V-Scale");
  const [style, setStyle] = useState("");
  const [completed, setCompleted] = useState(false);
  const [attempts, setAttempts] = useState(1);
  const [notes, setNotes] = useState("");

  const { data: problems, isLoading } = useQuery({
    queryKey: ["/api/sessions", sessionId, "problems"],
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
      const response = await apiRequest("POST", "/api/problems", problemData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/sessions", sessionId, "problems"] });
      toast({
        title: "Problem Added",
        description: "Your climb has been logged!",
      });
      // Reset form
      setGrade("");
      setStyle("");
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

  const handleAddProblem = () => {
    if (!grade) {
      toast({
        title: "Missing Grade",
        description: "Please select a grade for this problem.",
        variant: "destructive",
      });
      return;
    }

    addProblemMutation.mutate({
      sessionId,
      grade,
      gradeSystem,
      style: style || undefined,
      completed,
      attempts,
      notes: notes || undefined,
    });
  };

  const gradeOptions = {
    "V-Scale": ["V0", "V1", "V2", "V3", "V4", "V5", "V6", "V7", "V8", "V9", "V10", "V11", "V12", "V13", "V14", "V15", "V16", "V17"],
    "Font": ["4", "5", "5+", "6A", "6A+", "6B", "6B+", "6C", "6C+", "7A", "7A+", "7B", "7B+", "7C", "7C+", "8A", "8A+", "8B", "8B+"],
    "German": ["3", "4", "5", "6", "6+", "7-", "7", "7+", "8-", "8", "8+", "9-", "9", "9+", "10-", "10", "10+", "11-", "11"],
  };

  const styleOptions = [
    "Crimps", "Jugs", "Pinches", "Slopers", "Pockets", "Dynos", "Mantles", 
    "Overhangs", "Slabs", "Roofs", "Aretes", "Compression", "Coordination"
  ];

  const getGradeColor = (grade: string) => {
    const vGrade = parseInt(grade.replace("V", ""));
    if (vGrade <= 2) return "bg-green-500";
    if (vGrade <= 5) return "bg-yellow-500";
    if (vGrade <= 8) return "bg-orange-500";
    if (vGrade <= 11) return "bg-red-500";
    return "bg-purple-500";
  };

  return (
    <div className="space-y-6">
      {/* Add Problem Form */}
      <Card className="bg-abyss-purple/30 backdrop-blur-sm border-abyss-teal/20 depth-layer">
        <CardHeader>
          <CardTitle className="text-abyss-ethereal">Log Boulder Problem</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-abyss-ethereal">Grade System</Label>
              <Select value={gradeSystem} onValueChange={setGradeSystem}>
                <SelectTrigger className="bg-[#1a1a1a] border-abyss-teal/30 text-abyss-ethereal">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="V-Scale">V-Scale</SelectItem>
                  <SelectItem value="Font">Fontainebleau</SelectItem>
                  <SelectItem value="German">German</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label className="text-abyss-ethereal">Grade</Label>
              <Select value={grade} onValueChange={setGrade}>
                <SelectTrigger className="bg-[#1a1a1a] border-abyss-teal/30 text-abyss-ethereal">
                  <SelectValue placeholder="Select grade" />
                </SelectTrigger>
                <SelectContent>
                  {gradeOptions[gradeSystem as keyof typeof gradeOptions].map((g) => (
                    <SelectItem key={g} value={g}>
                      {g}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-abyss-ethereal">Style (Optional)</Label>
            <Select value={style} onValueChange={setStyle}>
              <SelectTrigger className="bg-[#1a1a1a] border-abyss-teal/30 text-abyss-ethereal">
                <SelectValue placeholder="Select climbing style" />
              </SelectTrigger>
              <SelectContent>
                {styleOptions.map((s) => (
                  <SelectItem key={s} value={s}>
                    {s}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-abyss-ethereal">Attempts</Label>
              <Input
                type="number"
                min="1"
                max="50"
                value={attempts}
                onChange={(e) => setAttempts(parseInt(e.target.value) || 1)}
                className="bg-[#1a1a1a] border-abyss-teal/30 text-abyss-ethereal"
              />
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
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-abyss-amber mx-auto"></div>
              <p className="text-abyss-ethereal/70 mt-2">Loading problems...</p>
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
                      {problem.grade}
                    </Badge>
                    <div>
                      <div className="flex items-center space-x-2">
                        {problem.completed ? (
                          <i className="fas fa-check text-green-400"></i>
                        ) : (
                          <i className="fas fa-clock text-yellow-400"></i>
                        )}
                        <span className="text-sm text-abyss-ethereal">
                          {problem.style || "Mixed"}
                        </span>
                      </div>
                      <p className="text-xs text-abyss-ethereal/60">
                        {problem.attempts} attempt{problem.attempts !== 1 ? 's' : ''}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-xs text-abyss-ethereal/70">
                      {problem.gradeSystem}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <i className="fas fa-mountain text-3xl text-abyss-amber/50 mb-3"></i>
              <p className="text-abyss-ethereal/70">No problems logged yet</p>
              <p className="text-sm text-abyss-ethereal/50 mt-1">
                Add your first climb above!
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
