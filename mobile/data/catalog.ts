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
  range?: string | null;
  description: string;
  image: string;
  gallery: string[];
  unavailableDates?: string[];
  rentalPeriods?: { start: string; end: string; status: 'confirmed' | 'pending' }[];
  currentBooking?: { customer?: string; pickup: string; returnDate: string; status: string } | null;
  provider?: string;
  ownerId: string;
  features?: string[];
  year?: number;
  status?: 'available' | 'booked';
  bookable?: boolean;
};

export type Owner = {
  id: string;
  slug: string;
  fullName: string;
  businessName: string;
  ownerType: string;
  city: string;
  location: string;
  phone: string;
  email: string;
  yearsExperience: number;
  description: string;
  profileImage: string;
  verified: boolean;
  vehicleIds: string[];
};

export type Session = {
  id?: string;
  name: string;
  email: string;
  role?: 'renter' | 'host';
  phone?: string;
  city?: string;
  businessName?: string;
};

export type Booking = {
  id?: string;
  vehicleId: string;
  customer: string;
  pickup: string;
  returnDate: string;
  totalAmount?: number;
  status: 'Confirmed' | 'Pending' | 'Cancelled';
  createdAt?: string;
};

export type OwnerProfile = Owner & { businessLocation: string };

export const demoVehicles: Vehicle[] = [
  {
    id: 'v1', slug: 'toyota-corolla-altis', brand: 'Toyota', model: 'Corolla Altis',
    category: 'Sedan', location: 'Lahore, Pakistan', pricePerDay: 65, rating: 4.92,
    reviewCount: 52, seats: 5, transmission: 'Automatic', fuelType: 'Gasoline',
    description: 'A composed, comfortable sedan for city days and long highway drives, with a quiet cabin and dependable daily comfort.',
    image: 'https://images.unsplash.com/photo-1590362891991-f776e747a588?auto=format&fit=crop&w=1400&q=82',
    gallery: [], ownerId: 'owner-ali', provider: 'Ali Motors Lahore', year: 2023,
    features: ['Air conditioning', 'Bluetooth', 'Professional handover'],
  },
  {
    id: 'v2', slug: 'honda-civic-rs-turbo', brand: 'Honda', model: 'Civic RS Turbo',
    category: 'Sedan', location: 'Islamabad, Pakistan', pricePerDay: 85, rating: 4.98,
    reviewCount: 78, seats: 5, transmission: 'Automatic', fuelType: 'Gasoline',
    description: 'A sharp, responsive sedan with a premium cabin and a confident drive through the capital and beyond.',
    image: 'https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?auto=format&fit=crop&w=1400&q=82',
    gallery: [], ownerId: 'owner-sana', provider: 'Sana Auto Collective', year: 2024,
    rentalPeriods: [{ start: '2026-10-22', end: '2026-10-24', status: 'confirmed' }],
    features: ['Sunroof', 'Leather interior', 'Paddle shifters'],
  },
  {
    id: 'v3', slug: 'toyota-fortuner-legender', brand: 'Toyota', model: 'Fortuner Legender',
    category: 'SUV', location: 'Karachi, Pakistan', pricePerDay: 165, rating: 4.89,
    reviewCount: 43, seats: 7, transmission: 'Automatic', fuelType: 'Diesel',
    description: 'A spacious seven-seat SUV with generous ground clearance and room for the whole trip.',
    image: 'https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?auto=format&fit=crop&w=1400&q=82',
    gallery: [], ownerId: 'owner-hamza', provider: 'Hamza Premium Rides', year: 2024,
    features: ['7 seats', '4x4', 'Rear air conditioning'],
  },
  {
    id: 'v4', slug: 'suzuki-alto-vxl', brand: 'Suzuki', model: 'Alto VXL AGS',
    category: 'Hatchback', location: 'Karachi, Pakistan', pricePerDay: 28, rating: 4.82,
    reviewCount: 65, seats: 4, transmission: 'Automatic', fuelType: 'Gasoline',
    description: 'An easy-to-park city hatchback with an efficient drive and just the right amount of room for everyday plans.',
    image: 'https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?auto=format&fit=crop&w=1400&q=82',
    gallery: [], ownerId: 'owner-hamza', provider: 'Hamza Premium Rides', year: 2022,
    features: ['City friendly', 'Compact parking', 'Fuel efficient'],
  },
  {
    id: 'v5', slug: 'honda-vezel-hybrid', brand: 'Honda', model: 'Vezel Hybrid Z',
    category: 'SUV', location: 'Islamabad, Pakistan', pricePerDay: 75, rating: 4.88,
    reviewCount: 51, seats: 5, transmission: 'Automatic', fuelType: 'Hybrid',
    description: 'A premium crossover with a calm cabin, elevated seating, and a smooth hybrid drive for an open-ended weekend.',
    image: 'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?auto=format&fit=crop&w=1400&q=82',
    gallery: [], ownerId: 'owner-sana', provider: 'Sana Auto Collective', year: 2023,
    features: ['Hybrid drive', 'Leather interior', 'Rear camera'],
  },
  {
    id: 'v6', slug: 'kia-sportage-awd', brand: 'Kia', model: 'Sportage AWD',
    category: 'SUV', location: 'Karachi, Pakistan', pricePerDay: 110, rating: 4.91,
    reviewCount: 62, seats: 5, transmission: 'Automatic', fuelType: 'Gasoline',
    description: 'A well-equipped crossover with a confident all-wheel drive feel, generous space, and a polished interior.',
    image: 'https://images.unsplash.com/photo-1583121274602-3e2820c69888?auto=format&fit=crop&w=1400&q=82',
    gallery: [], ownerId: 'owner-hamza', provider: 'Hamza Premium Rides', year: 2024,
    rentalPeriods: [{ start: '2026-10-20', end: '2026-10-25', status: 'confirmed' }],
    features: ['All-wheel drive', 'Panoramic roof', 'Wireless charging'],
  },
  {
    id: 'v7', slug: 'bmw-5-series-m-sport', brand: 'BMW', model: '5 Series M Sport',
    category: 'Luxury', location: 'Lahore, Pakistan', pricePerDay: 145, rating: 4.95,
    reviewCount: 37, seats: 5, transmission: 'Automatic', fuelType: 'Gasoline',
    description: 'A polished executive sedan with a quiet cabin, intuitive technology, and a confident drive for important days away.',
    image: 'https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&w=1400&q=82',
    gallery: [], ownerId: 'owner-sana', provider: 'Sana Auto Collective', year: 2024,
    features: ['M Sport package', 'Premium sound', 'Adaptive cruise'],
  },
];

