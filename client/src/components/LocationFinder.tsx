import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MapPin, Navigation, Search, Mountain, Building2, Star, Clock, Phone, Globe } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useMutation } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';

interface Location {
  lat: number;
  lng: number;
  address?: string;
}

interface ClimbingLocation {
  id: string;
  name: string;
  type: 'indoor' | 'outdoor';
  address: string;
  location: Location;
  distance: number;
  rating: number;
  difficulty: string;
  routes: number;
  openingHours?: string;
  phone?: string;
  website?: string;
  features: string[];
  description: string;
}

export default function LocationFinder() {
  const [userLocation, setUserLocation] = useState<Location | null>(null);
  const [searchLocation, setSearchLocation] = useState('');
  const [searchRadius, setSearchRadius] = useState(10);
  const [locationType, setLocationType] = useState<'all' | 'indoor' | 'outdoor'>('all');
  const [locations, setLocations] = useState<ClimbingLocation[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isGpsLoading, setIsGpsLoading] = useState(false);
  const mapRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const findLocationsMutation = useMutation({
    mutationFn: async (data: { location: Location; radius: number; type: string }) => {
      return await apiRequest("POST", "/api/locations/find", data);
    },
    onSuccess: (data) => {
      setLocations(data.locations || []);
      toast({
        title: "Locations Found",
        description: `Found ${data.locations?.length || 0} climbing locations nearby`,
      });
    },
    onError: (error) => {
      toast({
        title: "Search Failed",
        description: "Could not find climbing locations. Please try again.",
        variant: "destructive",
      });
    },
  });

  const geocodeLocationMutation = useMutation({
    mutationFn: async (address: string) => {
      return await apiRequest("POST", "/api/locations/geocode", { address });
    },
    onSuccess: (data) => {
      if (data.location) {
        setUserLocation(data.location);
        searchNearbyLocations(data.location);
      }
    },
    onError: (error) => {
      toast({
        title: "Location Not Found",
        description: "Could not find the specified location. Please try a different address.",
        variant: "destructive",
      });
    },
  });

  const getCurrentLocation = () => {
    setIsGpsLoading(true);
    
    if (!navigator.geolocation) {
      toast({
        title: "GPS Not Available",
        description: "Your browser doesn't support GPS location.",
        variant: "destructive",
      });
      setIsGpsLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const location: Location = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };
        setUserLocation(location);
        searchNearbyLocations(location);
        setIsGpsLoading(false);
        
        toast({
          title: "Location Found",
          description: "Successfully found your current location",
        });
      },
      (error) => {
        let message = "Could not get your location.";
        if (error.code === error.PERMISSION_DENIED) {
          message = "Location access denied. Please enable location services.";
        } else if (error.code === error.POSITION_UNAVAILABLE) {
          message = "Location information is unavailable.";
        }
        
        toast({
          title: "GPS Error",
          description: message,
          variant: "destructive",
        });
        setIsGpsLoading(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000, // 5 minutes
      }
    );
  };

  const searchNearbyLocations = (location: Location) => {
    setIsLoading(true);
    findLocationsMutation.mutate({
      location,
      radius: searchRadius,
      type: locationType,
    });
    setIsLoading(false);
  };

  const handleManualSearch = () => {
    if (!searchLocation.trim()) {
      toast({
        title: "Enter Location",
        description: "Please enter a city, address, or location to search",
        variant: "destructive",
      });
      return;
    }
    
    geocodeLocationMutation.mutate(searchLocation);
  };

  const renderMap = () => {
    // Simple map placeholder - in real implementation, you'd use Google Maps, Mapbox, etc.
    return (
      <div 
        ref={mapRef}
        className="w-full h-64 bg-gradient-to-br from-abyss-purple/20 to-abyss-teal/20 rounded-lg border border-abyss-teal/30 flex items-center justify-center relative overflow-hidden"
      >
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-4 left-4 w-8 h-8 bg-abyss-amber rounded-full animate-pulse"></div>
          <div className="absolute top-12 right-8 w-6 h-6 bg-abyss-teal rounded-full animate-pulse"></div>
          <div className="absolute bottom-8 left-12 w-4 h-4 bg-abyss-amber rounded-full animate-pulse"></div>
          <div className="absolute bottom-4 right-4 w-10 h-10 bg-abyss-teal rounded-full animate-pulse"></div>
        </div>
        
        <div className="text-center z-10">
          <MapPin className="w-12 h-12 text-abyss-ethereal mx-auto mb-2" />
          <p className="text-abyss-ethereal font-medium">Interactive Map</p>
          <p className="text-abyss-muted text-sm">
            {userLocation ? `${locations.length} locations found` : 'Get your location to see nearby climbing spots'}
          </p>
          
          {userLocation && (
            <div className="mt-2 text-xs text-abyss-teal">
              📍 {userLocation.lat.toFixed(4)}, {userLocation.lng.toFixed(4)}
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderLocationCard = (location: ClimbingLocation) => (
    <Card key={location.id} className="bg-abyss-purple/20 border-abyss-teal/30 hover:border-abyss-teal/50 transition-all duration-300">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-2">
            {location.type === 'indoor' ? (
              <Building2 className="w-5 h-5 text-abyss-teal" />
            ) : (
              <Mountain className="w-5 h-5 text-abyss-amber" />
            )}
            <div>
              <CardTitle className="text-abyss-ethereal text-lg">{location.name}</CardTitle>
              <p className="text-abyss-muted text-sm">{location.address}</p>
            </div>
          </div>
          <Badge 
            variant={location.type === 'indoor' ? 'default' : 'secondary'}
            className={location.type === 'indoor' ? 'bg-abyss-teal text-abyss-dark' : 'bg-abyss-amber text-abyss-dark'}
          >
            {location.type === 'indoor' ? 'Indoor' : 'Outdoor'}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-3">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-1">
              <Star className="w-4 h-4 text-abyss-amber" />
              <span className="text-abyss-ethereal">{location.rating}/5</span>
            </div>
            <div className="flex items-center space-x-1">
              <MapPin className="w-4 h-4 text-abyss-teal" />
              <span className="text-abyss-ethereal">{location.distance.toFixed(1)} km</span>
            </div>
          </div>
          <div className="text-abyss-muted">
            {location.routes} routes • {location.difficulty}
          </div>
        </div>
        
        <p className="text-abyss-muted text-sm">{location.description}</p>
        
        {location.features.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {location.features.map((feature, index) => (
              <Badge 
                key={index} 
                variant="outline" 
                className="text-xs border-abyss-teal/30 text-abyss-ethereal"
              >
                {feature}
              </Badge>
            ))}
          </div>
        )}
        
        <div className="flex items-center justify-between pt-2">
          <div className="flex items-center space-x-4 text-xs text-abyss-muted">
            {location.openingHours && (
              <div className="flex items-center space-x-1">
                <Clock className="w-3 h-3" />
                <span>{location.openingHours}</span>
              </div>
            )}
            {location.phone && (
              <div className="flex items-center space-x-1">
                <Phone className="w-3 h-3" />
                <span>{location.phone}</span>
              </div>
            )}
          </div>
          
          <div className="flex space-x-2">
            {location.website && (
              <Button 
                size="sm" 
                variant="outline" 
                onClick={() => window.open(location.website, '_blank')}
                className="border-abyss-teal/30 text-abyss-ethereal hover:bg-abyss-teal/10"
              >
                <Globe className="w-3 h-3 mr-1" />
                Visit
              </Button>
            )}
            <Button 
              size="sm"
              className="bg-abyss-teal hover:bg-abyss-teal/80 text-abyss-dark"
              onClick={() => {
                const mapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${location.location.lat},${location.location.lng}`;
                window.open(mapsUrl, '_blank');
              }}
            >
              <Navigation className="w-3 h-3 mr-1" />
              Navigate
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      {/* Search Controls */}
      <Card className="bg-abyss-purple/20 border-abyss-teal/30">
        <CardHeader>
          <CardTitle className="text-abyss-ethereal flex items-center space-x-2">
            <MapPin className="w-5 h-5" />
            <span>Find Climbing Locations</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Tabs defaultValue="gps" className="w-full">
            <TabsList className="grid w-full grid-cols-2 bg-abyss-dark/50">
              <TabsTrigger value="gps" className="data-[state=active]:bg-abyss-teal data-[state=active]:text-abyss-dark">
                Use GPS
              </TabsTrigger>
              <TabsTrigger value="manual" className="data-[state=active]:bg-abyss-teal data-[state=active]:text-abyss-dark">
                Enter Location
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="gps" className="space-y-4">
              <div className="text-center">
                <Button
                  onClick={getCurrentLocation}
                  disabled={isGpsLoading}
                  className="bg-abyss-teal hover:bg-abyss-teal/80 text-abyss-dark"
                >
                  {isGpsLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-abyss-dark border-t-transparent rounded-full animate-spin mr-2" />
                      Getting Location...
                    </>
                  ) : (
                    <>
                      <Navigation className="w-4 h-4 mr-2" />
                      Use My Current Location
                    </>
                  )}
                </Button>
              </div>
            </TabsContent>
            
            <TabsContent value="manual" className="space-y-4">
              <div className="flex space-x-2">
                <div className="flex-1">
                  <Label htmlFor="location-search" className="text-abyss-ethereal">
                    City, Address, or Location
                  </Label>
                  <Input
                    id="location-search"
                    placeholder="e.g., New York, NY or 123 Main St"
                    value={searchLocation}
                    onChange={(e) => setSearchLocation(e.target.value)}
                    className="bg-abyss-dark/50 border-abyss-teal/30 text-abyss-ethereal"
                    onKeyPress={(e) => e.key === 'Enter' && handleManualSearch()}
                  />
                </div>
                <div className="flex items-end">
                  <Button
                    onClick={handleManualSearch}
                    disabled={geocodeLocationMutation.isPending}
                    className="bg-abyss-teal hover:bg-abyss-teal/80 text-abyss-dark"
                  >
                    <Search className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </TabsContent>
          </Tabs>
          
          {/* Search Filters */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="search-radius" className="text-abyss-ethereal">
                Search Radius
              </Label>
              <Select value={searchRadius.toString()} onValueChange={(value) => setSearchRadius(parseInt(value))}>
                <SelectTrigger className="bg-abyss-dark/50 border-abyss-teal/30">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="5">5 km</SelectItem>
                  <SelectItem value="10">10 km</SelectItem>
                  <SelectItem value="25">25 km</SelectItem>
                  <SelectItem value="50">50 km</SelectItem>
                  <SelectItem value="100">100 km</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="location-type" className="text-abyss-ethereal">
                Location Type
              </Label>
              <Select value={locationType} onValueChange={(value: 'all' | 'indoor' | 'outdoor') => setLocationType(value)}>
                <SelectTrigger className="bg-abyss-dark/50 border-abyss-teal/30">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Locations</SelectItem>
                  <SelectItem value="indoor">Indoor Only</SelectItem>
                  <SelectItem value="outdoor">Outdoor Only</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Map */}
      {renderMap()}

      {/* Location Results */}
      {locations.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-xl font-bold text-abyss-ethereal">
            Nearby Climbing Locations ({locations.length})
          </h3>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {locations.map(renderLocationCard)}
          </div>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && locations.length === 0 && userLocation && (
        <Card className="bg-abyss-purple/20 border-abyss-teal/30">
          <CardContent className="text-center py-8">
            <Mountain className="w-12 h-12 text-abyss-muted mx-auto mb-4" />
            <p className="text-abyss-muted mb-4">
              Real climbing location data requires API integration
            </p>
            <p className="text-abyss-muted text-sm">
              This feature would normally use Google Places API or similar services to find real climbing gyms and outdoor locations. 
              Currently showing placeholder message instead of fake data.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Initial State */}
      {!userLocation && (
        <Card className="bg-abyss-purple/20 border-abyss-teal/30">
          <CardContent className="text-center py-8">
            <MapPin className="w-12 h-12 text-abyss-muted mx-auto mb-4" />
            <p className="text-abyss-muted mb-4">
              Find Real Climbing Locations
            </p>
            <p className="text-abyss-muted text-sm">
              Use your GPS location or enter a location manually to search for nearby climbing gyms and outdoor climbing areas.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}