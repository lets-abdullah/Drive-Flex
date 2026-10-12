const mongoose = require('mongoose');

const vehicleSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true },
    slug: { type: String, required: true, unique: true },
    make: { type: String, required: true }, // Brand
    brand: { type: String, required: true },
    model: { type: String, required: true },
    year: { type: Number, default: 2022 },
    license_plate: { type: String, default: '' },
    category: { type: String, required: true },
    location: { type: String, required: true },
    city_name: { type: String, required: true, default: 'Multan' },
    address_text: { type: String, required: true, default: 'Central Terminal' },
    latitude: { type: Number, required: true, default: 30.1575 },
    longitude: { type: Number, required: true, default: 71.5249 },
    locationCoords: {
      type: { type: String, enum: ['Point'], default: 'Point' },
      coordinates: { type: [Number], default: [71.5249, 30.1575] }, // [lng, lat]
    },
    price_per_day: { type: Number, required: true },
    pricePerDay: { type: Number, required: true },
    status: {
      type: String,
      enum: ['available', 'rented', 'maintenance'],
      default: 'available',
    },
    rating: { type: Number, default: 4.9 },
    reviewCount: { type: Number, default: 24 },
    seats: { type: Number, default: 5 },
    transmission: { type: String, default: 'Automatic' },
    fuelType: { type: String, default: 'Gasoline' },
    range: { type: String, default: null },
    description: { type: String, default: '' },
    image: { type: String, default: '' },
    gallery: { type: [String], default: [] },
    host_id: { type: String, default: 'owner-ali' },
    ownerId: { type: String, default: 'owner-ali' },
    provider: { type: String, default: 'DriveFlex Verified Host' },
    features: { type: [String], default: [] },
    engine: { type: String, default: '' },
    horsepower: { type: String, default: '' },
    mileage: { type: String, default: '' },
    wheels: { type: String, default: '' },
    safetyFeatures: { type: [String], default: [] },
    pickupAddress: { type: String, default: '' },
    distanceKm: { type: String, default: '1.2 km' },
    durationEta: { type: String, default: '14 min' },
  },
  { timestamps: true }
);

// 2dsphere index for real-time geospatial radial queries
vehicleSchema.index({ locationCoords: '2dsphere' });
vehicleSchema.index({ city_name: 1 });
vehicleSchema.index({ host_id: 1 });

const Vehicle = mongoose.models.Vehicle || mongoose.model('Vehicle', vehicleSchema);

/* ------------------------------------------------------------------
 * Seed data – Pakistani fleet with exact individual coordinates
 * ------------------------------------------------------------------ */
