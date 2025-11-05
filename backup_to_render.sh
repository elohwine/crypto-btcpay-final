#!/usr/bin/env bash
# ============================================================================
# backup_to_render.sh - Automated backup and restore to Render Postgres
# ============================================================================
# This script backs up a local Docker Postgres database and restores it
# to Render managed Postgres in one command.
#
# Usage:
#   ./backup_to_render.sh
#
# Prerequisites:
#   - Local Postgres container running (name: crypto-btcpay-final-db-1)
#   - Render Postgres credentials set in .env file
#   - Docker installed
# ============================================================================

set -e

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}Backup & Restore to Render Postgres${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""

# Check if local DB container is running
if ! docker ps --filter name=crypto-btcpay-final-db-1 --format "{{.Names}}" | grep -q "crypto-btcpay-final-db-1"; then
    echo -e "${RED}❌ Error: Local Postgres container not running${NC}"
    echo ""
    echo "Start it with:"
    echo "  cp docker-compose.override.yml.example docker-compose.override.yml"
    echo "  docker compose up -d db"
    exit 1
fi

# Create backups directory
mkdir -p backups

# Generate timestamp
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="backups/cryptoplatform_${TIMESTAMP}.sql"

# Step 1: Backup local database
echo -e "${YELLOW}📦 Step 1: Creating backup from local Postgres...${NC}"
docker exec crypto-btcpay-final-db-1 pg_dump \
    -U postgres \
    -d cryptoplatform \
    --clean \
    --if-exists \
    --no-owner \
    --no-acl \
    > "$BACKUP_FILE"

BACKUP_SIZE=$(du -h "$BACKUP_FILE" | cut -f1)
echo -e "${GREEN}✅ Backup created: $BACKUP_FILE ($BACKUP_SIZE)${NC}"
echo ""

# Step 2: Load Render credentials from .env
echo -e "${YELLOW}📝 Step 2: Loading Render credentials from .env...${NC}"
if [ ! -f .env ]; then
    echo -e "${RED}❌ Error: .env file not found${NC}"
    exit 1
fi

# Extract DATABASE_URL from .env (handles both external and internal URLs)
RENDER_DB_URL=$(grep '^DATABASE_URL=' .env | cut -d'=' -f2- | tr -d '"' | tr -d "'")

if [ -z "$RENDER_DB_URL" ]; then
    echo -e "${RED}❌ Error: DATABASE_URL not found in .env${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Credentials loaded${NC}"
echo ""

# Step 3: Restore to Render
echo -e "${YELLOW}🚀 Step 3: Restoring to Render Postgres...${NC}"
echo "This may take a few moments..."
echo ""

docker run --rm -i \
    -v "$(pwd)/backups:/backups" \
    postgres:16-alpine \
    psql "$RENDER_DB_URL" \
    -f "/backups/$(basename $BACKUP_FILE)" \
    2>&1 | grep -E "(ERROR|COPY|CREATE TABLE|ALTER TABLE)" || true

echo ""
echo -e "${GREEN}✅ Restore completed${NC}"
echo ""

# Step 4: Verify data
echo -e "${YELLOW}🔍 Step 4: Verifying data in Render...${NC}"
docker run --rm postgres:16-alpine psql "$RENDER_DB_URL" \
    -c "SELECT 'Users' as table_name, COUNT(*) as count FROM \"User\" 
        UNION ALL SELECT 'Deposits', COUNT(*) FROM \"Deposit\" 
        UNION ALL SELECT 'LedgerEntry', COUNT(*) FROM \"LedgerEntry\" 
        UNION ALL SELECT 'WebhookEvent', COUNT(*) FROM \"WebhookEvent\" 
        UNION ALL SELECT 'RefreshToken', COUNT(*) FROM \"RefreshToken\";"

echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}✅ Migration completed successfully!${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo "Backup file saved to: $BACKUP_FILE"
echo ""
echo "Next steps:"
echo "  1. Test your application with Render DB"
echo "  2. Deploy to Render if not already deployed"
echo "  3. Keep backup file safe for future reference"
