import "dotenv/config";
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "npx tsx prisma/seed.ts",
  },
  datasource: {
    // Optional so `prisma generate` (run on install) works without a database;
    // migrate and seed still need it.
    url: process.env.DATABASE_URL,
  },
});
