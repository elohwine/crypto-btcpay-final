## Crypto BTCPay Platform (NestJS + Prisma + BTCPay)

A small crypto deposit platform:
- API (NestJS) creates BTCPay invoices (optional), receives webhooks, and updates a ledger.
- React Frontend (apps/frontend) for the user-facing UI.
- PostgreSQL via Prisma ORM.
- BTCPay Server (testnet by default, optional).

Services in docker-compose:
- db (Postgres 16)
- redis (optional; currently unused by the code)
- app (combined API runtime; serves API on 3001; optional static assets)
- api (dev-only, profile: dev-separate)
- frontend (dev-only, profile: dev-separate)
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
This builds and runs db, redis, app (combined), and btcpay.

```bash
cp .env.example .env
docker compose up --build
```

Open:
- API: http://localhost:3001

## Option B: Dev hybrid (recommended for development)
Run database and BTCPay in Docker; run API and Frontend with pnpm locally (fast reload). Redis is not required in dev.

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

4) Start API and Frontend locally:
```bash
pnpm --filter @repo/api start      # API on :3001 (ts-node-dev)
pnpm --filter ./apps/frontend start # Frontend on :3000
```

Open:
- Frontend: http://localhost:3000
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
• Frontend build issues: use `pnpm build:frontend` or start in dev mode with `pnpm start:frontend`.

## Backups & persistence (Postgres / BTCPay)

This project uses Docker Compose and named volumes for Postgres and BTCPay data. To avoid losing store/accounts and invoices, do not remove volumes with `docker compose down -v` unless you want to wipe data.

Scripts are provided in `scripts/`:

- `scripts/backup_db.sh` — create a SQL dump of the Postgres database (created in `./backups`).
- `scripts/restore_db.sh` — restore a SQL dump into the DB.
- `scripts/backup_volume.sh backup [archive.tar.gz]` — backup the `btcpay_data` named volume to an archive in `./backups`.
- `scripts/backup_volume.sh restore [archive.tar.gz]` — restore archive into `btcpay_data` named volume.

Example:

```bash
# create DB SQL backup
./scripts/backup_db.sh

# backup BTCPay named volume
./scripts/backup_volume.sh backup
```

If you are migrating from an anonymous volume, inspect the container mounts with `docker inspect <container>` and use `docker run --rm -v OLD_VOL:/from -v NEW_VOL:/to alpine sh -c "cd /from && cp -a . /to"` to copy data into a named volume.

---

## Deploying to Render

This project is configured to deploy to Render with a managed Postgres database. The main `docker-compose.yml` has the local Postgres service commented out for production deployment.

### Prerequisites

