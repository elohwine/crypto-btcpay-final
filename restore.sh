#!/usr/bin/env bash
# ============================================================================
# restore.sh - Restore Postgres backup to Render managed database
# ============================================================================
# This script restores SQL dumps or pg_dump custom format backups to a
# Postgres database (typically Render managed Postgres with SSL required).
#
# Usage:
#   ./restore.sh /path/to/backup.sql          # Plain SQL file
#   ./restore.sh /path/to/backup.dump         # pg_dump custom format
#
# Before running:
#   1. Get the External Database URL from your Render Postgres dashboard
#   2. Export connection details below (or set them as environment variables)
#
# Example connection details (replace with your Render values):
#   export PGHOST=dpg-xxxxx-a.oregon-postgres.render.com
#   export PGUSER=cryptoplatform_user
#   export PGPASSWORD=your_secure_password_here
#   export PGDATABASE=cryptoplatform
#   export PGPORT=5432
#
# Note: sslmode=require is automatically added for Render connections
# ============================================================================

set -e  # Exit on any error

# ============================================================================
# CONFIGURATION - Set these or export them as environment variables
# ============================================================================
: "${PGHOST:=YOUR_RENDER_HOST}"           # e.g., dpg-xxxxx.oregon-postgres.render.com
: "${PGUSER:=cryptoplatform_user}"        # Your Render DB username
: "${PGPASSWORD:=YOUR_PASSWORD}"          # Your Render DB password
: "${PGDATABASE:=cryptoplatform}"         # Your database name
: "${PGPORT:=5432}"                       # Default Postgres port

# ============================================================================
# VALIDATION
# ============================================================================
if [[ -z "$1" ]]; then
  echo "❌ Error: No backup file specified"
  echo ""
  echo "Usage: $0 /path/to/backup.sql"
  echo "       $0 /path/to/backup.dump"
  exit 1
fi

BACKUP_FILE="$1"

if [[ ! -f "$BACKUP_FILE" ]]; then
  echo "❌ Error: Backup file not found: $BACKUP_FILE"
  exit 1
fi

# Check if placeholder values are still present
if [[ "$PGHOST" == "YOUR_RENDER_HOST" ]] || [[ "$PGPASSWORD" == "YOUR_PASSWORD" ]]; then
  echo "❌ Error: Please set connection details before running restore"
  echo ""
  echo "Export these environment variables with your Render Postgres details:"
  echo "  export PGHOST=dpg-xxxxx.oregon-postgres.render.com"
  echo "  export PGUSER=cryptoplatform_user"
  echo "  export PGPASSWORD=your_secure_password"
  echo "  export PGDATABASE=cryptoplatform"
  echo "  export PGPORT=5432"
  echo ""
  echo "Or edit the script and replace the placeholder values."
  exit 1
fi

# Build connection string with SSL required (Render requirement)
CONNECTION_STRING="postgresql://${PGUSER}:${PGPASSWORD}@${PGHOST}:${PGPORT}/${PGDATABASE}?sslmode=require"

# ============================================================================
# RESTORE
# ============================================================================
echo "🔄 Starting restore from: $BACKUP_FILE"
echo "📍 Target: ${PGUSER}@${PGHOST}:${PGPORT}/${PGDATABASE}"
echo ""

# Detect file type and use appropriate restore command
if [[ "$BACKUP_FILE" == *.dump ]]; then
  echo "📦 Detected pg_dump custom format (.dump)"
  echo "⚠️  Running pg_restore with --clean --no-owner..."
  echo ""
  
  pg_restore \
    --verbose \
    --clean \
    --no-owner \
    --no-acl \
    --dbname="$CONNECTION_STRING" \
    "$BACKUP_FILE"
  
  echo ""
  echo "✅ Restore completed (custom format)"
  
else
  echo "📄 Detected plain SQL file"
  echo "⚠️  Running psql to execute SQL..."
  echo ""
  
  psql "$CONNECTION_STRING" -f "$BACKUP_FILE"
  
  echo ""
  echo "✅ Restore completed (plain SQL)"
fi

echo ""
echo "🎉 Database restore finished successfully!"
echo ""
echo "Next steps:"
echo "  1. Verify data in your Render dashboard or connect via psql"
echo "  2. Run migrations if schema changed: pnpm prisma migrate deploy"
echo "  3. Test your application with the restored data"