export const owners: Owner[] = [
  {
    id: 'owner-ali', slug: 'ali-motors-lahore', fullName: 'Ali Raza',
    businessName: 'Ali Motors Lahore', ownerType: 'Car Rental Business', city: 'Lahore',
    location: 'Gulberg III, Lahore', phone: '+92 321 440 7812', email: 'hello@alimotors.demo',
    yearsExperience: 11,
    description: 'A family-run Lahore rental house known for clean handovers, considered cars, and calm airport-to-city service.',
    profileImage: 'https://images.pexels.com/photos/614810/pexels-photo-614810.jpeg?auto=compress&cs=tinysrgb&w=400',
    verified: true, vehicleIds: ['v1'],
  },
  {
    id: 'owner-sana', slug: 'sana-auto-collective-islamabad', fullName: 'Sana Ahmed',
    businessName: 'Sana Auto Collective', ownerType: 'Fleet Owner', city: 'Islamabad',
    location: 'F-7 Markaz, Islamabad', phone: '+92 333 219 6084', email: 'book@sanaauto.demo',
    yearsExperience: 8,
    description: 'A detail-first fleet for Islamabad weekends, northern road trips, and guests who want a polished car waiting on arrival.',
    profileImage: 'https://images.pexels.com/photos/3769021/pexels-photo-3769021.jpeg?auto=compress&cs=tinysrgb&w=400',
    verified: true, vehicleIds: ['v2', 'v5', 'v7'],
  },
  {
    id: 'owner-hamza', slug: 'hamza-premium-rides-karachi', fullName: 'Hamza Qureshi',
    businessName: 'Hamza Premium Rides', ownerType: 'Dealership', city: 'Karachi',
    location: 'Clifton Block 4, Karachi', phone: '+92 300 781 4420', email: 'studio@hamzarides.demo',
    yearsExperience: 14,
    description: 'Karachi’s premium mobility studio, pairing enthusiast cars with transparent rental terms and a personal handover.',
    profileImage: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=400',
    verified: true, vehicleIds: ['v3', 'v4', 'v6'],
  },
];

export const demoBookings: Booking[] = [
  { id: 'book-seed-001', vehicleId: 'v2', customer: 'Omar H.', pickup: '2026-10-22', returnDate: '2026-10-24', totalAmount: 170, status: 'Confirmed' },
  { id: 'book-seed-002', vehicleId: 'v6', customer: 'Zainab R.', pickup: '2026-10-20', returnDate: '2026-10-25', totalAmount: 550, status: 'Confirmed' },
];

export const categories = ['All', 'Sedan', 'SUV', 'Hatchback', 'Luxury'];