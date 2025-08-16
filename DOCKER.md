# Docker Deployment Guide

Complete Docker-based deployment for Sub-Pal subscription management platform.

## 🚀 Quick Start

### Prerequisites
- Docker Engine 20.10+
- Docker Compose v2.0+

### One-Command Deployment

**Development**:
```bash
git clone <repository-url>
cd sub-pal
./docker/scripts/deploy.sh
```

**Production**:
```bash
cp docker/config/.env.prod.template .env.prod
# Edit .env.prod with your values
./docker/scripts/deploy-prod.sh
```

## 📁 New Organization

All Docker files are now organized in the `docker/` directory:

```
docker/
├── README.md                    # Detailed documentation
├── backend/Dockerfile           # Backend container
├── frontend/Dockerfile          # Frontend container
├── frontend/nginx.conf          # Frontend nginx config
├── nginx/                       # Production proxy config
├── compose/
│   ├── docker-compose.yml       # Development stack
│   └── docker-compose.prod.yml  # Production stack
├── config/
│   ├── .env.docker              # Dev environment template
│   └── .env.prod.template       # Prod environment template
└── scripts/
    ├── deploy.sh               # Development deployment
    ├── deploy-prod.sh          # Production deployment
    ├── backup.sh               # Database backup
    └── restore.sh              # Database restore
```

## 🔧 Key Changes

1. **Removed raw deployment folder** - Only Docker-based deployment now
2. **Organized structure** - All Docker files in dedicated `docker/` folder
3. **Updated scripts** - All paths corrected for new structure
4. **Cleaner root** - Project root no longer cluttered with deployment files

## 📋 Access Points

- **Frontend**: http://localhost (dev) / your domain (prod)
- **Backend API**: http://localhost:3000 (dev) / your domain/api (prod)
- **Database**: localhost:5432 (dev only)

## 📖 Documentation

See `docker/README.md` for complete documentation including:
- Detailed setup instructions
- Architecture overview
- Management commands
- Troubleshooting guide
- Security considerations
- Production checklist

## 🛠️ Common Commands

```bash
# Deploy development
./docker/scripts/deploy.sh

# Deploy production
./docker/scripts/deploy-prod.sh

# Backup database
./docker/scripts/backup.sh

# View logs
docker-compose -f docker/compose/docker-compose.yml logs -f

# Stop services
docker-compose -f docker/compose/docker-compose.yml down
```
