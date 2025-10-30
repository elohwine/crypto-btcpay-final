#!/usr/bin/env bash
set -euo pipefail

if [ "$#" -ne 1 ]; then
  echo "Usage: $0 path/to/backup.sql"
  exit 2
fi

BACKUP_FILE="$1"

if [ ! -f "$BACKUP_FILE" ]; then
  echo "Backup file not found: $BACKUP_FILE"
  exit 1
fi

echo "Restoring DB from $BACKUP_FILE"
docker compose exec -T db psql -U postgres -d cryptoplatform < "$BACKUP_FILE"
echo "Restore complete"
