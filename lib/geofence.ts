/**
 * Restaurant Geofencing Verification
 * Prevents remote/prank orders by checking that the customer's phone
 * is physically inside or within 200m of Sudama Bhel premises.
 */

import {
  DEFAULT_RESTAURANT_LAT,
  DEFAULT_RESTAURANT_LNG,
  DEFAULT_GEOFENCE_RADIUS_METERS,
} from './constants';

export interface LocationVerificationResult {
  allowed: boolean;
  distanceMeters?: number;
  reason?: 'OUT_OF_RANGE' | 'PERMISSION_DENIED' | 'LOCATION_UNAVAILABLE' | 'GEOFENCE_DISABLED';
  message?: string;
}

/**
 * Calculates distance between two GPS coordinates using the Haversine formula (in meters).
 */
export function calculateDistanceMeters(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
): number {
  const R = 6371e3; // Earth radius in meters
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return Math.round(R * c);
}

/**
 * Get configured restaurant coordinates (supports custom location saved by owner in Admin).
 */
export function getRestaurantLocation(): { lat: number; lng: number; radiusMeters: number; enabled: boolean } {
  if (typeof window === 'undefined') {
    return {
      lat: DEFAULT_RESTAURANT_LAT,
      lng: DEFAULT_RESTAURANT_LNG,
      radiusMeters: DEFAULT_GEOFENCE_RADIUS_METERS,
      enabled: false,
    };
  }

  const storedLat = localStorage.getItem('sudama_restaurant_lat');
  const storedLng = localStorage.getItem('sudama_restaurant_lng');
  const storedRadius = localStorage.getItem('sudama_geofence_radius');
  const storedEnabled = localStorage.getItem('sudama_geofence_enabled');

  return {
    lat: storedLat ? parseFloat(storedLat) : DEFAULT_RESTAURANT_LAT,
    lng: storedLng ? parseFloat(storedLng) : DEFAULT_RESTAURANT_LNG,
    radiusMeters: storedRadius ? parseInt(storedRadius, 10) : DEFAULT_GEOFENCE_RADIUS_METERS,
    // By default DISABLED for easy testing/demo. Can be enabled in Admin.
    enabled: storedEnabled === 'true',
  };
}

/**
 * Saves restaurant coordinates (e.g. when owner clicks "Set current location as restaurant location").
 */
export function saveRestaurantLocation(lat: number, lng: number, radiusMeters = DEFAULT_GEOFENCE_RADIUS_METERS, enabled = true): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem('sudama_restaurant_lat', lat.toString());
  localStorage.setItem('sudama_restaurant_lng', lng.toString());
  localStorage.setItem('sudama_geofence_radius', radiusMeters.toString());
  localStorage.setItem('sudama_geofence_enabled', enabled ? 'true' : 'false');
}

/**
 * Verifies that the customer is physically present at Sudama Bhel before placing an order.
 */
export async function verifyCustomerAtRestaurant(): Promise<LocationVerificationResult> {
  const config = getRestaurantLocation();

  // If owner disabled geofencing (e.g. for testing), allow all
  if (!config.enabled) {
    return { allowed: true, reason: 'GEOFENCE_DISABLED' };
  }

  if (typeof window === 'undefined' || !navigator.geolocation) {
    // If browser doesn't support geolocation, allow with warning
    return { allowed: true };
  }

  return new Promise((resolve) => {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const userLat = pos.coords.latitude;
        const userLng = pos.coords.longitude;
        const distance = calculateDistanceMeters(userLat, userLng, config.lat, config.lng);

        if (distance <= config.radiusMeters) {
          resolve({
            allowed: true,
            distanceMeters: distance,
          });
        } else {
          const displayKm = (distance / 1000).toFixed(1);
          resolve({
            allowed: false,
            distanceMeters: distance,
            reason: 'OUT_OF_RANGE',
            message: `You appear to be ${displayKm} km away from Sudama Bhel (Loni Kalbhor). If you are testing or sitting at a table, you can tap "Place Order Anyway" below.`,
          });
        }
      },
      (err) => {
        if (err.code === err.PERMISSION_DENIED) {
          resolve({
            allowed: false,
            reason: 'PERMISSION_DENIED',
            message: 'Location access is required to verify you are seated at Sudama Bhel. Please allow location access in your browser to place the order.',
          });
        } else {
          // Weak signal or timeout — allow with soft fallback
          resolve({
            allowed: true,
            reason: 'LOCATION_UNAVAILABLE',
          });
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 9000,
        maximumAge: 10000,
      },
    );
  });
}
