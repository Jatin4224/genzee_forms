import { z } from "zod";

const envSchema = z.object({
  PORT: z.string().optional(),
  NODE_ENV: z.enum(["development", "prod", "production"]).default("development"),
  BASE_URL: z.string().default("http://localhost:8000"),
  //origin of the web app, used for CORS. In prod set this to your Vercel URL.
  WEB_ORIGIN: z.string().default("http://localhost:3000"),
  //injected by Railway at runtime. surfaced on /health so "which commit is live?"
  //is answerable with one request - a stale deploy is otherwise invisible until
  //some field the client sends starts silently disappearing.
  RAILWAY_GIT_COMMIT_SHA: z.string().optional(),
  RAILWAY_GIT_BRANCH: z.string().optional(),
});

function createEnv(env: NodeJS.ProcessEnv) {
  const safeParseResult = envSchema.safeParse(env);
  if (!safeParseResult.success) throw new Error(safeParseResult.error.message);
  return safeParseResult.data;
}

export const env = createEnv(process.env);
