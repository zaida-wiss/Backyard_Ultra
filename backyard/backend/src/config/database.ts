import mongoose from "mongoose";

import { config } from "./env.js";
import { logger } from "../utils/logger.js";

const connectToDatabase = async () => {
  await mongoose.connect(config.mongoUri);
  logger.info({}, "Ansluten till MongoDB");
};

export { connectToDatabase };
