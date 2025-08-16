#!/bin/bash

# Database restore script for Sub-Pal
set -e

# Navigate to project root
cd "$(dirname "$0")/../.."

if [ $# -eq 0 ]; then
    echo "❌ Usage: $0 <backup_file.sql.gz>"
    echo "📋 Available backups:"
    ls -la ./backups/sub_pal_backup_*.sql.gz 2>/dev/null || echo "No backups found"
    exit 1
fi

BACKUP_FILE="$1"

if [ ! -f "$BACKUP_FILE" ]; then
    echo "❌ Backup file not found: $BACKUP_FILE"
    exit 1
fi

echo "⚠️  This will replace the current database with the backup."
read -p "Are you sure? (y/N): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "❌ Restore cancelled."
    exit 1
fi

# Check if database container is running
if ! docker-compose -f docker/compose/docker-compose.yml ps | grep -q "database.*Up"; then
    echo "❌ Database container is not running. Please start it first."
    exit 1
fi

echo "🔄 Restoring database from: $BACKUP_FILE"

# Stop backend to prevent connections
echo "🛑 Stopping backend service..."
docker-compose -f docker/compose/docker-compose.yml stop backend

# Restore database
echo "💾 Restoring database..."
if [[ "$BACKUP_FILE" == *.gz ]]; then
    zcat "$BACKUP_FILE" | docker-compose -f docker/compose/docker-compose.yml exec -T database psql -U postgres -d sub_pal
else
    cat "$BACKUP_FILE" | docker-compose -f docker/compose/docker-compose.yml exec -T database psql -U postgres -d sub_pal
fi

# Restart backend
echo "🚀 Starting backend service..."
docker-compose -f docker/compose/docker-compose.yml start backend

echo "✅ Database restore completed successfully!"
