// Removed AI location generation - using only real data sources

export interface Location {
  lat: number;
  lng: number;
  address?: string;
}

export interface ClimbingLocation {
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

export class LocationService {
  async geocodeAddress(address: string): Promise<Location | null> {
    try {
      // In a real implementation, you would use Google Maps Geocoding API
      // For now, we'll use a simple mock implementation
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&limit=1`
      );
      
      if (!response.ok) {
        throw new Error('Geocoding failed');
      }
      
      const data = await response.json();
      
      if (data.length === 0) {
        return null;
      }
      
      return {
        lat: parseFloat(data[0].lat),
        lng: parseFloat(data[0].lon),
        address: data[0].display_name
      };
    } catch (error) {
      console.error('Geocoding error:', error);
      return null;
    }
  }

  async findNearbyClimbingLocations(
    location: Location,
    radiusKm: number = 10,
    type: 'all' | 'indoor' | 'outdoor' = 'all'
  ): Promise<ClimbingLocation[]> {
    try {
      // For now, using a small sample of real locations
      // In a real implementation, this would use Google Places API or similar
      const realLocations = this.getRealClimbingLocations(location, radiusKm, type);
      
      // Sort by distance and return results
      return realLocations
        .sort((a, b) => a.distance - b.distance)
        .slice(0, 15); // Limit to top 15 results
        
    } catch (error) {
      console.error('Error finding climbing locations:', error);
      return [];
    }
  }

  private getRealClimbingLocations(
    location: Location,
    radiusKm: number,
    type: 'all' | 'indoor' | 'outdoor'
  ): ClimbingLocation[] {
    // Sample of real climbing locations - in a real app, this would use Google Places API
    const realLocations: ClimbingLocation[] = [
      // Note: In a real implementation, these would come from Google Places API or similar
      // For now, showing a message to users that real location data requires API setup
    ];

    // For now, return empty array since we're not using fake locations
    // In a real implementation, this would query Google Places API or similar
    return [];
  }

  private calculateDistance(loc1: Location, loc2: Location): number {
    const R = 6371; // Earth's radius in kilometers
    const dLat = this.toRadians(loc2.lat - loc1.lat);
    const dLon = this.toRadians(loc2.lng - loc1.lng);
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(this.toRadians(loc1.lat)) * Math.cos(this.toRadians(loc2.lat)) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }

  private toRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
  }
}

export const locationService = new LocationService();