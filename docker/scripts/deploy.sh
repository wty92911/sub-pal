#!/bin/bash

# Docker deployment script for Sub-Pal
set -e

# Navigate to project root
cd "$(dirname "$0")/../.."

echo "🚀 Starting Sub-Pal Docker deployment..."

# Check if docker and docker-compose are installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first."
    exit 1
fi

if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi

# Check for environment file
if [ ! -f .env ]; then
    echo "⚠️  .env file not found. Copying from docker config template..."
    cp docker/config/.env.docker .env
    echo "📝 Please edit .env file with your configuration before running again."
    exit 1
fi

# Build and start services
echo "🔨 Building Docker images..."
docker-compose -f docker/compose/docker-compose.yml build

echo "🚀 Starting services..."
docker-compose -f docker/compose/docker-compose.yml up -d

echo "⏳ Waiting for services to be ready..."
sleep 10

# Check if services are running
if docker-compose -f docker/compose/docker-compose.yml ps | grep -q "Up"; then
    echo "✅ Services are running!"
    echo ""
    echo "📋 Service status:"
    docker-compose -f docker/compose/docker-compose.yml ps
    echo ""
    echo "🌐 Application should be available at:"
    echo "   Frontend: http://localhost"
    echo "   Backend API: http://localhost:3000"
    echo "   Database: localhost:5432"
    echo ""
    echo "📝 To view logs: docker-compose -f docker/compose/docker-compose.yml logs -f"
    echo "🛑 To stop: docker-compose -f docker/compose/docker-compose.yml down"
else
    echo "❌ Some services failed to start. Check logs:"
    docker-compose -f docker/compose/docker-compose.yml logs
    exit 1
fi
