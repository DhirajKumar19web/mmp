import { app } from "@/app";
import { config } from "@config/config";
import { connectDB, disconnectDB } from "@config/database";
import { logger } from "@config/logger";
import { redisService } from "@redis/redis.client";

async function main() {
  try {
    await connectDB();

    const server = app.listen(config.server.port, () => {
      logger.info(`Server is running on port ${String(config.server.port)}`);
    });

    const gracefulShutdown = (signal: string) => {
      logger.info(`Received ${signal}. Shutting down gracefully...`);
      server.close(() => {
        void (async () => {
          logger.info("HTTP server closed.");
          await redisService.disconnect();
          await disconnectDB();
          process.exit(0);
        })();
      });
    };

    process.on("SIGINT", () => {
      gracefulShutdown("SIGINT");
    });
    process.on("SIGTERM", () => {
      gracefulShutdown("SIGTERM");
    });

    process.on("unhandledRejection", (reason: unknown) => {
      logger.error({ reason }, "Unhandled Rejection detected");
    });

    process.on("uncaughtException", (error: Error) => {
      logger.fatal({ error }, "Uncaught Exception detected");
      gracefulShutdown("uncaughtException");
    });
  } catch (error) {
    logger.fatal({ error }, "MongoDB connection failed");
    process.exit(1);
  }
}

void main();
