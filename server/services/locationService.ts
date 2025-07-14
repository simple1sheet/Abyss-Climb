import { z } from "zod";

// Location types
export interface Location {
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

export interface LocationSearchResult {
  locations: Location[];
  total: number;
  searchQuery: string;
  searchLocation?: {
    latitude: number;
    longitude: number;
    address: string;
  };
}

// PositionStack API response types
interface PositionStackLocation {
  latitude: number;
  longitude: number;
  label: string;
  name: string;
  type: string;
  distance?: number;
  administrative_area?: string;
  country?: string;
  postal_code?: string;
  region?: string;
  locality?: string;
  street?: string;
  number?: string;
}

interface PositionStackResponse {
  data: PositionStackLocation[];
}

export class LocationService {
  private readonly API_KEY = process.env.POSITIONSTACK_API_KEY;
  private readonly BASE_URL = 'http://api.positionstack.com/v1';

  constructor() {
    if (!this.API_KEY) {
      throw new Error('POSITIONSTACK_API_KEY environment variable is required');
    }
  }

  // Geocode an address to get coordinates
  async geocodeAddress(address: string): Promise<{ latitude: number; longitude: number; formattedAddress: string }> {
    try {
      const response = await fetch(
        `${this.BASE_URL}/forward?access_key=${this.API_KEY}&query=${encodeURIComponent(address)}&limit=1`
      );

      if (!response.ok) {
        throw new Error(`PositionStack API error: ${response.status}`);
      }

      const data: PositionStackResponse = await response.json();
      
      if (!data.data || data.data.length === 0) {
        throw new Error('No location found for the given address');
      }

      const location = data.data[0];
      return {
        latitude: location.latitude,
        longitude: location.longitude,
        formattedAddress: location.label || address
      };
    } catch (error) {
      console.error('Geocoding error:', error);
      throw new Error('Failed to geocode address');
    }
  }

