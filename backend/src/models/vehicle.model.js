const mongoose = require('mongoose');

const vehicleSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true },
    slug: { type: String, required: true, unique: true },
    brand: { type: String, required: true },
    model: { type: String, required: true },
    category: { type: String, required: true },
    location: { type: String, required: true },
    pricePerDay: { type: Number, required: true },
    rating: { type: Number, default: 0 },
    reviewCount: { type: Number, default: 0 },
    seats: { type: Number, default: 5 },
    transmission: { type: String, default: 'Automatic' },
    fuelType: { type: String, default: 'Gasoline' },
    range: { type: String, default: null },
    description: { type: String, default: '' },
    image: { type: String, default: '' },
    gallery: { type: [String], default: [] },
    ownerId: { type: String, default: '' },
    provider: { type: String, default: 'Drive Flex verified host' },
    features: { type: [String], default: [] },
  },
  { timestamps: true }
);

const Vehicle = mongoose.model('Vehicle', vehicleSchema);

/* ------------------------------------------------------------------
 * Seed data – inserted once if the collection is empty
 * ------------------------------------------------------------------ */
const seedVehicles = [
  {
    id: 'v1', slug: 'mercedes-amg-gt', brand: 'Mercedes-Benz', model: 'AMG GT',
    category: 'Luxury', location: 'Lahore, Pakistan', pricePerDay: 289,
    rating: 4.9, reviewCount: 48, seats: 2, transmission: 'Automatic', fuelType: 'Gasoline',
    description: 'A low-slung grand tourer with effortless power, hand-finished details, and the kind of presence that changes the pace of a weekend.',
    image: 'https://images.pexels.com/photos/337909/pexels-photo-337909.jpeg?auto=compress&cs=tinysrgb&w=1600',
    gallery: ['https://images.pexels.com/photos/337909/pexels-photo-337909.jpeg?auto=compress&cs=tinysrgb&w=1600'],
    ownerId: 'owner-ali', features: ['Professional handover', 'Cleaned before pickup'],
  },
  {
    id: 'v2', slug: 'porsche-911-carrera', brand: 'Porsche', model: '911 Carrera',
    category: 'Sports', location: 'Islamabad, Pakistan', pricePerDay: 345,
    rating: 4.98, reviewCount: 72, seats: 2, transmission: 'Automatic', fuelType: 'Gasoline',
    description: 'A driver-first icon for Margalla roads and late arrivals. Responsive, composed, and made for the long way around.',
    image: 'https://images.pexels.com/photos/170811/pexels-photo-170811.jpeg?auto=compress&cs=tinysrgb&w=1600',
    gallery: ['https://images.pexels.com/photos/170811/pexels-photo-170811.jpeg?auto=compress&cs=tinysrgb&w=1600'],
    ownerId: 'owner-sana', features: ['Professional handover', 'Cleaned before pickup'],
  },
  {
    id: 'v3', slug: 'range-rover-autobiography', brand: 'Land Rover', model: 'Range Rover Autobiography',
    category: 'SUV', location: 'Karachi, Pakistan', pricePerDay: 265,
    rating: 4.87, reviewCount: 39, seats: 5, transmission: 'Automatic', fuelType: 'Hybrid', range: 'Up to 24 mpg',
    description: 'Quiet authority with room for five. A tailored cabin, all-weather confidence, and a view from the top of every city street.',
    image: 'https://images.pexels.com/photos/116675/pexels-photo-116675.jpeg?auto=compress&cs=tinysrgb&w=1600',
    gallery: ['https://images.pexels.com/photos/116675/pexels-photo-116675.jpeg?auto=compress&cs=tinysrgb&w=1600'],
    ownerId: 'owner-hamza', features: ['Professional handover', 'Cleaned before pickup'],
  },
  {
    id: 'v4', slug: 'tesla-model-s-plaid', brand: 'Tesla', model: 'Model S Plaid',
    category: 'Electric', location: 'Karachi, Pakistan', pricePerDay: 198,
    rating: 4.84, reviewCount: 55, seats: 5, transmission: 'Automatic', fuelType: 'Electric', range: '396 mi range',
    description: 'Instant torque, a serene cabin, and an electric range built for leaving the itinerary open.',
    image: 'https://images.pexels.com/photos/799443/pexels-photo-799443.jpeg?auto=compress&cs=tinysrgb&w=1600',
    gallery: ['https://images.pexels.com/photos/799443/pexels-photo-799443.jpeg?auto=compress&cs=tinysrgb&w=1600'],
    ownerId: 'owner-hamza', features: ['Professional handover', 'Cleaned before pickup'],
  },
  {
    id: 'v5', slug: 'bmw-7-series', brand: 'BMW', model: '7 Series',
    category: 'Luxury', location: 'Lahore, Pakistan', pricePerDay: 229,
    rating: 4.78, reviewCount: 31, seats: 5, transmission: 'Automatic', fuelType: 'Gasoline', range: 'Up to 29 mpg',
    description: 'Executive calm with a pulse underneath. The 7 Series is made for arrivals that feel considered.',
    image: 'https://images.pexels.com/photos/244206/pexels-photo-244206.jpeg?auto=compress&cs=tinysrgb&w=1600',
    gallery: ['https://images.pexels.com/photos/244206/pexels-photo-244206.jpeg?auto=compress&cs=tinysrgb&w=1600'],
    ownerId: 'owner-ali', features: ['Professional handover', 'Cleaned before pickup'],
  },
  {
    id: 'v6', slug: 'audi-q8-premium', brand: 'Audi', model: 'Q8 Premium',
    category: 'SUV', location: 'Islamabad, Pakistan', pricePerDay: 176,
    rating: 4.81, reviewCount: 44, seats: 5, transmission: 'Automatic', fuelType: 'Gasoline', range: 'Up to 25 mpg',
    description: 'A sculpted fastback SUV with quattro composure for rain-soaked streets and mountain departures.',
    image: 'https://images.pexels.com/photos/112460/pexels-photo-112460.jpeg?auto=compress&cs=tinysrgb&w=1600',
    gallery: ['https://images.pexels.com/photos/112460/pexels-photo-112460.jpeg?auto=compress&cs=tinysrgb&w=1600'],
    ownerId: 'owner-sana', features: ['Professional handover', 'Cleaned before pickup'],
  },
  {
    id: 'v7', slug: 'volvo-s90-inscription', brand: 'Volvo', model: 'S90 Inscription',
    category: 'Sedan', location: 'Karachi, Pakistan', pricePerDay: 142,
    rating: 4.76, reviewCount: 28, seats: 5, transmission: 'Automatic', fuelType: 'Hybrid', range: 'Up to 34 mpg',
    description: 'Scandinavian restraint, thoughtful materials, and the rare feeling of being looked after on the road.',
    image: 'https://images.pexels.com/photos/116675/pexels-photo-116675.jpeg?auto=compress&cs=tinysrgb&w=1600',
    gallery: ['https://images.pexels.com/photos/116675/pexels-photo-116675.jpeg?auto=compress&cs=tinysrgb&w=1600'],
    ownerId: 'owner-hamza', features: ['Professional handover', 'Cleaned before pickup'],
  },
  {
    id: 'v8', slug: 'lexus-es-350', brand: 'Lexus', model: 'ES 350',
    category: 'Sedan', location: 'Lahore, Pakistan', pricePerDay: 119,
    rating: 4.73, reviewCount: 63, seats: 5, transmission: 'Automatic', fuelType: 'Gasoline', range: 'Up to 31 mpg',
    description: 'Smooth, spacious, and quietly capable. A dependable choice for airport runs and unhurried miles.',
    image: 'https://images.pexels.com/photos/358070/pexels-photo-358070.jpeg?auto=compress&cs=tinysrgb&w=1600',
    gallery: ['https://images.pexels.com/photos/358070/pexels-photo-358070.jpeg?auto=compress&cs=tinysrgb&w=1600'],
    ownerId: 'owner-ali', features: ['Professional handover', 'Cleaned before pickup'],
  },
  {
    id: 'v9', slug: 'toyota-rav4-hybrid', brand: 'Toyota', model: 'RAV4 Hybrid',
    category: 'Economy', location: 'Islamabad, Pakistan', pricePerDay: 89,
    rating: 4.7, reviewCount: 89, seats: 5, transmission: 'Automatic', fuelType: 'Hybrid', range: 'Up to 38 mpg',
    description: 'Practical range and easy confidence for a day of errands or a week beyond the city limits.',
    image: 'https://images.pexels.com/photos/707046/pexels-photo-707046.jpeg?auto=compress&cs=tinysrgb&w=1600',
    gallery: ['https://images.pexels.com/photos/707046/pexels-photo-707046.jpeg?auto=compress&cs=tinysrgb&w=1600'],
    ownerId: 'owner-sana', features: ['Professional handover', 'Cleaned before pickup'],
  },
  {
    id: 'v10', slug: 'ford-bronco-wildtrak', brand: 'Ford', model: 'Bronco Wildtrak',
    category: 'SUV', location: 'Karachi, Pakistan', pricePerDay: 158,
    rating: 4.82, reviewCount: 36, seats: 5, transmission: 'Automatic', fuelType: 'Gasoline',
    description: 'Open-air attitude with the hardware to find your own horizon. Built for desert light and dirt roads.',
    image: 'https://images.pexels.com/photos/193999/pexels-photo-193999.jpeg?auto=compress&cs=tinysrgb&w=1600',
    gallery: ['https://images.pexels.com/photos/193999/pexels-photo-193999.jpeg?auto=compress&cs=tinysrgb&w=1600'],
    ownerId: 'owner-hamza', features: ['Professional handover', 'Cleaned before pickup'],
  },
];

const seedIfEmpty = async () => {
  const count = await Vehicle.countDocuments();
  if (count === 0) {
    await Vehicle.insertMany(seedVehicles);
    console.log(`🌱  Seeded ${seedVehicles.length} vehicles into MongoDB`);
  }
};

/* ------------------------------------------------------------------
 * DAO – same interface as the old in-memory model
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

  create: async (vehicleData) => {
    const newVehicle = new Vehicle({
      id: `v-${Date.now()}`,
      gallery: vehicleData.gallery || [vehicleData.image],
      ...vehicleData,
    });
    return (await newVehicle.save()).toObject();
  },

  update: async (id, updateData) => {
    return Vehicle.findOneAndUpdate({ id }, updateData, { new: true }).lean();
  },
};

module.exports = VehicleModel;
