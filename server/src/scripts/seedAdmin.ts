import 'dotenv/config';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import User from '../models/User';

async function seedAdmin() {
  try {
    const mongoUri = process.env.MONGO_URI;
    const email = process.env.ADMIN_EMAIL;
    const password = process.env.ADMIN_PASSWORD;
    const name = 'Admin';

    if (!mongoUri) throw new Error('❌ MONGO_URI is not defined in .env');
    if (!email || !password) throw new Error('❌ ADMIN_EMAIL or ADMIN_PASSWORD missing in .env');

    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB');

    let admin = await User.findOne({ email });
    if (admin) {
      console.log('⚠️ Admin already exists with email:', email);
    } else {
      const passwordHash = await bcrypt.hash(password, 10);

      admin = new User({
        name,
        email,
        passwordHash,
        credits: Infinity, // unlimited credits
      });

      await admin.save();
      console.log('🎉 Admin user created:', email);
    }

    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  } catch (err) {
    console.error('❌ Error seeding admin:', err);
    process.exit(1);
  }
}

seedAdmin();
