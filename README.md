<div align="center">

<img src="public/logo.jpg" alt="Atlas Forms" width="64" height="64" />

# Atlas Forms

**Build every field by hand, or describe the form you need and let AI draft it for you.**

Manual control. AI when you want it.

[![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)](https://nextjs.org)
[![React](https://img.shields.io/badge/React-19-149eca?logo=react)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178c6?logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Prisma](https://img.shields.io/badge/Prisma-7-2d3748?logo=prisma)](https://www.prisma.io)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-06b6d4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![Zustand](https://img.shields.io/badge/State-Zustand-orange)](https://zustand-demo.pmnd.rs)

<img src="public/app-home.png" alt="Atlas Forms dashboard preview" width="820" />

</div>

<br />

## What is this?

Atlas Forms is a form builder: drag fields onto a canvas by hand, or describe what you need in plain English and let AI draft a schema you can review, tweak, apply, or revert before it ever touches your live form. Publish a form, send single-use invite links by email, and watch responses land in real time — no duplicate submissions, no stale links.

## Features

- 🧩 **Manual builder** — a clean field palette, drag-to-reorder canvas, and a per-field editor for labels, placeholders, options, and validation rules.
- ✨ **AI co-pilot** — describe a form in natural language; the AI panel proposes a schema diff you explicitly apply or discard, never a silent overwrite.
- 🔗 **Publish & invite** — turn a draft into a live form in one click, then send unique, single-use links per invitee via email.
- 📊 **Response tracking** — invites move from `Pending` → `Submitted` live; open any response to see exactly what was answered against a snapshot of the form at submission time.
- 🔐 **Atlas ID auth** — sign in via Atlas ID's OAuth flow, or jump straight in with a disposable guest account.
- 🌗 **11 field types** — short text, long text, email, number, phone, date, single-select, multi-select, dropdown, rating, and yes/no.

## App flow

```mermaid
flowchart TD
    A([Visitor lands on Atlas Forms]) --> B{Signed in?}
    B -- No --> C["Sign in with Atlas ID (OAuth)"]
    B -- No --> D[Continue as Guest]
    C --> E[Dashboard]
    D --> E[Dashboard]
    B -- Yes --> E

    E --> F[Create a new form]
    F --> G{How do you want to build it?}
    G -- Manual --> H["Drag fields from the palette,\nedit labels, options & rules"]
    G -- AI --> I["Describe the form in the AI panel"]
    I --> J["AI proposes a schema diff"]
    J -- Apply --> H
    J -- Discard --> I

    H --> K[Publish form]
    K --> L["Send invite links by email\n(one unique, single-use link per invitee)"]
    L --> M[["Recipient opens their link\n(/submit/:token)"]]
    M --> N[Recipient fills & submits the form]
    N --> O["Invite flips Pending → Submitted"]
    O --> P["Owner reviews the response\nin the dashboard, in real time"]

    N -.already submitted.-> Q[Link shows 'already submitted']
```

**In short:** land → sign in (Atlas ID or guest) → build a form (by hand or with AI) → publish → invite by email → recipient submits via a one-time link → response tracked back on the dashboard.

## Tech stack

| Layer | Choice |
| --- | --- |
| Framework | [Next.js 16](https://nextjs.org) (App Router, Turbopack) |
| UI | React 19, Tailwind CSS 4, Radix UI primitives, Framer Motion, `lucide-react` |
| State | Zustand (per-feature stores) |
| Drag & drop | `@dnd-kit` |
| Database | PostgreSQL via Prisma 7 (Neon serverless driver supported) |
| Auth | Atlas ID OAuth, JWT verification (`jose`) |
| AI | OpenAI (`gpt-4o-mini`, structured JSON schema generation) |
| Email | Brevo transactional email API |
| Validation | Zod |
| Testing | Vitest |

## Project structure

```
src/
├── app/                     # Next.js routes (App Router)
│   ├── page.tsx             # Marketing home page
│   ├── dashboard/           # Authenticated form builder workspace
│   ├── submit/[token]/      # Public, tokenized invite submission page
│   └── api/v1/              # Route handlers (forms, invites, ai, users)
├── features/
│   ├── home/                # Landing page: hero, features, nav, user menu
│   ├── dashboard/            # Sidebar, canvas, field editor, AI panel, invites
│   ├── auth/                 # Atlas ID session store, token utils, JWT verification
│   └── submission/           # Public-facing submission form + closed state
├── server/
│   ├── services/             # Business logic (FormService)
│   └── validation/            # Zod schemas for forms, fields, submissions
├── infra/                    # External integrations: DB, AI, mailer
├── shared/                   # Reusable UI kit (Button, Modal, Badge, …) & utils
└── lib/http/                 # Axios instances (internal API + Atlas ID)
```

## Getting started

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment

Copy `.env.example` to `.env` and fill in the values:

```bash
cp .env.example .env
```

| Variable | Purpose |
| --- | --- |
| `DATABASE_URL` | PostgreSQL connection string |
| `NEXT_PUBLIC_AUTH_URL` | Atlas ID auth service origin |
| `NEXT_PUBLIC_API_URL` | This app's own public origin |
| `NEXT_PUBLIC_CLIENT_ID` | Atlas ID OAuth client id |
| `JWT_PUBLIC_KEY` | Public key used to verify Atlas ID access tokens |
| `OPENAI_API_KEY` | Powers the AI form-generation panel |
| `BREVO_API_KEY` / `BREVO_SENDER_EMAIL` | Sends invite emails |

### 3. Set up the database

```bash
npm run db:generate   # generate the Prisma client
npx prisma db push    # sync the schema to your database
```

### 4. Run the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

> Atlas Forms delegates sign-in to a separate Atlas ID auth service (`NEXT_PUBLIC_AUTH_URL`). Run that service locally too, or use "Continue as Guest" to skip OAuth entirely.

## Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start the dev server (Turbopack) |
| `npm run build` | Generate the Prisma client and build for production |
| `npm run start` | Run the production build |
| `npm run lint` | Lint the codebase |
| `npm run db:generate` | Regenerate the Prisma client |
| `npm run db:pull` | Pull the schema from the database |

## Data model

```mermaid
erDiagram
    User ||--o{ Form : owns
    Form ||--o{ FormInvite : has
    FormInvite ||--o| FormSubmission : produces

    User {
        string id
        string name
        string email
    }
    Form {
        string id
        string title
        string status "DRAFT | PUBLISHED"
        json schema
    }
    FormInvite {
        string id
        string email
        string token
        string status "PENDING | SUBMITTED"
    }
    FormSubmission {
        string id
        json values
        json formSchemaSnapshot
    }
```

Every submission stores a `formSchemaSnapshot` alongside the answers, so responses stay readable even after the live form schema changes later.
