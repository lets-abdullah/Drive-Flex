import mongoose, { Schema, Model } from 'mongoose';

export type UserRole = 'host' | 'renter';

export interface IUser {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  salt: string;
  role: UserRole;
  phone?: string;
  city?: string;
  businessName?: string;
  cnic?: string;
  ownerType?: string;
  description?: string;
  profileImage?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

const userSchema = new Schema<IUser>(
  {
    id: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    email: { type: String, required: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    salt: { type: String, required: true },
    role: { type: String, required: true, enum: ['host', 'renter'] },
    phone: { type: String, default: '' },
    city: { type: String, default: '' },
    businessName: { type: String, default: '' },
    cnic: { type: String, default: '' },
    ownerType: { type: String, default: 'Individual' },
    description: { type: String, default: '' },
    profileImage: { type: String, default: '' },
  },
  { timestamps: true }
);

// Compound index so email + role are strictly unique, preventing role collision
userSchema.index({ email: 1, role: 1 }, { unique: true });

export const UserModel: Model<IUser> =
  (mongoose.models && mongoose.models.User) ||
  mongoose.model<IUser>('User', userSchema);
