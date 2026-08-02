# Genzee Forms

**Build a form, publish it, and share one link. Collect responses and watch the results roll in — without writing a single line of code.**

Genzee Forms is a full-stack, open-source form builder — think Google Forms or Typeform, but yours to host and extend. Sign up, drag fields into a form, flip the publish switch, and hand out one public link. Anyone can fill it in; every response lands in a dashboard with response counts and a 30-day activity chart.

Under the hood it is a TypeScript monorepo built around a single idea: **you write one tRPC procedure, and you get four things for free** — a fully typed client call, a REST endpoint, an OpenAPI spec, and an interactive API playground. No codegen step, no Postman collection to keep in sync.

---

## Table of contents

- [What you can do with it](#what-you-can-do-with-it)
- [Screens & routes](#screens--routes)
- [How it's built](#how-its-built)
- [One procedure, four artifacts](#one-procedure-four-artifacts)
- [Getting started](#getting-started)
- [Environment variables](#environment-variables)
- [Everyday commands](#everyday-commands)
- [Data model](#data-model)
- [API surface](#api-surface)
- [Deployment](#deployment)
- [Project layout](#project-layout)

---

## What you can do with it

| | |
| --- | --- |
| **Sign up & sign in** | Email + password, hashed with a per-user salt. The session is a JWT in an HTTP-only cookie. |
| **Build forms** | Create a form with a title and description, then add fields one at a time. Five field types: `TEXT`, `NUMBER`, `EMAIL`, `YES_NO`, `PASSWORD`. |
| **Reorder by dragging** | Fields are ordered by a *fractional* index, so dragging a field between two others only writes one row — no re-numbering the whole form. |
| **Publish & share** | A form is a draft until you flip the publish switch. Published forms get a public link (`/form/<id>`) you can copy to the clipboard. Unpublished forms are invisible to the public. |
| **Collect responses** | Anyone with the link can submit — no account needed. Required fields and email/number formats are validated on both ends. |
| **Read responses** | A per-form responses table, owner-only. |
| **See the numbers** | Dashboard with total / published / draft form counts, total responses, recent forms, and a submissions-per-day chart for the last 30 days. |
| **Move fast in the UI** | Command palette, light/dark themes, and a bit of confetti when a form goes out. |

Every mutation is ownership-checked on the server: you can only read or edit forms, fields, and responses that belong to you.

## Screens & routes

| Route | What it is | Auth |
| --- | --- | --- |
| `/` | Marketing landing page | Public |
| `/info` | Deep-dive on the stack and architecture (fully static — renders even with the API down) | Public |
| `/login`, `/signup` | Auth screens | Public |
| `/dashboard` | Stats overview, recent forms, activity chart | Required |
| `/dashboard/forms` | All your forms | Required |
| `/dashboard/forms/[id]` | Form builder — fields, drag-to-reorder, publish toggle, share | Required |
| `/dashboard/forms/[id]/responses` | Responses table for one form | Required |
| `/form/[form_id]` | The public, fillable form | Public (published only) |
| `:8000/docs` | Interactive API playground (Scalar) | Public |
| `:8000/openapi.json` | Generated OpenAPI 3 document | Public |

## How it's built

A [Turborepo](https://turborepo.com) + pnpm workspace monorepo.

```
┌──────────────────────┐         ┌───────────────────────┐
│  apps/web  :3000     │  tRPC   │  apps/api  :8000      │
│  Next.js 16 · React  │ ──────► │  Express 5 · tRPC 11  │
│  Tailwind v4 · shadcn│  cookie │  OpenAPI · Scalar docs│
└──────────────────────┘  creds  └───────────┬───────────┘
                                             │
                    ┌────────────────────────┼────────────────────────┐
                    │                        │                        │
            ┌───────▼────────┐     ┌─────────▼────────┐     ┌─────────▼────────┐
            │ packages/trpc  │     │ packages/services│     │ packages/database│
            │ routers · Zod  │ ──► │ business logic   │ ──► │ Drizzle ORM      │
            │ auth middleware│     │ ownership checks │     │ PostgreSQL       │
            └────────────────┘     └──────────────────┘     └──────────────────┘
```

**Stack:** Next.js 16 · React 19 · tRPC 11 · Zod 4 · Drizzle ORM · PostgreSQL 15 · Express 5 · Tailwind CSS v4 · shadcn/ui + Radix · TanStack Query & Table · dnd-kit · Motion · Winston · TypeScript 5.9 · Turborepo · pnpm

**Layering rule:** routers validate and authorize, services own the business logic and database access, and the database package owns the schema. A router never touches the database directly.

## One procedure, four artifacts

This is the part worth stealing for your own project. Write a procedure once:

```ts
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
    .mutation(async ({ input, ctx }) => {
      /* ... */
    }),
});
```

…and you get all four of these, with zero extra work:

1. **A typed client call** — `api.auth.createUserWithEmailAndPassword.mutate({ … })` in `apps/web`, with arguments and return type inferred from the Zod schemas. Rename a server field and the frontend stops compiling.
2. **A REST endpoint** — `POST /api/authentication/createUserWithEmailAndPassword`, for mobile clients, webhooks, or plain `curl`.
3. **An OpenAPI spec** — generated at boot from the same Zod schemas and served at `/openapi.json`. Field descriptions come from `.describe()` calls, so the docs can't drift from the code.
4. **A playground** — a full API client at `/docs`, powered by [Scalar](https://scalar.com). It reads the generated spec, so it's always current.

The `/info` page in the web app walks through this in detail, with real code from this repo.

## Getting started

### Prerequisites

- **Node.js ≥ 18**
- **pnpm 9** — `npm install -g pnpm`
- **Docker** (for PostgreSQL) — or your own Postgres instance
- On **Windows**, run `setup.sh` from Git Bash or WSL

### Setup

```bash
# 1. Install dependencies
pnpm install

# 2. Start PostgreSQL (port 5433, deliberately not 5432, so it won't
#    collide with a Postgres already installed on your machine)
docker compose up -d

# 3. Create .env from the example and copy it into every workspace
./setup.sh

# 4. Create the database tables
pnpm db:migrate

# 5. Run everything
pnpm dev
```

Then open:

- **http://localhost:3000** — the app
- **http://localhost:8000/docs** — the API playground
- **Drizzle Studio** — a database browser, also started by `pnpm dev` (the URL is printed in its terminal pane)

Sign up at `/signup`, create a form, add a few fields, hit publish, and open the share link in a private window to submit a response the way a visitor would.

### About `setup.sh`

Each workspace loads its own `.env`, so the root `.env` has to be copied into `apps/*` and `packages/*`. `setup.sh` does that, overwriting whatever was there — deliberately, because a stale per-package `.env` that disagrees with the root means each package silently talks to a different database. **Re-run `./setup.sh` after every edit to the root `.env`.**

## Environment variables

Copy `.env.example` to `.env` (or let `setup.sh` do it) and adjust:

| Variable | Purpose | Default |
| --- | --- | --- |
| `DATABASE_URL` | PostgreSQL connection string | `postgres://postgres:postgres@localhost:5433/dev` |
| `PORT` | API server port | `8000` |
| `BASE_URL` | Public URL of the API — used as the OpenAPI base URL | `http://localhost:8000` |
| `WEB_ORIGIN` | Origin of the web app, used for CORS. **Set this to your deployed web URL in production.** | `http://localhost:3000` |
| `NEXT_PUBLIC_API_URL` | Where the web app reaches the API. Must be absolute — it's used during server-side rendering, where Node can't resolve a relative path. | `http://localhost:8000/trpc` |
| `JWT_SECRET` | Signing key for session tokens. **Change this in production.** | dev placeholder |
| `LOGGER_LEVEL` | `error` \| `info` \| `debug` | `debug` in development, `error` otherwise |
| `GOOGLE_OAUTH_CLIENT_ID` / `_SECRET` / `_REDIRECT_URI` | Google sign-in credentials | mock values |

> **Note on Google OAuth:** the credentials and an `OAuth2Client` are in place (`packages/services/clients/google-oauth.ts`), but no sign-in route is wired up yet. Email + password is the only working auth flow today.

`WEB_ORIGIN` isn't listed in `.env.example` — it defaults to `http://localhost:3000`, which is right for local development, but set it explicitly once the web app and API live on different domains.

## Everyday commands

Run from the repo root:

| Command | What it does |
| --- | --- |
| `pnpm dev` | Start web, API, and Drizzle Studio together |
| `pnpm build` | Build every app and package |
| `pnpm lint` | ESLint across the workspace |
| `pnpm check-types` | TypeScript, no emit |
| `pnpm format` | Prettier over `.ts`, `.tsx`, `.md` |
| `pnpm db:generate` | Generate a new migration from schema changes |
| `pnpm db:migrate` | Apply pending migrations |

Target a single workspace with a Turborepo filter:

```bash
pnpm exec turbo dev --filter=web
pnpm exec turbo build --filter=@repo/api
```

### Changing the database schema

1. Edit a model in `packages/database/models/`
2. `pnpm db:generate` — writes a SQL migration into `packages/database/drizzle/`
3. `pnpm db:migrate` — applies it
4. Update the matching Zod models in `packages/services/*/model.ts` so the API contract follows

## Data model

Four tables, all UUID-keyed:

- **`users`** — name, unique email, optional password + salt (optional so OAuth users can exist without one), profile image
- **`forms`** — title, description, `is_published`, `created_by` → `users`
- **`forms_fields`** — label, stable `label_key`, description, placeholder, `is_required`, `type` (Postgres enum), and a `numeric(8,2)` `index`. Cascades on form delete; `(form_id, index)` is unique
- **`forms_submissions`** — `form_id` plus a JSON array of `{ formFieldId, value }` pairs

The fractional `index` is what makes drag-and-drop reordering cheap: a field dropped between positions `2.00` and `3.00` becomes `2.50`, so only that one row is written.

## API surface

All procedures live in `packages/trpc/server/routes/`. Each is reachable over tRPC at `/trpc` and over REST at `/api`.

**`auth`** — `createUserWithEmailAndPassword` · `signInUserWithEmailAndPassword` · `getLoggedInUserInfo` · `logout`

**`form`** — `createForm` · `listForms` · `getForm` *(public)* · `getFormMeta` · `getDashboardStats` · `updateForm` · `deleteForm`

**`formField`** — `createField` · `getFields` · `updateField` · `deleteField`

**`formSubmission`** — `submitForm` *(public)* · `listSubmissions`

Two procedures are intentionally public: `form.getForm`, so a shared link works without an account (it returns nothing for an unpublished form), and `formSubmission.submitForm`, so anyone can respond. Everything else runs through `authenticatedProcedure`, which reads the session cookie, verifies the JWT, and puts the user id on the context.

## Deployment

The app is built to run with the web and API on separate hosts — for example Vercel for `apps/web` and Railway for `apps/api`.

- Set `WEB_ORIGIN` on the API to the deployed web origin. CORS runs in every environment because the tRPC client sends credentials, and the CORS spec forbids a wildcard origin on credentialed requests.
- Set `NEXT_PUBLIC_API_URL` on the web app to the deployed API's `/trpc` URL.
- Replace `JWT_SECRET` with a real secret.
- The API calls `app.set("trust proxy", 1)` so `req.secure` and secure cookies behave correctly behind a TLS-terminating proxy.
- Point `DATABASE_URL` at your managed Postgres and run `pnpm db:migrate` against it.

## Project layout

```
apps/
  web/          Next.js 16 app — landing, auth, dashboard, builder, public forms
  api/          Express 5 server — tRPC + REST + OpenAPI + Scalar docs
packages/
  trpc/         Routers, Zod models, context, auth middleware, typed client
  services/     Business logic and ownership checks (form, field, submission, user)
  database/     Drizzle schema, models, migrations, db client
  logger/       Winston logger — pretty in dev, JSON in production
  eslint-config/     Shared ESLint configs
  typescript-config/ Shared tsconfig bases
```

---

Built with [Turborepo](https://turborepo.com), [tRPC](https://trpc.io), [Drizzle](https://orm.drizzle.team), and [shadcn/ui](https://ui.shadcn.com).
