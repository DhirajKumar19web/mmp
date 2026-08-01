import mongoose from "mongoose";

import { config } from "@config/config";
import { logger } from "@config/logger";

const connectDB = async () => {
  try {
    const connectionInstance = await mongoose.connect(config.database.mongoUri);
    logger.info(`MongoDB connected !! DB HOST: ${connectionInstance.connection.host}`);
  } catch (error) {
    logger.error({ error }, "MONGODB connection FAILED");
    process.exit(1);
  }
};

const disconnectDB = async () => {
  try {
    await mongoose.disconnect();
    logger.info("MongoDB disconnected successfully");
  } catch (error) {
    logger.error({ error }, "MongoDB disconnection FAILED");
  }
};

export { connectDB, disconnectDB };
