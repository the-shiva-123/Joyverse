import dotenv from 'dotenv';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import User from './models/UserModel.js';

dotenv.config();

const MONGO_URI = process.env.MONGO;
const ADMIN_USERNAME = 'admin';
const ADMIN_PASSWORD = 'admin123';

async function main() {
  if (!MONGO_URI) {
    console.error('Error: MONGO environment variable is not set.');
    process.exit(1);
  }

  try {
    await mongoose.connect(MONGO_URI, { dbName: 'cluster0' });
    console.log('Connected to MongoDB');

    const existingAdmin = await User.findOne({ username: ADMIN_USERNAME });
    if (existingAdmin) {
      existingAdmin.role = 'admin';
      existingAdmin.isApproved = true;
      existingAdmin.password = await bcrypt.hash(ADMIN_PASSWORD, 10);
      await existingAdmin.save();
      console.log(`Updated existing user '${ADMIN_USERNAME}' to admin.`);
    } else {
      const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, 10);
      const adminUser = new User({
        username: ADMIN_USERNAME,
        password: hashedPassword,
        role: 'admin',
        isApproved: true,
      });
      await adminUser.save();
      console.log(`Created new admin user '${ADMIN_USERNAME}'.`);
    }

    console.log(`Admin credentials: username='${ADMIN_USERNAME}', password='${ADMIN_PASSWORD}'`);
  } catch (error) {
    console.error('Error creating admin user:', error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
  }
}

main();
