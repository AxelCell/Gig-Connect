import mongoose from "mongoose";

const connectDB = async () => {
  // MONGODB_URI is the documented name; MONGO_URI is kept for older .env files.
  const uri = process.env.MONGODB_URI || process.env.MONGO_URI;

  if (!uri) {
    console.error("Error: MONGODB_URI is not set. Add it to gig-platform-backend/.env");
    process.exit(1);
  }

  try {
    const conn = await mongoose.connect(uri);
    console.log(`MongoDB Connected ✅ ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

export default connectDB;
