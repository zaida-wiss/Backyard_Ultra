import mongoose from 'mongoose';

export const connectToDatabase = async () => {
  const mongoUri = process.env.MONGO_URI;

  if (!mongoUri) {
    throw new Error('MONGO_URI saknas i miljövariablerna');
  }

  await mongoose.connect(mongoUri);
  console.log('Ansluten till MongoDB');
};
