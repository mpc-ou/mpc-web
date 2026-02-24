import "dotenv/config";
import { defineConfig, env } from "prisma/config";

export default defineConfig({
  schema: "configs/prisma/schema.prisma",
  datasource: {
    url: env("DIRECT_URL") ?? env("DATABASE_URL")
  }
});
