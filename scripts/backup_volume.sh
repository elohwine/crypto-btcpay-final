#!/usr/bin/env bash
set -euo pipefail

if [ "$#" -lt 1 ]; then
  echo "Usage: $0 backup|restore [archive.tar.gz]"
  exit 2
fi

ACTION="$1"
ARCHIVE="${2:-$(pwd)/backups/btcpay-data-$(date +%F_%H%M%S).tar.gz}"
VOL_NAME="btcpay_data"

mkdir -p "$(pwd)/backups"

if [ "$ACTION" = "backup" ]; then
  echo "Backing up volume $VOL_NAME to $ARCHIVE"
  docker run --rm -v ${VOL_NAME}:/data -v $(pwd)/backups:/backup alpine sh -c "cd /data && tar czf /backup/$(basename $ARCHIVE) ."
  echo "Backup complete: $ARCHIVE"
  exit 0
fi

if [ "$ACTION" = "restore" ]; then
  if [ ! -f "$ARCHIVE" ]; then
    echo "Archive not found: $ARCHIVE"
    exit 1
  fi
  echo "Restoring $ARCHIVE to volume $VOL_NAME"
  docker run --rm -v ${VOL_NAME}:/data -v $(pwd)/backups:/backup alpine sh -c "cd /data && tar xzf /backup/$(basename $ARCHIVE)"
  echo "Restore complete"
  exit 0
fi

echo "Unknown action: $ACTION"
exit 3
