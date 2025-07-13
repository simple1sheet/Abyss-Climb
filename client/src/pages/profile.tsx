import { useAuth } from "@/hooks/useAuth";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useLocation } from "wouter";
import BottomNavigation from "@/components/BottomNavigation";
import ProfilePictureUpload from "@/components/ProfilePictureUpload";
import { Skeleton } from "@/components/ui/skeleton";
import { Trophy, Star, Target, Award, Crown, Zap, Calendar, Mountain, Clock, CheckCircle, Lock } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import SessionIndicator from "@/components/SessionIndicator";
import { useGradeSystem } from "@/hooks/useGradeSystem";
import DeveloperTools from "@/components/DeveloperTools";

export default function Profile() {
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { gradeSystem, setGradeSystem } = useGradeSystem();
  
  const { data: achievements, isLoading: isLoadingAchievements } = useQuery({
    queryKey: ["/api/achievements"],
    enabled: !!user,
  });

  const { data: availableAchievements, isLoading: isLoadingAvailable } = useQuery({
    queryKey: ["/api/achievements/available"],
    enabled: !!user,
  });

  const { data: stats, isLoading: isLoadingStats } = useQuery({
    queryKey: ["/api/user/stats"],
    enabled: !!user,
  });

  const { data: layerProgress, isLoading: isLoadingProgress } = useQuery({
    queryKey: ["/api/layer-progress"],
    enabled: !!user,
  });

  const checkAchievements = useMutation({
    mutationFn: async () => {
      return await apiRequest("POST", "/api/achievements/check", {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/achievements"] });
      queryClient.invalidateQueries({ queryKey: ["/api/achievements/available"] });
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      queryClient.invalidateQueries({ queryKey: ["/api/layer-progress"] });
      toast({
        title: "Achievements Updated",
        description: "Your achievements have been checked and updated!",
      });
    },
  });

  const getWhistleLevel = (whistleLevel: number) => {
    const levels = {
      1: { name: "Red Whistle", color: "bg-red-500", description: "Apprentice Cave Raider", icon: "🔴" },
      2: { name: "Blue Whistle", color: "bg-blue-500", description: "Experienced Explorer", icon: "🔵" },
      3: { name: "Moon Whistle", color: "bg-purple-500", description: "Seasoned Delver", icon: "🌙" },
      4: { name: "Black Whistle", color: "bg-gray-800", description: "Master Raider", icon: "⚫" },
      5: { name: "White Whistle", color: "bg-white", description: "Legendary Explorer", icon: "⚪" },
    };
    return levels[whistleLevel as keyof typeof levels] || levels[1];
  };

  const getLayerName = (layer: number) => {
    const layerNames = {
      1: "Edge of the Abyss",
      2: "Forest of Temptation",
      3: "Great Fault",
      4: "Goblets of Giants",
      5: "Sea of Corpses",
      6: "Capital of the Unreturned",
      7: "Final Maelstrom",
    };
    return layerNames[layer as keyof typeof layerNames] || "Unknown Layer";
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "Explorer": return <Target className="h-4 w-4" />;
      case "Climber": return <Mountain className="h-4 w-4" />;
      case "Master": return <Crown className="h-4 w-4" />;
      default: return <Award className="h-4 w-4" />;
    }
  };

  const getAchievementIcon = (iconName: string) => {
    switch (iconName) {
      case "scroll": return <Target className="h-5 w-5" />;
      case "tasks": return <CheckCircle className="h-5 w-5" />;
      case "crown": return <Crown className="h-5 w-5" />;
      case "calendar-check": return <Calendar className="h-5 w-5" />;
      case "mountain": return <Mountain className="h-5 w-5" />;
      case "clock": return <Clock className="h-5 w-5" />;
      case "star": return <Star className="h-5 w-5" />;
      case "trophy": return <Trophy className="h-5 w-5" />;
      default: return <Award className="h-5 w-5" />;
    }
  };

  const whistleInfo = getWhistleLevel(user?.whistleLevel || 1);

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
              <i className="fas fa-arrow-left text-xl"></i>
            </button>
            <h1 className="text-lg font-semibold text-abyss-ethereal">Profile</h1>
          </div>
          <Button
            onClick={() => window.location.href = '/api/logout'}
            variant="outline"
            className="border-abyss-amber/30 text-abyss-amber hover:bg-abyss-amber/10"
          >
            <i className="fas fa-sign-out-alt mr-2"></i>
            Logout
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <div className="relative z-10 px-6 pb-24 space-y-6">
        <SessionIndicator />
        {/* Profile Header with Picture Upload */}
        <Card className="bg-abyss-purple/30 backdrop-blur-sm border-abyss-teal/20 depth-layer">
          <CardContent className="p-6">
            <ProfilePictureUpload 
              currentImageUrl={user?.profileImageUrl}
              userName={`${user?.firstName || ""} ${user?.lastName || ""}`.trim() || "Cave Raider"}
              onImageUpdate={(newImageUrl) => {
                // Update the user data immediately in the cache
                queryClient.setQueryData(["/api/auth/user"], (oldData: any) => {
                  if (oldData) {
                    return { ...oldData, profileImageUrl: newImageUrl };
                  }
                  return oldData;
                });
                // Also invalidate to refetch from server
                queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
              }}
            />
            
            <div className="mt-6 text-center">
              <h2 className="text-xl font-bold text-abyss-ethereal mb-2">
                {user?.firstName || "Cave Raider"} {user?.lastName || ""}
              </h2>
              <p className="text-abyss-amber mb-3">{user?.email}</p>
              
              <div className="flex items-center justify-center space-x-3 mb-4">
                <Badge className={`${whistleInfo.color} text-white`}>
                  {whistleInfo.icon} {whistleInfo.name}
                </Badge>
                <Badge variant="outline" className="text-abyss-teal border-abyss-teal">
                  {getLayerName(user?.currentLayer || 1)}
                </Badge>
              </div>
              
              <p className="text-sm text-abyss-ethereal/80 mb-4">
                {whistleInfo.description}
              </p>
              
              <div className="flex justify-center space-x-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-abyss-amber">
                    {user?.totalXP || 0}
                  </div>
                  <div className="text-xs text-abyss-ethereal/70">Total XP</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-abyss-amber">
                    {stats?.totalSessions || 0}
                  </div>
                  <div className="text-xs text-abyss-ethereal/70">Sessions</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-abyss-amber">
                    {stats?.totalProblems || 0}
                  </div>
                  <div className="text-xs text-abyss-ethereal/70">Problems</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-abyss-amber">
                    {stats?.completedQuests || 0}
                  </div>
                  <div className="text-xs text-abyss-ethereal/70">Quests</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* XP Progress Bar */}
        {(isLoadingProgress || layerProgress) && (
          <Card className="bg-abyss-purple/30 backdrop-blur-sm border-abyss-teal/20 depth-layer">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <Zap className="h-4 w-4 text-abyss-amber" />
                  <span className="text-sm font-medium text-abyss-ethereal">Layer Progress</span>
                </div>
                <Button
                  onClick={() => checkAchievements.mutate()}
                  disabled={checkAchievements.isPending}
                  variant="outline"
                  size="sm"
                  className="border-abyss-amber/30 text-abyss-amber hover:bg-abyss-amber/10"
                >
                  {checkAchievements.isPending ? "Checking..." : "Check Achievements"}
                </Button>
              </div>
              
              {isLoadingProgress ? (
                <Skeleton className="h-4 w-full bg-abyss-purple/50" />
              ) : (
                <>
                  <Progress 
                    value={layerProgress?.layerProgress || 0} 
                    className="h-3 bg-abyss-purple/50"
                  />
                  <div className="flex justify-between text-xs text-abyss-ethereal/60 mt-1">
                    <span>Layer {layerProgress?.currentLayer || 1}</span>
                    <span>
                      {layerProgress?.currentLayer === 7 ? "Max Layer" : 
                       `${layerProgress?.progressToNextLayer || 0}/${(layerProgress?.nextLayerXP || 0) - (layerProgress?.currentLayerXP || 0)} XP`}
                    </span>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        )}

        {/* Achievements */}
        <Card className="bg-abyss-purple/30 backdrop-blur-sm border-abyss-teal/20 depth-layer">
          <CardHeader>
            <CardTitle className="text-abyss-ethereal flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Trophy className="h-5 w-5 text-abyss-amber" />
                <span>Achievements</span>
              </div>
              <Badge variant="outline" className="text-abyss-amber border-abyss-amber">
                {achievements?.length || 0} unlocked
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Recently Unlocked */}
            {achievements && achievements.length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-abyss-ethereal mb-3 flex items-center">
                  <Star className="h-4 w-4 mr-1" />
                  Recently Unlocked
                </h3>
                <div className="space-y-3">
                  {achievements.slice(0, 3).map((achievement: any) => (
                    <div key={achievement.id} className="flex items-center space-x-3 p-3 bg-abyss-dark/30 rounded-lg border border-abyss-amber/20">
                      <div className="w-10 h-10 bg-abyss-amber/20 rounded-full flex items-center justify-center">
                        {getAchievementIcon(achievement.icon)}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <h4 className="text-abyss-ethereal font-medium">{achievement.title}</h4>
                          {getCategoryIcon(achievement.category)}
                        </div>
                        <p className="text-sm text-abyss-ethereal/70">{achievement.description}</p>
                        <div className="flex items-center justify-between mt-1">
                          <p className="text-xs text-abyss-ethereal/50">
                            {new Date(achievement.unlockedAt).toLocaleDateString()}
                          </p>
                          <Badge variant="secondary" className="text-xs">
                            +{achievement.xpReward} XP
                          </Badge>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* All Achievements Progress */}
            {(isLoadingAvailable || (availableAchievements && availableAchievements.length > 0)) && (
              <div>
                <h3 className="text-sm font-medium text-abyss-ethereal mb-3 flex items-center">
                  <Target className="h-4 w-4 mr-1" />
                  All Achievements
                </h3>
                
                {isLoadingAvailable ? (
                  <div className="grid grid-cols-1 gap-3">
                    {Array.from({ length: 6 }).map((_, i) => (
                      <div key={i} className="p-3 bg-abyss-dark/30 rounded-lg border border-abyss-teal/20">
                        <div className="flex items-center space-x-3">
                          <Skeleton className="w-10 h-10 rounded-full bg-abyss-purple/50" />
                          <div className="flex-1">
                            <Skeleton className="h-4 w-3/4 mb-1 bg-abyss-purple/50" />
                            <Skeleton className="h-3 w-full bg-abyss-purple/50" />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-3 max-h-96 overflow-y-auto">
                    {availableAchievements
                      ?.sort((a, b) => (b.isUnlocked ? 1 : 0) - (a.isUnlocked ? 1 : 0))
                      .map((achievement: any) => (
                        <div 
                          key={achievement.id} 
                          className={`p-3 rounded-lg border transition-all duration-200 ${
                            achievement.isUnlocked 
                              ? 'bg-abyss-dark/30 border-abyss-amber/20' 
                              : 'bg-abyss-dark/20 border-abyss-teal/20 opacity-60'
                          }`}
                        >
                          <div className="flex items-center space-x-3">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                              achievement.isUnlocked 
                                ? 'bg-abyss-amber/20' 
                                : 'bg-abyss-purple/20'
                            }`}>
                              {achievement.isUnlocked ? (
                                getAchievementIcon(achievement.icon)
                              ) : (
                                <Lock className="h-5 w-5 text-abyss-ethereal/40" />
                              )}
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-2">
                                  <h4 className={`font-medium ${
                                    achievement.isUnlocked 
                                      ? 'text-abyss-ethereal' 
                                      : 'text-abyss-ethereal/60'
                                  }`}>
                                    {achievement.title}
                                  </h4>
                                  {getCategoryIcon(achievement.category)}
                                </div>
                                <div className="flex items-center space-x-2">
                                  {achievement.isUnlocked && (
                                    <Badge variant="secondary" className="text-xs">
                                      +{achievement.xpReward} XP
                                    </Badge>
                                  )}
                                  <Badge 
                                    variant="outline" 
                                    className={`text-xs ${
                                      achievement.isUnlocked 
                                        ? 'border-abyss-amber text-abyss-amber' 
                                        : 'border-abyss-teal text-abyss-teal'
                                    }`}
                                  >
                                    {achievement.category}
                                  </Badge>
                                </div>
                              </div>
                              <p className={`text-sm mt-1 ${
                                achievement.isUnlocked 
                                  ? 'text-abyss-ethereal/70' 
                                  : 'text-abyss-ethereal/50'
                              }`}>
                                {achievement.description}
                              </p>
                              {!achievement.isUnlocked && achievement.progress !== undefined && (
                                <div className="mt-2">
                                  <div className="flex items-center justify-between text-xs text-abyss-ethereal/50 mb-1">
                                    <span>Progress</span>
                                    <span>{Math.round(achievement.progress)}%</span>
                                  </div>
                                  <Progress 
                                    value={achievement.progress} 
                                    className="h-2 bg-abyss-purple/50"
                                  />
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                )}
              </div>
            )}

            {/* Empty State */}
            {!isLoadingAvailable && (!availableAchievements || availableAchievements.length === 0) && (
              <div className="text-center py-8">
                <Trophy className="h-12 w-12 mx-auto mb-4 text-abyss-amber/30" />
                <p className="text-abyss-ethereal/70 mb-2">No achievements yet</p>
                <p className="text-sm text-abyss-ethereal/50">
                  Complete quests and climb to unlock achievements!
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Settings */}
        <Card className="bg-abyss-purple/30 backdrop-blur-sm border-abyss-teal/20 depth-layer">
          <CardHeader>
            <CardTitle className="text-abyss-ethereal">Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-abyss-ethereal font-medium">Grade System</h4>
                <p className="text-sm text-abyss-ethereal/70">Default climbing grade system</p>
              </div>
              <select 
                value={gradeSystem} 
                onChange={(e) => setGradeSystem(e.target.value)}
                className="bg-abyss-purple/30 border border-abyss-teal/20 text-abyss-ethereal rounded px-3 py-1 text-sm"
              >
                <option value="V-Scale">V-Scale</option>
                <option value="Font">Fontainebleau</option>
                <option value="German">German (Saxon)</option>
              </select>
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-abyss-ethereal font-medium">Notifications</h4>
                <p className="text-sm text-abyss-ethereal/70">Quest and progress notifications</p>
              </div>
              <div className="w-10 h-6 bg-abyss-amber rounded-full flex items-center justify-end px-1">
                <div className="w-4 h-4 bg-abyss-dark rounded-full"></div>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-abyss-ethereal font-medium">Privacy</h4>
                <p className="text-sm text-abyss-ethereal/70">Share progress with community</p>
              </div>
              <div className="w-10 h-6 bg-abyss-teal/50 rounded-full flex items-center justify-start px-1">
                <div className="w-4 h-4 bg-abyss-ethereal rounded-full"></div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Developer Tools */}
        <DeveloperTools />
      </div>

      <BottomNavigation />
    </div>
  );
}
