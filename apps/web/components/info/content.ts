/**
 * Single source of truth for the /info landing page.
 *
 * Every code sample below is copied verbatim from a real file in this repo.
 * If you change the source, change the sample — the page's whole credibility
 * rests on the code being real.
 */

export const PRODUCT = {
  name: "buildsmoothly",
  tagline: "Write the procedure. Get the API, the docs, and the client.",
  subtitle:
    "A TypeScript monorepo where one Zod-typed tRPC procedure becomes four things at once: a typed client call, a REST endpoint, an OpenAPI spec, and an interactive playground. No codegen step. No Postman collection to maintain.",
  install: "git clone https://github.com/your-org/buildsmoothly.git my-app",
  repoUrl: "https://github.com/your-org/buildsmoothly",
} as const;

export const STACK_BADGES = [
  "Next.js 16",
  "React 19",
  "tRPC 11",
  "Drizzle ORM",
  "PostgreSQL",
  "Turborepo",
  "Tailwind v4",
  "shadcn/ui",
] as const;

export const NAV_LINKS = [
  { href: "#artifacts", label: "How it works" },
  { href: "#features", label: "Features" },
  { href: "#architecture", label: "Architecture" },
  { href: "#quickstart", label: "Quickstart" },
  { href: "#pricing", label: "Pricing" },
] as const;

/* ------------------------------------------------------------------ */
/* The centerpiece: one procedure, four artifacts                      */
/* ------------------------------------------------------------------ */

/** Verbatim from packages/trpc/server/routes/auth/route.ts */
export const SOURCE_PROCEDURE = `import { publicProcedure, router } from "../../trpc";
import { userService } from "../../services";
import { generatePath } from "../../utils/path-generator";
import {
  createUserWithEmailAndPasswordInputModel,
  createUserWithEmailAndPasswordOutputModel,
} from "./model";

const TAGS = ["Authentication"];
const getPath = generatePath("/authentication");

export const authRouter = router({
  createUserWithEmailAndPassword: publicProcedure
    .meta({
      openapi: {
        method: "POST",
        path: getPath("/createUserWithEmailAndPassword"),
        tags: TAGS,
      },
    })
    .input(createUserWithEmailAndPasswordInputModel)
    .output(createUserWithEmailAndPasswordOutputModel)
    .mutation(async ({ input }) => {
      const { fullName, email, password } = input;

      const { id } = await userService.createUserWithEmailAndPassword({
        fullName,
        email,
        password,
      });
      return {
        id,
      };
    }),
});`;

export const ARTIFACTS = [
  {
    id: "client",
    label: "Typed client",
    where: "apps/web",
    blurb:
      "Import the router type once. Every call, argument and response is inferred — rename a field on the server and the frontend stops compiling.",
    lang: "ts" as const,
    code: `import { api } from "~/trpc/server";

const { id } = await api.auth.createUserWithEmailAndPassword.mutate({
  fullName: "Ada Lovelace",
  email: "ada@example.com",
  password: "correct-horse-battery-staple",
});
//      ^? string
//
// Autocomplete knew every field. A misspelled key is a compile error,
// and the response type came from the .output() schema.`,
  },
  {
    id: "rest",
    label: "REST endpoint",
    where: "POST /api/authentication/createUserWithEmailAndPassword",
    blurb:
      "The same procedure is served as plain REST, for mobile clients, webhooks, curl, or anyone who does not speak tRPC.",
    lang: "bash" as const,
    code: `$ curl -X POST \\
    http://localhost:8000/api/authentication/createUserWithEmailAndPassword \\
    -H "Content-Type: application/json" \\
    -d '{"fullName":"Ada","email":"ada@example.com","password":"s3cret-pass"}'

{
  "id": "c540d20a-2482-4c7c-abd1-c511a3090cb2"
}`,
  },
  {
    id: "openapi",
    label: "OpenAPI spec",
    where: "GET /openapi.json",
    blurb:
      "Generated from the Zod schemas at boot. Every description below is a .describe() call on the schema — not a doc comment someone has to remember to update. Even the email format carried over on its own, alongside a full validation regex trimmed here for space.",
    lang: "json" as const,
    code: `{
  "/authentication/createUserWithEmailAndPassword": {
    "post": {
      "operationId": "auth-createUserWithEmailAndPassword",
      "tags": ["Authentication"],
      "requestBody": {
        "content": {
          "application/json": {
            "schema": {
              "type": "object",
              "properties": {
                "fullName": {
                  "type": "string",
                  "description": "name of the user"
                },
                "email": {
                  "type": "string",
                  "format": "email",
                  "description": "email of the user"
                },
                "password": {
                  "type": "string",
                  "description": "password of the user"
                }
              },
              "required": ["fullName", "email", "password"]
            }
          }
        }
      }
      // The 200 response, plus 401, 403 and 500, are generated too.
    }
  }
}`,
  },
  {
    id: "playground",
    label: "Playground",
    where: "GET /docs",
    blurb:
      "A full API client mounted at /docs — browse every endpoint, fill in the body, hit send, read the response. This is the Postman replacement, and it can never drift from your code because it reads the generated spec.",
    lang: "ts" as const,
    code: `// apps/api/src/server.ts — the entire setup

const openApiDocument = generateOpenApiDocument(serverRouter, {
  title: "buildsmoothly OpenAPI",
  version: "1.0.0",
  baseUrl: env.BASE_URL.concat("/api"),
});

app.get("/openapi.json", (req, res) => res.json(openApiDocument));

app.use("/docs", apiReference({ url: "/openapi.json" }));`,
  },
] as const;

