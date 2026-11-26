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
      label: '10 mins',
      distanceKm: 1.2,
    };
  }

  const dist = calculateDistanceKm(
    DARK_STORE_COORDS.lat,
    DARK_STORE_COORDS.lng,
    lat,
    lng
  );

  // If destination is within 1 km: ~8 to 10 mins
  // If destination is 2 km: ~10 to 12 mins
  // If destination is 3 km: ~13 to 15 mins
  const travelMins = dist * 2.5;
  const totalMins = Math.max(8, Math.round(5 + travelMins));

  return {
    minutes: totalMins,
    label: `${totalMins} mins`,
    distanceKm: Math.round(dist * 10) / 10,
  };
}

/**
 * Reverse geocodes coordinates to a clean, human-readable address label.
 * NEVER returns raw latitude/longitude numbers.
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

      if (place.name && !isRawCoordinate(place.name)) {
        parts.push(place.name);
      }
      if (place.street && !isRawCoordinate(place.street) && !parts.includes(place.street)) {
        parts.push(place.street);
      }
      if (place.subregion && !parts.includes(place.subregion)) {
        parts.push(place.subregion);
      } else if (place.city && !parts.includes(place.city)) {
        parts.push(place.city);
      } else if (place.district && !parts.includes(place.district)) {
        parts.push(place.district);
      }

      if (parts.length > 0) {
        return parts.join(', ');
      }
    }
  } catch (e) {
    // Graceful fallback on permission error or network failure
  }

  // Sensible default human-readable locality in Hetauda
  return 'School Road, Hetauda-4';
}

function isRawCoordinate(str: string): boolean {
  return /^\d{1,3}\.\d+$/.test(str.trim()) || /^-?\d+\.\d+,\s*-?\d+\.\d+$/.test(str.trim());
}
