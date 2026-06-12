# FindMySpare — Web Frontend

## Overview

Mobile-first, role-based web frontend for the FindMySpare auto-parts marketplace. Supports two user roles — **Buyer** and **Supplier** — each with dedicated page flows. Targets the **Indian automotive aftermarket** (INR currency, Indian vehicle makes/models).

## Tech Stack

| Layer          | Technology                                              |
| -------------- | ------------------------------------------------------- |
| Framework      | **Next.js 16.1** (App Router, Turbopack, React Compiler)|
| React          | **React 19.2**                                          |
| Styling        | **Tailwind CSS v4** (PostCSS plugin, `@theme inline`)   |
| State          | **Zustand** v5 (client auth store, localStorage-backed)  |
| Animation      | **Framer Motion** v12                                    |
| Icons          | **Lucide React**                                         |
| Validation     | **Zod** v4                                               |
| Auth (planned) | **NextAuth v5 beta** (configured but auth is JWT-based via backend) |
| Firebase       | Firebase SDK (configured in `lib/firebase.ts`)           |
| ORM (local)    | **Drizzle ORM** (frontend has its own drizzle config)    |
| Fonts          | Inter (sans), JetBrains Mono (mono), Instrument Serif (serif — externally loaded) |

## Project Structure

```
src/
├── app/                       # Next.js App Router pages
│   ├── layout.tsx             # Root layout — fonts, metadata, <Providers>
│   ├── providers.tsx          # Client-side providers wrapper
│   ├── globals.css            # Design tokens + Tailwind theme + base styles
│   ├── page.tsx               # Landing / role-switcher homepage
│   ├── login/                 # Login page
│   ├── register/              # Registration page
│   ├── buyer/                 # Buyer dashboard & flows
│   ├── supplier/              # Supplier dashboard & flows
│   ├── product/               # Product detail pages
│   ├── search/                # Search results
│   ├── scan/                  # Part scanning feature
│   ├── requests/              # Part inquiry requests
│   ├── cart/                  # Shopping cart
│   ├── checkout/              # Checkout flow
│   ├── payment/               # Payment processing
│   ├── success/               # Order success confirmation
│   ├── messages/              # Chat / messaging
│   ├── profile/               # User profile
│   └── favicon.ico
├── components/
│   ├── ui/                    # Primitives: Avatar, Button, Card, Chip, Input
│   ├── layout/                # Shell components: DesktopNav, TabBar, TopBar, PageShell
│   └── features/              # Domain components: ProductCard, OrderCard, BidCard,
│                              #   SearchBar, FilterPills, ChatBubble, EscrowTimeline,
│                              #   SupplierKpiCard, TaskCard
├── lib/
│   ├── api.ts                 # fetchApi() — wraps fetch with auth token injection
│   ├── store.ts               # Zustand auth store (useAuthStore)
│   ├── constants.ts           # Vehicle data, categories, formatPrice()
│   ├── firebase.ts            # Firebase client config
│   ├── icons.tsx              # Centralized icon components
│   └── theme.tsx              # Theme utility components
```

## Design System

### Color Tokens (oklch)

Defined as CSS custom properties in `globals.css` and mapped into Tailwind via `@theme inline`:

| Token           | Role                       | Tailwind Class       |
| --------------- | -------------------------- | -------------------- |
| `--paper`       | Primary background         | `bg-paper`           |
| `--paper-2`     | Secondary background       | `bg-paper-2`         |
| `--paper-3`     | Tertiary / page background | `bg-paper-3`         |
| `--ink`         | Primary text               | `text-ink`           |
| `--ink-2`       | Secondary text             | `text-ink-2`         |
| `--ink-3`       | Tertiary / muted text      | `text-ink-3`         |
| `--line`        | Border / divider           | `border-line`        |
| `--accent`      | Emerald primary accent     | `bg-accent`          |
| `--accent-ink`  | Accent on text             | `text-accent-ink`    |
| `--accent-wash` | Light accent background    | `bg-accent-wash`     |
| `--amber`       | Amber status color         | `bg-amber`           |
| `--danger`      | Error / destructive        | `bg-danger`          |