const seedVehicles = [
  {
    id: 'v-mb-c-class',
    slug: 'mercedes-benz-c-class',
    make: 'Mercedes-Benz',
    brand: 'Mercedes-Benz',
    model: 'C-Class AMG Line',
    year: 2023,
    license_plate: 'LEA-23-9090',
    category: 'Sedan',
    location: 'Multan, Pakistan',
    city_name: 'Multan',
    address_text: 'Bosan Road Executive Suites, Multan',
    latitude: 30.2210,
    longitude: 71.4920,
    locationCoords: { type: 'Point', coordinates: [71.4920, 30.2210] },
    price_per_day: 81,
    pricePerDay: 81,
    status: 'available',
    rating: 4.95,
    reviewCount: 210,
    seats: 5,
    transmission: 'Automatic',
    fuelType: 'Gasoline',
    description: 'A stylish, athletic luxury sedan boasting a whisper-quiet ride and cutting-edge digital driver display.',
    image: 'https://images.unsplash.com/photo-1617531653332-bd46c24f2068?auto=format&fit=crop&w=1200&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1617531653332-bd46c24f2068?auto=format&fit=crop&w=1200&q=80',
    ],
    host_id: 'owner-ali',
    ownerId: 'owner-ali',
    provider: 'Ali Motors Multan',
    features: ['Sunroof', 'Leather interior', 'Ambient Lighting', 'Adaptive Cruise'],
  },
  {
    id: 'v-bmw-3-series',
    slug: 'bmw-3-series',
    make: 'BMW',
    brand: 'BMW',
    model: '3-Series M Sport',
    year: 2023,
    license_plate: 'ICT-23-4512',
    category: 'Sedan',
    location: 'Lahore, Pakistan',
    city_name: 'Lahore',
    address_text: 'Main Boulevard, Gulberg III, Lahore',
    latitude: 31.5125,
    longitude: 74.3490,
    locationCoords: { type: 'Point', coordinates: [74.3490, 31.5125] },
    price_per_day: 95,
    pricePerDay: 95,
    status: 'available',
    rating: 4.98,
    reviewCount: 164,
    seats: 5,
    transmission: 'Automatic',
    fuelType: 'Gasoline',
    description: 'Precision German handling, twin-turbo punch, and executive prestige tailored for Lahore boulevards.',
    image: 'https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&w=1200&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&w=1200&q=80',
    ],
    host_id: 'owner-sana',
    ownerId: 'owner-sana',
    provider: 'Sana Luxury Fleet Lahore',
    features: ['Heads-Up Display', 'Harman Kardon Audio', 'Wireless CarPlay'],
  },
  {
    id: 'v-audi-a4',
    slug: 'audi-a4',
    make: 'Audi',
    brand: 'Audi',
    model: 'A4 S-Line Quattro',
    year: 2022,
    license_plate: 'ISB-22-7711',
    category: 'Luxury',
    location: 'Islamabad, Pakistan',
    city_name: 'Islamabad',
    address_text: 'Blue Area Executive Parking, Islamabad',
    latitude: 33.7150,
    longitude: 73.0620,
    locationCoords: { type: 'Point', coordinates: [73.0620, 33.7150] },
    price_per_day: 110,
    pricePerDay: 110,
    status: 'available',
    rating: 4.92,
    reviewCount: 98,
    seats: 5,
    transmission: 'Automatic',
    fuelType: 'Gasoline',
    description: 'All-wheel Quattro grip and virtual cockpit luxury for diplomat trips through Islamabad and the Margalla hills.',
    image: 'https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?auto=format&fit=crop&w=1200&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?auto=format&fit=crop&w=1200&q=80',
    ],
    host_id: 'owner-hamza',
    ownerId: 'owner-hamza',
    provider: 'Hamza Prestige Cars Islamabad',
    features: ['Quattro AWD', 'Bang & Olufsen 3D Sound', 'Matrix LED Headlights'],
  },
  {
    id: 'v-toyota-fortuner',
    slug: 'toyota-fortuner-legender',
    make: 'Toyota',
    brand: 'Toyota',
    model: 'Fortuner Legender Sigma 4',
    year: 2023,
    license_plate: 'KHI-23-3399',
    category: 'SUV',
    location: 'Karachi, Pakistan',
    city_name: 'Karachi',
    address_text: 'DHA Phase 6, Khayaban-e-Shahbaz, Karachi',
    latitude: 24.8015,
    longitude: 67.0625,
    locationCoords: { type: 'Point', coordinates: [67.0625, 24.8015] },
    price_per_day: 165,
    pricePerDay: 165,
    status: 'available',
    rating: 4.89,
    reviewCount: 143,
    seats: 7,
    transmission: 'Automatic',
    fuelType: 'Diesel',
    description: 'The commanding 7-seater SUV of Pakistan with Sigma-4 terrain modes, dual AC, and unmatched stance.',
    image: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=1200&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=1200&q=80',
    ],
    host_id: 'owner-hamza',
    ownerId: 'owner-hamza',
    provider: 'Karachi Premier Wheels',
    features: ['7 Seats', '4x4 Sigma Drive', '360 Camera', 'Leather Seats'],
  },
  {
    id: 'v-tesla-model-3',
    slug: 'tesla-model-3',
    make: 'Tesla',
    brand: 'Tesla',
    model: 'Model 3 Performance',
    year: 2023,
    license_plate: 'ISB-23-0001',
    category: 'Electric',
    location: 'Islamabad, Pakistan',
    city_name: 'Islamabad',
    address_text: 'Centaurus Mall VIP Level 2, Islamabad',
    latitude: 33.7082,
    longitude: 73.0505,
    locationCoords: { type: 'Point', coordinates: [73.0505, 33.7082] },
    price_per_day: 140,
    pricePerDay: 140,
    status: 'available',
    rating: 4.97,
    reviewCount: 88,
    seats: 5,
    transmission: 'Automatic',
    fuelType: 'Electric',
    range: '500 km range',
    description: '0-100 km/h in 3.1 seconds. Silent electric propulsion, glass canopy roof, and cutting-edge Autopilot tech.',
    image: 'https://images.unsplash.com/photo-1560958089-b8a1929cea89?auto=format&fit=crop&w=1200&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1560958089-b8a1929cea89?auto=format&fit=crop&w=1200&q=80',
    ],
    host_id: 'owner-sana',
    ownerId: 'owner-sana',
    provider: 'ElectroDrive Pakistan',
    features: ['Autopilot', 'All-Glass Roof', 'Supercharger Access', 'Instant Torque'],
  },
  {
    id: 'v-mb-a-class',
    slug: 'mercedes-benz-a-class',
    make: 'Mercedes-Benz',
    brand: 'Mercedes-Benz',
    model: 'A-Class Premium Plus',
    year: 2022,
    license_plate: 'LHR-22-5544',
    category: 'Luxury',
    location: 'Lahore, Pakistan',
    city_name: 'Lahore',
    address_text: 'Mall of Lahore, Cantt, Lahore',
    latitude: 31.5450,
    longitude: 74.3720,
    locationCoords: { type: 'Point', coordinates: [74.3720, 31.5450] },
    price_per_day: 150,
    pricePerDay: 150,
    status: 'available',
    rating: 4.91,
    reviewCount: 184,
    seats: 5,
    transmission: 'Automatic',
    fuelType: 'Petrol',
    description: 'A refined luxury hatchback featuring intuitive MBUX digital touchscreens and executive cabin styling.',
    image: 'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?auto=format&fit=crop&w=1200&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?auto=format&fit=crop&w=1200&q=80',
    ],
    host_id: 'owner-ali',
    ownerId: 'owner-ali',
    provider: 'Ali Motors Lahore',
    features: ['MBUX Infotainment', 'LED High Performance', 'Active Brake Assist'],
  },
  {
    id: 'v-hyundai-sonata',
    slug: 'hyundai-sonata',
    make: 'Hyundai',
    brand: 'Hyundai',
    model: 'Sonata 2.5 Executive',
    year: 2023,
    license_plate: 'MUL-23-8822',
    category: 'Sedan',
    location: 'Multan, Pakistan',
    city_name: 'Multan',
    address_text: 'Multan International Airport Terminal, Multan',
    latitude: 30.2030,
    longitude: 71.4250,
    locationCoords: { type: 'Point', coordinates: [71.4250, 30.2030] },
    price_per_day: 75,
    pricePerDay: 75,
    status: 'available',
    rating: 4.88,
    reviewCount: 120,
    seats: 5,
    transmission: 'Automatic',
    fuelType: 'Gasoline',
    description: 'Sleek coupe-like sedan silhouette with panoramic glass roof, digital cluster, and first-class ride quality.',
    image: 'https://images.unsplash.com/photo-1542282088-72c9c27ed0cd?auto=format&fit=crop&w=1200&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1542282088-72c9c27ed0cd?auto=format&fit=crop&w=1200&q=80',
    ],
    host_id: 'owner-ali',
    ownerId: 'owner-ali',
    provider: 'Multan Airport Car Fleet',
    features: ['Panoramic Sunroof', 'Blind Spot Monitor', 'Wireless Charging'],
  },
  {
    id: 'v-kia-sportage',
    slug: 'kia-sportage-alpha',
    make: 'Kia',
    brand: 'Kia',
    model: 'Sportage AWD',
    year: 2022,
    license_plate: 'LHR-22-1980',
    category: 'SUV',
    location: 'Lahore, Pakistan',
    city_name: 'Lahore',
    address_text: 'DHA Phase 5 Commercial Avenue, Lahore',
    latitude: 31.4670,
    longitude: 74.4010,
    locationCoords: { type: 'Point', coordinates: [74.4010, 31.4670] },
    price_per_day: 70,
    pricePerDay: 70,
    status: 'available',
    rating: 4.85,
    reviewCount: 95,
    seats: 5,
    transmission: 'Automatic',
    fuelType: 'Gasoline',
    description: 'Family-friendly compact crossover with great ground clearance, all-wheel drive, and comfortable ride.',
    image: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1200&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1200&q=80',
    ],
    host_id: 'owner-sana',
    ownerId: 'owner-sana',
    provider: 'Sana Luxury Fleet Lahore',
    features: ['All Wheel Drive', 'Rear Camera', 'Cruise Control'],
  },
];

