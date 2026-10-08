const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
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

const UserModel = mongoose.models.User || mongoose.model('User', userSchema);

module.exports = UserModel;
