import { createClient } from "redis";

const redisClient = createClient({
  url: "redis://localhost:6379", // add password if needed
  // url: "redis://:password@localhost:6379"
});

redisClient.on("connect", () => {
  console.log("✅ Redis connected");
});

redisClient.on("error", (err) => {
  console.error("❌ Redis error:", err);
});

export const connectRedis = async () => {
  if (!redisClient.isOpen) {
    await redisClient.connect();
  }
};

export default redisClient;