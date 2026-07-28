import express from "express";
import { logger } from "@repo/logger";
import cors from "cors";

import * as trpcExpress from "@trpc/server/adapters/express";
import { generateOpenApiDocument, createOpenApiExpressMiddleware } from "trpc-to-openapi";
import { apiReference } from "@scalar/express-api-reference";

import { serverRouter, createContext } from "@repo/trpc/server";

import { env } from "./env";
import cookieParser from "cookie-parser";

export const app = express();
const openApiDocument = generateOpenApiDocument(serverRouter, {
  title: "Genzee Forms OpenAPI",
  version: "1.0.0",
  baseUrl: env.BASE_URL.concat("/api"),
});

// behind Railway/Vercel the app sits behind a TLS-terminating proxy; trust it so
// req.secure and secure cookies behave correctly in production.
app.set("trust proxy", 1);

app.use(cookieParser());

app.use(
  cors({
    // The web app and API are on different domains in production, so CORS must
    // run in every environment. The tRPC client sends credentials, and the CORS
    // spec forbids a wildcard origin on credentialed requests — so we send the
    // exact web origin (localhost in dev, the Vercel URL in prod via WEB_ORIGIN).
    origin: env.WEB_ORIGIN,
    credentials: true,
  }),
);

app.use(express.json());

app.get("/", (req, res) => {
  return res.json({ message: "Genzee Forms is up and running..." });
});

app.get("/health", (req, res) => {
  return res.json({ message: "Genzee Forms server is healthy", healthy: true });
});

logger.debug(`openapi.json: ${env.BASE_URL}/openapi.json`);
app.get("/openapi.json", (req, res) => {
  return res.json(openApiDocument);
});

logger.debug(`docs: ${env.BASE_URL}/docs`);
app.use("/docs", apiReference({ url: "/openapi.json" }));

app.use(
  "/api",
  createOpenApiExpressMiddleware({
    router: serverRouter,
    createContext,
  }),
);

app.use(
  "/trpc",
  trpcExpress.createExpressMiddleware({
    router: serverRouter,
    createContext,
  }),
);

export default app;
