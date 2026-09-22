export type Vehicle = {
  id: string;
  slug: string;
  brand: string;
  model: string;
  category: string;
  location: string;
  pricePerDay: number;
  rating: number;
  reviewCount: number;
  seats: number;
  transmission: string;
  fuelType: string;
  range?: string;
  description: string;
  image: string;
  gallery: string[];
  unavailableDates: string[];
  rentalPeriods: RentalPeriod[];
  provider: string;
  ownerId: string;
  pricingType?: 'Per Day' | 'Per Week' | 'Per Month';
  features?: string[];
  year?: number;
  variant?: string;
};

export type RentalPeriod = { start: string; end: string; status: 'confirmed' | 'pending'; customer?: string };

const car = (id: string, slug: string, brand: string, model: string, category: string, location: string, pricePerDay: number, rating: number, reviewCount: number, seats: number, transmission: string, fuelType: string, image: string, description: string, unavailableDates: string[] = [], range?: string, ownerId = 'owner-ali', rentalPeriods: RentalPeriod[] = []): Vehicle => ({
  id, slug, brand, model, category, location, pricePerDay, rating, reviewCount, seats, transmission, fuelType, range, description, image,
  gallery: [image, image.replace('w=1600', 'w=1200'), image.replace('w=1600', 'w=1000')],
  unavailableDates, rentalPeriods, provider: 'Drive Flex verified host', ownerId, pricingType: 'Per Day',
  features: ['Professional handover', 'Cleaned before pickup'],
});

export const vehicles: Vehicle[] = [
  car('v1', 'mercedes-amg-gt', 'Mercedes-Benz', 'AMG GT', 'Luxury', 'Lahore, Pakistan', 289, 4.9, 48, 2, 'Automatic', 'Gasoline', 'https://images.pexels.com/photos/337909/pexels-photo-337909.jpeg?auto=compress&cs=tinysrgb&w=1600', 'A low-slung grand tourer with effortless power, hand-finished details, and the kind of presence that changes the pace of a weekend.', ['2026-10-18', '2026-10-19'], undefined, 'owner-ali', [{ start: '2026-10-18', end: '2026-10-20', status: 'confirmed', customer: 'Ayesha K.' }]),
  car('v2', 'porsche-911-carrera', 'Porsche', '911 Carrera', 'Sports', 'Islamabad, Pakistan', 345, 4.98, 72, 2, 'Automatic', 'Gasoline', 'https://images.pexels.com/photos/170811/pexels-photo-170811.jpeg?auto=compress&cs=tinysrgb&w=1600', 'A driver-first icon for Margalla roads and late arrivals. Responsive, composed, and made for the long way around.', ['2026-10-22'], undefined, 'owner-sana', [{ start: '2026-10-22', end: '2026-10-24', status: 'confirmed', customer: 'Omar H.' }]),
  car('v3', 'range-rover-autobiography', 'Land Rover', 'Range Rover Autobiography', 'SUV', 'Karachi, Pakistan', 265, 4.87, 39, 5, 'Automatic', 'Hybrid', 'https://images.pexels.com/photos/116675/pexels-photo-116675.jpeg?auto=compress&cs=tinysrgb&w=1600', 'Quiet authority with room for five. A tailored cabin, all-weather confidence, and a view from the top of every city street.', [], 'Up to 24 mpg', 'owner-hamza'),
  car('v4', 'tesla-model-s-plaid', 'Tesla', 'Model S Plaid', 'Electric', 'Karachi, Pakistan', 198, 4.84, 55, 5, 'Automatic', 'Electric', 'https://images.pexels.com/photos/799443/pexels-photo-799443.jpeg?auto=compress&cs=tinysrgb&w=1600', 'Instant torque, a serene cabin, and an electric range built for leaving the itinerary open.', ['2026-10-20'], '396 mi range', 'owner-hamza'),
  car('v5', 'bmw-7-series', 'BMW', '7 Series', 'Luxury', 'Lahore, Pakistan', 229, 4.78, 31, 5, 'Automatic', 'Gasoline', 'https://images.pexels.com/photos/244206/pexels-photo-244206.jpeg?auto=compress&cs=tinysrgb&w=1600', 'Executive calm with a pulse underneath. The 7 Series is made for arrivals that feel considered.', [], 'Up to 29 mpg', 'owner-ali'),
  car('v6', 'audi-q8-premium', 'Audi', 'Q8 Premium', 'SUV', 'Islamabad, Pakistan', 176, 4.81, 44, 5, 'Automatic', 'Gasoline', 'https://images.pexels.com/photos/112460/pexels-photo-112460.jpeg?auto=compress&cs=tinysrgb&w=1600', 'A sculpted fastback SUV with quattro composure for rain-soaked streets and mountain departures.', [], 'Up to 25 mpg', 'owner-sana'),
  car('v7', 'volvo-s90-inscription', 'Volvo', 'S90 Inscription', 'Sedan', 'Karachi, Pakistan', 142, 4.76, 28, 5, 'Automatic', 'Hybrid', 'https://images.pexels.com/photos/116675/pexels-photo-116675.jpeg?auto=compress&cs=tinysrgb&w=1600', 'Scandinavian restraint, thoughtful materials, and the rare feeling of being looked after on the road.', [], 'Up to 34 mpg', 'owner-hamza'),
  car('v8', 'lexus-es-350', 'Lexus', 'ES 350', 'Sedan', 'Lahore, Pakistan', 119, 4.73, 63, 5, 'Automatic', 'Gasoline', 'https://images.pexels.com/photos/358070/pexels-photo-358070.jpeg?auto=compress&cs=tinysrgb&w=1600', 'Smooth, spacious, and quietly capable. A dependable choice for airport runs and unhurried miles.', [], 'Up to 31 mpg', 'owner-ali'),
  car('v9', 'toyota-rav4-hybrid', 'Toyota', 'RAV4 Hybrid', 'Economy', 'Islamabad, Pakistan', 89, 4.7, 89, 5, 'Automatic', 'Hybrid', 'https://images.pexels.com/photos/707046/pexels-photo-707046.jpeg?auto=compress&cs=tinysrgb&w=1600', 'Practical range and easy confidence for a day of errands or a week beyond the city limits.', [], 'Up to 38 mpg', 'owner-sana'),
  car('v10', 'ford-bronco-wildtrak', 'Ford', 'Bronco Wildtrak', 'SUV', 'Karachi, Pakistan', 158, 4.82, 36, 5, 'Automatic', 'Gasoline', 'https://images.pexels.com/photos/193999/pexels-photo-193999.jpeg?auto=compress&cs=tinysrgb&w=1600', 'Open-air attitude with the hardware to find your own horizon. Built for desert light and dirt roads.', ['2026-10-25'], undefined, 'owner-hamza'),
];

export const findVehicle = (slug: string) => vehicles.find((vehicle) => vehicle.slug === slug);

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
  if (pickupDate && returnDate) return datesOverlap(vehicle, pickupDate, returnDate) ? 'Unavailable for selected dates' : 'Available';
  const today = new Date(`${new Date().toISOString().slice(0, 10)}T12:00:00`).getTime();
  const active = vehicle.rentalPeriods.find((period) => period.status === 'confirmed' && new Date(`${period.start}T12:00:00`).getTime() <= today && new Date(`${period.end}T12:00:00`).getTime() > today);
  return active ? 'Currently rented' : 'Available';
}