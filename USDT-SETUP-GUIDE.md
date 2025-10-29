# USDT-Only BTCPay Platform Setup Guide

## Current Status ✅

Your platform is now configured for **USDT deposits via TronLink** with the following:

### Infrastructure (Running)
- ✅ **PostgreSQL** (db) - Database for all services
- ✅ **BTCPay Server 2.2.1** (btcpay) - Payment processor at http://localhost:49392
- ✅ **NestJS API** (api) - Backend API at http://localhost:3001
- ✅ **Express Web** (web) - Frontend with TronLink integration at http://localhost:3000

### BTC Services (Inactive - profiles: btc/optional)
- ⏸️ bitcoind, nbxplorer, redis - Not started (use `--profile btc` to enable if needed)

### TronLink Integration ✅
The web frontend (`/apps/web/deposit.html`) includes:
- **TronLink wallet detection** (automatic on page load)
- **Connect/disconnect** wallet functionality
- **Address display** and validation
- **USDT deposit form** that sends wallet address to API
- Works with both legacy and modern TronLink versions

---

## ⚠️ Required: Re-enable USDt Plugin

The USDt plugin crashed on first boot (before DB migrations completed) and BTCPay auto-disabled it. You must re-enable it:

### Option 1: Via BTCPay UI (Recommended)
1. Open http://localhost:49392
2. Create admin account + first store (if not done)
3. Go to **Server Settings** → **Plugins**
4. Find **USDt** plugin → Click **Enable**
5. BTCPay will restart automatically

### Option 2: Via Database (Advanced)
```bash
sudo docker compose exec db psql -U postgres -d cryptoplatform -c "DELETE FROM \"Settings\" WHERE \"Id\" LIKE '%DisabledPlugins%';"
sudo docker compose restart btcpay
```

---

## 🔧 Configure Tron RPC (Critical)

After re-enabling the plugin, configure a **stable Tron RPC endpoint** to avoid wallet generation 500 errors:

### In BTCPay UI:
1. Go to your **Store** → **Payment Methods** → **USDT-TRON** → **Settings**
2. Set **Tron RPC Endpoint** (choose one):
   - **Shasta Testnet** (recommended for testing): `https://api.shasta.trongrid.io/jsonrpc`
   - **Nile Testnet**: `https://nile.trongrid.io/jsonrpc`
   - **Mainnet** (production): `https://api.trongrid.io/jsonrpc`

