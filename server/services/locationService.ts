import { generateClimbingLocations } from './openai';

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
      // Generate AI-powered climbing locations based on the area
      const aiLocations = await generateClimbingLocations(location, radiusKm, type);
      
      // Combine with known climbing locations database
      const knownLocations = this.getKnownClimbingLocations(location, radiusKm, type);
      
      // Merge and deduplicate
      const allLocations = [...aiLocations, ...knownLocations];
      
      // Sort by distance and return top results
      return allLocations
        .sort((a, b) => a.distance - b.distance)
        .slice(0, 20); // Limit to top 20 results
        
    } catch (error) {
      console.error('Error finding climbing locations:', error);
      // Return fallback locations
      return this.getKnownClimbingLocations(location, radiusKm, type);
    }
  }

  private getKnownClimbingLocations(
    location: Location,
    radiusKm: number,
    type: 'all' | 'indoor' | 'outdoor'
  ): ClimbingLocation[] {
    // Sample climbing locations - in a real app, this would come from a database
    const sampleLocations: ClimbingLocation[] = [
      {
        id: 'indoor-1',
        name: 'Urban Climbing Gym',
        type: 'indoor',
        address: '123 Climbing St, Downtown',
        location: {
          lat: location.lat + 0.01,
          lng: location.lng + 0.01
        },
        distance: 1.2,
        rating: 4.5,
        difficulty: 'V0-V12',
        routes: 150,
        openingHours: '6:00 AM - 10:00 PM',
        phone: '(555) 123-4567',
        website: 'https://urbanclimbing.com',
        features: ['Bouldering', 'Lead Climbing', 'Auto Belay', 'Yoga Classes'],
        description: 'Modern climbing gym with state-of-the-art routes and facilities.'
      },
      {
        id: 'outdoor-1',
        name: 'Red Rock Canyon',
        type: 'outdoor',
        address: 'Red Rock Canyon National Conservation Area',
        location: {
          lat: location.lat + 0.05,
          lng: location.lng - 0.02
        },
        distance: 5.8,
        rating: 4.8,
        difficulty: 'V0-V15',
        routes: 500,
        features: ['Sandstone', 'Multi-pitch', 'Trad Climbing', 'Sport Climbing'],
        description: 'World-class outdoor climbing destination with stunning red rock formations.'
      },
      {
        id: 'indoor-2',
        name: 'Boulder Central',
        type: 'indoor',
        address: '456 Boulder Ave, Midtown',
        location: {
          lat: location.lat - 0.02,
          lng: location.lng + 0.03
        },
        distance: 3.4,
        rating: 4.2,
        difficulty: 'V0-V10',
        routes: 120,
        openingHours: '7:00 AM - 9:00 PM',
        phone: '(555) 987-6543',
        website: 'https://bouldercentral.com',
        features: ['Bouldering Only', 'Training Area', 'Competitions', 'Kids Programs'],
        description: 'Dedicated bouldering gym with creative problem setting and training facilities.'
      },
      {
        id: 'outdoor-2',
        name: 'Mountain Peak Crags',
        type: 'outdoor',
        address: 'Mountain Peak State Park',
        location: {
          lat: location.lat + 0.08,
          lng: location.lng + 0.05
        },
        distance: 12.3,
        rating: 4.6,
        difficulty: 'V1-V12',
        routes: 300,
        features: ['Granite', 'Traditional Climbing', 'Alpine Routes', 'Camping'],
        description: 'High-altitude climbing area with challenging granite routes and scenic views.'
      }
    ];

    // Filter by type and distance
    return sampleLocations
      .filter(loc => {
        if (type !== 'all' && loc.type !== type) return false;
        return loc.distance <= radiusKm;
      })
      .map(loc => ({
        ...loc,
        distance: this.calculateDistance(location, loc.location)
      }));
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