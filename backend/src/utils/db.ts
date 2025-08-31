import mongoose from "mongoose";
import { ENV } from "../config/env";

export async function connectDB() {
  if (!ENV.MONGODB_URI) throw new Error("MONGODB_URI not set");
  if (mongoose.connection.readyState >= 1) return;
  await mongoose.connect(ENV.MONGODB_URI);
  console.log("[db] connected");
}
