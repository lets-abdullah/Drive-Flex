export type Vehicle = {
  id: string;
  slug: string;
  brand: string;
  make?: string;
  model: string;
  category: string;
  location: string;
  city_name?: string;
  address_text?: string;
  latitude?: number;
  longitude?: number;
  license_plate?: string;
  pricePerDay: number;
  price_per_day?: number;
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
  host_id?: string;
  features?: string[];
  year?: number;
  status?: 'available' | 'rented' | 'maintenance' | 'booked';
  bookable?: boolean;
  fuelUsage?: string;
  tripFee?: number;
  pickupAddress?: string;
  distanceKm?: string;
  durationEta?: string;
  lastActivity?: { renter: string; avatar: string; dateRange: string; distance: string }[];
  engine?: string;
  horsepower?: string;
  mileage?: string;
  wheels?: string;
  safetyFeatures?: string[];
  angleImages?: { angle: number; label: string; url: string; vertical?: 'standard' | 'top' | 'interior' }[];
  hotspots?: { id: string; part: string; title: string; subtitle: string; angleRange?: [number, number]; x?: number; y?: number }[];
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
  car_id?: string;
  vehicleId: string;
  customer: string;
  renter_id?: string;
  renter_name?: string;
  renter_phone?: string;
  renter_email?: string;
  host_id?: string;
  host_name?: string;
  host_phone?: string;
  car_title?: string;
  car_image?: string;
  pickup: string;
  start_date?: string;
  returnDate: string;
  end_date?: string;
  pickup_time?: string;
  return_time?: string;
  pickup_address?: string;
  totalAmount?: number;
  total_price?: number;
  status:
    | 'pending'
    | 'confirmed'
    | 'active'
    | 'completed'
    | 'cancelled'
    | 'Pending'
    | 'Confirmed'
    | 'Cancelled';
  payment_status?: 'unpaid' | 'paid' | 'refunded';
  refund_status?: string;
  cancellation_reason?: string;
  review_rating?: number;
  review_comment?: string;
  createdAt?: string;
};

export type OwnerProfile = Owner & { businessLocation: string };

