export interface CityLocation {
  name: string;
  province: string;
  lat: number;
  lng: number;
}

export const PAKISTAN_CITIES: CityLocation[] = [
  { name: 'Multan', province: 'Punjab', lat: 30.1575, lng: 71.5249 },
  { name: 'Lahore', province: 'Punjab', lat: 31.5204, lng: 74.3587 },
  { name: 'Islamabad', province: 'Federal', lat: 33.6844, lng: 73.0479 },
  { name: 'Rawalpindi', province: 'Punjab', lat: 33.5651, lng: 73.0169 },
  { name: 'Karachi', province: 'Sindh', lat: 24.8607, lng: 67.0011 },
  { name: 'Faisalabad', province: 'Punjab', lat: 31.4504, lng: 73.135 },
  { name: 'Peshawar', province: 'KPK', lat: 34.0151, lng: 71.5249 },
  { name: 'Gujranwala', province: 'Punjab', lat: 32.1877, lng: 74.1945 },
  { name: 'Sialkot', province: 'Punjab', lat: 32.4945, lng: 74.5229 },
  { name: 'Quetta', province: 'Balochistan', lat: 30.1798, lng: 66.975 },
  { name: 'Bahawalpur', province: 'Punjab', lat: 29.3544, lng: 71.6911 },
  { name: 'Sargodha', province: 'Punjab', lat: 32.0836, lng: 72.6711 },
  { name: 'Abbottabad', province: 'KPK', lat: 34.1688, lng: 73.2215 },
  { name: 'Hyderabad', province: 'Sindh', lat: 25.396, lng: 68.3578 },
];

export const RADIUS_OPTIONS = [10, 25, 50, 100, 250, 500] as const;

/**
 * Calculates the great-circle distance between two geographic coordinates
 * using the Haversine formula (returns distance in kilometers).
 */
export function calculateDistanceKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth's mean radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c);
}

/**
 * Resolves a text location string (e.g. "Lahore, Pakistan" or "Gulberg, Lahore")
 * to known city coordinates.
 */
export function resolveLocationCoords(
  locationString?: string | null
): CityLocation | null {
  if (!locationString) return null;
  const normalized = locationString.toLowerCase();

  for (const city of PAKISTAN_CITIES) {
    if (normalized.includes(city.name.toLowerCase())) {
      return city;
    }
  }

  if (normalized.includes('punjab')) {
    return PAKISTAN_CITIES[1]; // Lahore fallback
  }
  if (normalized.includes('sindh')) {
    return PAKISTAN_CITIES[4]; // Karachi fallback
  }
  if (normalized.includes('kpk') || normalized.includes('khyber')) {
    return PAKISTAN_CITIES[6]; // Peshawar fallback
  }

  return null;
}