- Render account ([render.com](https://render.com))
- Git repository (GitHub, GitLab, or Bitbucket)

### Step 1: Create Render Managed Postgres

1. Log in to your Render dashboard
2. Click **New +** → **PostgreSQL**
3. Configure your database:
   - **Name**: `cryptoplatform-db` (or your preferred name)
   - **Database**: `cryptoplatform`
   - **User**: Will be auto-generated (e.g., `cryptoplatform_user`)
   - **Region**: Choose closest to your web service
   - **Plan**: Choose based on your needs (Free tier available for testing)
4. Click **Create Database**
5. Wait for the database to provision (usually 1-2 minutes)
6. Once ready, copy the **External Database URL** from the dashboard
   - It will look like: `postgresql://USER:PASSWORD@HOST:5432/cryptoplatform`

### Step 2: Create Web Service

1. In Render dashboard, click **New +** → **Web Service**
2. Connect your Git repository
3. Configure the service:
   - **Name**: `cryptoplatform` (or your preferred name)
   - **Region**: Same as your database
   - **Branch**: `main` (or your deployment branch)
   - **Runtime**: `Docker`
   - **Instance Type**: Choose based on needs (Starter or higher recommended)

### Step 3: Configure Environment Variables

In your Render web service settings, add these environment variables:

**Required:**
```bash
# Database (use the External Database URL from Step 1, add sslmode=require)
DATABASE_URL=postgresql://USER:PASSWORD@HOST:5432/cryptoplatform?sslmode=require

# API Configuration
API_PORT=3001
JWT_SECRET=your_strong_random_secret_here
FRONTEND_ORIGIN=https://your-app-name.onrender.com

# TRON Configuration
TRON_DEFAULT_RECEIVER=TQK3DrqthcDJNdMZGmBXDLMznGqa72pcLG
TRON_NETWORK=shasta
TRON_PROVIDER_URL=https://api.shasta.trongrid.io
TRON_USDT_DECIMALS=6
```

**Optional (BTCPay Server):**
```bash
BTCPAY_ENABLED=true
BTCPAY_HOST=https://your-btcpay-server.com
BTCPAY_API_KEY=your_api_key
BTCPAY_STORE_ID=your_store_id
BTCPAY_WEBHOOK_SECRET=your_webhook_secret
```

### Step 4: Deploy

1. Click **Create Web Service**
2. Render will automatically build and deploy from your Dockerfile
3. Monitor the deploy logs for any errors

### Step 5: Run Database Migrations

After the first deployment, you need to run Prisma migrations:

**Option A: Using Render Shell (recommended)**
1. Go to your web service in Render dashboard
2. Click **Shell** tab
3. Run migration command:
   ```bash
   cd /app && npx prisma migrate deploy --schema ./packages/db/prisma/schema.prisma
   ```

**Option B: Add to Dockerfile CMD (automatic on every deploy)**

Edit your `Dockerfile` CMD to run migrations before starting the app:
```dockerfile
CMD ["sh", "-c", "npx prisma migrate deploy --schema ./packages/db/prisma/schema.prisma && cd /app/apps/api && node /app/apps/api/dist/main.js"]
```

### Step 6: Verify Deployment

1. Visit your Render web service URL: `https://your-app-name.onrender.com`
2. Check that the app loads and database connections work
3. Test creating a deposit and verify database writes

---

## Restoring Database Backups to Render

If you have an existing database backup (from `pg_dump` or plain SQL export), you can restore it to your Render managed Postgres using the included `restore.sh` script.

### Prerequisites

- `psql` or `pg_restore` installed locally
- Database backup file (`.sql` or `.dump` format)
- Render Postgres External Database URL

### Restore Steps

1. **Get your Render database credentials:**
   - Open your Render Postgres dashboard
   - Copy the **External Database URL** 
   - Parse it to get: `PGHOST`, `PGUSER`, `PGPASSWORD`, `PGDATABASE`, `PGPORT`

2. **Set environment variables:**
   ```bash
   export PGHOST=dpg-xxxxx.oregon-postgres.render.com
   export PGUSER=cryptoplatform_user
   export PGPASSWORD=your_password_here
   export PGDATABASE=cryptoplatform
   export PGPORT=5432
   ```

3. **Run the restore script:**
   ```bash
   # For plain SQL files
   ./restore.sh /path/to/backup.sql
   
   # For pg_dump custom format
   ./restore.sh /path/to/backup.dump
   ```

The script automatically:
- Detects file format (SQL vs custom dump)
- Adds `sslmode=require` for Render connection
- Uses `--clean --no-owner` flags to avoid permission issues
- Provides progress output and error handling

### Handling Extensions and Roles

If your backup includes PostgreSQL extensions or custom roles:

**Create required extensions** (if not already present):
```sql
-- Connect to Render DB via psql
psql "$DATABASE_URL"

-- Create extensions as needed
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
```

**Handle role/owner errors:**
The `restore.sh` script uses `--no-owner` to avoid role ownership issues. If you encounter role errors, you can:
1. Manually create roles before restore, or
2. Use Render's default user and ignore role errors (data will restore successfully)

### After Restore

1. **Verify data:**
   ```bash
   psql "$DATABASE_URL" -c "SELECT COUNT(*) FROM \"User\";"
   ```

2. **Run migrations** (if schema changed):
   ```bash
   pnpm --filter @repo/db exec prisma migrate deploy
   ```

3. **Restart your Render web service** to pick up the restored data

---

## Local Development

For local development, you have two options:

### Option A: Use docker-compose.override.yml (Recommended)

This allows you to run a local Postgres container without modifying the main `docker-compose.yml`:

1. **Copy the override example:**
   ```bash
   cp docker-compose.override.yml.example docker-compose.override.yml
   ```

2. **Update your .env to use localhost:**
   ```bash
   DATABASE_URL=postgresql://postgres:postgres@localhost:5432/cryptoplatform
   ```

3. **Start services:**
   ```bash
   docker compose up -d
   ```

Docker Compose will automatically merge the override file and start the local Postgres service.

### Option B: Use external Postgres

Install Postgres locally or use a cloud instance, then set `DATABASE_URL` in your `.env`:

```bash
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/cryptoplatform
```

### Running Migrations Locally

```bash
# Install dependencies
pnpm install

# Run migrations
pnpm --filter @repo/db exec prisma migrate dev

# Generate Prisma client
pnpm --filter @repo/db exec prisma generate

# Start the app
pnpm --filter @repo/api start
```

---