export const demoVehicles: Vehicle[] = [
  {
    id: 'v-mb-a-class',
    slug: 'mercedes-benz-a-class',
    brand: 'Mercedes-Benz',
    make: 'Mercedes-Benz',
    model: 'A-Class Premium Plus',
    category: 'Luxury',
    location: 'Lahore, Pakistan',
    city_name: 'Lahore',
    address_text: 'Mall of Lahore, Cantt, Lahore',
    latitude: 31.5450,
    longitude: 74.3720,
    license_plate: 'LHR-21-5544',
    pricePerDay: 150,
    price_per_day: 150,
    rating: 4.9,
    reviewCount: 184,
    seats: 5,
    transmission: 'Automatic',
    fuelType: 'Petrol',
    fuelUsage: '10 l / 100 km',
    tripFee: 120,
    year: 2021,
    status: 'available',
    description: 'A refined luxury hatchback featuring intuitive digital touchscreens, dynamic driving modes, and an executive cabin.',
    image: 'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?auto=format&fit=crop&w=1200&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1617814076367-b759c7d7e738?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1617531653332-bd46c24f2068?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&w=1200&q=80',
    ],
    ownerId: 'owner-ali',
    host_id: 'owner-ali',
    provider: 'Ali Motors Lahore',
    pickupAddress: 'Mall of Lahore, Cantt, Lahore',
    distanceKm: '1.2 km',
    durationEta: '14 min',
    lastActivity: [
      {
        renter: 'Andrew Dellington',
        avatar: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=200',
        dateRange: '21 Sep, 22 - 9 Oct, 22',
        distance: '670 km',
      },
      {
        renter: 'Katy Jameson',
        avatar: 'https://images.pexels.com/photos/3769021/pexels-photo-3769021.jpeg?auto=compress&cs=tinysrgb&w=200',
        dateRange: '12 Aug, 22 - 17 Aug, 22',
        distance: '276 km',
      },
    ],
    features: ['MBUX Infotainment', 'LED High Performance', 'Active Brake Assist', 'Heated Seats'],
  },
  {
    id: 'v-mb-c-class',
    slug: 'mercedes-benz-c-class',
    brand: 'Mercedes-Benz',
    make: 'Mercedes-Benz',
    model: 'C-Class',
    category: 'Sedan',
    location: 'Multan, Pakistan',
    city_name: 'Multan',
    address_text: 'Bosan Road Commercial Hub, Multan',
    latitude: 30.2215,
    longitude: 71.4880,
    license_plate: 'MUL-23-4122',
    pricePerDay: 81,
    price_per_day: 81,
    rating: 4.9,
    reviewCount: 210,
    seats: 5,
    transmission: 'Automatic',
    fuelType: 'Gasoline',
    fuelUsage: '7.8 l / 100 km',
    tripFee: 120,
    year: 2023,
    status: 'available',
    description: 'A stylish, athletic luxury sedan boasting a whisper-quiet ride and cutting-edge digital driver display.',
    image: 'https://images.unsplash.com/photo-1617531653332-bd46c24f2068?auto=format&fit=crop&w=1200&q=80',
    gallery: [],
    ownerId: 'owner-ali',
    host_id: 'owner-ali',
    provider: 'Ali Motors Multan',
    pickupAddress: 'Bosan Road Commercial Hub, Multan',
    features: ['Sunroof', 'Leather interior', 'Ambient Lighting'],
  },
  {
    id: 'v-bmw-3-series',
    slug: 'bmw-3-series',
    brand: 'BMW',
    make: 'BMW',
    model: '3 Series',
    category: 'Sedan',
    location: 'Multan, Pakistan',
    city_name: 'Multan',
    address_text: 'Abdali Road Commercial Centre, Multan',
    latitude: 30.1830,
    longitude: 71.4620,
    license_plate: 'MUL-23-3399',
    pricePerDay: 72,
    price_per_day: 72,
    rating: 4.9,
    reviewCount: 165,
    seats: 5,
    transmission: 'Automatic',
    fuelType: 'Gasoline',
    fuelUsage: '7.2 l / 100 km',
    tripFee: 110,
    year: 2023,
    status: 'available',
    description: 'The definitive sport sedan with precision handling, agile performance, and executive comfort.',
    image: 'https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&w=1200&q=80',
    gallery: [],
    ownerId: 'owner-sana',
    host_id: 'owner-sana',
    provider: 'Sana Auto Collective',
    pickupAddress: 'Abdali Road, Multan',
    features: ['M Sport suspension', 'Harman Kardon audio', 'Adaptive Cruise'],
  },
  {
    id: 'v-audi-a4',
    slug: 'audi-a4',
    brand: 'Audi',
    make: 'Audi',
    model: 'A4 Quattro',
    category: 'Sedan',
    location: 'Multan, Pakistan',
    city_name: 'Multan',
    address_text: 'Multan International Airport Terminal, Multan',
    latitude: 30.2030,
    longitude: 71.4250,
    license_plate: 'MUL-23-9088',
    pricePerDay: 68,
    price_per_day: 68,
    rating: 4.88,
    reviewCount: 142,
    seats: 5,
    transmission: 'Automatic',
    fuelType: 'Electric',
    fuelUsage: '18 kWh / 100 km',
    tripFee: 95,
    year: 2023,
    status: 'available',
    description: 'Sleek aerodynamic German engineering with Quattro traction and virtual cockpit displays.',
    image: 'https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?auto=format&fit=crop&w=1200&q=80',
    gallery: [],
    ownerId: 'owner-hamza',
    host_id: 'owner-hamza',
    provider: 'Hamza Premium Rides',
    features: ['Quattro AWD', 'Virtual Cockpit', 'Matrix LED'],
  },
  {
    id: 'v-tesla-model-3',
    slug: 'tesla-model-3',
    brand: 'Tesla',
    make: 'Tesla',
    model: 'Model 3 Long Range',
    category: 'Sedan',
    location: 'Islamabad, Pakistan',
    city_name: 'Islamabad',
    address_text: 'Blue Area, Jinnah Avenue, Islamabad',
    latitude: 33.7082,
    longitude: 73.0505,
    license_plate: 'ISB-24-1010',
    pricePerDay: 94,
    price_per_day: 94,
    rating: 4.95,
    reviewCount: 280,
    seats: 5,
    transmission: 'Automatic',
    fuelType: 'Electric',
    fuelUsage: '14.5 kWh / 100 km',
    tripFee: 130,
    year: 2024,
    status: 'available',
    description: 'Pure electric exhilaration with instant acceleration, glass roof panoramic views, and Autopilot safety.',
    image: 'https://images.unsplash.com/photo-1560958089-b8a1929cea89?auto=format&fit=crop&w=1200&q=80',
    gallery: [],
    ownerId: 'owner-sana',
    host_id: 'owner-sana',
    provider: 'Sana Auto Collective',
    features: ['Autopilot', 'All-Glass Roof', 'Supercharging Enabled'],
  },
  {
    id: 'v-bmw-i7-master',
    slug: 'bmw-i7-master',
    brand: 'BMW',
    make: 'BMW',
    model: 'i7 Master',
    category: 'Luxury',
    location: 'Lahore, Pakistan',
    city_name: 'Lahore',
    address_text: 'Gulberg III, Main Boulevard, Lahore',
    latitude: 31.5204,
    longitude: 74.3587,
    license_plate: 'LHR-24-8800',
    pricePerDay: 100,
    price_per_day: 100,
    rating: 4.9,
    reviewCount: 200,
    seats: 5,
    transmission: 'Automatic',
    fuelType: 'Electric',
    fuelUsage: '19.6 kWh / 100 km',
    tripFee: 120,
    year: 2024,
    status: 'available',
    description: 'Flagship all-electric luxury sedan with executive lounge seating, theatre display, and commanding presence.',
    image: 'https://images.unsplash.com/photo-1580273916550-e323be2ae537?auto=format&fit=crop&w=1200&q=80',
    gallery: [],
    ownerId: 'owner-ali',
    host_id: 'owner-ali',
    provider: 'Ali Motors Lahore',
    pickupAddress: 'Gulberg III, Main Boulevard, Lahore',
    features: ['Theatre Screen', 'Executive Lounge', 'Bowers & Wilkins 4D'],
  },
  {
    id: 'v-mb-gla-suv',
    slug: 'mercedes-benz-gla-suv',
    brand: 'Mercedes-Benz',
    make: 'Mercedes-Benz',
    model: 'GLA SUV',
    category: 'SUV',
    location: 'Karachi, Pakistan',
    city_name: 'Karachi',
    address_text: 'Khayaban-e-Shahbaz, DHA Phase 6, Karachi',
    latitude: 24.8138,
    longitude: 67.0305,
    license_plate: 'KHI-23-7721',
    pricePerDay: 200,
    price_per_day: 200,
    rating: 4.9,
    reviewCount: 95,
    seats: 5,
    transmission: 'Automatic',
    fuelType: 'Gasoline',
    fuelUsage: '8.4 l / 100 km',
    tripFee: 150,
    year: 2023,
    status: 'available',
    description: 'A dynamic compact luxury SUV combining high seating position, athletic proportions, and versatile cargo capacity.',
    image: 'https://images.unsplash.com/photo-1583121274602-3e2820c69888?auto=format&fit=crop&w=1200&q=80',
    gallery: [],
    ownerId: 'owner-hamza',
    host_id: 'owner-hamza',
    provider: 'Hamza Premium Rides',
    features: ['4MATIC All-Wheel Drive', 'Panoramic Roof', 'Hands-Free Tailgate'],
  },
  {
    id: 'v-mb-s-class',
    slug: 'mercedes-benz-s-class',
    brand: 'Mercedes-Benz',
    make: 'Mercedes-Benz',
    model: 'S-Class',
    category: 'Luxury',
    location: 'Islamabad, Pakistan',
    city_name: 'Islamabad',
    address_text: 'Serena Hotel, Club Road, Islamabad',
    latitude: 33.6844,
    longitude: 73.0479,
    license_plate: 'ISB-24-9999',
    pricePerDay: 115,
    price_per_day: 115,
    rating: 4.9,
    reviewCount: 130,
    seats: 5,
    transmission: 'Automatic',
    fuelType: 'Gasoline',
    fuelUsage: '9.2 l / 100 km',
    tripFee: 140,
    year: 2024,
    status: 'available',
    description: 'The pinnacle of luxury motoring. Uncompromising comfort, acoustic isolation, and state-of-the-art assistance.',
    image: 'https://images.unsplash.com/photo-1622353219448-466020524fc2?auto=format&fit=crop&w=1200&q=80',
    gallery: [],
    ownerId: 'owner-sana',
    host_id: 'owner-sana',
    provider: 'Sana Auto Collective',
    features: ['Air Suspension', 'Chauffeur Package', 'Burmester 3D Surround'],
  },
  {
    id: 'v1',
    slug: 'toyota-corolla-altis',
    brand: 'Toyota',
    make: 'Toyota',
    model: 'Corolla Altis Grande',
    category: 'Sedan',
    location: 'Multan, Pakistan',
    city_name: 'Multan',
    address_text: 'Vehari Road, New Multan Colony, Multan',
    latitude: 30.1575,
    longitude: 71.5249,
    license_plate: 'MUL-23-1122',
    pricePerDay: 65,
    price_per_day: 65,
    rating: 4.92,
    reviewCount: 52,
    seats: 5,
    transmission: 'Automatic',
    fuelType: 'Gasoline',
    status: 'available',
    description: 'A composed, comfortable sedan for city days and long highway drives, with a quiet cabin and dependable daily comfort.',
    image: 'https://images.unsplash.com/photo-1590362891991-f776e747a588?auto=format&fit=crop&w=1400&q=82',
    gallery: [],
    ownerId: 'owner-ali',
    host_id: 'owner-ali',
    provider: 'Ali Motors Multan',
    year: 2023,
    features: ['Air conditioning', 'Bluetooth', 'Professional handover'],
  },
  {
    id: 'v2',
    slug: 'honda-civic-rs-turbo',
    brand: 'Honda',
    make: 'Honda',
    model: 'Civic RS Turbo',
    category: 'Sedan',
    location: 'Islamabad, Pakistan',
    city_name: 'Islamabad',
    address_text: 'F-7 Markaz, Jinnah Super, Islamabad',
    latitude: 33.7215,
    longitude: 73.0580,
    license_plate: 'ISB-24-3456',
    pricePerDay: 85,
    price_per_day: 85,
    rating: 4.98,
    reviewCount: 78,
    seats: 5,
    transmission: 'Automatic',
    fuelType: 'Gasoline',
    status: 'available',
    description: 'A sharp, responsive sedan with a premium cabin and a confident drive through the capital and beyond.',
    image: 'https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?auto=format&fit=crop&w=1400&q=82',
    gallery: [],
    ownerId: 'owner-sana',
    host_id: 'owner-sana',
    provider: 'Sana Auto Collective',
    year: 2024,
    features: ['Sunroof', 'Leather interior', 'Paddle shifters'],
  },
  {
    id: 'v3',
    slug: 'toyota-fortuner-legender',
    brand: 'Toyota',
    make: 'Toyota',
    model: 'Fortuner Legender',
    category: 'SUV',
    location: 'Karachi, Pakistan',
    city_name: 'Karachi',
    address_text: 'Bilawal Chowrangi, Clifton Block 2, Karachi',
    latitude: 24.8350,
    longitude: 67.0390,
    license_plate: 'KHI-24-5500',
    pricePerDay: 165,
    price_per_day: 165,
    rating: 4.89,
    reviewCount: 43,
    seats: 7,
    transmission: 'Automatic',
    fuelType: 'Diesel',
    status: 'available',
    description: 'A spacious seven-seat SUV with generous ground clearance and room for the whole trip.',
    image: 'https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?auto=format&fit=crop&w=1400&q=82',
    gallery: [],
    ownerId: 'owner-hamza',
    host_id: 'owner-hamza',
    provider: 'Hamza Premium Rides',
    year: 2024,
    features: ['7 seats', '4x4', 'Rear air conditioning'],
  },
  {
    id: 'v4',
    slug: 'suzuki-alto-vxl',
    brand: 'Suzuki',
    make: 'Suzuki',
    model: 'Alto VXL AGS',
    category: 'Hatchback',
    location: 'Karachi, Pakistan',
    city_name: 'Karachi',
    address_text: 'Shahrah-e-Faisal Airport Road, Karachi',
    latitude: 24.8607,
    longitude: 67.0011,
    license_plate: 'KHI-22-1200',
    pricePerDay: 28,
    price_per_day: 28,
    rating: 4.82,
    reviewCount: 65,
    seats: 4,
    transmission: 'Automatic',
    fuelType: 'Gasoline',
    status: 'available',
    description: 'An easy-to-park city hatchback with an efficient drive and just the right amount of room for everyday plans.',
    image: 'https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?auto=format&fit=crop&w=1400&q=82',
    gallery: [],
    ownerId: 'owner-hamza',
    host_id: 'owner-hamza',
    provider: 'Hamza Premium Rides',
    year: 2022,
    features: ['City friendly', 'Compact parking', 'Fuel efficient'],
  },
  {
    id: 'v5',
    slug: 'honda-vezel-hybrid',
    brand: 'Honda',
    make: 'Honda',
    model: 'Vezel Hybrid Z',
    category: 'SUV',
    location: 'Islamabad, Pakistan',
    city_name: 'Islamabad',
    address_text: 'Centaurus Mall, F-8/G-8, Islamabad',
    latitude: 33.7077,
    longitude: 73.0500,
    license_plate: 'ISB-23-8899',
    pricePerDay: 75,
    price_per_day: 75,
    rating: 4.88,
    reviewCount: 51,
    seats: 5,
    transmission: 'Automatic',
    fuelType: 'Hybrid',
    status: 'available',
    description: 'A premium crossover with a calm cabin, elevated seating, and a smooth hybrid drive for an open-ended weekend.',
    image: 'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?auto=format&fit=crop&w=1400&q=82',
    gallery: [],
    ownerId: 'owner-sana',
    host_id: 'owner-sana',
    provider: 'Sana Auto Collective',
    year: 2023,
    features: ['Hybrid drive', 'Leather interior', 'Rear camera'],
  },
  {
    id: 'v6',
    slug: 'kia-sportage-awd',
    brand: 'Kia',
    make: 'Kia',
    model: 'Sportage AWD',
    category: 'SUV',
    location: 'Karachi, Pakistan',
    city_name: 'Karachi',
    address_text: 'Clifton Block 4, Marine Promenade, Karachi',
    latitude: 24.8210,
    longitude: 67.0420,
    license_plate: 'KHI-24-9090',
    pricePerDay: 110,
    price_per_day: 110,
    rating: 4.91,
    reviewCount: 62,
    seats: 5,
    transmission: 'Automatic',
    fuelType: 'Gasoline',
    status: 'available',
    description: 'A well-equipped crossover with a confident all-wheel drive feel, generous space, and a polished interior.',
    image: 'https://images.unsplash.com/photo-1583121274602-3e2820c69888?auto=format&fit=crop&w=1400&q=82',
    gallery: [],
    ownerId: 'owner-hamza',
    host_id: 'owner-hamza',
    provider: 'Hamza Premium Rides',
    year: 2024,
    features: ['All-wheel drive', 'Panoramic roof', 'Wireless charging'],
  },
  {
    id: 'v7',
    slug: 'bmw-5-series-m-sport',
    brand: 'BMW',
    make: 'BMW',
    model: '5 Series M Sport',
    category: 'Luxury',
    location: 'Lahore, Pakistan',
    city_name: 'Lahore',
    address_text: 'MM Alam Road, Gulberg II, Lahore',
    latitude: 31.5120,
    longitude: 74.3410,
    license_plate: 'LHR-24-6633',
    pricePerDay: 145,
    price_per_day: 145,
    rating: 4.95,
    reviewCount: 37,
    seats: 5,
    transmission: 'Automatic',
    fuelType: 'Gasoline',
    status: 'available',
    description: 'A polished executive sedan with a quiet cabin, intuitive technology, and a confident drive for important days away.',
    image: 'https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&w=1400&q=82',
    gallery: [],
    ownerId: 'owner-sana',
    host_id: 'owner-sana',
    provider: 'Sana Auto Collective',
    year: 2024,
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
  // 1. Pending Request (waiting for Host manual approval)
  {
    id: 'book-req-001',
    car_id: 'v-mb-c-class',
    vehicleId: 'v-mb-c-class',
    renter_id: 'usr-renter-demo',
    host_id: 'owner-ali',
    customer: 'Omar Farooq',
    renter_name: 'Omar Farooq',
    renter_phone: '+92 300 1122334',
    renter_email: 'omar.farooq@driveflex.pk',
    host_name: 'Ali Raza (Ali Motors)',
    host_phone: '+92 321 440 7812',
    car_title: 'Mercedes-Benz C-Class',
    car_image: 'https://images.unsplash.com/photo-1617531653332-bd46c24f2068?auto=format&fit=crop&w=1200&q=80',
    start_date: '2026-10-18',
    pickup: '2026-10-18',
    end_date: '2026-10-21',
    returnDate: '2026-10-21',
    pickup_time: '10:00 AM',
    return_time: '06:00 PM',
    pickup_address: 'Bosan Road Commercial Hub, Multan',
    total_price: 243,
    totalAmount: 243,
    status: 'pending',
    payment_status: 'paid',
    refund_status: 'Held in Escrow',
  },
  // 2. Upcoming / Confirmed Booking (Scheduled vehicle release)
  {
    id: 'book-seed-001',
    car_id: 'v2',
    vehicleId: 'v2',
    renter_id: 'usr-renter-demo',
    host_id: 'owner-sana',
    customer: 'Omar H.',
    renter_name: 'Omar H.',
    renter_phone: '+92 333 5551234',
    renter_email: 'omar@driveflex.pk',
    host_name: 'Sana Ahmed (Sana Auto Collective)',
    host_phone: '+92 333 219 6084',
    car_title: 'Honda Civic RS Turbo',
    car_image: 'https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?auto=format&fit=crop&w=1400&q=82',
    start_date: '2026-10-22',
    pickup: '2026-10-22',
    end_date: '2026-10-24',
    returnDate: '2026-10-24',
    pickup_time: '11:00 AM',
    return_time: '07:00 PM',
    pickup_address: 'F-7 Markaz, Jinnah Super, Islamabad',
    total_price: 170,
    totalAmount: 170,
    status: 'confirmed',
    payment_status: 'paid',
    refund_status: 'Guaranteed Reservation',
  },
  // 3. Active Booking (Currently on road)
  {
    id: 'book-act-001',
    car_id: 'v-tesla-model-3',
    vehicleId: 'v-tesla-model-3',
    renter_id: 'usr-renter-demo',
    host_id: 'owner-sana',
    customer: 'Bilal Khan',
    renter_name: 'Bilal Khan',
    renter_phone: '+92 345 9988776',
    renter_email: 'bilal.khan@driveflex.pk',
    host_name: 'Sana Ahmed (Sana Auto Collective)',
    host_phone: '+92 333 219 6084',
    car_title: 'Tesla Model 3 Long Range',
    car_image: 'https://images.unsplash.com/photo-1560958089-b8a1929cea89?auto=format&fit=crop&w=1200&q=80',
    start_date: '2026-10-10',
    pickup: '2026-10-10',
    end_date: '2026-10-14',
    returnDate: '2026-10-14',
    pickup_time: '09:00 AM',
    return_time: '08:00 PM',
    pickup_address: 'Blue Area, Jinnah Avenue, Islamabad',
    total_price: 376,
    totalAmount: 376,
    status: 'active',
    payment_status: 'paid',
    refund_status: 'Active Rental In-Progress',
  },
  // 4. Completed / Past Booking (With earnings & reviews)
  {
    id: 'book-comp-001',
    car_id: 'v-mb-a-class',
    vehicleId: 'v-mb-a-class',
    renter_id: 'usr-renter-demo',
    host_id: 'owner-ali',
    customer: 'Andrew Dellington',
    renter_name: 'Andrew Dellington',
    renter_phone: '+92 301 2233445',
    renter_email: 'andrew@driveflex.pk',
    host_name: 'Ali Raza (Ali Motors)',
    host_phone: '+92 321 440 7812',
    car_title: 'Mercedes-Benz A-Class',
    car_image: 'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?auto=format&fit=crop&w=1200&q=80',
    start_date: '2026-09-21',
    pickup: '2026-09-21',
    end_date: '2026-10-09',
    returnDate: '2026-10-09',
    pickup_time: '10:00 AM',
    return_time: '05:00 PM',
    pickup_address: 'Mall of Lahore, Cantt, Lahore',
    total_price: 2700,
    totalAmount: 2700,
    status: 'completed',
    payment_status: 'paid',
    refund_status: 'Paid Out to Host',
    review_rating: 5,
    review_comment: 'Pristine Mercedes-Benz, flawless airport handover by Ali Motors!',
  },
  // 5. Cancelled Booking (Documented reason & refund processed)
  {
    id: 'book-canc-001',
    car_id: 'v6',
    vehicleId: 'v6',
    renter_id: 'usr-renter-demo',
    host_id: 'owner-hamza',
    customer: 'Zainab R.',
    renter_name: 'Zainab R.',
    renter_phone: '+92 322 7766554',
    renter_email: 'zainab@driveflex.pk',
    host_name: 'Hamza Qureshi (Hamza Premium Rides)',
    host_phone: '+92 300 781 4420',
    car_title: 'Kia Sportage AWD',
    car_image: 'https://images.unsplash.com/photo-1583121274602-3e2820c69888?auto=format&fit=crop&w=1400&q=82',
    start_date: '2026-10-01',
    pickup: '2026-10-01',
    end_date: '2026-10-05',
    returnDate: '2026-10-05',
    pickup_time: '12:00 PM',
    return_time: '06:00 PM',
    pickup_address: 'Clifton Block 4, Karachi',
    total_price: 550,
    totalAmount: 550,
    status: 'cancelled',
    payment_status: 'refunded',
    refund_status: 'Refund Processed to Card (100% Refund)',
    cancellation_reason: 'Renter flight schedule changed',
  },
];

export const categories = ['All', 'Sedan', 'SUV', 'Hatchback', 'Luxury'];