3. Add **TronGrid API Key** to avoid rate limits:
   - **Header name**: `TRON-PRO-API-KEY`
   - **Header value**: Your TronGrid API key (get from https://www.trongrid.io/)
   - Without this, you'll hit timeouts/500 errors on public nodes

4. **Save** settings
5. Click **Generate new wallet** (or **Import wallet** if you have a private key)
6. Store will now have a USDT receiving address

---

## 🔑 Create BTCPay API Credentials

After wallet is created:

### In BTCPay UI:
1. **Account** → **Manage Account** → **API Keys**
2. Click **Generate Key**
3. Permissions needed:
   - ✅ View stores
   - ✅ Create invoice
   - ✅ Modify stores (optional)
4. Scope to your store (recommended)
5. **Copy the API key** (you won't see it again)

### Update Environment Variables:
Edit `/home/eloh/PROJECTS/crypto-btcpay-final/.env`:
```env
BTCPAY_API_KEY=your_new_api_key_here
BTCPAY_STORE_ID=your_store_id_here
BTCPAY_WEBHOOK_SECRET=generate_a_random_secret_here
```

To find your **Store ID**:
- Store → Settings → General → copy the ID from the URL or page

### Restart API to load new credentials:
```bash
sudo docker compose restart api
```

---

## 🧪 Test End-to-End Deposit Flow

### 1. Open the deposit page:
```bash
# In your browser:
http://localhost:3000/deposit/new
```

### 2. Connect TronLink:
- Install TronLink Chrome extension if not installed
- Unlock your wallet
- Click **Connect TronLink** on the page
- Your Tron address will appear

### 3. Create deposit:
- Amount: 10 USDT (or any amount)
- Click **Create USDT Deposit**
- Response will show:
  - `depositId`
  - `paymentUrl` (BTCPay checkout link)
  - `invoiceId`
  - `walletAddress` (your TronLink address)

### 4. Pay with BTCPay:
- Open the `paymentUrl` in browser
- BTCPay will show USDT payment address and QR code
- Send USDT from TronLink to that address
- BTCPay detects payment and fires webhook

### 5. Verify webhook processing:
```bash
# Watch API logs for webhook
sudo docker compose logs -f api

# Check database for confirmed deposit
sudo docker compose exec db psql -U postgres -d cryptoplatform -c "SELECT * FROM \"Deposit\" WHERE status='CONFIRMED';"

# Check ledger entries (double-entry accounting)
sudo docker compose exec db psql -U postgres -d cryptoplatform -c "SELECT * FROM \"LedgerEntry\" ORDER BY \"createdAt\" DESC LIMIT 10;"
```

---

## 📊 Current Configuration Summary

### docker-compose.yml Changes Made:
- ✅ Removed `nbxplorer` dependency from BTCPay
- ✅ Set `BTCPAY_CHAINS=""` to disable BTC chain (avoids NBXplorer errors)
- ✅ Added `profiles: [btc]` to bitcoind, nbxplorer (won't start by default)
- ✅ Added `profiles: [optional]` to redis
- ✅ Changed plugin mount from `:ro` to writable (so BTCPay can manage plugins)

### To start ONLY USDt stack (current):
```bash
sudo docker compose up -d
```

### To include BTC infrastructure (if needed later):
```bash
sudo docker compose --profile btc up -d
```

---

## 🐛 Troubleshooting

### Issue: "Some plugins were disabled due to fatal errors"
- **Cause**: USDt plugin crashed before DB migrations completed
- **Fix**: Re-enable plugin via UI (Server Settings → Plugins → USDt → Enable)

### Issue: "500 Internal Server Error" when generating wallet
- **Cause**: Tron RPC endpoint timeout/rate limit
- **Fix**: 
  1. Configure stable RPC (Shasta: `https://api.shasta.trongrid.io/jsonrpc`)
  2. Add `TRON-PRO-API-KEY` header with your TronGrid API key

### Issue: "Authentication is required for accessing this endpoint"
- **Cause**: Invalid or missing BTCPay API key
- **Fix**: Create new API key in BTCPay UI and update `.env`

### Issue: BTCPay logs show "NBXplorer error"
- **Status**: Harmless warning (BTC chain is disabled but BTCPay still tries to connect)
- **Impact**: None - USDt plugin works independently of NBXplorer

### Live tail logs for debugging:
```bash
# BTCPay (USDt plugin, wallet generation)
sudo docker compose logs -f btcpay | stdbuf -oL grep -i -E "usdt|tron|wallet|plugin|error|fail"

# API (invoice creation, webhooks)
sudo docker compose logs -f api

# All services
sudo docker compose logs -f
```

---

## 🚀 Quick Commands Reference

```bash
# Start USDt stack
sudo docker compose up -d

# Stop all
sudo docker compose down

# Reset everything (DB + volumes)
sudo docker compose down -v

# Restart specific service
sudo docker compose restart btcpay
sudo docker compose restart api

# Check running containers
sudo docker compose ps

# View logs
sudo docker compose logs btcpay --tail=100
sudo docker compose logs api --tail=50

# Access database
sudo docker compose exec db psql -U postgres -d cryptoplatform
```

---

## ✅ Next Steps (In Order)

1. **Re-enable USDt plugin** in BTCPay UI (Server Settings → Plugins)
2. **Configure Tron RPC** with Shasta/Nile + TRON-PRO-API-KEY
3. **Generate/import USDT wallet** in store payment methods
4. **Create BTCPay API key** and update `.env`
5. **Restart API** to load credentials
6. **Test deposit** at http://localhost:3000/deposit/new
7. **Pay invoice** and verify webhook/ledger updates

---

## 📁 Key Files Reference

- **docker-compose.yml** - Infrastructure configuration
- **.env** - Environment variables (BTCPay credentials)
- **apps/api/.env** - API-specific overrides
- **apps/web/deposit.html** - TronLink integration + deposit form
- **apps/api/src/modules/btcpay/btcpay.service.ts** - BTCPay API client
- **apps/api/src/modules/deposits/deposits.controller.ts** - Deposit creation endpoint
- **apps/api/src/modules/webhooks/webhooks.controller.ts** - BTCPay webhook handler
- **packages/db/prisma/schema.prisma** - Database schema (Deposit, LedgerEntry, etc.)

---

🎯 **Ready to proceed!** Start by re-enabling the USDt plugin in BTCPay UI at http://localhost:49392
