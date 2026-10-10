const mongoose = require('mongoose');

const uri = 'mongodb+srv://letsmailabdullahcoder_db_user:0PCZIPJvQ9AK1v9X@cluster0.dceioeq.mongodb.net/Driveflex?appName=Cluster0';

const pakistaniVehicles = [
  {
    id: 'v1',
    slug: 'toyota-corolla-altis',
    brand: 'Toyota',
    model: 'Corolla Altis Grandi',
    category: 'Sedan',
    location: 'Lahore, Pakistan',
    pricePerDay: 65,
    rating: 4.92,
    reviewCount: 52,
    seats: 5,
    transmission: 'Automatic',
    fuelType: 'Gasoline',
    range: null,
    description: 'Pakistan’s favorite executive sedan. Smooth automatic drive, powerful 1.8L engine, ice-cold dual AC, and unmatched reliability.',
    image: 'https://images.unsplash.com/photo-1623869675781-80aa31012a5a?auto=format&fit=crop&w=1600&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1623869675781-80aa31012a5a?auto=format&fit=crop&w=1600&q=80',
      'https://images.unsplash.com/photo-1623869675781-80aa31012a5a?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1623869675781-80aa31012a5a?auto=format&fit=crop&w=1000&q=80'
    ],
    ownerId: 'owner-ali',
    provider: 'Drive Flex verified host',
    features: ['Professional handover', 'Cleaned before pickup'],
  },
  {
    id: 'v2',
    slug: 'honda-civic-rs-turbo',
    brand: 'Honda',
    model: 'Civic RS Turbo',
    category: 'Sedan',
    location: 'Islamabad, Pakistan',
    pricePerDay: 85,
    rating: 4.98,
    reviewCount: 78,
    seats: 5,
    transmission: 'Automatic',
    fuelType: 'Gasoline',
    range: null,
    description: 'Sleek, aggressive and fast. 1.5L VTEC Turbo engine with sunroof, paddle shifters, and premium leather cabin for Margalla highway drives.',
    image: 'https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?auto=format&fit=crop&w=1600&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?auto=format&fit=crop&w=1600&q=80',
      'https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?auto=format&fit=crop&w=1000&q=80'
    ],
    ownerId: 'owner-sana',
    provider: 'Drive Flex verified host',
    features: ['Professional handover', 'Cleaned before pickup'],
  },
  {
    id: 'v3',
    slug: 'toyota-fortuner-legender',
    brand: 'Toyota',
    model: 'Fortuner Legender',
    category: 'SUV',
    location: 'Karachi, Pakistan',
    pricePerDay: 165,
    rating: 4.89,
    reviewCount: 43,
    seats: 7,
    transmission: 'Automatic',
    fuelType: 'Diesel',
    range: 'Up to 24 mpg',
    description: 'The ultimate 7-seater SUV in Pakistan. High road clearance, commanding presence, 4x4 Sigma capability, and luxurious 3-row seating.',
    image: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=1600&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=1600&q=80',
      'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=1000&q=80'
    ],
    ownerId: 'owner-hamza',
    provider: 'Drive Flex verified host',
    features: ['Professional handover', 'Cleaned before pickup'],
  },
  {
    id: 'v4',
    slug: 'suzuki-alto-vxl',
    brand: 'Suzuki',
    model: 'Alto VXL AGS',
    category: 'Hatchback',
    location: 'Karachi, Pakistan',
    pricePerDay: 28,
    rating: 4.82,
    reviewCount: 65,
    seats: 4,
    transmission: 'Automatic',
    fuelType: 'Gasoline',
    range: '50+ mpg economy',
    description: 'Pakistan’s top-selling fuel-efficient hatchback. Extremely easy to navigate through tight city traffic with Auto Gear Shift.',
    image: 'https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?auto=format&fit=crop&w=1600&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?auto=format&fit=crop&w=1600&q=80',
      'https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?auto=format&fit=crop&w=1000&q=80'
    ],
    ownerId: 'owner-hamza',
    provider: 'Drive Flex verified host',
    features: ['Professional handover', 'Cleaned before pickup'],
  },
  {
    id: 'v5',
    slug: 'suzuki-cultus-vxl',
    brand: 'Suzuki',
    model: 'Cultus VXL',
    category: 'Hatchback',
    location: 'Lahore, Pakistan',
    pricePerDay: 38,
    rating: 4.79,
    reviewCount: 39,
    seats: 5,
    transmission: 'Automatic',
    fuelType: 'Gasoline',
    range: 'Up to 38 mpg',
    description: 'Spacious 5-seater family hatchback. Excellent fuel economy, Android touchscreen infotainment system, and smooth city driving.',
    image: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=1600&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=1600&q=80',
      'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=1000&q=80'
    ],
    ownerId: 'owner-ali',
    provider: 'Drive Flex verified host',
    features: ['Professional handover', 'Cleaned before pickup'],
  },
  {
    id: 'v6',
    slug: 'honda-vezel-hybrid',
    brand: 'Honda',
    model: 'Vezel Hybrid Z',
    category: 'SUV',
    location: 'Islamabad, Pakistan',
    pricePerDay: 75,
    rating: 4.88,
    reviewCount: 51,
    seats: 5,
    transmission: 'Automatic',
    fuelType: 'Hybrid',
    range: 'Up to 42 mpg',
    description: 'Premium Japanese hybrid crossover SUV with panoramic view, leather upholstery, and outstanding fuel efficiency.',
    image: 'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?auto=format&fit=crop&w=1600&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?auto=format&fit=crop&w=1600&q=80',
      'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?auto=format&fit=crop&w=1000&q=80'
    ],
    ownerId: 'owner-sana',
    provider: 'Drive Flex verified host',
    features: ['Professional handover', 'Cleaned before pickup'],
  },
  {
    id: 'v7',
    slug: 'suzuki-mehran-vxr',
    brand: 'Suzuki',
    model: 'Mehran VXR',
    category: 'Hatchback',
    location: 'Rawalpindi, Pakistan',
    pricePerDay: 18,
    rating: 4.72,
    reviewCount: 84,
    seats: 4,
    transmission: 'Manual',
    fuelType: 'Gasoline',
    range: 'Up to 40 mpg',
    description: 'The iconic budget favorite of Pakistan. Unbeatable fuel economy, bulletproof reliability, and effortless city maneuvering.',
    image: 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=1600&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=1600&q=80',
      'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=1000&q=80'
    ],
    ownerId: 'owner-hamza',
    provider: 'Drive Flex verified host',
    features: ['Professional handover', 'Cleaned before pickup'],
  },
  {
    id: 'v8',
    slug: 'honda-city-aspire',
    brand: 'Honda',
    model: 'City 1.5 Aspire',
    category: 'Sedan',
    location: 'Lahore, Pakistan',
    pricePerDay: 50,
    rating: 4.85,
    reviewCount: 47,
    seats: 5,
    transmission: 'Automatic',
    fuelType: 'Gasoline',
    range: 'Up to 35 mpg',
    description: 'Comfortable and elegant sedan. Alloy rims, rear camera, plush seating, and great highway mileage for family trips.',
    image: 'https://images.unsplash.com/photo-1550355291-bbee04a92027?auto=format&fit=crop&w=1600&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1550355291-bbee04a92027?auto=format&fit=crop&w=1600&q=80',
      'https://images.unsplash.com/photo-1550355291-bbee04a92027?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1550355291-bbee04a92027?auto=format&fit=crop&w=1000&q=80'
    ],
    ownerId: 'owner-ali',
    provider: 'Drive Flex verified host',
    features: ['Professional handover', 'Cleaned before pickup'],
  },
  {
    id: 'v9',
    slug: 'honda-brv-ivtec',
    brand: 'Honda',
    model: 'BR-V i-VTEC S',
    category: 'SUV',
    location: 'Islamabad, Pakistan',
    pricePerDay: 68,
    rating: 4.76,
    reviewCount: 33,
    seats: 7,
    transmission: 'Automatic',
    fuelType: 'Gasoline',
    range: 'Up to 30 mpg',
    description: '7-seater family MPV / SUV with rear AC vents, high ground clearance, and large boot capacity for road trips to Northern Pakistan.',
    image: 'https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?auto=format&fit=crop&w=1600&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?auto=format&fit=crop&w=1600&q=80',
      'https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?auto=format&fit=crop&w=1000&q=80'
    ],
    ownerId: 'owner-sana',
    provider: 'Drive Flex verified host',
    features: ['Professional handover', 'Cleaned before pickup'],
  },
  {
    id: 'v10',
    slug: 'kia-sportage-awd',
    brand: 'Kia',
    model: 'Sportage AWD',
    category: 'SUV',
    location: 'Karachi, Pakistan',
    pricePerDay: 110,
    rating: 4.91,
    reviewCount: 62,
    seats: 5,
    transmission: 'Automatic',
    fuelType: 'Gasoline',
    range: null,
    description: 'Modern luxury crossover SUV featuring a panoramic sunroof, all-wheel drive stability, wireless charging, and plush leather seats.',
    image: 'https://images.unsplash.com/photo-1583121274602-3e2820c69888?auto=format&fit=crop&w=1600&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1583121274602-3e2820c69888?auto=format&fit=crop&w=1600&q=80',
      'https://images.unsplash.com/photo-1583121274602-3e2820c69888?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1583121274602-3e2820c69888?auto=format&fit=crop&w=1000&q=80'
    ],
    ownerId: 'owner-hamza',
    provider: 'Drive Flex verified host',
    features: ['Professional handover', 'Cleaned before pickup'],
  },
];

async function sync() {
  try {
    await mongoose.connect(uri);
    console.log('Connected to MongoDB Atlas');
    const col = mongoose.connection.db.collection('vehicles');

    // Upsert each vehicle by id and slug
    for (const v of pakistaniVehicles) {
      await col.updateOne(
        { id: v.id },
        { $set: v },
        { upsert: true }
      );
      console.log(`Synced ${v.id}: ${v.brand} ${v.model} (${v.slug})`);
    }

    console.log('All 10 Pakistani vehicles successfully synced to MongoDB Atlas!');
    process.exit(0);
  } catch (err) {
    console.error('Error syncing:', err);
    process.exit(1);
  }
}

sync();
