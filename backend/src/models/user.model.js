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

const seedDemoUsers = async () => {
  try {
    const { hashPassword } = require('../utils/auth-crypto');
    const demoUsers = [
      {
        id: 'usr-demo-renter',
        name: 'Omar Farooq',
        email: 'renter@driveflex.pk',
        role: 'renter',
        phone: '+92 300 8472910',
        city: 'Lahore',
        password: 'password123',
      },
      {
        id: 'owner-ali',
        name: 'Ali Raza',
        email: 'host@driveflex.pk',
        role: 'host',
        phone: '+92 321 440 7812',
        city: 'Lahore',
        businessName: 'Ali Motors Lahore',
        ownerType: 'Dealer',
        password: 'password123',
      },
    ];

    for (const demo of demoUsers) {
      const exists = await UserModel.findOne({ email: demo.email, role: demo.role }).lean();
      if (!exists) {
        const { hash, salt } = hashPassword(demo.password);
        await UserModel.create({
          id: demo.id,
          name: demo.name,
          email: demo.email,
          role: demo.role,
          phone: demo.phone,
          city: demo.city,
          businessName: demo.businessName || '',
          ownerType: demo.ownerType || 'Individual',
          passwordHash: hash,
          salt: salt,
        });
        console.log(`🌱  Seeded demo ${demo.role}: ${demo.email}`);
      }
    }
  } catch (err) {
    console.warn('⚠️  Could not seed demo users:', err.message);
  }
};

mongoose.connection.on('connected', () => {
  seedDemoUsers();
});

if (mongoose.connection.readyState === 1) {
  seedDemoUsers();
}

module.exports = UserModel;
