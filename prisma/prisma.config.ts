import { defineConfig } from "@prisma/client";

export default defineConfig({
  adapter: "postgresql",
  url: process.env.DATABASE_URL!,
});
