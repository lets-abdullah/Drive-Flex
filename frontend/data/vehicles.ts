import type { Vehicle, RentalPeriod } from '@/types';

export type { Vehicle, RentalPeriod };

function getPublishedVehiclesLocal(): Vehicle[] {
  if (typeof window === 'undefined') return [];
  try {
    const list1 = JSON.parse(localStorage.getItem('driveflex-demo-published-vehicles') || '[]');
    const list2 = JSON.parse(localStorage.getItem('driveflex-host-cars') || '[]');
    const combined = [...(Array.isArray(list1) ? list1 : []), ...(Array.isArray(list2) ? list2 : [])];
    const seen = new Set<string>();
    return combined.filter((item: Vehicle) => {
      const key = item.id || item.slug;
      if (!key || seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  } catch {
    return [];
  }
}

const car = (
  id: string, slug: string, brand: string, model: string, category: string,
  location: string, pricePerDay: number, rating: number, reviewCount: number,
  seats: number, transmission: string, fuelType: string, image: string,
  description: string, unavailableDates: string[] = [], range?: string,
  ownerId = 'owner-ali', rentalPeriods: RentalPeriod[] = [],
  status: 'available' | 'booked' = 'available',
  customerName?: string,
): Vehicle => ({
  id, slug, brand, model, category, location, pricePerDay, rating, reviewCount,
  seats, transmission, fuelType, range, description, image,
  gallery: [image, image.replace('w=1600', 'w=1200'), image.replace('w=1600', 'w=1000')],
  unavailableDates, rentalPeriods, provider: 'Drive Flex verified host', ownerId, pricingType: 'Per Day',
  features: ['Professional handover', 'Cleaned before pickup'],
  status,
  bookable: status === 'available',
  currentBooking: status === 'booked' ? {
    id: `book-${id}`,
    customer: customerName || (id === 'v2' ? 'Omar H.' : 'Zainab R.'),
    pickup: '2026-10-20',
    returnDate: '2026-10-25',
    status: 'Confirmed',
  } : null,
});

export const vehicles: Vehicle[] = [
  car('v1', 'toyota-corolla-altis', 'Toyota', 'Corolla Altis Grandi', 'Sedan', 'Lahore, Pakistan', 65, 4.92, 52, 5, 'Automatic', 'Gasoline', 'https://images.unsplash.com/photo-1623869675781-80aa31012a5a?auto=format&fit=crop&w=1600&q=80', 'Pakistan’s favorite executive sedan. Smooth automatic drive, powerful 1.8L engine, ice-cold dual AC, and unmatched reliability.', ['2026-10-18', '2026-10-19'], undefined, 'owner-ali', [{ start: '2026-10-18', end: '2026-10-20', status: 'confirmed', customer: 'Ayesha K.' }], 'available'),
  car('v2', 'honda-civic-rs-turbo', 'Honda', 'Civic RS Turbo', 'Sedan', 'Islamabad, Pakistan', 85, 4.98, 78, 5, 'Automatic', 'Gasoline', 'https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?auto=format&fit=crop&w=1600&q=80', 'Sleek, aggressive and fast. 1.5L VTEC Turbo engine with sunroof, paddle shifters, and premium leather cabin for Margalla highway drives.', ['2026-10-22'], undefined, 'owner-sana', [{ start: '2026-10-22', end: '2026-10-24', status: 'confirmed', customer: 'Omar H.' }], 'booked', 'Omar H.'),
  car('v3', 'toyota-fortuner-legender', 'Toyota', 'Fortuner Legender', 'SUV', 'Karachi, Pakistan', 165, 4.89, 43, 7, 'Automatic', 'Diesel', 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=1600&q=80', 'The ultimate 7-seater SUV in Pakistan. High road clearance, commanding presence, 4x4 Sigma capability, and luxurious 3-row seating.', [], 'Up to 24 mpg', 'owner-hamza', [], 'available'),
  car('v4', 'suzuki-alto-vxl', 'Suzuki', 'Alto VXL AGS', 'Hatchback', 'Karachi, Pakistan', 28, 4.82, 65, 4, 'Automatic', 'Gasoline', 'https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?auto=format&fit=crop&w=1600&q=80', 'Pakistan’s top-selling fuel-efficient hatchback. Extremely easy to navigate through tight city traffic with Auto Gear Shift.', ['2026-10-20'], '50+ mpg economy', 'owner-hamza', [], 'available'),
  car('v5', 'suzuki-cultus-vxl', 'Suzuki', 'Cultus VXL', 'Hatchback', 'Lahore, Pakistan', 38, 4.79, 39, 5, 'Automatic', 'Gasoline', 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=1600&q=80', 'Spacious 5-seater family hatchback. Excellent fuel economy, Android touchscreen infotainment system, and smooth city driving.', [], 'Up to 38 mpg', 'owner-ali', [], 'available'),
  car('v6', 'honda-vezel-hybrid', 'Honda', 'Vezel Hybrid Z', 'SUV', 'Islamabad, Pakistan', 75, 4.88, 51, 5, 'Automatic', 'Hybrid', 'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?auto=format&fit=crop&w=1600&q=80', 'Premium Japanese hybrid crossover SUV with panoramic view, leather upholstery, and outstanding fuel efficiency.', [], 'Up to 42 mpg', 'owner-sana', [{ start: '2026-10-20', end: '2026-10-25', status: 'confirmed', customer: 'Zainab R.' }], 'booked', 'Zainab R.'),
  car('v7', 'suzuki-mehran-vxr', 'Suzuki', 'Mehran VXR', 'Hatchback', 'Rawalpindi, Pakistan', 18, 4.72, 84, 4, 'Manual', 'Gasoline', 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=1600&q=80', 'The iconic budget favorite of Pakistan. Unbeatable fuel economy, bulletproof reliability, and effortless city maneuvering.', [], 'Up to 40 mpg', 'owner-hamza', [], 'available'),
  car('v8', 'honda-city-aspire', 'Honda', 'City 1.5 Aspire', 'Sedan', 'Lahore, Pakistan', 50, 4.85, 47, 5, 'Automatic', 'Gasoline', 'https://images.unsplash.com/photo-1550355291-bbee04a92027?auto=format&fit=crop&w=1600&q=80', 'Comfortable and elegant sedan. Alloy rims, rear camera, plush seating, and great highway mileage for family trips.', [], 'Up to 35 mpg', 'owner-ali', [], 'available'),
  car('v9', 'honda-brv-ivtec', 'Honda', 'BR-V i-VTEC S', 'SUV', 'Islamabad, Pakistan', 68, 4.76, 33, 7, 'Automatic', 'Gasoline', 'https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?auto=format&fit=crop&w=1600&q=80', '7-seater family MPV / SUV with rear AC vents, high ground clearance, and large boot capacity for road trips to Northern Pakistan.', [], 'Up to 30 mpg', 'owner-sana', [], 'available'),
  car('v10', 'kia-sportage-awd', 'Kia', 'Sportage AWD', 'SUV', 'Karachi, Pakistan', 110, 4.91, 62, 5, 'Automatic', 'Gasoline', 'https://images.unsplash.com/photo-1583121274602-3e2820c69888?auto=format&fit=crop&w=1600&q=80', 'Modern luxury crossover SUV featuring a panoramic sunroof, all-wheel drive stability, wireless charging, and plush leather seats.', ['2026-10-25'], undefined, 'owner-hamza', [], 'available'),
];

export const findVehicle = (slugOrId: string): Vehicle | undefined => {
  if (!slugOrId) return undefined;
  const decoded = decodeURIComponent(slugOrId).toLowerCase().trim();
  return allCars().find(
    (vehicle) =>
      vehicle.slug?.toLowerCase() === decoded ||
      vehicle.id?.toLowerCase() === decoded ||
      `${vehicle.brand}-${vehicle.model}`.toLowerCase().replace(/[^a-z0-9]+/g, '-') === decoded
  );
};

export function allCars(): Vehicle[] {
  return [...vehicles, ...getPublishedVehiclesLocal()];
}

export function ownerCars(ownerId: string, findOwnerById: (id: string) => { vehicleIds: string[] } | undefined): Vehicle[] {
  const owner = findOwnerById(ownerId);
  const base = vehicles.filter((v) => v.ownerId === ownerId);
  return [...base, ...getPublishedVehiclesLocal().filter((v) => v.ownerId === ownerId)];
}

export function calculateRentalPrice(pricePerDay: number, pickupDate: string, returnDate: string) {
  if (!pickupDate || !returnDate) return { days: 0, total: 0 };
  const start = new Date(`${pickupDate}T12:00:00`).getTime();
  const end = new Date(`${returnDate}T12:00:00`).getTime();
  const days = Math.ceil((end - start) / 86400000);
  return { days: days > 0 ? days : 0, total: days > 0 ? days * pricePerDay : 0 };
}

export function datesOverlap(vehicle: Vehicle, pickupDate: string, returnDate: string) {
  if (!pickupDate || !returnDate) return false;
  const start = new Date(`${pickupDate}T12:00:00`).getTime();
  const end = new Date(`${returnDate}T12:00:00`).getTime();
  const legacyOverlap = vehicle.unavailableDates.some((date) => {
    const point = new Date(`${date}T12:00:00`).getTime();
    return point >= start && point < end;
  });
  const periodOverlap = vehicle.rentalPeriods.some((period) => {
    if (period.status !== 'confirmed') return false;
    const reservedStart = new Date(`${period.start}T12:00:00`).getTime();
    const reservedEnd = new Date(`${period.end}T12:00:00`).getTime();
    return start < reservedEnd && end > reservedStart;
  });
  return legacyOverlap || periodOverlap;
}

export function availabilityLabel(vehicle: Vehicle, pickupDate = '', returnDate = '') {
  if (vehicle.status === 'booked' || vehicle.bookable === false) {
    return 'Booked';
  }
  if (pickupDate && returnDate) return datesOverlap(vehicle, pickupDate, returnDate) ? 'Unavailable for selected dates' : 'Available';
  const today = new Date(`${new Date().toISOString().slice(0, 10)}T12:00:00`).getTime();
  const active = vehicle.rentalPeriods.find(
    (period) =>
      period.status === 'confirmed' &&
      new Date(`${period.start}T12:00:00`).getTime() <= today &&
      new Date(`${period.end}T12:00:00`).getTime() > today,
  );
  return active ? 'Currently rented' : 'Available';
}