export const ARTIFACTS_CAPTION =
  "You wrote one procedure. You did not write an OpenAPI schema, a fetch wrapper, a response type, or a Postman request.";

/* ------------------------------------------------------------------ */
/* Features                                                            */
/* ------------------------------------------------------------------ */

export const FEATURES = [
  {
    icon: "FileJson",
    title: "Docs that cannot go stale",
    body: "The OpenAPI document is generated from your Zod schemas every boot. There is no YAML file to forget about.",
  },
  {
    icon: "Send",
    title: "Postman, built in",
    body: "A Scalar API client lives at /docs. Browse endpoints, send real requests, read responses — without leaving the browser or installing anything.",
  },
  {
    icon: "ShieldCheck",
    title: "End-to-end type safety",
    body: "The web app imports the server's router type directly. Break a contract and TypeScript fails the build, not production.",
  },
  {
    icon: "Route",
    title: "tRPC and REST from one source",
    body: "Add openapi meta to a procedure and it is served at /api as REST too. Same handler, same validation, zero duplication.",
  },
  {
    icon: "KeyRound",
    title: "Environment validated at boot",
    body: "Every package parses process.env through a Zod schema. A missing DATABASE_URL crashes on line one with a readable message.",
  },
  {
    icon: "Layers",
    title: "A real service layer",
    body: "Business logic lives in @repo/services, not in your route handlers. Routes stay thin; logic stays testable and reusable.",
  },
  {
    icon: "Database",
    title: "Drizzle with migrations committed",
    body: "Typed SQL, generated migrations checked into the repo, and Drizzle Studio wired to pnpm dev.",
  },
  {
    icon: "ScrollText",
    title: "Structured logging",
    body: "Winston configured for both worlds: colorized and readable in development, JSON for your log aggregator in production.",
  },
  {
    icon: "Gauge",
    title: "Turborepo caching",
    body: "Task graph and caching configured, remote cache ready. Rebuild only what actually changed.",
  },
  {
    icon: "Palette",
    title: "The UI kit is already installed",
    body: "Around sixty shadcn/ui components, Tailwind v4, dark mode, toasts and react-hook-form with Zod resolvers. Start on features, not setup.",
  },
  {
    icon: "Container",
    title: "Postgres in one command",
    body: "docker compose up brings the database online, and setup.sh links a single root .env into every workspace.",
  },
  {
    icon: "Wrench",
    title: "Shared config packages",
    body: "ESLint and TypeScript configs live in their own workspace packages, so every app inherits identical rules.",
  },
] as const;

/* ------------------------------------------------------------------ */
/* Architecture                                                        */
/* ------------------------------------------------------------------ */

export const WORKSPACE_TREE = `.
├── apps
│   ├── api            # Express + tRPC + OpenAPI + Scalar docs
│   └── web            # Next.js 16, React 19, shadcn/ui
└── packages
    ├── trpc           # routers, procedures, shared client types
    ├── services       # business logic, transport-agnostic
    ├── database       # Drizzle schema + committed migrations
    ├── logger         # Winston, dev-pretty / prod-JSON
    ├── eslint-config
    └── typescript-config`;

