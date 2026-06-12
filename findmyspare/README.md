# FindMySpare

**Auto Parts Marketplace with Escrow System**

A trusted online marketplace connecting buyers with auto parts suppliers, featuring a built-in escrow system to ensure safe transactions.

---

## Tech Stack

| Layer        | Technology                          |
| ------------ | ----------------------------------- |
| Framework    | Next.js 15 (App Router)             |
| Language     | TypeScript                          |
| Styling      | Tailwind CSS v4                     |
| ORM          | Drizzle ORM                         |
| Database     | PostgreSQL                          |
| Auth         | NextAuth.js v5 (Auth.js)            |
| Validation   | Zod                                 |
| State        | Zustand                             |
| Icons        | Lucide React                        |

---

## Getting Started

### Prerequisites

- Node.js 18+
- npm
- PostgreSQL database (local, [Neon](https://neon.tech), or [Supabase](https://supabase.com))

### Setup

```bash
# 1. Install dependencies
npm install

# 2. Copy environment variables
cp .env.example .env.local
# Edit .env.local with your DATABASE_URL and NEXTAUTH_SECRET

# 3. Generate database migrations (requires DATABASE_URL)
npx drizzle-kit generate

# 4. Run migrations
npx drizzle-kit migrate

# 5. Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the app.

---

## Project Structure

```
src/
├── app/
│   ├── (auth)/          # Login, signup, verify pages
│   ├── (buyer)/         # Buyer dashboard, browse, orders, disputes, profile
│   ├── (supplier)/      # Supplier dashboard, products, orders, disputes, profile
│   ├── (marketing)/     # Landing page, how-it-works, about
│   ├── (legal)/         # Terms, privacy, escrow/dispute/refund policies
│   ├── api/             # API routes (products, orders, disputes, escrow, upload)
│   ├── help/            # Help & FAQ
│   └── contact/         # Contact support
├── components/
│   ├── layout/          # Header, footer, sidebar, mobile-nav
│   ├── shared/          # Reusable components
│   ├── buyer/           # Buyer-specific components
│   ├── supplier/        # Supplier-specific components
│   └── orders/          # Shared order components
├── lib/
│   ├── db/              # Drizzle ORM schemas & connection
│   ├── validators/      # Zod validation schemas
│   ├── constants/       # Enums (order status, escrow, disputes, roles)
│   └── utils.ts         # Utility functions
├── stores/              # Zustand state stores
├── types/               # Shared TypeScript types
└── config/              # Site configuration
```

---

## Available Scripts

| Command           | Description                |
| ----------------- | -------------------------- |
| `npm run dev`     | Start development server   |
| `npm run build`   | Production build           |
| `npm run start`   | Start production server    |
| `npm run lint`    | Run ESLint                 |

---

## Documentation

- [Project Brief](docs/project_brief.md)
- [Product Specifications](docs/project_specs.md)
# findmyspare