- Dark mode: toggled via `data-theme="dark"` on `<html>`.
- Density: `data-density="compact"` reduces `--pad` from 20px to 14px.
- Shape: `--radius: 14px` (mapped to `rounded-card` in Tailwind).

### Typography

- **Sans** (body): Inter via `next/font/google`
- **Serif** (display): Instrument Serif via external Google Fonts link
- **Mono** (code/labels): JetBrains Mono via `next/font/google`
- CSS utility classes: `.mono`, `.serif`

### Component Architecture

Components follow a three-tier hierarchy:

1. **`ui/`** — Base primitives (Button, Card, Input, Chip, Avatar). Accept `variant`, `size`, and `className` props. Built with `clsx` + `tailwind-merge` for composability.
2. **`layout/`** — Page-level shell (TopBar, TabBar, DesktopNav, PageShell). Handle responsive breakpoints — mobile bottom tab bar, desktop side nav.
3. **`features/`** — Domain-specific cards and widgets. Compose `ui/` primitives with business logic and data shapes.

## Key Commands

```bash
# Development
npm run dev                # next dev (Turbopack)

# Production
npm run build              # next build
npm run start              # next start

# Lint
npm run lint               # eslint
```

## Environment Variables

All frontend env vars are `NEXT_PUBLIC_*` — they're baked into the client bundle at build time.

| Variable                  | Description                 | Dev default              |
| ------------------------- | --------------------------- | ------------------------ |
| `NEXT_PUBLIC_APP_URL`     | Canonical app URL (OG)      | `http://localhost:3000`  |
| `NEXT_PUBLIC_API_URL`     | Backend REST base URL       | `http://localhost:8000`  |
| `NEXT_PUBLIC_SOCKET_URL`  | Backend Socket.IO URL       | `http://localhost:8001`  |

### Dev vs. Prod workflow

- **Local dev**: values come from `.env.local` (gitignored). Copy `.env.example` → `.env.local` for first setup.
- **Vercel Preview / Production**: values come from the Vercel dashboard (**Settings → Environment Variables**). `.env.local` is never shipped. After editing a `NEXT_PUBLIC_*` value in Vercel, redeploy — they're baked at build time, not runtime.
- **Canonical source of truth**: `.env.example` (committed). Any new env var must be added there with a dev default.
- Hardcoded `localhost` fallbacks in `src/lib/api/index.ts`, `src/lib/socket.ts`, and `src/app/layout.tsx` only activate when the env var is unset — they exist for zero-config `bun dev` and should never trigger in prod.

## State Management

### Auth Store (`lib/store.ts`)

```typescript
useAuthStore.getState().setAuth(user, token)  // login
useAuthStore.getState().logout()               // logout
useAuthStore(state => state.user)              // access user
```

- Persisted to `localStorage` under keys `fms_user` and `fms_token`.
- Token is auto-injected into all `fetchApi()` calls via the `Authorization` header.

### API Client (`lib/api.ts`)

```typescript
import { fetchApi } from "@/lib/api";
const data = await fetchApi("/products");            // GET
await fetchApi("/orders", { method: "POST", body: JSON.stringify(payload) });
```

- Reads token from `localStorage` on every request.
- Throws on non-2xx responses with the backend's error message.

## Conventions

- **File naming**: kebab-case for directories, PascalCase for component files.
- **Client components**: Use `"use client"` directive only where needed (state, effects, browser APIs).
- **Tailwind**: Use the design tokens (e.g. `text-ink`, `bg-paper`, `border-line`) — avoid raw hex colors.
- **Imports**: Use `@/` path alias (maps to `src/`).
- **Currency**: Always use `formatPrice()` or `formatPriceCompact()` from `lib/constants.ts`.
- **React Compiler**: Enabled via `babel-plugin-react-compiler` — avoid manual `useMemo`/`useCallback` unless profiling shows a need.
- **Node version**: Requires **≥ 20.9.0** (Next.js 16 requirement). Use `nvm use 22` if the default is older.
