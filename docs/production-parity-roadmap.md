# Production Parity Roadmap

Date: 2026-07-17

## Objective
Transform the current crypto deposit platform into an exchange-grade product with a realistic, production-first path.

## Current Baseline (Verified)
- Auth with access+refresh tokens and protected profile endpoints is implemented.
- Deposit lifecycle is implemented (BTCPay invoice creation, webhook confirmation, direct TRON tx reporting).
- Ledger posting exists for deposit settlement.
- Frontend includes shell pages and deposit UX, but many market/trading widgets still use static/mock data.
- Prisma schema is deposit-ledger centric and does not yet include order-book/trade-engine entities.

## Parity Matrix
| Capability | Status Today | Production Gap | Target Window |
|---|---|---|---|
| Auth/session lifecycle | Partial-ready | Cookie hardening, MFA, abuse controls | Weeks 1-3 |
| Market list/ticker | Mostly static UI | Live feeds, caching, WS broadcast | Weeks 2-5 |
| Spot trading engine | Missing | Orders, matching, fills, fees, reservations | Weeks 4-10 |
| Wallet/balance accounting | Partial (ledger posts only) | Balance states (available/locked), reconciliation | Weeks 3-8 |
| Withdrawals | Missing | Request/approve/broadcast/monitor pipeline | Weeks 5-9 |
| Announcement/legal CMS | Missing as managed system | Admin CRUD + published pages + search | Weeks 1-4 |
| KYC/compliance | Mostly missing | Provider integration + review tooling + policy gates | Weeks 7-12+ |
| Ops/security posture | Partial | SLOs, alerting, audit trails, runbooks | Weeks 1-12 |

## 12-Week Production Plan

### Phase 1 (Weeks 1-2): Hardening and Platform Safety
- Enforce DTO validation across auth and deposits endpoints.
- Finalize secure cookie/CORS behavior per environment.
- Add structured request logging and correlation IDs.
- Add API health checks (liveness/readiness) and uptime probes.
- Build integration tests for: signup/login/refresh/logout, deposit create, webhook idempotency.

### Phase 2 (Weeks 3-5): Live Market Foundation
- Add market-data service (ticker snapshots + websocket fanout).
- Replace mock data in market widgets/screens with API-backed data.
- Add cache strategy and failover behavior for data providers.
- Add rate limiting and edge protections on public market endpoints.

### Phase 3 (Weeks 6-9): Spot Core MVP
- Introduce data model for balances, orders, fills, fee records.
- Implement order lifecycle (create/cancel/query) and matching execution path.
- Implement reservation accounting (available vs locked).
- Add user trade/order history APIs and frontend screens.
- Add reconciliation jobs and invariant checks.

### Phase 4 (Weeks 10-12): Compliance, Ops, Launch Readiness
- Add KYC provider hooks and gating for protected actions.
- Implement withdrawal controls and policy checks.
- Add admin tools for support/reconciliation/incident review.
- Add dashboards and alerts (payment delays, webhook failures, queue lag, DB pressure).
- Conduct staged launch drills and rollback rehearsals.

## Immediate Sprint Backlog (Production-Minded)

### Done in this PR slice
- Global validation pipeline enabled in API bootstrap.
- Auth DTO constraints added using class-validator.
- Auth cookies now use environment-aware secure/sameSite behavior.
- Refresh endpoint now returns Unauthorized instead of generic error for missing refresh token.
- CORS origin checks tightened with explicit allowlist handling.

### Next 5 implementation tasks
1. Add DTOs + validation for deposits endpoints (`create`, `direct`) and remove permissive `any` request bodies.
2. Add API rate limiting (`@nestjs/throttler`) for auth and public deposit endpoints.
3. Add structured logging (request id, route, status, duration) and redact sensitive fields.
4. Add health endpoints and basic dependency checks (DB + BTCPay reachability).
5. Replace frontend static market/order/trade widgets with a single API contract and mock-server fallback for local dev.

## Production Config Checklist
- Set `NODE_ENV=production` on production deployments.
- Set `FRONTEND_ORIGIN` as a comma-separated allowlist of trusted origins.
- Set `COOKIE_SECURE=true` in production (unless TLS terminates unusually and requires exception handling).
- Optionally set `COOKIE_DOMAIN` for subdomain sharing rules.
- Ensure reverse proxy forwards secure headers consistently.

## Risks to Watch
- Current refresh-token lookup strategy scans candidate tokens and will not scale indefinitely.
- Deposit endpoints still use permissive body typing and should be DTO-protected next.
- Spot/futures parity should be staged; attempting full parity at once is high risk.
