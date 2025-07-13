import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import BottomNavigation from "@/components/BottomNavigation";
import SessionIndicator from "@/components/SessionIndicator";
import { Award, ArrowLeft, Lock, Check, Clock } from "lucide-react";
import { useGradeSystem } from "@/hooks/useGradeSystem";
import { gradeConverter } from "@/utils/gradeConverter";

const WHISTLE_CONFIG = {
  0: {
    name: "Bell Whistle",
    fullName: "Bell Whistle – Novice",
    color: "bg-gray-400",
    borderColor: "border-gray-400/50",
    textColor: "text-gray-400",
    icon: Award,
    gradeRange: "V0",
    description: "Starting point for all cave raiders",
    requirements: "Complete V0 grade problems",
    privileges: "Access to basic climbing areas and safety equipment"
  },
  1: {
    name: "Red Whistle",
    fullName: "Red Whistle – Cave Raider",
    color: "bg-red-500",
    borderColor: "border-red-500/50",
    textColor: "text-red-400",
    icon: Award,
    gradeRange: "V1-V2",
    description: "Novice delvers who stay in the upper layers",
    requirements: "Successfully climb V1-V2 grade problems",
    privileges: "Access to basic climbing areas and guidance"
  },
  2: {
    name: "Blue Whistle",
    fullName: "Blue Whistle – Apprentice Delver",
    color: "bg-blue-500",
    borderColor: "border-blue-500/50",
    textColor: "text-blue-400",
    icon: Award,
    gradeRange: "V3-V4",
    description: "Apprentices who venture into the second layer",
    requirements: "Successfully climb V3-V4 grade problems",
    privileges: "Access to intermediate climbing techniques"
  },
  3: {
    name: "Moon Whistle",
    fullName: "Moon Whistle – Seasoned Delver",
    color: "bg-purple-500",
    borderColor: "border-purple-500/50",
    textColor: "text-purple-400",
    icon: Award,
    gradeRange: "V5-V6",
    description: "Experienced climbers who can handle complex routes",
    requirements: "Master V5-V6 grade problems consistently",
    privileges: "Access to advanced climbing areas and mentorship roles"
  },
  4: {
    name: "Black Whistle",
    fullName: "Black Whistle – Expert Delver",
    color: "bg-gray-800",
    borderColor: "border-gray-500/50",
    textColor: "text-gray-300",
    icon: Award,
    gradeRange: "V7-V8",
    description: "Elite climbers who push the boundaries of possibility",
    requirements: "Conquer V7-V8 grade problems with skill and precision",
    privileges: "Access to expert-only routes and leadership opportunities"
  },
  5: {
    name: "White Whistle",
    fullName: "White Whistle – Legendary Delver",
    color: "bg-white",
    borderColor: "border-white/50",
    textColor: "text-white",
    icon: Award,
    gradeRange: "V9+",
    description: "Legendary climbers who have mastered the art",
    requirements: "Achieve V9+ grade problems and inspire others",
    privileges: "Unrestricted access to all climbing areas and recognition as a master"
  }
};

