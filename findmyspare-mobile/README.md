# FindMySpare — Mobile (Expo / React Native)

Pixel-parity mobile app for FindMySpare. Mirrors the Next.js web frontend feature-for-feature.

## Stack

- **Expo SDK 54** + Expo Router (file-based routing)
- **React Native 0.79** (New Arch enabled)
- **NativeWind v4** (Tailwind for RN — same tokens as web)
- **Zustand** + AsyncStorage (auth)
- **socket.io-client** (real-time chat + leads)
- **moti** + Reanimated (animations, parity with Framer Motion on web)
- **expo-image** (fast image loading)
- **expo-image-picker** (product image upload)

## Setup

```bash
cd findmyspare-mobile
bun install     # or: npm install
bunx expo start # or: npx expo start
```

Press **i** for iOS Simulator, **a** for Android Emulator, **w** for web.

> Requires **Node ≥ 20** and Xcode (iOS) or Android Studio.

## Connecting to local backend

Edit `app.json` → `expo.extra.apiUrl` / `socketUrl`:

```json
{
  "expo": {
    "extra": {
      "apiUrl": "http://192.168.1.x:8000",
      "socketUrl": "http://192.168.1.x:8000"
    }
  }
}
```

Use your machine's LAN IP (not `localhost`) so the device can reach the backend.

## Demo accounts

| Email | Password | Role |
|-------|----------|------|
| `admin@findmyspare.test` | `Admin1234!` | admin |
| `raza@findmyspare.test` | `demo1234` | supplier |
| `ayman@findmyspare.test` | `demo1234` | supplier |
| `buyer1@findmyspare.test` | `demo1234` | buyer |
| `buyer2@findmyspare.test` | `demo1234` | buyer |

## Structure

```
app/
  _layout.tsx           # root, hydrates auth, mounts stack
  index.tsx             # role-based redirect
  (auth)/               # login, register
  (buyer)/              # tabs: home, search, requests, messages, profile
  (supplier)/           # tabs: dash, products, leads, messages, profile + onboarding/pending/rejected
  messages/[id].tsx     # 1:1 chat thread (real-time + typing)
  product/[id].tsx      # product detail with "Message supplier" CTA

components/
  ui/                   # Button, Card, Input, Chip, Avatar, Skeleton, DnaLoader
  layout/               # PageShell, TopBar
  features/             # ProductCard, ChatBubble

lib/
  api/                  # auth, products, messages, inquiries, banners
  store.ts              # Zustand auth + AsyncStorage
  socket.ts             # Socket.IO singleton + useSocket hook
  types.ts, constants.ts
```
