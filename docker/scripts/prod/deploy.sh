#!/bin/bash

# Production Docker deployment script for Sub-Pal
set -e

# Navigate to project root
cd "$(dirname "$0")/../.."

# Parse command line arguments
SERVICE=""
case "$1" in
    backend|back|be)
        SERVICE="backend"
        echo "🚀 Starting Sub-Pal Backend-only Production deployment..."
        ;;
    frontend|front|fe)
        SERVICE="frontend"
        echo "🚀 Starting Sub-Pal Frontend-only Production deployment..."
        ;;
    ""|all|full)
        SERVICE="all"
        echo "🚀 Starting Sub-Pal Full Production Docker deployment..."
        ;;
    -h|--help|help)
        echo "Usage: $0 [backend|frontend|all]"
        echo ""
        echo "Options:"
        echo "  backend, back, be    Deploy only backend service"
        echo "  frontend, front, fe  Deploy only frontend service"
        echo "  all, full, (empty)   Deploy all services (default)"
        echo "  -h, --help, help     Show this help message"
        exit 0
        ;;
    *)
        echo "❌ Unknown option: $1"
        echo "Use '$0 --help' for usage information"
        exit 1
        ;;
esac

# Check if docker and docker-compose are installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first."
    exit 1
fi

if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi

# Check for production environment file
if [ ! -f .env.prod ]; then
    echo "❌ .env.prod file not found. Please create it from template"
    echo "📝 Run: cp docker/config/.env.prod.template .env.prod"
    echo "📝 Then edit .env.prod with your production configuration."
    exit 1
fi

# Create necessary directories
mkdir -p logs ssl backups

# Selective deployment logic
if [ "$SERVICE" = "all" ]; then
    # Full deployment
    echo "📥 Pulling latest base images..."
    docker-compose -f docker/compose/docker-compose.prod.yml pull

    echo "🔨 Building production images..."
    docker-compose -f docker/compose/docker-compose.prod.yml build

    echo "🛑 Stopping existing services..."
    docker-compose -f docker/compose/docker-compose.prod.yml down

    echo "🚀 Starting production services..."
    docker-compose -f docker/compose/docker-compose.prod.yml --env-file .env.prod up -d
else
    # Selective deployment
    echo "🔨 Building $SERVICE image..."
    docker-compose -f docker/compose/docker-compose.prod.yml --env-file .env.prod build $SERVICE

    echo "🛑 Stopping $SERVICE service..."
    docker-compose -f docker/compose/docker-compose.prod.yml --env-file .env.prod stop $SERVICE

    echo "🚀 Starting $SERVICE service..."
    docker-compose -f docker/compose/docker-compose.prod.yml --env-file .env.prod up -d $SERVICE
fi

echo "⏳ Waiting for services to be ready..."
sleep 10

# Check if services are running
if docker-compose -f docker/compose/docker-compose.prod.yml ps | grep -q "Up"; then
    echo "✅ Production services are running!"
    echo ""
    echo "📋 Service status:"
    docker-compose -f docker/compose/docker-compose.prod.yml ps
    echo ""
    echo "🌐 Application should be available at:"
    echo "   Frontend: http://localhost (or your domain)"
    echo "   Backend API: http://localhost/api"
    echo ""
    echo "📝 To view logs: docker-compose -f docker/compose/docker-compose.prod.yml logs -f"
    echo "🛑 To stop: docker-compose -f docker/compose/docker-compose.prod.yml down"
    echo ""
    echo "⚠️  Important production notes:"
    echo "   - Set up SSL certificates in ./ssl/ directory"
    echo "   - Configure proper firewall rules"
    echo "   - Set up log rotation for ./logs/"
    echo "   - Configure automatic backups for ./backups/"
else
    echo "❌ Some services failed to start. Check logs:"
    docker-compose -f docker/compose/docker-compose.prod.yml logs
    exit 1
fi