export const DEPENDENCY_FLOWS = [
  {
    title: "The type seam",
    chain: ["apps/web", "@repo/trpc/client", "@repo/trpc/server", "apps/api"],
    note: "The web app never imports server code — only its type. Contracts are shared at compile time and erased at runtime.",
  },
  {
    title: "The request path",
    chain: ["@repo/trpc/server", "@repo/services", "@repo/database"],
    note: "Routes validate and delegate. Services own the logic. The database package owns the schema. Each layer is replaceable.",
  },
] as const;

/* ------------------------------------------------------------------ */
/* Add an endpoint in 60 seconds                                       */
/* ------------------------------------------------------------------ */

export const WORKFLOW_STEPS = [
  {
    n: 1,
    title: "Describe the shapes",
    file: "packages/trpc/server/routes/auth/model.ts",
    lang: "ts" as const,
    code: `import { z } from "zod";

export const createUserWithEmailAndPasswordInputModel = z.object({
  fullName: z.string().describe("name of the user"),
  email: z.email().describe("email of the user"),
  password: z.string().describe("password of the user"),
});

export const createUserWithEmailAndPasswordOutputModel = z.object({
  id: z.string().describe("id of the user created"),
});`,
    note: "Those .describe() calls are your API documentation. Write them once, here.",
  },
  {
    n: 2,
    title: "Write the procedure",
    file: "packages/trpc/server/routes/auth/route.ts",
    lang: "ts" as const,
    code: `const TAGS = ["Authentication"];
const getPath = generatePath("/authentication");

export const authRouter = router({
  createUserWithEmailAndPassword: publicProcedure
    .meta({
      openapi: {
        method: "POST",
        path: getPath("/createUserWithEmailAndPassword"),
        tags: TAGS,
      },
    })
    .input(createUserWithEmailAndPasswordInputModel)
    .output(createUserWithEmailAndPasswordOutputModel)
    .mutation(async ({ input }) => {
      const { fullName, email, password } = input;

      const { id } = await userService.createUserWithEmailAndPassword({
        fullName,
        email,
        password,
      });
      return { id };
    }),
});`,
    note: "generatePath keeps REST paths consistent. The tags group your endpoints in the docs sidebar.",
  },
  {
    n: 3,
    title: "Mount it",
    file: "packages/trpc/server/index.ts",
    lang: "ts" as const,
    code: `export const serverRouter = router({
  auth: authRouter,
});

export type ServerRouter = typeof serverRouter;`,
    note: "One line. This is the only registration step there is.",
  },
  {
    n: 4,
    title: "Call it, fully typed",
    file: "apps/web/app/signup/page.tsx",
    lang: "ts" as const,
    code: `const { id } = await api.auth.createUserWithEmailAndPassword.mutate({
  fullName: "Ada Lovelace",
  email: "ada@example.com",
  password: "correct-horse-battery-staple",
});
//      ^? string

// Autocomplete knew every field. Typos are compile errors.`,
    note: "No client to regenerate, no SDK to publish. The type flowed straight through.",
  },
] as const;

export const WORKFLOW_OUTRO =
  "Meanwhile the REST route, the OpenAPI spec and the /docs playground updated themselves. You never opened a second tool.";

/* ------------------------------------------------------------------ */
/* Comparison                                                          */
/* ------------------------------------------------------------------ */

export const COMPARISON = {
  rows: [
    {
      concern: "API documentation",
      diy: "Hand-written Swagger YAML that drifts from the code",
      ours: "Generated from the Zod schemas on every boot",
    },
    {
      concern: "Trying an endpoint",
      diy: "A Postman collection someone has to export and share",
      ours: "Interactive client at /docs, always matching the code",
    },
    {
      concern: "Frontend types",
      diy: "Interfaces retyped by hand, or a codegen step in CI",
      ours: "Inferred from the router type — no generation step",
    },
    {
      concern: "REST and RPC",
      diy: "Two handlers, two validators, two chances to disagree",
      ours: "One procedure, served on both transports",
    },
    {
      concern: "Environment variables",
      diy: "process.env.FOO! and a crash at 3am",
      ours: "Zod-parsed at startup in every package",
    },
    {
      concern: "Database migrations",
      diy: "Bolted on once the schema already hurts",
      ours: "Drizzle configured, migrations committed from day one",
    },
    {
      concern: "UI components",
      diy: "A week of wiring Tailwind, Radix and dark mode",
      ours: "~60 shadcn/ui components installed and themed",
    },
    {
      concern: "Build times",
      diy: "Rebuild everything, every time",
      ours: "Turborepo task graph with caching",
    },
  ],
} as const;

/* ------------------------------------------------------------------ */
/* Quickstart                                                          */
/* ------------------------------------------------------------------ */

