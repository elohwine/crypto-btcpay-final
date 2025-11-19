# Fly.io Deployment Guide for Magnum Crypto Platform

## Prerequisites
- Fly.io CLI installed (`flyctl` command available)
- Fly.io account (sign up at https://fly.io)
- Logged in: `flyctl auth login`

## Initial Setup

### 1. Create Postgres Database on Fly.io
```bash
# Create a Postgres cluster
flyctl postgres create --name crypto-btcpay-db --region iad --vm-size shared-cpu-1x --volume-size 10

# Note the connection string displayed after creation
```

### 2. Attach Database to App
```bash
# This will automatically set DATABASE_URL secret
flyctl postgres attach crypto-btcpay-db --app crypto-btcpay-final
```

### 3. Set Required Secrets
```bash
# Set JWT secret (generate a strong random string)
flyctl secrets set JWT_SECRET="your-strong-random-secret-here" --app crypto-btcpay-final

# Set Tron wallet receiver address
flyctl secrets set TRON_DEFAULT_RECEIVER="TQK3DrqthcDJNdMZGmBXDLMznGqa72pcLG" --app crypto-btcpay-final

# Set frontend origin (will be your Fly.io app URL)
flyctl secrets set FRONTEND_ORIGIN="https://crypto-btcpay-final.fly.dev" --app crypto-btcpay-final

# Optional: If using BTCPay Server
# flyctl secrets set BTCPAY_HOST="your-btcpay-url" --app crypto-btcpay-final
# flyctl secrets set BTCPAY_API_KEY="your-api-key" --app crypto-btcpay-final
# flyctl secrets set BTCPAY_STORE_ID="your-store-id" --app crypto-btcpay-final
```

## Deploy

### First-time Deployment
```bash
# Launch the app (uses fly.toml configuration)
flyctl launch --no-deploy

# Deploy the application
flyctl deploy
```

### Subsequent Deployments
```bash
# Just deploy
flyctl deploy

# Or deploy with build logs
flyctl deploy --verbose
```

## Database Migrations

Migrations run automatically via the `release_command` in fly.toml. To run manually:

```bash
# SSH into the machine
flyctl ssh console

# Run migrations
cd /app/packages/db && pnpm exec prisma migrate deploy --schema ./prisma/schema.prisma
```

## Monitoring & Management

### View Logs
```bash
flyctl logs
```

### Check Status
```bash
flyctl status
```

### View Secrets
```bash
flyctl secrets list
```

### Scale Resources
```bash
# Scale memory
flyctl scale memory 2048

# Scale CPU
flyctl scale vm shared-cpu-2x
```

### Open App
```bash
flyctl open
```

## Environment Variables

Required secrets (set via `flyctl secrets set`):
- `DATABASE_URL` - Automatically set when attaching Postgres
- `JWT_SECRET` - Your secure JWT signing key
- `TRON_DEFAULT_RECEIVER` - Tron wallet address for deposits
- `FRONTEND_ORIGIN` - Your app URL (https://your-app.fly.dev)

Optional secrets:
- `BTCPAY_HOST` - BTCPay Server URL
- `BTCPAY_API_KEY` - BTCPay API key
- `BTCPAY_STORE_ID` - BTCPay Store ID
- `BTCPAY_WEBHOOK_SECRET` - BTCPay webhook secret

Public environment variables (in fly.toml):
- `PORT=8080` - Fly.io uses port 8080 internally
- `NODE_ENV=production`
- `BTCPAY_ENABLED=false` - Change if using BTCPay
- `TRON_NETWORK=shasta` - Or mainnet for production
- `TRON_PROVIDER_URL=https://api.shasta.trongrid.io`
- `TRON_USDT_DECIMALS=6`

## Troubleshooting

### Check Health Endpoint
```bash
curl https://crypto-btcpay-final.fly.dev/api/health
```

### View Machine Details
```bash
flyctl machine list
```

### Restart App
```bash
flyctl apps restart crypto-btcpay-final
```

### SSH into Machine
```bash
flyctl ssh console
```

## Cost Optimization

- **Free tier**: Fly.io provides free allowances (shared-cpu-1x, 256MB RAM)
- **Auto-stop**: Configured to stop machines when idle (`auto_stop_machines = true`)
- **Auto-start**: Machines restart on incoming requests
- **Min running**: Set to 0 to avoid charges when not in use

## Production Checklist

- [ ] Set strong JWT_SECRET
- [ ] Update TRON_NETWORK to "mainnet" for production
- [ ] Update TRON_DEFAULT_RECEIVER to production wallet
- [ ] Configure BTCPay if needed
- [ ] Set up custom domain (optional)
- [ ] Enable backups for Postgres
- [ ] Monitor logs regularly
- [ ] Set up alerts in Fly.io dashboard

## Custom Domain (Optional)

```bash
# Add certificate for custom domain
flyctl certs create yourdomain.com

# Add DNS records as instructed by Fly.io
```
