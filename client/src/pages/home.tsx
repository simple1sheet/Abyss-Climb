import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import WhistleProgress from "@/components/WhistleProgress";
import CurrentLayer from "@/components/CurrentLayer";
import QuickActions from "@/components/QuickActions";
import ActiveQuests from "@/components/ActiveQuests";
import RecentSessions from "@/components/RecentSessions";
import StatsOverview from "@/components/StatsOverview";
import BottomNavigation from "@/components/BottomNavigation";
import SessionIndicator from "@/components/SessionIndicator";

export default function Home() {
  const { user } = useAuth();
  
  const { data: stats } = useQuery({
    queryKey: ["/api/user/stats"],
    enabled: !!user,
  });

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
            <img 
              src={user?.profileImageUrl || "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=100&h=100"}
              alt="Climber Profile" 
              className="w-12 h-12 rounded-full object-cover border-2 border-abyss-amber abyss-glow"
            />
            <div>
              <h1 className="text-lg font-semibold text-abyss-ethereal">
                {user?.firstName || "Cave Raider"}
              </h1>
              <p className="text-sm text-abyss-amber">
                Layer {user?.currentLayer || 1} Explorer
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <button className="text-abyss-amber hover:text-abyss-ethereal transition-colors">
              <i className="fas fa-bell text-xl"></i>
            </button>
            <button className="text-abyss-amber hover:text-abyss-ethereal transition-colors">
              <i className="fas fa-cog text-xl"></i>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="relative z-10 pb-24">
        <SessionIndicator />
        <WhistleProgress />
        <CurrentLayer />
        <QuickActions />
        <ActiveQuests />
        <RecentSessions />
        <StatsOverview />
      </div>

      <BottomNavigation />

      {/* Floating Elements */}
      <div className="fixed top-20 right-4 w-4 h-4 bg-abyss-amber/20 rounded-full blur-sm floating-animation" style={{animationDelay: '0.5s'}}></div>
      <div className="fixed top-40 left-4 w-3 h-3 bg-abyss-teal/30 rounded-full blur-sm floating-animation" style={{animationDelay: '1s'}}></div>
      <div className="fixed bottom-40 right-8 w-5 h-5 bg-abyss-purple/20 rounded-full blur-sm floating-animation" style={{animationDelay: '1.5s'}}></div>
    </div>
  );
}
