import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: "./src/db/schema/index.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL!,
    ssl: /@(localhost|127\.0\.0\.1)[:/]/.test(process.env.DATABASE_URL ?? "") ? false : "require",
  },
});
