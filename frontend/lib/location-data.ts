export interface CityLocation {
  name: string;
  lat: number;
  lng: number;
  province: string;
}

export const PAKISTAN_CITIES: CityLocation[] = [
  { name: 'Multan', lat: 30.1575, lng: 71.5249, province: 'Punjab' },
  { name: 'Lahore', lat: 31.5204, lng: 74.3587, province: 'Punjab' },
  { name: 'Islamabad', lat: 33.6844, lng: 73.0479, province: 'Federal' },
  { name: 'Rawalpindi', lat: 33.5651, lng: 73.0169, province: 'Punjab' },
  { name: 'Karachi', lat: 24.8607, lng: 67.0011, province: 'Sindh' },
  { name: 'Faisalabad', lat: 31.4504, lng: 73.1350, province: 'Punjab' },
  { name: 'Peshawar', lat: 34.0151, lng: 71.5249, province: 'KPK' },
  { name: 'Quetta', lat: 30.1798, lng: 66.9750, province: 'Balochistan' },
  { name: 'Gujranwala', lat: 32.1877, lng: 74.1945, province: 'Punjab' },
  { name: 'Sialkot', lat: 32.4945, lng: 74.5229, province: 'Punjab' },
  { name: 'Bahawalpur', lat: 29.3544, lng: 71.6911, province: 'Punjab' },
  { name: 'Sargodha', lat: 32.0836, lng: 72.6711, province: 'Punjab' },
  { name: 'Sukkur', lat: 27.7052, lng: 68.8574, province: 'Sindh' },
  { name: 'Rahim Yar Khan', lat: 28.4212, lng: 70.2989, province: 'Punjab' },
  { name: 'Hyderabad', lat: 25.3960, lng: 68.3578, province: 'Sindh' },
  { name: 'Abbottabad', lat: 34.1688, lng: 73.2215, province: 'KPK' },
  { name: 'Gujrat', lat: 32.5742, lng: 74.0754, province: 'Punjab' },
  { name: 'Sahiwal', lat: 30.6682, lng: 73.1114, province: 'Punjab' },
  { name: 'Mardan', lat: 34.1989, lng: 72.0404, province: 'KPK' },
  { name: 'Larkana', lat: 27.5590, lng: 68.2120, province: 'Sindh' },
];

export const RADIUS_OPTIONS = [
  { value: 10, label: '10 kilometres' },
  { value: 25, label: '25 kilometres' },
  { value: 50, label: '50 kilometres' },
  { value: 100, label: '100 kilometres' },
  { value: 250, label: '250 kilometres' },
  { value: 500, label: '500 kilometres' },
];

/**
 * Calculates straight-line distance in kilometers using the Haversine formula
 */
export function calculateDistanceKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth's radius in km
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
 * Resolves a city name or location string to a CityLocation
 */
export function resolveLocationCoords(locationStr: string): CityLocation | null {
  if (!locationStr) return null;
  const clean = locationStr.toLowerCase();

  // Try exact or substring match with known Pakistani cities
  for (const city of PAKISTAN_CITIES) {
    if (clean.includes(city.name.toLowerCase())) {
      return city;
    }
  }

  // Default fallback if unknown
  return null;
}

/**
 * Finds the nearest known Pakistani city from arbitrary lat/lng
 */
export function findNearestCity(lat: number, lng: number): CityLocation {
  let closest = PAKISTAN_CITIES[0];
  let minDistance = Infinity;

  for (const city of PAKISTAN_CITIES) {
    const dist = calculateDistanceKm(lat, lng, city.lat, city.lng);
    if (dist < minDistance) {
      minDistance = dist;
      closest = city;
    }
  }

  return closest;
}
