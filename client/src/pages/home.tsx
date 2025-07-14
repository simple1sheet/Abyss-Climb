import { useAuth } from "@/hooks/useAuth";
import { useQuery, useMutation } from "@tanstack/react-query";
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
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { MapPin, Navigation, Search, Clock, Star, ExternalLink } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface Location {
  id: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  type: 'gym' | 'outdoor' | 'mixed';
  distance?: number;
  rating?: number;
  phone?: string;
  website?: string;
  hours?: string;
  description?: string;
}

interface LocationSearchResult {
  locations: Location[];
  total: number;
  searchQuery: string;
  searchLocation?: {
    latitude: number;
    longitude: number;
    address: string;
  };
}

export default function Home() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isGpsLoading, setIsGpsLoading] = useState(false);
  const [searchAddress, setSearchAddress] = useState("");
  const [searchResults, setSearchResults] = useState<LocationSearchResult | null>(null);
  const [showResults, setShowResults] = useState(false);
  
  const { data: stats } = useQuery({
    queryKey: ["/api/user/stats"],
    enabled: !!user,
  });

  const locationSearchMutation = useMutation({
    mutationFn: async (searchData: { latitude: number; longitude: number; radius?: number; query?: string }) => {
      return await apiRequest("POST", "/api/locations/search", searchData);
    },
    onSuccess: (data: LocationSearchResult) => {
      setSearchResults(data);
      setShowResults(true);
      toast({
        title: "Locations Found",
        description: `Found ${data.total} climbing locations nearby`,
      });
    },
    onError: (error) => {
      toast({
        title: "Search Error",
        description: "Failed to search for climbing locations. Please try again.",
        variant: "destructive",
      });
    },
  });

  const addressSearchMutation = useMutation({
    mutationFn: async (searchData: { address: string; radius?: number }) => {
      return await apiRequest("POST", "/api/locations/search-by-address", searchData);
    },
    onSuccess: (data: LocationSearchResult) => {
      setSearchResults(data);
      setShowResults(true);
      toast({
        title: "Locations Found",
        description: `Found ${data.total} climbing locations near ${data.searchLocation?.address}`,
      });
    },
    onError: (error) => {
      toast({
        title: "Search Error",
        description: "Failed to search for climbing locations. Please check your address and try again.",
        variant: "destructive",
      });
    },
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
        setIsGpsLoading(false);
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          locationSearchMutation.mutate({
            latitude,
            longitude,
            radius: 10000, // 10km radius
            query: "climbing gym"
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

  const handleAddressSearch = () => {
    if (!searchAddress.trim()) {
      toast({
        title: "Search Error",
        description: "Please enter a location to search.",
        variant: "destructive",
      });
      return;
    }

    addressSearchMutation.mutate({
      address: searchAddress,
      radius: 10000, // 10km radius
    });
  };

  const getTypeColor = (type: 'gym' | 'outdoor' | 'mixed') => {
    switch (type) {
      case 'gym': return 'bg-abyss-teal/20 text-abyss-teal';
      case 'outdoor': return 'bg-abyss-amber/20 text-abyss-amber';
      case 'mixed': return 'bg-abyss-purple/20 text-abyss-purple';
      default: return 'bg-abyss-muted/20 text-abyss-muted';
    }
  };

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
            <Avatar className="w-12 h-12 border-2 border-abyss-amber abyss-glow">
              <AvatarImage 
                src={user?.profileImageUrl}
                alt="Climber Profile"
                className="object-cover"
                key={user?.profileImageUrl} // Force re-render when image changes
              />
              <AvatarFallback className="bg-abyss-purple/50 text-abyss-ethereal font-semibold">
                {getInitials(`${user?.firstName || ""} ${user?.lastName || ""}`.trim() || "Cave Raider")}
              </AvatarFallback>
            </Avatar>
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
                Find nearby climbing gyms and outdoor climbing areas using GPS or search by location.
              </p>
              
              {/* GPS and Search Controls */}
              <div className="flex space-x-3">
                <Button
                  onClick={handleGpsLocation}
                  disabled={isGpsLoading || locationSearchMutation.isPending}
                  className="flex-1 bg-abyss-teal hover:bg-abyss-teal/80 text-white"
                >
                  <Navigation className="w-4 h-4 mr-2" />
                  {isGpsLoading ? "Getting Location..." : "Use GPS"}
                </Button>
                <Button
                  onClick={() => setShowResults(!showResults)}
                  variant="outline"
                  className="border-abyss-teal/30 text-abyss-ethereal hover:bg-abyss-teal/10"
                >
                  <Search className="w-4 h-4 mr-2" />
                  {showResults ? "Hide" : "Search"}
                </Button>
              </div>

              {/* Manual Search */}
              {showResults && (
                <div className="space-y-4">
                  <div className="flex space-x-2">
                    <Input
                      placeholder="Enter city, address, or location..."
                      value={searchAddress}
                      onChange={(e) => setSearchAddress(e.target.value)}
                      className="bg-abyss-dark/50 border-abyss-teal/30 text-abyss-ethereal"
                      onKeyPress={(e) => e.key === 'Enter' && handleAddressSearch()}
                    />
                    <Button
                      onClick={handleAddressSearch}
                      disabled={addressSearchMutation.isPending}
                      className="bg-abyss-amber hover:bg-abyss-amber/80 text-abyss-dark"
                    >
                      <Search className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              )}

              {/* Loading State */}
              {(locationSearchMutation.isPending || addressSearchMutation.isPending) && (
                <div className="text-center py-4">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-abyss-teal mx-auto"></div>
                  <p className="text-abyss-muted text-sm mt-2">Searching for climbing locations...</p>
                </div>
              )}

              {/* Search Results */}
              {searchResults && showResults && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-abyss-ethereal font-medium">
                      Found {searchResults.total} locations
                    </h3>
                    {searchResults.searchLocation && (
                      <p className="text-abyss-muted text-xs">
                        Near: {searchResults.searchLocation.address}
                      </p>
                    )}
                  </div>
                  
                  <div className="max-h-96 overflow-y-auto space-y-3">
                    {searchResults.locations.map((location) => (
                      <Card key={location.id} className="bg-abyss-dark/50 border-abyss-teal/20 p-3">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-2">
                              <h4 className="text-abyss-ethereal font-medium text-sm">
                                {location.name}
                              </h4>
                              <Badge className={getTypeColor(location.type)}>
                                {location.type}
                              </Badge>
                            </div>
                            <p className="text-abyss-muted text-xs mb-1">
                              {location.address}
                            </p>
                            {location.distance && (
                              <p className="text-abyss-amber text-xs">
                                📍 {location.distance.toFixed(1)} km away
                              </p>
                            )}
                            {location.description && (
                              <p className="text-abyss-muted text-xs mt-1">
                                {location.description}
                              </p>
                            )}
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${location.latitude},${location.longitude}`;
                              window.open(mapsUrl, '_blank');
                            }}
                            className="text-abyss-teal hover:bg-abyss-teal/10"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </Button>
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>
              )}

              {/* No Results */}
              {searchResults && searchResults.locations.length === 0 && showResults && (
                <div className="text-center py-4">
                  <p className="text-abyss-muted text-sm">
                    No climbing locations found in this area. Try searching in a major city like "New York", "San Francisco", or "Denver".
                  </p>
                </div>
              )}
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
