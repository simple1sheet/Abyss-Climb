import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import { Mountain, Dumbbell, ArrowLeft } from "lucide-react";
import BottomNavigation from "@/components/BottomNavigation";
import SessionIndicator from "@/components/SessionIndicator";
import WorkoutGenerator from "@/components/WorkoutGenerator";
import { calculateProblemXP, calculateSessionXP } from "@shared/xpUtils";

interface BoulderProblem {
  grade: string;
  gradeSystem: string;
  style: string;
  holdType: string;
  wallAngle: string;
  completed: boolean;
  attempts: number;
  notes: string;
}

export default function SessionForm() {
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [sessionData, setSessionData] = useState({
    sessionType: "indoor",
    location: "",
    duration: "",
    notes: "",
  });

  const [problems, setProblems] = useState<BoulderProblem[]>([]);
  const [isSessionActive, setIsSessionActive] = useState(false);
  const [sessionStartTime, setSessionStartTime] = useState<Date | null>(null);
  const [activeTab, setActiveTab] = useState('climbing');

  const createSessionMutation = useMutation({
    mutationFn: async (data: any) => {
      return await apiRequest("POST", "/api/sessions", data);
    },
    onSuccess: async (session) => {
      // Create boulder problems for this session
      for (const problem of problems) {
        await apiRequest("POST", "/api/problems", {
          sessionId: session.id,
          ...problem,
        });
      }
      
      // Complete the session to ensure XP is properly applied
      await apiRequest("POST", `/api/sessions/${session.id}/complete`, {});
      
      queryClient.invalidateQueries({ queryKey: ["/api/sessions"] });
      queryClient.invalidateQueries({ queryKey: ["/api/skills"] });
      queryClient.invalidateQueries({ queryKey: ["/api/quests"] });
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      queryClient.invalidateQueries({ queryKey: ["/api/layer-progress"] });
      
      const completedProblems = problems.filter(p => p.completed);
      const totalXP = calculateSessionXP(completedProblems);
      
      toast({
        title: "Session Complete!",
        description: `Logged ${problems.length} boulder problems and gained ${totalXP} XP!`,
      });
      
      setLocation("/");
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to save session. Please try again.",
        variant: "destructive",
      });
    },
  });

  const startSession = () => {
    setIsSessionActive(true);
    setSessionStartTime(new Date());
  };

  const endSession = () => {
    if (sessionStartTime) {
      const duration = Math.round((Date.now() - sessionStartTime.getTime()) / 1000 / 60);
      setSessionData(prev => ({ ...prev, duration: duration.toString() }));
    }
    setIsSessionActive(false);
  };

  const addProblem = () => {
    setProblems(prev => [...prev, {
      grade: "V0",
      gradeSystem: "V-Scale",
      style: "crimps",
      holdType: "crimps",
      wallAngle: "vertical",
      completed: false,
      attempts: 1,
      notes: "",
    }]);
  };

  const updateProblem = (index: number, field: string, value: any) => {
    setProblems(prev => prev.map((problem, i) => 
      i === index ? { ...problem, [field]: value } : problem
    ));
  };

  const removeProblem = (index: number) => {
    setProblems(prev => prev.filter((_, i) => i !== index));
  };

  const submitSession = () => {
    if (problems.length === 0) {
      toast({
        title: "Add Some Problems!",
        description: "You need to log at least one boulder problem.",
        variant: "destructive",
      });
      return;
    }

    createSessionMutation.mutate({
      sessionType: sessionData.sessionType,
      location: sessionData.location,
      duration: parseInt(sessionData.duration) || 60,
      notes: sessionData.notes,
      startTime: sessionStartTime || new Date(),
      endTime: new Date(),
    });
  };

  const getSkillIcon = (skill: string) => {
    const icons = {
      crimps: "fas fa-hand-rock",
      dynos: "fas fa-rocket",
      movement: "fas fa-running",
      strength: "fas fa-dumbbell",
      balance: "fas fa-balance-scale",
      flexibility: "fas fa-leaf",
      slopers: "fas fa-circle",
      pinches: "fas fa-compress",
      jugs: "fas fa-grip-horizontal",
    };
    return icons[skill as keyof typeof icons] || "fas fa-question";
  };

  const handleWorkoutRedirect = () => {
    setLocation("/workout");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-abyss-dark via-abyss-dark to-abyss-teal/10 text-abyss-ethereal relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-10 right-10 w-32 h-32 bg-abyss-amber rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 left-10 w-40 h-40 bg-abyss-teal rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10 container mx-auto px-4 py-6 pb-20">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              onClick={() => setLocation("/")}
              className="text-abyss-ethereal hover:bg-abyss-teal/10"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-abyss-ethereal">Start Training</h1>
              <p className="text-abyss-muted">Choose your training type</p>
            </div>
          </div>
          <SessionIndicator />
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-abyss-dark/50 border border-abyss-teal/20 mb-6">
            <TabsTrigger value="climbing" className="data-[state=active]:bg-abyss-teal/20">
              <Mountain className="w-4 h-4 mr-2" />
              Climbing Session
            </TabsTrigger>
            <TabsTrigger value="workout" className="data-[state=active]:bg-abyss-teal/20">
              <Dumbbell className="w-4 h-4 mr-2" />
              Home Workout
            </TabsTrigger>
          </TabsList>

          <TabsContent value="climbing" className="space-y-6">
            <div className="max-w-md mx-auto space-y-6">

      <div className="space-y-6 relative z-10">
        {/* Session Controls */}
        <Card className="bg-abyss-purple/30 backdrop-blur-sm border-abyss-teal/20 depth-layer">
          <CardHeader>
            <CardTitle className="text-abyss-ethereal flex items-center space-x-2">
              <i className="fas fa-play text-abyss-amber"></i>
              <span>Session Control</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-abyss-ethereal">Session Status</span>
              <div className="flex items-center space-x-2">
                <span className={`w-3 h-3 rounded-full ${isSessionActive ? 'bg-green-500' : 'bg-red-500'}`}></span>
                <span className="text-abyss-ethereal/80">
                  {isSessionActive ? "Active" : "Inactive"}
                </span>
              </div>
            </div>
            
            {!isSessionActive ? (
              <Button 
                onClick={startSession}
                className="w-full bg-abyss-amber hover:bg-abyss-amber/80 text-abyss-dark font-medium"
              >
                Start Session
              </Button>
            ) : (
              <Button 
                onClick={endSession}
                className="w-full bg-red-500 hover:bg-red-600 text-white font-medium"
              >
                End Session
              </Button>
            )}
          </CardContent>
        </Card>

        {/* Session Details */}
        <Card className="bg-abyss-purple/30 backdrop-blur-sm border-abyss-teal/20 depth-layer">
          <CardHeader>
            <CardTitle className="text-abyss-ethereal">Session Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label className="text-abyss-ethereal">Session Type</Label>
              <Select value={sessionData.sessionType} onValueChange={(value) => setSessionData(prev => ({ ...prev, sessionType: value }))}>
                <SelectTrigger className="bg-[#1a1a1a] border-abyss-teal/30 text-abyss-ethereal">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="indoor">Indoor Gym</SelectItem>
                  <SelectItem value="outdoor">Outdoor Crag</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-abyss-ethereal">Location</Label>
              <Input
                placeholder="Gym name or crag location"
                value={sessionData.location}
                onChange={(e) => setSessionData(prev => ({ ...prev, location: e.target.value }))}
                className="bg-[#1a1a1a] border-abyss-teal/30 text-abyss-ethereal placeholder:text-abyss-ethereal/50"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-abyss-ethereal">Duration (minutes)</Label>
              <Input
                type="number"
                placeholder="60"
                value={sessionData.duration}
                onChange={(e) => setSessionData(prev => ({ ...prev, duration: e.target.value }))}
                className="bg-[#1a1a1a] border-abyss-teal/30 text-abyss-ethereal placeholder:text-abyss-ethereal/50"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-abyss-ethereal">Notes</Label>
              <Textarea
                placeholder="How did the session go?"
                value={sessionData.notes}
                onChange={(e) => setSessionData(prev => ({ ...prev, notes: e.target.value }))}
                className="bg-[#1a1a1a] border-abyss-teal/30 text-abyss-ethereal placeholder:text-abyss-ethereal/50"
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        {/* Boulder Problems */}
        <Card className="bg-abyss-purple/30 backdrop-blur-sm border-abyss-teal/20 depth-layer">
          <CardHeader>
            <CardTitle className="text-abyss-ethereal flex items-center justify-between">
              <span>Boulder Problems</span>
              <Button 
                onClick={addProblem}
                size="sm"
                className="bg-abyss-amber hover:bg-abyss-amber/80 text-abyss-dark"
              >
                <i className="fas fa-plus mr-2"></i>Add Problem
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {problems.length === 0 ? (
              <div className="text-center py-8">
                <i className="fas fa-mountain text-4xl text-abyss-amber/50 mb-4"></i>
                <p className="text-abyss-ethereal/70">No problems logged yet</p>
                <p className="text-abyss-ethereal/50 text-sm">Add your first boulder problem above</p>
              </div>
            ) : (
              problems.map((problem, index) => (
                <div key={index} className="bg-abyss-dark/30 rounded-lg p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-abyss-ethereal font-medium">Problem {index + 1}</h4>
                    <button 
                      onClick={() => removeProblem(index)}
                      className="text-red-400 hover:text-red-300"
                    >
                      <i className="fas fa-trash"></i>
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label className="text-abyss-ethereal/80">Grade</Label>
                      <Select 
                        value={problem.grade} 
                        onValueChange={(value) => updateProblem(index, 'grade', value)}
                      >
                        <SelectTrigger className="bg-[#1a1a1a] border-abyss-teal/30 text-abyss-ethereal">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {Array.from({ length: 17 }, (_, i) => (
                            <SelectItem key={i} value={`V${i}`}>V{i}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-abyss-ethereal/80">Style</Label>
                      <Select 
                        value={problem.style} 
                        onValueChange={(value) => updateProblem(index, 'style', value)}
                      >
                        <SelectTrigger className="bg-[#1a1a1a] border-abyss-teal/30 text-abyss-ethereal">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="crimps">
                            <div className="flex items-center space-x-2">
                              <i className={getSkillIcon("crimps")}></i>
                              <span>Crimps</span>
                            </div>
                          </SelectItem>
                          <SelectItem value="dynos">
                            <div className="flex items-center space-x-2">
                              <i className={getSkillIcon("dynos")}></i>
                              <span>Dynos</span>
                            </div>
                          </SelectItem>
                          <SelectItem value="movement">
                            <div className="flex items-center space-x-2">
                              <i className={getSkillIcon("movement")}></i>
                              <span>Movement</span>
                            </div>
                          </SelectItem>
                          <SelectItem value="strength">
                            <div className="flex items-center space-x-2">
                              <i className={getSkillIcon("strength")}></i>
                              <span>Strength</span>
                            </div>
                          </SelectItem>
                          <SelectItem value="balance">
                            <div className="flex items-center space-x-2">
                              <i className={getSkillIcon("balance")}></i>
                              <span>Balance</span>
                            </div>
                          </SelectItem>
                          <SelectItem value="flexibility">
                            <div className="flex items-center space-x-2">
                              <i className={getSkillIcon("flexibility")}></i>
                              <span>Flexibility</span>
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Switch 
                        checked={problem.completed}
                        onCheckedChange={(checked) => updateProblem(index, 'completed', checked)}
                      />
                      <span className="text-abyss-ethereal/80">Completed</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Label className="text-abyss-ethereal/80">Attempts:</Label>
                      <Input
                        type="number"
                        min="1"
                        value={problem.attempts}
                        onChange={(e) => updateProblem(index, 'attempts', parseInt(e.target.value) || 1)}
                        className="w-16 bg-[#1a1a1a] border-abyss-teal/30 text-abyss-ethereal"
                      />
                    </div>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Submit Button */}
        <Button 
          onClick={submitSession}
          disabled={createSessionMutation.isPending}
          className="w-full bg-abyss-amber hover:bg-abyss-amber/80 text-abyss-dark font-medium py-3 relic-shimmer"
        >
          {createSessionMutation.isPending ? (
            <><i className="fas fa-spinner fa-spin mr-2"></i>Saving Session...</>
          ) : (
            <><i className="fas fa-save mr-2"></i>Complete Session</>
          )}
        </Button>
      </div>
            </div>
          </TabsContent>

          <TabsContent value="workout" className="space-y-6">
            <Card className="bg-layer-gradient backdrop-blur-sm border-abyss-teal/20">
              <CardHeader>
                <CardTitle className="text-abyss-ethereal flex items-center space-x-2">
                  <Dumbbell className="w-5 h-5 text-abyss-amber" />
                  <span>Home Workout</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center space-y-4">
                  <p className="text-abyss-muted">
                    Get personalized workouts based on your climbing stats and current needs. 
                    Choose from stretching, meditation, strength training, or combination sessions.
                  </p>
                  <div className="space-y-3">
                    <div className="flex justify-center space-x-4">
                      <div className="text-center">
                        <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center mx-auto mb-2">
                          <span className="text-green-400">💪</span>
                        </div>
                        <p className="text-xs text-abyss-muted">Strength</p>
                      </div>
                      <div className="text-center">
                        <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center mx-auto mb-2">
                          <span className="text-blue-400">🧘</span>
                        </div>
                        <p className="text-xs text-abyss-muted">Meditation</p>
                      </div>
                      <div className="text-center">
                        <div className="w-12 h-12 bg-yellow-500/20 rounded-lg flex items-center justify-center mx-auto mb-2">
                          <span className="text-yellow-400">🤸</span>
                        </div>
                        <p className="text-xs text-abyss-muted">Stretching</p>
                      </div>
                    </div>
                    <Button
                      onClick={handleWorkoutRedirect}
                      className="w-full bg-abyss-amber hover:bg-abyss-amber/80 text-abyss-dark"
                    >
                      Start Home Workout
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      <BottomNavigation />
    </div>
  );
}