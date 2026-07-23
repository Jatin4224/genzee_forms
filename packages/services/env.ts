import { z } from "zod";

const envSchema = z.object({
  JWT_SECRET: z
    .string()
    .default("development-jwt-secret-key-change-in-production")
    .describe("secret key for jwt tokens"),
});

function createEnv(env: NodeJS.ProcessEnv) {
  const safeParseResult = envSchema.safeParse(env);
  if (!safeParseResult.success) throw new Error(safeParseResult.error.message);
  return safeParseResult.data;
}

export const env = createEnv(process.env);
