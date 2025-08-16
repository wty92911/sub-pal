# Sub-Pal Docker Deployment

Complete Docker-based deployment solution for Sub-Pal subscription management platform.

## 📁 Directory Structure

```
docker/
├── README.md                 # This file
├── backend/
│   └── Dockerfile           # Backend container definition
├── frontend/
│   ├── Dockerfile           # Frontend container definition
│   └── nginx.conf           # Frontend nginx configuration
├── nginx/                   # Production reverse proxy
│   ├── nginx.conf           # Main nginx config
│   └── conf.d/
│       └── default.conf     # Site configuration
├── compose/
│   ├── docker-compose.yml       # Development stack
│   └── docker-compose.prod.yml  # Production stack
├── config/
│   ├── .env.docker              # Development environment template
│   └── .env.prod.template       # Production environment template
└── scripts/
    ├── deploy.sh            # Development deployment
    ├── deploy-prod.sh       # Production deployment
    ├── backup.sh            # Database backup
    └── restore.sh           # Database restore
```

## 🚀 Quick Start

### Prerequisites

- Docker Engine 20.10+
- Docker Compose v2.0+
- Git

### Development Deployment

1. **Clone repository**:
   ```bash
   git clone <your-repo-url>
   cd sub-pal
   ```

2. **Deploy with single command**:
   ```bash
   ./docker/scripts/deploy.sh
   ```

   This automatically:
   - Creates `.env` from template if missing
   - Builds all Docker images
   - Starts all services
   - Shows service status and URLs

3. **Access application**:
   - Frontend: http://localhost
   - Backend API: http://localhost:3000
   - Database: localhost:5432

### Production Deployment

1. **Setup environment**:
   ```bash
   cp docker/config/.env.prod.template .env.prod
   # Edit .env.prod with your production values
   ```

2. **Deploy production stack**:
   ```bash
   ./docker/scripts/deploy-prod.sh
   ```

3. **Configure SSL** (recommended):
   - Place certificates in `./ssl/` directory
   - Update nginx configuration for HTTPS

## 🔧 Configuration

### Environment Files

**Development (`.env`)**:
Created automatically from `docker/config/.env.docker` template.

**Production (`.env.prod`)**:
Must be created from `docker/config/.env.prod.template`:

```bash
# Required production values
POSTGRES_PASSWORD=your_secure_password
JWT_SECRET=your_32_character_secret_key_here
ALLOWED_ORIGINS=https://yourdomain.com
APP_URL=https://yourdomain.com
```

## 🏗️ Architecture

### Services Overview

| Service | Description | Port | Environment |
|---------|-------------|------|-------------|
| **database** | PostgreSQL 15 | 5432 | Dev only |
| **backend** | Rust API (Axum) | 3000 | Dev only |
| **frontend** | React + Nginx | 80 | Dev only |
| **nginx** | Reverse proxy | 80/443 | Prod only |

### Development Stack
- Direct port access to all services
- PostgreSQL exposed for debugging
- Hot reload support
- Simplified networking

### Production Stack
- Nginx reverse proxy with SSL termination
- Internal service communication
- Health checks and restart policies
- Log aggregation and backups

## 📋 Management Commands

### Service Control

```bash
# View status
docker-compose -f docker/compose/docker-compose.yml ps

# View logs
docker-compose -f docker/compose/docker-compose.yml logs -f

# Stop services
docker-compose -f docker/compose/docker-compose.yml down

# Restart specific service
docker-compose -f docker/compose/docker-compose.yml restart backend
```

### Database Management

**Backup database**:
```bash
./docker/scripts/backup.sh
```

**Restore database**:
```bash
./docker/scripts/restore.sh ./backups/sub_pal_backup_20250816_143022.sql.gz
```

**Direct database access**:
```bash
docker-compose -f docker/compose/docker-compose.yml exec database psql -U postgres sub_pal
```

## 🔄 Updates and Maintenance

### Application Updates

```bash
# Pull latest code
git pull

# Rebuild and restart
docker-compose -f docker/compose/docker-compose.yml down
docker-compose -f docker/compose/docker-compose.yml build
docker-compose -f docker/compose/docker-compose.yml up -d
```

### Database Migrations

Migrations run automatically on backend startup. For manual execution:

```bash
docker-compose -f docker/compose/docker-compose.yml exec backend ./sub-pal migrate
```

### Cleanup

```bash
# Remove containers only
docker-compose -f docker/compose/docker-compose.yml down

# Remove containers and volumes (⚠️ deletes database)
docker-compose -f docker/compose/docker-compose.yml down -v

# Remove unused images and containers
docker system prune -a
```

## 🛡️ Security Considerations

### Development
- Default passwords (change for any external access)
- Exposed database port (block in firewall)
- Debug logging enabled

### Production
- Strong passwords in `.env.prod`
- SSL certificates in `./ssl/`
- Firewall configuration
- Log monitoring and rotation
- Regular security updates

## 📊 Monitoring

### Health Checks

All production services include health checks:
- Database: PostgreSQL readiness
- Backend: API endpoint availability
- Frontend: HTTP response check

### Logs

```bash
# All services
docker-compose -f docker/compose/docker-compose.yml logs -f

# Specific service
docker-compose -f docker/compose/docker-compose.yml logs -f backend

# Follow logs with timestamps
docker-compose -f docker/compose/docker-compose.yml logs -f -t
```

### Resource Usage

```bash
# Container stats
docker stats

# Disk usage
docker system df
```

## 🚨 Troubleshooting

### Common Issues

**Services won't start**:
1. Check Docker daemon: `docker version`
2. Verify port availability: `netstat -tulpn | grep :80`
3. Check logs: `docker-compose logs`

**Database connection failed**:
1. Verify database health: `docker-compose exec database pg_isready -U postgres`
2. Check environment variables in `.env`
3. Ensure services can communicate: `docker network ls`

**Frontend/Backend communication**:
1. Verify nginx configuration
2. Check CORS settings in backend logs
3. Test API endpoints: `curl http://localhost:3000/api/v1/health`

**Permission issues**:
```bash
# Make scripts executable
chmod +x docker/scripts/*.sh

# Fix Docker permissions (Linux)
sudo usermod -aG docker $USER
newgrp docker
```

## 🎯 Production Checklist

- [ ] Environment file configured (`.env.prod`)
- [ ] Strong passwords and JWT secret
- [ ] SSL certificates installed
- [ ] Firewall rules configured
- [ ] Domain DNS configured
- [ ] Backup strategy implemented
- [ ] Log monitoring setup
- [ ] Health check alerts configured
- [ ] Documentation updated for team

## 📞 Support

For issues and questions:
1. Check this documentation
2. Review Docker logs
3. Check GitHub issues
4. Create new issue with logs and configuration
