# Genzee Forms

**Make forms with a cool vibe.**

Build a form, publish it, and share one link. Collect responses and watch the results roll in — all without writing a single line of code.

Genzee Forms is a form builder in the spirit of Google Forms or Typeform, except it's open source and you run it yourself. Sign up, drag some fields into a form, flip the publish switch, and hand out a link. Anyone can fill it in — no account needed on their end — and every response shows up in your dashboard.

---

## What you can do

**Build a form in a couple of minutes.** Give it a title and description, then add fields. Five types to pick from:

| Type | For |
| --- | --- |
| `TEXT` | Names, short answers, comments |
| `NUMBER` | Ages, quantities, ratings |
| `EMAIL` | Addresses, validated as you type |
| `YES_NO` | Simple toggles |
| `PASSWORD` | Masked input |

Each field gets a label, optional helper text, a placeholder, and a required-or-not switch.

**Drag to reorder.** Grab a field, drop it somewhere else, done. The order saves instantly.

**Publish when you're ready.** Every form starts as a draft, visible only to you. Flip the publish switch and it goes live at its own link — copy it with one click and put it wherever you like. Unpublish at any time and the link goes quiet again.

**Let anyone respond.** People who open your link just see the form. No sign-up, no account, no friction. Required fields and email or number formats are checked before anything is submitted.

**Read what came in.** Every form has a responses table showing exactly what people entered, ordered by when they submitted. Only you can see it.

**Watch the numbers.** The dashboard shows how many forms you have, how many are live versus still drafts, total responses across everything, your most recent forms with their response counts, and a chart of submissions per day over the last 30 days.

**Enjoy using it.** Light and dark themes, a command palette for jumping around fast, and a little confetti when a form goes live.

---

## Try it locally

```bash
pnpm install
docker compose up -d     # PostgreSQL
./setup.sh               # sets up your .env
pnpm db:migrate
pnpm dev
```

Open **http://localhost:3000**, sign up, and make your first form.

> Needs Node 18+, pnpm 9, and Docker. On Windows, run `setup.sh` from Git Bash or WSL.

Full setup, configuration, and architecture notes live in [CONTRIBUTING.md](CONTRIBUTING.md).

---

## How it works

1. **Sign up** with an email and password.
2. **Create a form** and add your fields.
3. **Publish it** and copy the share link.
4. **Send it out** — anywhere you like.
5. **Watch responses land** in your dashboard.

---

Built with Next.js, tRPC, Drizzle, and PostgreSQL.
