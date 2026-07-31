import { defineConfig } from "drizzle-kit";

export default defineConfig({
  dialect: "postgresql",
  schema: "./src/schema/*", // Update this path if necessary
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
});