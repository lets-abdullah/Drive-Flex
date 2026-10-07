import mongoose, { Schema, Model } from 'mongoose';

export interface IBooking {
  id: string;
  vehicleId: string;
  customer: string;
  pickup: string;
  returnDate: string;
  status: string;
  totalAmount: number;
  notes?: string;
}

const bookingSchema = new Schema<IBooking>(
  {
    id: { type: String, required: true, unique: true },
    vehicleId: { type: String, required: true },
    customer: { type: String, required: true },
    pickup: { type: String, required: true },
    returnDate: { type: String, required: true },
    status: { type: String, default: 'Confirmed' },
    totalAmount: { type: Number, default: 0 },
    notes: { type: String, default: '' },
  },
  { timestamps: true }
);

export const BookingModel: Model<IBooking> =
  (mongoose.models && mongoose.models.Booking) ||
  mongoose.model<IBooking>('Booking', bookingSchema);
