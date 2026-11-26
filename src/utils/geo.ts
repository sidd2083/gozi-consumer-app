import * as Location from 'expo-location';

/**
 * Gozii Dark Store Coordinates (Hetauda, Nepal)
 * 27°25'16.6"N 85°02'33.8"E
 */
export const DARK_STORE_COORDS = {
  lat: 27.421278,
  lng: 85.042722,
  address: 'Gozii Dark Store, Hetauda',
};

/**
 * Calculate distance in kilometers using the Haversine formula
 */
export function calculateDistanceKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Compute realistic dynamic ETA from Gozii Dark Store to destination:
 * - Base buffer: 5 mins for packing & dispatch
 * - Travel speed: ~2.5 mins per km in Hetauda urban & suburban routes
 */
export function calculateDeliveryEta(lat?: number, lng?: number): {
  minutes: number;
  label: string;
  distanceKm: number;
} {
  if (!lat || !lng || isNaN(lat) || isNaN(lng)) {
    return {
      minutes: 10,
      label: '10 MINS',
      distanceKm: 1.2,
    };
  }

  const dist = calculateDistanceKm(
    DARK_STORE_COORDS.lat,
    DARK_STORE_COORDS.lng,
    lat,
    lng
  );

  const travelMins = dist * 2.5;
  const totalMins = Math.max(8, Math.round(5 + travelMins));

  return {
    minutes: totalMins,
    label: `${totalMins} MINS`,
    distanceKm: Math.round(dist * 10) / 10,
  };
}

/**
 * Checks if a string is a Plus Code (like C2CR+92), an unhelpful short code, or raw coordinates.
 */
function isPlusCodeOrInvalid(str: string): boolean {
  if (!str) return true;
  const trimmed = str.trim();
  // Plus code format like C2CR+3X, 87Q8C2CR+92
  if (/[A-Z0-9]{2,8}\+[A-Z0-9]*/i.test(trimmed)) return true;
  // Short 3-4 alphanumeric codes without vowels/spaces like C2CR
  if (/^[A-Z0-9]{3,5}$/i.test(trimmed) && !/^(road|tole|ward|chowk|gate|city)/i.test(trimmed)) return true;
  // Raw numeric coordinates
  if (/^\d{1,3}\.\d+$/.test(trimmed)) return true;
  if (/^-?\d+\.\d+,\s*-?\d+\.\d+$/.test(trimmed)) return true;
  // Unnamed road codes
  if (/^unnamed/i.test(trimmed)) return true;
  return false;
}

/**
 * Reverse geocodes coordinates to a clean, human-readable exact address label.
 * Strictly eliminates Plus Codes (like C2CR) and raw numbers.
 */
export async function reverseGeocodeToReadable(
  latitude: number,
  longitude: number
): Promise<string> {
  try {
    const results = await Location.reverseGeocodeAsync({ latitude, longitude });
    if (results && results.length > 0) {
      const place = results[0];
      const parts: string[] = [];

      // Check street name first
      if (place.street && !isPlusCodeOrInvalid(place.street)) {
        parts.push(place.street);
      } else if (place.name && !isPlusCodeOrInvalid(place.name)) {
        parts.push(place.name);
      }

      // Check subregion / locality / ward
      if (place.subregion && !isPlusCodeOrInvalid(place.subregion) && !parts.includes(place.subregion)) {
        parts.push(place.subregion);
      }

      // Check city or district
      const cityOrDistrict = place.city || place.district || 'Hetauda';
      if (!isPlusCodeOrInvalid(cityOrDistrict) && !parts.includes(cityOrDistrict)) {
        parts.push(cityOrDistrict);
      }

      if (parts.length > 0) {
        return parts.join(', ');
      }
    }
  } catch (e) {
    // Fallback on error
  }

  // Exact human-readable doorstep default in Hetauda
  return 'School Road, Hetauda-4, Makwanpur';
}