export default function WhistleOverview() {
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const { gradeSystem } = useGradeSystem();
  
  const { data: skills, isLoading } = useQuery({
    queryKey: ["/api/skills"],
    enabled: !!user,
  });

  // Convert grade ranges to user's preferred system
  const getConvertedGradeRange = (vScaleRange: string) => {
    if (gradeSystem === 'V-Scale') return vScaleRange;
    
    if (vScaleRange.includes('-')) {
      const [start, end] = vScaleRange.split('-');
      const convertedStart = gradeConverter.convertGrade(start, 'V-Scale', gradeSystem);
      const convertedEnd = gradeConverter.convertGrade(end, 'V-Scale', gradeSystem);
      return `${convertedStart}-${convertedEnd}`;
    } else if (vScaleRange.includes('+')) {
      const baseGrade = vScaleRange.replace('+', '');
      const convertedGrade = gradeConverter.convertGrade(baseGrade, 'V-Scale', gradeSystem);
      return `${convertedGrade}+`;
    } else {
      return gradeConverter.convertGrade(vScaleRange, 'V-Scale', gradeSystem);
    }
  };

  const getWhistleStatus = (whistleLevel: number) => {
    if (!user) return "locked";
    
    const currentWhistle = user.whistleLevel || 0;
    
    if (whistleLevel <= currentWhistle) {
      if (whistleLevel === currentWhistle) {
        return "current";
      } else {
        return "completed";
      }
    }
    
    return "locked";
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <Check className="h-5 w-5 text-green-400" />;
      case "current":
        return <Clock className="h-5 w-5 text-amber-400" />;
      case "locked":
        return <Lock className="h-5 w-5 text-gray-500" />;
      default:
        return <Lock className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return <Badge className="bg-green-500/20 text-green-400 border-green-500/30">Achieved</Badge>;
      case "current":
        return <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30">Current</Badge>;
      case "locked":
        return <Badge className="bg-gray-500/20 text-gray-400 border-gray-500/30">Locked</Badge>;
      default:
        return <Badge className="bg-gray-500/20 text-gray-400 border-gray-500/30">Locked</Badge>;
    }
  };

  const getHighestGrade = () => {
    if (!skills || skills.length === 0) return gradeConverter.convertGrade("V0", 'V-Scale', gradeSystem);
    
    const gradeOrder = ["V0", "V1", "V2", "V3", "V4", "V5", "V6", "V7", "V8", "V9", "V10", "V11", "V12", "V13", "V14", "V15", "V16", "V17"];
    let highestGrade = "V0";
    
    skills.forEach((skill: any) => {
      const skillGrade = skill.maxGrade || skill.grade || "V0";
      const gradeIndex = gradeOrder.indexOf(skillGrade);
      const currentHighestIndex = gradeOrder.indexOf(highestGrade);
      if (gradeIndex > currentHighestIndex) {
        highestGrade = skillGrade;
      }
    });
    
    return gradeConverter.convertGrade(highestGrade, 'V-Scale', gradeSystem);
  };

  const getProgressToNextWhistle = () => {
    const currentWhistle = user?.whistleLevel || 0;
    const nextWhistle = Math.min(currentWhistle + 1, 5);
    const currentGrade = getHighestGrade();
    
    if (currentWhistle >= 5) return { progress: 100, text: "Maximum whistle achieved!" };
    
    // Get the minimum grade needed for next whistle based on the actual whistle system
    const getMinGradeForWhistle = (whistleLevel: number): string => {
      if (whistleLevel === 0) return "V0";
      if (whistleLevel === 1) return "V1";
      if (whistleLevel === 2) return "V3";
      if (whistleLevel === 3) return "V5";
      if (whistleLevel === 4) return "V7";
      if (whistleLevel === 5) return "V9";
      return "V0";
    };
    
    const requiredGrade = getMinGradeForWhistle(nextWhistle);
    const convertedRequiredGrade = gradeConverter.convertGrade(requiredGrade, 'V-Scale', gradeSystem);
    
    const gradeOrder = ["V0", "V1", "V2", "V3", "V4", "V5", "V6", "V7", "V8", "V9", "V10", "V11", "V12", "V13", "V14", "V15", "V16", "V17"];
    const currentIndex = gradeOrder.indexOf(gradeConverter.convertGrade(currentGrade, gradeSystem, 'V-Scale'));
    const requiredIndex = gradeOrder.indexOf(requiredGrade);
    
    if (currentIndex >= requiredIndex) {
      return { progress: 100, text: "Ready to advance!" };
    }
    
    const progress = Math.min((currentIndex + 1) / (requiredIndex + 1) * 100, 100);
    return { progress, text: `Climb ${convertedRequiredGrade} to advance` };
  };

  if (isLoading) {
    return (
      <div className="max-w-md mx-auto bg-abyss-gradient min-h-screen relative overflow-hidden">
        <div className="flex items-center justify-center h-screen">
          <div className="text-abyss-ethereal">Loading whistle information...</div>
        </div>
      </div>
    );
  }

  const currentWhistle = user?.whistleLevel || 0;
  const highestGrade = getHighestGrade();
  const nextWhistleProgress = getProgressToNextWhistle();

  return (
    <div className="max-w-md mx-auto bg-abyss-gradient min-h-screen relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-10 right-10 w-32 h-32 bg-abyss-amber rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 left-10 w-40 h-40 bg-abyss-teal rounded-full blur-3xl"></div>
      </div>

      {/* Header */}
      <header className="relative z-20 px-6 pt-12 pb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setLocation("/")}
              className="text-abyss-amber hover:text-abyss-ethereal transition-colors"
            >
              <ArrowLeft className="h-6 w-6" />
            </button>
            <h1 className="text-xl font-bold text-abyss-ethereal">Whistle Progression</h1>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="relative z-10 px-6 pb-24 space-y-4">
        <SessionIndicator />
        
        {/* Current Whistle Summary */}
        <Card className="bg-abyss-purple/30 backdrop-blur-sm border-abyss-teal/20 depth-layer">
          <CardContent className="p-6">
            <div className="text-center">
              <h2 className="text-xl font-bold text-abyss-ethereal mb-2">
                Current Whistle
              </h2>
              <div className="flex items-center justify-center space-x-4 mb-4">
                <div className="text-center">
                  <div className="text-3xl font-bold text-abyss-amber">
                    {currentWhistle}
                  </div>
                  <div className="text-sm text-abyss-ethereal/70">Whistle Level</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-abyss-teal">
                    {highestGrade}
                  </div>
                  <div className="text-sm text-abyss-ethereal/70">Highest Grade</div>
                </div>
              </div>
              
              {currentWhistle < 5 && (
                <div className="bg-abyss-dark/30 rounded-lg p-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-abyss-ethereal/80">Progress to Next Whistle</span>
                    <span className="text-sm text-abyss-amber">
                      {nextWhistleProgress.text}
                    </span>
                  </div>
                  <Progress value={nextWhistleProgress.progress} className="h-2" />
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Whistle List */}
        <div className="space-y-4">
          {Object.entries(WHISTLE_CONFIG).map(([whistleNum, whistleInfo]) => {
            const whistleNumber = parseInt(whistleNum);
            const status = getWhistleStatus(whistleNumber);
            const IconComponent = whistleInfo.icon;
            const convertedGradeRange = getConvertedGradeRange(whistleInfo.gradeRange);
            
            return (
              <Card 
                key={whistleNumber} 
                className={`bg-abyss-purple/30 backdrop-blur-sm border-2 depth-layer transition-all duration-300 ${
                  status === "current" 
                    ? `${whistleInfo.borderColor} shadow-lg` 
                    : status === "completed"
                    ? "border-green-500/30"
                    : "border-abyss-teal/20"
                }`}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={`p-2 rounded-lg ${whistleInfo.color}/20`}>
                        <IconComponent className={`h-6 w-6 ${whistleInfo.textColor}`} />
                      </div>
                      <div>
                        <CardTitle className="text-abyss-ethereal text-sm">
                          {whistleInfo.fullName}
                        </CardTitle>
                        <p className="text-xs text-abyss-ethereal/60">Grade Range: {convertedGradeRange}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(status)}
                      {getStatusBadge(status)}
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="pt-0">
                  <p className="text-sm text-abyss-ethereal/80 mb-3 italic">
                    "{whistleInfo.description}"
                  </p>
                  
                  <div className="space-y-3">
                    <div className="bg-abyss-dark/30 rounded-lg p-3">
                      <h4 className="text-xs font-medium text-abyss-ethereal/90 mb-1">Requirements</h4>
                      <p className="text-xs text-abyss-ethereal/70">Successfully climb {convertedGradeRange} grade problems</p>
                    </div>
                    
                    <div className="bg-abyss-dark/30 rounded-lg p-3">
                      <h4 className="text-xs font-medium text-abyss-ethereal/90 mb-1">Privileges</h4>
                      <p className="text-xs text-abyss-ethereal/70">{whistleInfo.privileges}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      <BottomNavigation />
    </div>
  );
}