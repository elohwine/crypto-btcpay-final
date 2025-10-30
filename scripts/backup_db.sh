#!/usr/bin/env bash
set -euo pipefail

# Backup Postgres database used by BTCPay/this project
# Creates a SQL dump in ./backups named btcpay-db-YYYYMMDD_HHMMSS.sql

OUT_DIR="$(pwd)/backups"
mkdir -p "$OUT_DIR"

TS=$(date +"%F_%H%M%S")
OUT_FILE="$OUT_DIR/btcpay-db-${TS}.sql"

echo "Creating DB backup: $OUT_FILE"

# Use docker compose to exec pg_dump. This requires docker compose to be runnable by the user (sudo may be needed).
docker compose exec -T db pg_dump -U postgres -d cryptoplatform > "$OUT_FILE"

echo "Done. Backup saved to $OUT_FILE"
