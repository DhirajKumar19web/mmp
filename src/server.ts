import logger from "@/config/logger";

const app = "Dhiraj";

console.log(app);

function greet(name: string): string {
  return `Hello, ${name}!`;
}
logger.info("Rate limit exceeded");

// logger.error(new Error("Database connection failed"));
console.log(greet(app));
