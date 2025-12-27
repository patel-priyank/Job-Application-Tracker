import mongoose from 'mongoose';

const connectDB = async () => {
  if (mongoose.connection.readyState) {
    return;
  }

  try {
    await mongoose.connect(process.env.MONGO_URI || '');
    console.log('Database connected');
  } catch (err) {
    console.error('Database connection error: ', err);
    throw err;
  }
};

export default connectDB;
