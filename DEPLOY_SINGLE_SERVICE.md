# Single-Service Deployment (Frontend + API Combined)

This guide explains how to deploy the application as a **single Docker service** combining both the React frontend and NestJS API. This approach minimizes the number of billable services on platforms like Render.

## Overview

The combined service works as follows:
1. A single Dockerfile builds both the frontend (React) and API (NestJS)
2. The API serves the built frontend static files from the `/public` folder
3. API routes are exposed under the `/api` prefix
4. Frontend routes (client-side routing) are handled by the SPA

## Architecture

```
┌─────────────────────────────────┐
│   Single Container (Port 3001)  │
│                                  │
│  ┌────────────────────────────┐ │
│  │   NestJS API (/api/*)      │ │
│  └────────────────────────────┘ │
│                                  │
│  ┌────────────────────────────┐ │
│  │   Static Files (/, /*)     │ │
│  │   (React build)            │ │
│  └────────────────────────────┘ │
└─────────────────────────────────┘
```

## Files Changed

### 1. Root `Dockerfile` (new)
- Multi-stage build that:
  - Builds React frontend in stage 1
  - Builds NestJS API in stage 2
  - Combines both in runtime stage 3
  - Frontend build copied to `./public` folder

### 2. `apps/api/package.json`
- Added `@nestjs/serve-static` dependency

### 3. `apps/api/src/app.module.ts`
- Added `ServeStaticModule` to serve frontend files from `./public`
- Excludes `/api*` routes so API endpoints are not affected

### 4. `apps/api/src/main.ts`
- Updated to use `process.env.PORT` (required for Render)
- Falls back to `API_PORT` or 3001

### 5. `docker-compose.yml`
- Added new `app` service using the combined Dockerfile
- Moved original `api` and `frontend` to `dev-separate` profile

## Local Testing

### Option 1: Run combined service (production-like)

```bash
# Build and start combined service + database
docker compose up -d db app

# Access the app at http://localhost:3001
# API available at http://localhost:3001/api/*
# Frontend at http://localhost:3001/
```

### Option 2: Run separate services (development)

```bash
# Start with dev-separate profile
docker compose --profile dev-separate up -d db btcpay api frontend

# API at http://localhost:3001/api/*
# Frontend at http://localhost:3000/
```

## Render Deployment

### Prerequisites
1. Create a Render account
2. Create a managed Postgres database on Render
3. (Optional) Self-host BTCPay Server on a VM

### Steps

1. **Create Web Service**
   - Environment: Docker
   - Repository: Point to your GitHub repo
   - Branch: `main`
   - Dockerfile Path: `./Dockerfile`
   - Build Context: `.` (root)

2. **Set Environment Variables**
   ```bash
   # Required
   DATABASE_URL=<your-render-postgres-url>
   JWT_SECRET=<generate-secure-secret>
   TRON_PROVIDER_URL=https://api.shasta.trongrid.io
   TRON_NETWORK=shasta
   TRON_USDT_DECIMALS=6
   TRON_DEFAULT_RECEIVER=<your-tron-wallet-address>
   
   # Optional (if using BTCPay)
   BTCPAY_HOST=<your-btcpay-url>
   BTCPAY_API_KEY=<your-api-key>
   BTCPAY_STORE_ID=<your-store-id>
   BTCPAY_WEBHOOK_SECRET=<webhook-secret>
   
   # Frontend origin (set to your Render service URL)
   FRONTEND_ORIGIN=https://your-service.onrender.com
   ```

3. **Configure Release Command** (Optional but recommended)
   ```bash
   npx prisma migrate deploy --schema ./packages/db/prisma/schema.prisma
   ```
   This runs database migrations before each deployment.

4. **Deploy**
   - Render will automatically build and deploy on git push
   - First deploy may take 5-10 minutes

## Minimal Stack Requirements

For USDT/TRON-only deployment without BTCPay:

### Required Services
1. **Render Web Service** (combined frontend+API) - $7+/month
2. **Render Postgres** - $7+/month
3. **Total**: ~$14/month minimum

### Optional Services
- BTCPay Server (self-hosted on VM) - For invoice management
- Redis - For caching (not required for basic setup)

## Environment Variables Reference

### Required
- `DATABASE_URL` - Postgres connection string
- `JWT_SECRET` - Secret for JWT tokens
- `TRON_PROVIDER_URL` - Tron network RPC endpoint
- `TRON_NETWORK` - `mainnet` or `shasta` (testnet)
- `TRON_USDT_DECIMALS` - Usually `6` for USDT TRC20
- `TRON_DEFAULT_RECEIVER` - Fallback wallet address

### Optional (BTCPay)
- `BTCPAY_HOST` - BTCPay server URL
- `BTCPAY_API_KEY` - API key from BTCPay
- `BTCPAY_STORE_ID` - Store ID from BTCPay
- `BTCPAY_WEBHOOK_SECRET` - Webhook secret for verification

### Optional (Other)
- `PORT` - Port to listen on (Render sets this automatically)
- `FRONTEND_ORIGIN` - Frontend URL for CORS
- `API_PORT` - Fallback port if PORT not set

## Troubleshooting

### Frontend not loading
- Check that `/public` folder exists in container
- Verify `ServeStaticModule` is configured in `app.module.ts`
- Check browser console for errors

### API routes returning 404
- Ensure routes are prefixed with `/api`
- Check `main.ts` has `app.setGlobalPrefix('api')`
- Verify CORS configuration

### Database connection errors
- Verify `DATABASE_URL` is set correctly
- Check Render Postgres instance is running
- Ensure migrations have run

### BTCPay integration not working
- Verify `BTCPAY_HOST` is reachable from Render
- Check API keys and store ID are correct
- Ensure webhook URL is configured in BTCPay: `https://your-service.onrender.com/api/webhooks/btcpay`

## Reverting to Separate Services

To switch back to separate frontend and API services:

```bash
# In docker-compose.yml, comment out 'app' service
# Uncomment or remove profiles from 'api' and 'frontend'

docker compose up -d db api frontend
```

For Render, create two separate services:
1. Web Service for API (Dockerfile: `./apps/api/Dockerfile`)
2. Static Site for Frontend (Root: `apps/frontend`, Build: `npm run build`)

## Next Steps

- Set up monitoring and logging on Render
- Configure custom domain
- Set up automatic backups for Postgres
- Implement Option B (per-invoice addresses) for better UX
- Add server-side chain watcher for automatic payment detection
