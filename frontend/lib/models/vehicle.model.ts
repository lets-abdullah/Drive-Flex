import mongoose, { Schema, Model } from 'mongoose';

export interface IVehicle {
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
  ownerId: string;
  provider: string;
  features: string[];
}

const vehicleSchema = new Schema<IVehicle>(
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

export const VehicleModel: Model<IVehicle> =
  (mongoose.models && mongoose.models.Vehicle) ||
  mongoose.model<IVehicle>('Vehicle', vehicleSchema);
