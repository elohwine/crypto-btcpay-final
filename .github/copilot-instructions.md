## Quick orientation for AI contributors

This repo implements a small crypto deposit platform using NestJS (API), Prisma/Postgres (DB) and a tiny Express static `web` frontend. BTCPay Server (testnet) and related services are available via Docker Compose. Use the files referenced below when making changes.

High-level architecture (why it exists)
- API: `apps/api` (NestJS) — exposes deposit endpoints, creates BTCPay invoices, receives webhooks, and posts ledger entries.
- Web: `apps/web` (Express static) — simple static pages that call the API to create deposits.
- DB: `packages/db/prisma/schema.prisma` — Postgres models for users, deposits, ledger entries, and webhook events.
- BTCPay & infra: wired via `docker-compose.yml` for local full-stack runs (db, btcpay, nbxplorer, bitcoind, api, web).

Key files to reference when coding
- API entry: `apps/api/src/main.ts` (note: body-parser verify stores raw body on `req.rawBody` for webhook signature verification)
- DI wiring: `apps/api/src/app.module.ts` and `apps/api/src/prisma/prisma.module.ts` (PRISMA client injected as `PRISMA` token)
- Deposit flow: `apps/api/src/modules/deposits/deposits.controller.ts` and `apps/api/src/modules/btcpay/btcpay.service.ts`
- Webhook flow: `apps/api/src/modules/webhooks/webhooks.controller.ts` (idempotent upsert of `WebhookEvent` + signature check via `BtcpayService.verifySignature`)
- Ledger: `apps/api/src/modules/ledger/ledger.service.ts` (simple posts, balances grouped by currency)
- DB schema: `packages/db/prisma/schema.prisma` (models: User, Deposit, LedgerEntry, WebhookEvent)

Developer workflows & commands (exact)
- Install: corepack enable && pnpm install
- Start full stack (Docker): copy `.env.example` to `.env` then `docker compose up --build` (services: db, btcpay, api, web)
- Dev hybrid (recommended):
  1. `docker compose up -d db btcpay` (only infra)
  2. `pnpm --filter @repo/db exec prisma migrate dev --name init`
  3. `pnpm --filter @repo/db exec prisma generate`
  4. `pnpm --filter @repo/api start` (runs ts-node-dev on :3001)
  5. `pnpm --filter @repo/web start` (runs node server.js on :3000)

Project-specific conventions & gotchas
- Webhook raw body: Webhooks rely on the raw request body saved to `req.rawBody` by the body-parser verify hook in `main.ts`. Preserve this when editing middleware or request parsing.
- BTCPay client: `BtcpayService` builds an axios client from env vars at construction; changes to env reading may require calling `reloadClientFromEnv()` if you need dynamic refresh.
- Database model units: `LedgerEntry.deltaMinor` stores amounts in minor units (satoshis-like) as BigInt. When converting from invoice amounts, code multiplies decimals by 1e8 and uses BigInt.
- Idempotency: `WebhookEvent` uses `eventId` unique constraint; webhook handlers upsert and mark `processed` to avoid double-processing.
- Prisma location: Prisma schema lives in `packages/db/prisma/schema.prisma`. Use the workspace filter `@repo/db` when running prisma commands via pnpm workspace filters.

Integration points and external dependencies
- BTCPay Server: API calls `BTCPAY_HOST/api/v1` with header `Authorization: token ${BTCPAY_API_KEY}`. Store id may be discovered via `/stores` if `BTCPAY_STORE_ID` is not provided.
- Docker Compose networking: inside Docker use service hostnames (e.g., `btcpay:49392`, `db:5432`) — see `docker-compose.yml`.

Small examples to follow
- Creating a deposit (controller): reads `walletAddress` from request, calls `BtcpayService.createInvoice(...)`, then persists `Deposit` with `status: PENDING` (see `deposits.controller.ts`).
- Webhook processing (controller): verify signature via `BtcpayService.verifySignature(req.rawBody, sig)`, upsert `WebhookEvent`, update `Deposit` and post two ledger entries (Assets and Liabilities) when status is `complete`/`paid` (see `webhooks.controller.ts`).

When changing behaviors
- Update Prisma schema -> run `pnpm --filter @repo/db exec prisma migrate dev` and `prisma generate` using the `@repo/db` filter.
- If adjusting webhook signature logic, ensure tests or a manual curl replicate BTCPay headers and raw body behavior; preserve `req.rawBody` handling.

If anything here is unclear or you want more detail (example unit tests, CI, or common PR patterns), tell me which area to expand.
\n
Common PR checklist (Prisma & webhooks)
- Schema & migrations
  - If you change `packages/db/prisma/schema.prisma`, include a Prisma migration and a short note about the intent. Run locally with:

