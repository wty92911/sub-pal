#!/bin/bash

# Database backup script for Sub-Pal
set -e

# Navigate to project root
cd "$(dirname "$0")/../../.."

BACKUP_DIR="./backups"
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="sub_pal_backup_${DATE}.sql"

echo "📦 Starting database backup..."

# Create backup directory if it doesn't exist
mkdir -p "$BACKUP_DIR"

# Check if database container is running
if ! docker-compose -f docker/compose/docker-compose.prod.yml ps | grep -q "database.*Up"; then
    echo "❌ Database container is not running. Please start it first."
    exit 1
fi

# Create backup
echo "💾 Creating backup: $BACKUP_FILE"
docker-compose -f docker/compose/docker-compose.prod.yml exec -T database pg_dump -U postgres sub_pal > "$BACKUP_DIR/$BACKUP_FILE"

# Compress backup
echo "🗜️  Compressing backup..."
gzip "$BACKUP_DIR/$BACKUP_FILE"

echo "✅ Backup completed: $BACKUP_DIR/${BACKUP_FILE}.gz"

# Clean up old backups (keep last 7 days)
echo "🧹 Cleaning up old backups..."
find "$BACKUP_DIR" -name "sub_pal_backup_*.sql.gz" -mtime +7 -delete

echo "📊 Current backups:"
ls -la "$BACKUP_DIR"/sub_pal_backup_*.sql.gz
