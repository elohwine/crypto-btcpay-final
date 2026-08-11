# Spot Parity Todo

## Completed in this pass

- [x] Fix frontend Docker image so SPA routes like `/market` work in-container.
- [x] Move frontend host port binding away from a conflicting local `3000` service.
- [x] Add backend support for `MARKET` orders alongside `LIMIT` orders.
- [x] Expand spot market coverage and make the market list configurable with `SPOT_MARKETS`.
- [x] Fix deposit-to-spot balance synchronization so newly confirmed deposits credit spot balances after the first sync.
- [x] Add a dedicated open-orders widget with cancel actions.
- [x] Fix auth redirect handling so users can sign in and return to the market they intended to trade.
- [x] Add `/trade/:symbol` routing so market rows lead into a real trading screen.

## Remaining validation

- [x] Bring the API container up in Docker with the updated spot backend.
- [x] Run Prisma migration `20260719132000_spot_market_orders_and_balance_sync` against the local database.
- [x] Verify full signin -> fund -> place order -> cancel/fill flow with frontend and API running together.
- [ ] Check public market pages against the reference site for any remaining UX mismatches worth closing.
