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

export const owners: Owner[] = [
  {
    id: 'owner-ali',
    slug: 'ali-motors-lahore',
    fullName: 'Ali Raza',
    businessName: 'Ali Motors Lahore',
    ownerType: 'Car Rental Business',
    city: 'Lahore',
    location: 'Gulberg III, Lahore',
    phone: '+92 321 440 7812',
    email: 'hello@alimotors.demo',
    yearsExperience: 11,
    description: 'A family-run Lahore rental house known for clean handovers, considered cars, and a calm airport-to-city service.',
    profileImage: 'https://images.pexels.com/photos/614810/pexels-photo-614810.jpeg?auto=compress&cs=tinysrgb&w=300',
    coverImage: 'https://images.pexels.com/photos/164634/pexels-photo-164634.jpeg?auto=compress&cs=tinysrgb&w=1600',
    verified: true,
    identityVerified: true,
    vehicleIds: ['v1', 'v5', 'v8'],
  },
  {
    id: 'owner-sana',
    slug: 'sana-auto-collective-islamabad',
    fullName: 'Sana Ahmed',
    businessName: 'Sana Auto Collective',
    ownerType: 'Fleet Owner',
    city: 'Islamabad',
    location: 'F-7 Markaz, Islamabad',
    phone: '+92 333 219 6084',
    email: 'book@sanaauto.demo',
    yearsExperience: 8,
    description: 'A detail-first fleet for Islamabad weekends, northern road trips, and guests who want a polished car waiting on arrival.',
    profileImage: 'https://images.pexels.com/photos/3769021/pexels-photo-3769021.jpeg?auto=compress&cs=tinysrgb&w=300',
    coverImage: 'https://images.pexels.com/photos/116675/pexels-photo-116675.jpeg?auto=compress&cs=tinysrgb&w=1600',
    verified: true,
    identityVerified: true,
    vehicleIds: ['v2', 'v6', 'v9'],
  },
  {
    id: 'owner-hamza',
    slug: 'hamza-premium-rides-karachi',
    fullName: 'Hamza Qureshi',
    businessName: 'Hamza Premium Rides',
    ownerType: 'Dealership',
    city: 'Karachi',
    location: 'Clifton Block 4, Karachi',
    phone: '+92 300 781 4420',
    email: 'studio@hamzarides.demo',
    yearsExperience: 14,
    description: 'Karachi’s premium mobility studio, pairing enthusiast cars with transparent rental terms and a personal handover.',
    profileImage: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=300',
    coverImage: 'https://images.pexels.com/photos/337909/pexels-photo-337909.jpeg?auto=compress&cs=tinysrgb&w=1600',
    verified: true,
    identityVerified: true,
    vehicleIds: ['v3', 'v4', 'v7', 'v10'],
  },
];

export const findOwner = (slug: string) => owners.find((owner) => owner.slug === slug);
export const findOwnerById = (id: string) => owners.find((owner) => owner.id === id);