const seedIfEmpty = async () => {
  const count = await Vehicle.countDocuments();
  if (count === 0) {
    await Vehicle.insertMany(seedVehicles);
    console.log(`🌱  Seeded ${seedVehicles.length} vehicles into MongoDB with precise coordinates`);
  } else {
    // Safely sync coordinates & location text to existing vehicles by matching id or slug
    for (const sv of seedVehicles) {
      await Vehicle.updateOne(
        { $or: [{ id: sv.id }, { slug: sv.slug }] },
        {
          $set: {
            make: sv.make,
            brand: sv.brand,
            model: sv.model,
            city_name: sv.city_name,
            location: sv.location,
            address_text: sv.address_text,
            latitude: sv.latitude,
            longitude: sv.longitude,
            locationCoords: sv.locationCoords,
            price_per_day: sv.price_per_day,
            pricePerDay: sv.pricePerDay,
            status: sv.status,
            license_plate: sv.license_plate,
            host_id: sv.host_id,
            ownerId: sv.ownerId,
          },
        }
      );
    }
  }
};

/* ------------------------------------------------------------------
 * Haversine formula calculation for proximity distance
 * ------------------------------------------------------------------ */
function haversineDistanceKm(lat1, lon1, lat2, lon2) {
  const R = 6371; // km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
}

