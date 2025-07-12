import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useLocation } from "wouter";
import BottomNavigation from "@/components/BottomNavigation";

export default function Profile() {
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  
  const { data: achievements } = useQuery({
    queryKey: ["/api/achievements"],
    enabled: !!user,
  });

  const { data: stats } = useQuery({
    queryKey: ["/api/user/stats"],
    enabled: !!user,
  });

  const getWhistleLevel = (whistleLevel: number) => {
    const levels = {
      1: { name: "Red Whistle", color: "bg-red-500", description: "Apprentice Cave Raider" },
      2: { name: "Blue Whistle", color: "bg-blue-500", description: "Experienced Explorer" },
      3: { name: "Moon Whistle", color: "bg-purple-500", description: "Seasoned Delver" },
      4: { name: "Black Whistle", color: "bg-gray-800", description: "Master Raider" },
      5: { name: "White Whistle", color: "bg-white", description: "Legendary Explorer" },
    };
    return levels[whistleLevel as keyof typeof levels] || levels[1];
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
        {/* Profile Header */}
        <Card className="bg-abyss-purple/30 backdrop-blur-sm border-abyss-teal/20 depth-layer">
          <CardContent className="p-6">
            <div className="flex items-center space-x-4 mb-6">
              <img 
                src={user?.profileImageUrl || "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=100&h=100"}
                alt="Profile" 
                className="w-20 h-20 rounded-full object-cover border-2 border-abyss-amber abyss-glow"
              />
              <div>
                <h2 className="text-xl font-bold text-abyss-ethereal">
                  {user?.firstName || "Cave Raider"} {user?.lastName || ""}
                </h2>
                <p className="text-abyss-amber">{user?.email}</p>
                <div className="flex items-center space-x-2 mt-2">
                  <Badge className={`${whistleInfo.color} text-white`}>
                    {whistleInfo.name}
                  </Badge>
                  <span className="text-sm text-abyss-ethereal/70">
                    Layer {user?.currentLayer || 1}
                  </span>
                </div>
              </div>
            </div>
            
            <div className="text-center">
              <p className="text-sm text-abyss-ethereal/80 mb-2">
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
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Achievements */}
        <Card className="bg-abyss-purple/30 backdrop-blur-sm border-abyss-teal/20 depth-layer">
          <CardHeader>
            <CardTitle className="text-abyss-ethereal flex items-center space-x-2">
              <i className="fas fa-trophy text-abyss-amber"></i>
              <span>Achievements</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {achievements && achievements.length > 0 ? (
              <div className="space-y-3">
                {achievements.slice(0, 5).map((achievement: any) => (
                  <div key={achievement.id} className="flex items-center space-x-3 p-3 bg-abyss-dark/30 rounded-lg">
                    <div className="w-10 h-10 bg-abyss-amber/20 rounded-full flex items-center justify-center">
                      <i className="fas fa-award text-abyss-amber"></i>
                    </div>
                    <div>
                      <h4 className="text-abyss-ethereal font-medium">{achievement.title}</h4>
                      <p className="text-sm text-abyss-ethereal/70">{achievement.description}</p>
                      <p className="text-xs text-abyss-ethereal/50">
                        {new Date(achievement.unlockedAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <i className="fas fa-trophy text-4xl text-abyss-amber/30 mb-4"></i>
                <p className="text-abyss-ethereal/70">No achievements yet</p>
                <p className="text-sm text-abyss-ethereal/50 mt-2">
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
              <Badge variant="outline" className="border-abyss-amber/30 text-abyss-amber">
                V-Scale
              </Badge>
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
      </div>

      <BottomNavigation />
    </div>
  );
}
