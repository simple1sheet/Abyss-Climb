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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MapPin, Navigation, Search } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

export default function Home() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isGpsLoading, setIsGpsLoading] = useState(false);
  
  const { data: stats } = useQuery({
    queryKey: ["/api/user/stats"],
    enabled: !!user,
  });

  const getInitials = (name?: string) => {
    if (!name) return "CR"; // Cave Raider
    return name.split(" ").map(n => n[0]?.toUpperCase()).join("").slice(0, 2) || "CR";
  };

  const handleGpsLocation = async () => {
    setIsGpsLoading(true);
    try {
      if (!navigator.geolocation) {
        toast({
          title: "GPS Not Supported",
          description: "Your browser doesn't support GPS location access.",
          variant: "destructive",
        });
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          toast({
            title: "Location Found",
            description: `Your location: ${latitude.toFixed(6)}, ${longitude.toFixed(6)}`,
          });
          setIsGpsLoading(false);
        },
        (error) => {
          toast({
            title: "Location Error",
            description: "Unable to access GPS location. Please check your browser permissions.",
            variant: "destructive",
          });
          setIsGpsLoading(false);
        }
      );
    } catch (error) {
      toast({
        title: "GPS Error",
        description: "Failed to access location services.",
        variant: "destructive",
      });
      setIsGpsLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto bg-abyss-gradient min-h-screen relative overflow-hidden">
      {/* Made in Abyss Map Background */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-abyss-teal/10 to-abyss-purple/20"></div>
        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-full h-full">
          <div className="relative w-full h-full">
            {/* Abyss layers represented as vertical bands */}
            <div className="absolute top-0 left-0 right-0 h-1/7 bg-gradient-to-b from-amber-300/10 to-orange-400/10"></div>
            <div className="absolute top-[14%] left-0 right-0 h-1/7 bg-gradient-to-b from-green-300/10 to-emerald-500/10"></div>
            <div className="absolute top-[28%] left-0 right-0 h-1/7 bg-gradient-to-b from-blue-300/10 to-cyan-500/10"></div>
            <div className="absolute top-[42%] left-0 right-0 h-1/7 bg-gradient-to-b from-purple-300/10 to-violet-500/10"></div>
            <div className="absolute top-[56%] left-0 right-0 h-1/7 bg-gradient-to-b from-teal-300/10 to-cyan-600/10"></div>
            <div className="absolute top-[70%] left-0 right-0 h-1/7 bg-gradient-to-b from-red-300/10 to-rose-500/10"></div>
            <div className="absolute top-[84%] left-0 right-0 h-1/7 bg-gradient-to-b from-indigo-300/10 to-purple-700/10"></div>
            
            {/* Mystical depth lines */}
            <div className="absolute top-1/7 left-0 right-0 h-px bg-gradient-to-r from-transparent via-abyss-amber/20 to-transparent"></div>
            <div className="absolute top-2/7 left-0 right-0 h-px bg-gradient-to-r from-transparent via-abyss-teal/20 to-transparent"></div>
            <div className="absolute top-3/7 left-0 right-0 h-px bg-gradient-to-r from-transparent via-abyss-purple/20 to-transparent"></div>
            <div className="absolute top-4/7 left-0 right-0 h-px bg-gradient-to-r from-transparent via-abyss-amber/20 to-transparent"></div>
            <div className="absolute top-5/7 left-0 right-0 h-px bg-gradient-to-r from-transparent via-abyss-teal/20 to-transparent"></div>
            <div className="absolute top-6/7 left-0 right-0 h-px bg-gradient-to-r from-transparent via-abyss-crimson/20 to-transparent"></div>
          </div>
        </div>
      </div>
      
      {/* Floating mystical particles */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-10 right-10 w-32 h-32 bg-abyss-amber rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 left-10 w-40 h-40 bg-abyss-teal rounded-full blur-3xl"></div>
        <div className="absolute top-40 left-5 w-2 h-2 bg-abyss-amber/40 rounded-full blur-sm floating-animation"></div>
        <div className="absolute top-60 right-8 w-1 h-1 bg-abyss-teal/30 rounded-full blur-sm floating-animation" style={{animationDelay: '2s'}}></div>
        <div className="absolute bottom-40 right-12 w-3 h-3 bg-abyss-purple/20 rounded-full blur-sm floating-animation" style={{animationDelay: '4s'}}></div>
      </div>

      {/* Header */}
      <header className="relative z-20 px-6 pt-12 pb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Avatar className="w-12 h-12 border-2 border-abyss-amber mystical-glow">
              <AvatarImage 
                src={user?.profileImageUrl}
                alt="Delver Profile"
                className="object-cover"
                key={user?.profileImageUrl} // Force re-render when image changes
              />
              <AvatarFallback className="bg-abyss-purple/50 text-abyss-ethereal font-semibold">
                {getInitials(`${user?.firstName || ""} ${user?.lastName || ""}`.trim() || "Cave Raider")}
              </AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-lg font-semibold text-abyss-ethereal">
                {user?.firstName || "Delver"}
              </h1>
              <p className="text-sm text-abyss-amber">
                Layer {user?.currentLayer || 1} Explorer • The Abyss Calls
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <button className="text-abyss-amber hover:text-abyss-ethereal transition-colors relic-glow">
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
        
        {/* Location Finder */}
        <div className="px-6 mb-6">
          <Card className="bg-abyss-purple/20 backdrop-blur-sm border-abyss-teal/20">
            <CardHeader>
              <CardTitle className="text-abyss-ethereal flex items-center space-x-2">
                <MapPin className="w-5 h-5 text-abyss-amber" />
                <span>Find Climbing Locations</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-abyss-muted text-sm">
                Find nearby climbing gyms and outdoor areas using trusted climbing databases and maps.
              </p>
              <div className="flex space-x-3">
                <Button
                  onClick={handleGpsLocation}
                  disabled={isGpsLoading}
                  className="flex-1 bg-abyss-teal hover:bg-abyss-teal/80 text-white"
                >
                  <Navigation className="w-4 h-4 mr-2" />
                  {isGpsLoading ? "Getting Location..." : "Use GPS"}
                </Button>
                <Button
                  onClick={() => window.open('https://www.google.com/maps/search/climbing+gym+near+me', '_blank')}
                  variant="outline"
                  className="flex-1 border-abyss-teal/30 text-abyss-ethereal hover:bg-abyss-teal/10"
                >
                  <Search className="w-4 h-4 mr-2" />
                  Search Maps
                </Button>
              </div>
              <div className="grid grid-cols-2 gap-3 mt-4">
                <Button
                  onClick={() => window.open('https://www.mountainproject.com/route-finder', '_blank')}
                  variant="outline"
                  className="border-abyss-teal/30 text-abyss-ethereal hover:bg-abyss-teal/10 text-sm"
                >
                  🏔️ Mountain Project
                </Button>
                <Button
                  onClick={() => window.open('https://www.thecrag.com/climbing', '_blank')}
                  variant="outline"
                  className="border-abyss-teal/30 text-abyss-ethereal hover:bg-abyss-teal/10 text-sm"
                >
                  🧗 theCrag
                </Button>
              </div>
              <div className="text-center">
                <p className="text-abyss-muted text-xs">
                  Links to trusted climbing resources with real, up-to-date location data.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
        
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
