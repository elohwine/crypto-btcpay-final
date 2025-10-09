## Crypto BTCPay Platform (NestJS + Prisma + BTCPay)

A small crypto deposit platform:
- API (NestJS) creates BTCPay invoices, receives webhooks, and updates a ledger.
- Web (Express + static HTML) triggers deposits.
- PostgreSQL via Prisma ORM.
- BTCPay Server (testnet by default).

Services in docker-compose:
- db (Postgres 16)
- redis (optional; currently unused by the code)
- api (NestJS, port 3001)
- web (Express static site, port 3000)
- btcpay (BTCPay Server, port 49392, testnet)

## Prerequisites
- Node.js 20+
- pnpm 9+ (Corepack works: `corepack enable`)
- Docker + Docker Compose (for DB/BTCPay or full stack)

## Environment variables
Copy `.env.example` to `.env` and fill these:
- DATABASE_URL=postgresql://postgres:postgres@db:5432/cryptoplatform (works inside Docker; for local-only replace host with localhost)
- API_PORT=3001
- BTCPAY_HOST=http://btcpay:49392 (inside Docker) or http://localhost:49392 (from your host)
- BTCPAY_API_KEY=your_btcpay_api_key
- BTCPAY_STORE_ID=your_store_id
- BTCPAY_WEBHOOK_SECRET=shared_secret_used_in_btcpay_webhook
- NEXT_PUBLIC_API_URL=http://localhost:3001

## Option A: Full Docker (all services)
This builds and runs db, redis, api, web, and btcpay.

Note: `apps/web` needs a Dockerfile to build with Compose. If full build fails, use Option B below, or add a simple Node Dockerfile in `apps/web/`.

```bash
cp .env.example .env
docker compose up --build
```

Open:
- Web: http://localhost:3000
- API: http://localhost:3001

## Option B: Dev hybrid (recommended for development)
Run database and BTCPay in Docker; run API and Web with pnpm locally (fast reload). Redis is not required in dev.

1) Start infra (db + btcpay only):
```bash
docker compose up -d db btcpay
```

2) Install deps:
```bash
corepack enable
pnpm install
```

3) Run Prisma migrations and generate client (schema lives in `packages/db/prisma/schema.prisma`):
```bash
pnpm --filter @repo/db exec prisma migrate dev --name init
pnpm --filter @repo/db exec prisma generate
```

4) Start API and Web locally:
```bash
pnpm --filter @repo/api start      # API on :3001 (ts-node-dev)
pnpm --filter @repo/web start      # Web on :3000
```

Open:
- Web: http://localhost:3000
- API: http://localhost:3001

## Data flow
1. Web requests a new deposit.
2. API creates a BTCPay invoice and stores a pending deposit.
3. User pays invoice; BTCPay posts a webhook to the API.
4. API verifies webhook and updates the ledger/deposit status.

## Where to change things
- `apps/api/src/modules/deposits/deposits.controller.ts`: deposit endpoints
- `apps/api/src/modules/btcpay/btcpay.service.ts`: invoice creation/verification
- `apps/api/src/modules/webhooks/webhooks.controller.ts`: webhook intake
- `apps/api/src/modules/ledger/ledger.service.ts`: ledger logic
- `packages/db/prisma/schema.prisma`: database models

## Troubleshooting
- Webhook not updating deposits: check `BTCPAY_WEBHOOK_SECRET` and that BTCPay can reach the API container (ports/hostnames).
- Invoice creation fails: verify `BTCPAY_HOST`, `BTCPAY_API_KEY`, and `BTCPAY_STORE_ID`.
- Prisma errors: ensure DB is running and re-run migrate/generate from `@repo/db`.
- Full Compose build fails on Web: add a Dockerfile to `apps/web` or use Option B.

