# Nodus Protocol Frontend

[![CI](https://github.com/Nodus-protocol/Nodus-Protocol-Frontend/actions/workflows/ci.yml/badge.svg)](https://github.com/Nodus-protocol/Nodus-Protocol-Frontend/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-violet.svg)](LICENSE)
[![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)](https://nextjs.org)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](CONTRIBUTING.md)

Landing page and component library for the **Nodus Protocol** AMM DEX — built with Next.js 16 App Router and Tailwind CSS v4.

---

## Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router, Server Components) |
| Language | TypeScript 5 |
| Styling | Tailwind CSS v4 |
| Runtime | React 19 |
| Wallet | Freighter (Stellar browser extension) |
| Tests | Jest + Testing Library |

---

## Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Configure environment
cp .env.example .env.local
# Fill in NEXT_PUBLIC_API_URL

# 3. Start dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Environment Variables

| Variable | Description | Example |
|---|---|---|
| `NEXT_PUBLIC_API_URL` | Nodus Backend API base URL | `http://localhost:8080` |
| `NEXT_PUBLIC_APP_URL` | Fully-qualified app origin (used for og:url) | `https://nodus.fi` |
| `NEXT_PUBLIC_DOCS_URL` | Docs site URL | `https://docs.nodus.fi` |

The `/api/v1` prefix is appended automatically — both `http://localhost:8080` and `http://localhost:8080/api/v1` are accepted as `NEXT_PUBLIC_API_URL`.

Copy `.env.example` to `.env.local` — never commit real values.

---

## Scripts

| Script | Description |
|---|---|
| `npm run dev` | Development server with HMR |
| `npm run build` | Production build |
| `npm start` | Serve production build |
| `npm run lint` | ESLint |
| `npm run typecheck` | TypeScript type-check (no emit) |
| `npm test` | Jest unit tests |
| `npm run test:watch` | Jest in watch mode |

---

## Project Structure

```
Nodus-Protocol-Frontend/
├── app/
│   ├── layout.tsx          # Root layout — SEO metadata, Navbar
│   ├── page.tsx            # Landing page (server component, live pool stats)
│   ├── globals.css         # CSS variables, animations, scrollbar
│   ├── not-found.tsx       # 404 page
│   ├── protocol/           # Protocol overview stub
│   ├── docs/               # Documentation stub
│   ├── community/          # Community stub
│   └── blog/               # Blog stub
├── components/
│   ├── Navbar.tsx          # Sticky top nav with wallet button
│   ├── ConnectWallet.tsx   # Freighter wallet connect/disconnect
│   ├── Footer.tsx          # Footer with protocol/dev/legal links
│   ├── PoolMiniCard.tsx    # Single stat card with skeleton loader
│   ├── LPPosition.tsx      # LP balance + redeemable token amounts
│   ├── SwapPreview.tsx     # Swap breakdown (rate, fee, impact, min received)
│   ├── SlippageSelector.tsx # Slippage preset + custom input
│   ├── TokenIcon.tsx       # XLM/USDC icon + TokenPair component
│   ├── TransactionRow.tsx  # Transaction table row + full table
│   └── ui/
│       ├── badge.tsx       # Token, status, and generic badges
│       ├── skeleton.tsx    # Animated skeleton loaders
│       └── spinner.tsx     # Spinner and FullPageSpinner
├── lib/
│   ├── api.ts              # Typed fetch client for all backend endpoints
│   ├── auth.ts             # JWT token storage helpers (localStorage)
│   └── format.ts           # Number formatting: stroops, USDC, bps, timeAgo
└── __tests__/
    └── lib/
        └── format.test.ts  # Unit tests for format utilities
```

---

## Wallet Integration

The frontend uses [Freighter](https://freighter.app), Stellar's official browser extension wallet. `ConnectWallet` polls for the `window.freighter` global (injected asynchronously) and persists the connected address in component state. A `mounted` guard prevents SSR hydration mismatches.

No private keys are ever handled client-side — all transaction signing happens in the user's wallet extension.

---

## API Client

`lib/api.ts` exports a typed client that wraps `fetch` with auth headers and consistent error handling:

```typescript
import { pool, auth, users, payments } from "@/lib/api"

// Server Component — fetches on the server
const stats = await pool.stats()

// Client Component — with access token
const position = await users.getLPPosition(token)
```

All endpoints mirror the [Backend API](https://github.com/Nodus-protocol/Nodus-Protocol-Backend#api-reference).

---

## License

MIT — see [LICENSE](LICENSE).
