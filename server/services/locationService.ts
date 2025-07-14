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
        throw new Error(`PositionStack API error: ${response.status}`);
      }

      const data: PositionStackResponse = await response.json();
      
      if (!data.data || data.data.length === 0) {
        return `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;
      }

      return data.data[0].label || `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;
    } catch (error) {
      console.error('Reverse geocoding error:', error);
      return `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;
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
      // Create search queries for different types of climbing locations
      const searchQueries = [
        'climbing gym',
        'bouldering gym',
        'rock climbing',
        'indoor climbing',
        'climbing wall',
        'climbing center'
      ];

      if (query) {
        searchQueries.unshift(query);
      }

      const allLocations: Location[] = [];
      const searchLocation = {
        latitude,
        longitude,
        address: await this.reverseGeocode(latitude, longitude)
      };

      // Search for each query type
      for (const searchQuery of searchQueries) {
        try {
          const response = await fetch(
            `${this.BASE_URL}/forward?access_key=${this.API_KEY}&query=${encodeURIComponent(searchQuery)}&bbox=${longitude - 0.1},${latitude - 0.1},${longitude + 0.1},${latitude + 0.1}&limit=10`
          );

          if (response.ok) {
            const data: PositionStackResponse = await response.json();
            
            if (data.data && data.data.length > 0) {
              const locations = data.data.map((item, index) => {
                const distance = this.calculateDistance(
                  latitude,
                  longitude,
                  item.latitude,
                  item.longitude
                );

                return {
                  id: `${item.latitude}_${item.longitude}_${index}`,
                  name: item.name || item.label || 'Climbing Location',
                  address: item.label || `${item.latitude}, ${item.longitude}`,
                  latitude: item.latitude,
                  longitude: item.longitude,
                  type: this.determineClimbingType(item.name || item.label || ''),
                  distance: distance,
                  description: `Found via: ${searchQuery}`
                } as Location;
              }).filter(loc => loc.distance <= radius / 1000); // Filter by radius in km

              allLocations.push(...locations);
            }
          }
        } catch (error) {
          console.error(`Error searching for ${searchQuery}:`, error);
        }
      }

      // Remove duplicates and sort by distance
      const uniqueLocations = this.removeDuplicateLocations(allLocations);
      uniqueLocations.sort((a, b) => (a.distance || 0) - (b.distance || 0));

      return {
        locations: uniqueLocations.slice(0, 20), // Limit to top 20 results
        total: uniqueLocations.length,
        searchQuery: query || 'climbing locations',
        searchLocation
      };
    } catch (error) {
      console.error('Location search error:', error);
      throw new Error('Failed to search for climbing locations');
    }
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
        'climbing gym'
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