```bash
pnpm --filter @repo/db exec prisma migrate dev --name your_change_name
pnpm --filter @repo/db exec prisma generate
```

  - Verify the migration SQL in `packages/db/prisma/migrations` and include a short rollback note in the PR description.

- Tests & local validation
  - Add a small unit test for any webhook signature or parsing logic you change (the API exposes `BtcpayService.verifySignature`).
  - Manually exercise the full webhook path in dev: create an invoice via API, then simulate a BTCPay webhook POST to `/api/webhooks/btcpay` that includes the exact headers and raw body used for signature verification.

- Webhook idempotency and raw body
  - Preserve `req.rawBody` (set in `apps/api/src/main.ts`) — do not replace the body-parser verify hook. Webhook handlers should still upsert `WebhookEvent` and mark `processed` when handling completes.

- Ledger & units
  - Ensure changes that touch amounts honor `LedgerEntry.deltaMinor` (BigInt minor units). When converting decimals, multiply by 1e8 and store as BigInt (see `webhooks.controller.ts`).

- PR contents
  - Short description of the intent, migration SQL (if any), example curl or test demonstrating webhook verification, and a note saying how to roll back the migration if needed.

Deposit flows supported (design + current implementation status)

This platform supports two deposit flows. Important rule: the API must create the BTCPay invoice and BTCPay is the authoritative source for settlement/receipts for both flows.

1) Browser-connected wallet (auto deduction / TronWallet flow)
  - Flow summary:
    1. Frontend requests a new deposit from `POST /api/deposits` with { amount, currency, walletAddress }.
    2. API creates a BTCPay invoice (via `BtcpayService.createInvoice`) and persists a `Deposit` record with `status: PENDING` and `invoiceId`.
    3. API returns invoice data and payment details to the browser (checkout link / address).
    4. The browser (via a TronWallet web extension/SDK) initiates an on-chain TRC20 transfer to the target address derived from the invoice or plugin. The UI may show a one-click confirm using the returned invoice/payment details.
    5. BTCPay receives the on-chain payment and emits an invoice webhook -> API's `/api/webhooks/btcpay` verifies signature and reconciles by updating the `Deposit` and posting ledger entries.

  - Implementation notes & current status:
    - Backend: already implemented. `deposits.controller.ts` creates invoices with `walletAddress` included in invoice metadata. `webhooks.controller.ts` reconciles payments and posts ledger entries.
    - Frontend: the repo includes `apps/web/deposit.html` but does not contain a ready-made Tron wallet auto-send integration. Implement a client-side TronWallet integration in `apps/web` (or a SPA) that first requests an invoice from the API, then calls the Tron wallet SDK to send funds.
    - Important: Always create the BTCPay invoice and persist the `Deposit` BEFORE initiating a client-side transfer. Do not mark deposits as confirmed from the client — rely on BTCPay webhooks for settlement.

2) Scan QR / manual-transfer flow
  - Flow summary:
    1. Frontend requests deposit creation like above; API returns a checkout link and/or an on-chain address and a QR payload.
    2. User scans the QR code with an external mobile wallet and broadcasts the transfer.
    3. BTCPay processes the incoming payment and posts invoice webhooks to the API.
    4. API verifies webhook, updates `Deposit` and posts ledger entries for reconciliation (same as auto-wallet flow).

  - Implementation notes & current status:
    - Backend: supported out-of-the-box. `DepositsController` returns `paymentUrl`/`checkout` values used to render QR codes. `WebhooksController` reconciles identical to the auto-wallet flow.
    - Frontend: deposit page should render a QR code for `paymentUrl` returned by the API (this exists as `paymentUrl` in the deposit response). If you add QR rendering, put it in `apps/web/deposit.html`.

3) Cross-cutting rules (both flows)
  - The BTCPay invoice MUST be created by the API and used as the single source of truth for settlement and receipts.
  - Persist `invoiceId` on `Deposit` and use it to find the `Deposit` record when webhooks arrive (see `webhooks.controller.ts`).
  - Ledger posting must only happen in the webhook handling code path (don't post ledger entries from client code or deposit-creation code).
  - Include `walletAddress` in invoice metadata when provided so that reconciliations and customer receipts can include the target wallet.

Where we left off
 - Backend: invoice creation, metadata, and webhook reconciliation (including posting two ledger entries) are already implemented in `apps/api/src/modules/*` controllers and services.
 - Frontend: manual QR/checkout is already supported (API returns `paymentUrl`), but browser-integrated TronWallet auto-send needs a client-side implementation (Tron SDK) to call the wallet; the backend is ready to reconcile.


stop making half complete edits/refctors and claiming all is well,, review every edit against original goal!!

stop making half complete edits/refctors and claiming all is well,, review every edit against original goal!!

top making half complete edits/refctors and claiming all is well,, review every edit against original goal!!