/* ------------------------------------------------------------------
 * DAO
 * ------------------------------------------------------------------ */
const VehicleModel = {
  findAll: async () => {
    await seedIfEmpty();
    return Vehicle.find().lean();
  },

  findById: async (id) => {
    return Vehicle.findOne({ id }).lean();
  },

  findBySlug: async (slug) => {
    return Vehicle.findOne({ slug }).lean();
  },

  findByHost: async (hostId) => {
    await seedIfEmpty();
    return Vehicle.find({ $or: [{ host_id: hostId }, { ownerId: hostId }] }).lean();
  },

  findByCity: async (cityName) => {
    await seedIfEmpty();
    const regex = new RegExp(cityName.trim(), 'i');
    return Vehicle.find({
      $or: [{ city_name: regex }, { location: regex }, { address_text: regex }],
    }).lean();
  },

  findByNear: async ({ lat, lng, radiusKm = 25 }) => {
    await seedIfEmpty();
    const all = await Vehicle.find().lean();
    return all
      .map((car) => {
        const dist = haversineDistanceKm(lat, lng, car.latitude, car.longitude);
        return { ...car, distanceKm: `${dist} km`, rawDistance: dist };
      })
      .filter((car) => car.rawDistance <= radiusKm)
      .sort((a, b) => a.rawDistance - b.rawDistance);
  },

  create: async (vehicleData) => {
    const coords = [vehicleData.longitude || 71.5249, vehicleData.latitude || 30.1575];
    const newVehicle = new Vehicle({
      id: `v-${Date.now()}`,
      gallery: vehicleData.gallery || [vehicleData.image],
      make: vehicleData.make || vehicleData.brand,
      brand: vehicleData.brand || vehicleData.make,
      price_per_day: vehicleData.price_per_day || vehicleData.pricePerDay,
      pricePerDay: vehicleData.pricePerDay || vehicleData.price_per_day,
      host_id: vehicleData.host_id || vehicleData.ownerId,
      ownerId: vehicleData.ownerId || vehicleData.host_id,
      locationCoords: { type: 'Point', coordinates: coords },
      ...vehicleData,
    });
    return (await newVehicle.save()).toObject();
  },

  update: async (id, updateData) => {
    return Vehicle.findOneAndUpdate({ id }, updateData, { new: true }).lean();
  },

  delete: async (id) => {
    const result = await Vehicle.deleteOne({ id });
    return result.deletedCount > 0;
  },
};

module.exports = VehicleModel;
