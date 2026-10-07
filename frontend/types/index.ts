// ─── Owner Types ───────────────────────────────────────────────────────────────
export type OwnerType = 'Individual' | 'Car Rental Business' | 'Dealership' | 'Fleet Owner';

export type Owner = {
  id: string;
  slug: string;
  fullName: string;
  businessName: string;
  ownerType: OwnerType;
  city: string;
  location: string;
  phone: string;
  email: string;
  yearsExperience: number;
  description: string;
  profileImage: string;
  logoImage?: string;
  coverImage?: string;
  verified: boolean;
  identityVerified: boolean;
  vehicleIds: string[];
};

// ─── Vehicle Types ─────────────────────────────────────────────────────────────
export type RentalPeriod = {
  start: string;
  end: string;
  status: 'confirmed' | 'pending';
  customer?: string;
};

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
  status?: 'available' | 'booked';
  bookable?: boolean;
  currentBooking?: {
    id: string;
    customer: string;
    pickup: string;
    returnDate: string;
    status: string;
  } | null;
};

// ─── Session & Auth Types ──────────────────────────────────────────────────────
export type Session = { name: string; email: string };

export type DemoOwnerProfile = Owner & { cnic: string; businessLocation: string };

export type DemoBooking = {
  id?: string;
  vehicleId: string;
  customer: string;
  pickup: string;
  returnDate: string;
  totalAmount?: number;
  status: 'Confirmed' | 'Pending' | 'Cancelled';
  createdAt?: string;
};