  // Reverse geocode coordinates to get address
  async reverseGeocode(latitude: number, longitude: number): Promise<string> {
    try {
      const response = await fetch(
        `${this.BASE_URL}/reverse?access_key=${this.API_KEY}&query=${latitude},${longitude}&limit=1`
      );

      if (!response.ok) {
        if (response.status === 429) {
          throw new Error('Rate limit exceeded');
        }
        throw new Error(`PositionStack API error: ${response.status}`);
      }

      const data: PositionStackResponse = await response.json();
      
      if (!data.data || data.data.length === 0) {
        return `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;
      }

      return data.data[0].label || `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;
    } catch (error) {
      console.error('Reverse geocoding error:', error);
      throw error; // Re-throw so caller can handle appropriately
    }
  }

  // Search for climbing locations near coordinates
  async searchClimbingLocations(
    latitude: number,
    longitude: number,
    radius: number = 10000, // 10km default
    query?: string
  ): Promise<LocationSearchResult> {
    try {
      // Get address without throwing error if it fails
      let address = `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;
      try {
        address = await this.reverseGeocode(latitude, longitude);
      } catch (error) {
        console.log('Reverse geocoding failed, using coordinates as address');
      }

      const searchLocation = {
        latitude,
        longitude,
        address
      };

      // Since PositionStack is a geocoding service, not a business directory,
      // we'll return sample climbing locations based on major cities
      const sampleLocations = this.getSampleClimbingLocations(latitude, longitude, radius);

      return {
        locations: sampleLocations,
        total: sampleLocations.length,
        searchQuery: query || 'climbing locations',
        searchLocation
      };
    } catch (error) {
      console.error('Location search error:', error);
      throw new Error('Failed to search for climbing locations');
    }
  }

  // Get sample climbing locations for major cities
  private getSampleClimbingLocations(latitude: number, longitude: number, radius: number): Location[] {
    const locations: Location[] = [];
    
    // Major climbing locations database
    const knownClimbingLocations = [
      // New York City area
      { name: "Brooklyn Boulders Queensbridge", lat: 40.7589, lng: -73.9441, type: "gym" as const },
      { name: "Central Park Climbing", lat: 40.7829, lng: -73.9654, type: "outdoor" as const },
      { name: "Manhattan Plaza Health Club", lat: 40.7614, lng: -73.9776, type: "gym" as const },
      
      // San Francisco area
      { name: "Planet Granite San Francisco", lat: 37.7749, lng: -122.4194, type: "gym" as const },
      { name: "Yosemite National Park", lat: 37.8651, lng: -119.5383, type: "outdoor" as const },
      { name: "Mission Cliffs", lat: 37.7588, lng: -122.4089, type: "gym" as const },
      
      // Los Angeles area
      { name: "Cliffs of Id", lat: 34.0522, lng: -118.2437, type: "gym" as const },
      { name: "Joshua Tree National Park", lat: 33.8734, lng: -115.9010, type: "outdoor" as const },
      { name: "Hangar 18", lat: 34.1478, lng: -118.1445, type: "gym" as const },
      
      // Seattle area
      { name: "Vertical World Seattle", lat: 47.6062, lng: -122.3321, type: "gym" as const },
      { name: "Index Town Wall", lat: 47.8206, lng: -121.5540, type: "outdoor" as const },
      { name: "Stone Gardens", lat: 47.6606, lng: -122.3491, type: "gym" as const },
      
      // Denver area
      { name: "Movement Climbing Denver", lat: 39.7392, lng: -104.9903, type: "gym" as const },
      { name: "Flatirons", lat: 39.9991, lng: -105.2928, type: "outdoor" as const },
      { name: "Earth Treks Golden", lat: 39.7555, lng: -105.2211, type: "gym" as const },
      
      // Austin area
      { name: "Austin Bouldering Project", lat: 30.2672, lng: -97.7431, type: "gym" as const },
      { name: "Reimers Ranch", lat: 30.0874, lng: -98.0625, type: "outdoor" as const },
      { name: "Crux Climbing Center", lat: 30.2849, lng: -97.7341, type: "gym" as const },
      
      // Chicago area
      { name: "First Ascent Chicago", lat: 41.8781, lng: -87.6298, type: "gym" as const },
      { name: "Devil's Lake State Park", lat: 43.4221, lng: -89.7267, type: "outdoor" as const },
      { name: "Brooklyn Boulders Chicago", lat: 41.9278, lng: -87.6692, type: "gym" as const },
      
      // Boston area
      { name: "Brooklyn Boulders Somerville", lat: 42.3875, lng: -71.0995, type: "gym" as const },
      { name: "Quincy Quarries", lat: 42.2459, lng: -71.0275, type: "outdoor" as const },
      { name: "Metro Rock", lat: 42.3601, lng: -71.0589, type: "gym" as const },
    ];

    // Filter locations within radius
    for (const location of knownClimbingLocations) {
      const distance = this.calculateDistance(latitude, longitude, location.lat, location.lng);
      
      if (distance <= radius / 1000) { // Convert radius to km
        locations.push({
          id: `${location.lat}_${location.lng}`,
          name: location.name,
          address: `${location.lat.toFixed(4)}, ${location.lng.toFixed(4)}`,
          latitude: location.lat,
          longitude: location.lng,
          type: location.type,
          distance: distance,
          description: `Popular climbing location in the area`
        });
      }
    }

    // Sort by distance
    locations.sort((a, b) => (a.distance || 0) - (b.distance || 0));
    
    return locations.slice(0, 20); // Limit to top 20 results
  }

  // Search for climbing locations by city/address
  async searchClimbingLocationsByAddress(
    address: string,
    radius: number = 10000
  ): Promise<LocationSearchResult> {
    try {
      const geocoded = await this.geocodeAddress(address);
      return await this.searchClimbingLocations(
        geocoded.latitude,
        geocoded.longitude,
        radius,
        'climbing locations'
      );
    } catch (error) {
      console.error('Address search error:', error);
      throw new Error('Failed to search for climbing locations by address');
    }
  }

  // Helper: Calculate distance between two points using Haversine formula
  private calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371; // Earth's radius in kilometers
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }

  // Helper: Determine climbing type based on name/description
  private determineClimbingType(name: string): 'gym' | 'outdoor' | 'mixed' {
    const lowerName = name.toLowerCase();
    
    if (lowerName.includes('gym') || lowerName.includes('indoor') || lowerName.includes('center')) {
      return 'gym';
    } else if (lowerName.includes('outdoor') || lowerName.includes('rock') || lowerName.includes('crag')) {
      return 'outdoor';
    } else {
      return 'mixed';
    }
  }

  // Helper: Remove duplicate locations based on proximity
  private removeDuplicateLocations(locations: Location[]): Location[] {
    const unique: Location[] = [];
    
    for (const location of locations) {
      const isDuplicate = unique.some(existing => 
        this.calculateDistance(
          location.latitude,
          location.longitude,
          existing.latitude,
          existing.longitude
        ) < 0.1 // Within 100 meters
      );
      
      if (!isDuplicate) {
        unique.push(location);
      }
    }
    
    return unique;
  }
}

// Validation schemas
export const locationSearchSchema = z.object({
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  radius: z.number().min(100).max(50000).default(10000),
  query: z.string().optional(),
});

export const addressSearchSchema = z.object({
  address: z.string().min(1),
  radius: z.number().min(100).max(50000).default(10000),
});

export const locationService = new LocationService();