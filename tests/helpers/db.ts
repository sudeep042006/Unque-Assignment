import mongoose from 'mongoose';

// 1. Helper to connect
export const connectTestDB = async () => {
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/salon-db-test');
  }
};

// 2. Helper to clear all collections
export const clearTestDB = async () => {
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    await collections[key].deleteMany({});
  }
};

// 3. Helper to close connection
export const closeTestDB = async () => {
  await clearTestDB();
  await mongoose.connection.close();
};