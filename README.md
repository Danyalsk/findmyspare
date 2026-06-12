# FindMySpare — Auto Parts Marketplace

End-to-end auto-parts marketplace for India. Three surfaces sharing one backend.

```
findmyspare-backend/   # Bun + Elysia + Drizzle ORM + Nhost Postgres + Socket.IO
findmyspare/           # Next.js 16 web frontend
findmyspare-mobile/    # Expo SDK 54 React Native app
```

## Demo accounts (after seeding)

| Email | Password | Role |
|-------|----------|------|
| `admin@findmyspare.test` | `Admin1234!` | admin |
| `raza@findmyspare.test` | `demo1234` | supplier (approved) |
| `ayman@findmyspare.test` | `demo1234` | supplier (approved) |
| `buyer1@findmyspare.test` | `demo1234` | buyer (Arjun Kumar) |
| `buyer2@findmyspare.test` | `demo1234` | buyer (Priya Sharma) |

Seed includes 6 products (3 from Raza, 3 from Ayman).

## Local dev — order of operations

### 1. Backend

```bash
cd findmyspare-backend
bun install
cp .env.example .env        # fill DATABASE_URL, JWT_SECRET
bun run db:push             # apply schema
bun run db:seed             # seed users + products
bun run dev                 # http://localhost:8000  (HTTP + Socket.IO same port)
```

Health check: `curl http://localhost:8000/health`
Swagger: `http://localhost:8000/swagger`

### 2. Web frontend

```bash
cd findmyspare
bun install
echo 'NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_SOCKET_URL=http://localhost:8000
NEXT_PUBLIC_APP_URL=http://localhost:3000' > .env.local
bun run dev                 # http://localhost:3000
```

> Needs Node ≥ 20.9.0. Use `nvm use 22` if your default is older.

### 3. Mobile

```bash
cd findmyspare-mobile
bun install
# Edit app.json → expo.extra.apiUrl / socketUrl to your LAN IP (not localhost)
bunx expo start
# press i for iOS, a for Android, w for web
```

## Real-time features (Socket.IO)

| Event | Direction | Payload |
|-------|-----------|---------|
| `inquiry:created` | server → suppliers room | new buyer inquiry |
| `message:new` | server → recipient | new chat message |
| `message:read` | server → sender | recipient read your messages |
| `typing:start` / `typing:stop` | client ↔ peer | typing indicator |

Socket.IO mounts on the **same HTTP port** as the REST API (single-port deploy).

## Smoke test

1. Login as `buyer1` (web) and `raza` (mobile).
2. Buyer browses, opens a product, taps **Message supplier**.
3. Buyer sends a message → supplier sees real-time delivery + typing indicator.
4. Supplier replies → buyer sees real-time + read receipt.
5. Buyer posts an inquiry → supplier's **Leads** tab updates live.

## Production deploy

- **Backend**: Render (Docker — `findmyspare-backend/Dockerfile` + `render.yaml`)
- **Web**: Vercel (auto-detects Next.js)
- **Mobile**: EAS Build → TestFlight + Play internal track

Set `NEXT_PUBLIC_API_URL` / `NEXT_PUBLIC_SOCKET_URL` in Vercel to your Render URL.
For mobile prod, update `app.json` → `expo.extra.apiUrl` / `socketUrl`, then `eas build`.