export const QUICKSTART_STEPS = [
  { label: "Start Postgres", command: "docker compose up -d" },
  { label: "Install dependencies", command: "pnpm install" },
  { label: "Link the shared .env", command: "./setup.sh" },
  { label: "Run migrations", command: "pnpm db:migrate" },
  { label: "Start everything", command: "pnpm dev" },
] as const;

export const PORTS = [
  { what: "Web app", url: "http://localhost:3000", note: "Next.js" },
  { what: "API", url: "http://localhost:8000", note: "Express + tRPC" },
  { what: "API playground", url: "http://localhost:8000/docs", note: "Scalar client" },
  { what: "OpenAPI spec", url: "http://localhost:8000/openapi.json", note: "generated" },
  { what: "tRPC endpoint", url: "http://localhost:8000/trpc", note: "typed transport" },
  { what: "Postgres", url: "localhost:5433", note: "docker compose" },
] as const;

/* ------------------------------------------------------------------ */
/* Pricing                                                             */
/* ------------------------------------------------------------------ */

export const PRICING = {
  eyebrow: "Pricing",
  title: "One price. Everything in it.",
  subtitle:
    "No seats, no tiers, no subscription. Pay once and the whole repository is yours to build on.",
  currency: "₹",
  amount: "99",
  cadence: "one-time",
  compare: "Less than the hour you would spend wiring OpenAPI by hand.",
  cta: "Buy and clone",
  includes: [
    "The complete monorepo source — nothing obfuscated, nothing held back",
    "Typed tRPC layer with OpenAPI docs generated from your schemas",
    "Built-in API playground at /docs, so no Postman collection to maintain",
    "Drizzle schema, committed migrations and a Dockerised Postgres",
    "~60 shadcn/ui components, themed, with dark mode already wired",
    "Zod-validated environment config across every package",
    "Free updates — pull them whenever you want them",
  ],
  licenseTitle: "What the licence allows",
  license: [
    { allowed: true, text: "Use it on unlimited personal and client projects" },
    { allowed: true, text: "Modify anything, ship it closed-source, no attribution needed" },
    { allowed: false, text: "Resell or redistribute the template itself" },
  ],
} as const;

/* ------------------------------------------------------------------ */
/* FAQ                                                                 */
/* ------------------------------------------------------------------ */

export const FAQ = [
  {
    q: "Do I need to know tRPC to use this?",
    a: "No. If you can write a function that takes an input and returns an output, you can write a procedure. The Zod schemas are the only new concept, and you likely already use Zod.",
  },
  {
    q: "Can I ignore tRPC and just build a REST API?",
    a: "Yes. Every procedure carrying openapi meta is served at /api as ordinary REST, documented and testable at /docs. The typed client is there when you want it and costs nothing when you do not.",
  },
  {
    q: "Does every procedure show up in the docs?",
    a: "Only the ones with openapi meta. That is deliberate — internal procedures stay internal and out of your public spec. Adding a procedure to the docs is a four-line meta block.",
  },
  {
    q: "Am I locked into PostgreSQL?",
    a: "The template ships Drizzle pointed at Postgres via docker compose. Drizzle supports MySQL and SQLite too — swap the dialect in drizzle.config.ts and the driver in the database package. Nothing above that layer knows the difference.",
  },
  {
    q: "How do I rename it from buildsmoothly?",
    a: "The product name lives in one constant in components/info/content.ts, and the API title in apps/api/src/server.ts. Package names use the @repo scope, so a find-and-replace covers the rest.",
  },
  {
    q: "What is the licence?",
    a: "One purchase covers one developer, on unlimited projects — your own products or client work, closed-source, no attribution required. The only restriction is that you cannot resell or redistribute the template itself.",
  },
  {
    q: "Do I get updates after buying?",
    a: "Yes, and at no extra cost. You are added to the repository, so improvements and dependency bumps arrive as ordinary commits you can pull — or ignore, if you have already made the code your own.",
  },
] as const;

/* ------------------------------------------------------------------ */
/* CTA                                                                 */
/* ------------------------------------------------------------------ */

export const CTA = {
  headline: "Skip the week of plumbing.",
  body: "Auth scaffolding, typed API layer, generated docs, an API client, migrations and a themed component library — configured, wired together, and working the moment you clone it.",
  primary: "Get the template",
  secondary: "Browse the source",
  fineprint: "₹99 once. Full source, unlimited projects, free updates.",
} as const;
