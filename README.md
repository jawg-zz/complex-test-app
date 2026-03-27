# Complex Test App

Full-stack test application with Next.js 14, NestJS, PostgreSQL, Redis, and Bull queue worker.

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        Traefik                               │
│                   (Reverse Proxy / SSL)                      │
└──────────────┬──────────────────┬───────────────────────────┘
               │                  │
        ┌──────▼──────┐    ┌───────▼───────┐
        │  Frontend   │    │    Backend    │
        │  Next.js    │    │    NestJS     │
        │   :3000     │    │    :3001      │
        └─────────────┘    └───────┬───────┘
                                  │
                    ┌─────────────┼─────────────┐
                    │             │             │
              ┌──────▼──────┐ ┌───▼────┐ ┌─────▼─────┐
              │  PostgreSQL │ │ Redis  │ │  Worker   │
              │    :5432    │ │ :6379  │ │  Bull MQ  │
              └─────────────┘ └────────┘ └───────────┘
```

## Services

- **Frontend** (Next.js 14) - http://complextest.spidmax.win
- **Backend** (NestJS) - https://api.complextest.spidmax.win
- **WebSocket** - wss://ws.complextest.spidmax.win
- **PostgreSQL** - :5432
- **Redis** - :6379
- **Traefik Dashboard** - http://localhost:8080

## Quick Start

1. **Clone and setup:**
   ```bash
   cd complex-test-app
   cp .env.example .env
   ```

2. **Create letsencrypt directory:**
   ```bash
   mkdir -p letsencrypt
   touch letsencrypt/acme.json
   chmod 600 letsencrypt/acme.json
   ```

3. **Start services:**
   ```bash
   docker-compose up -d
   ```

4. **Check status:**
   ```bash
   docker-compose ps
   docker-compose logs -f
   ```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user (protected)

### Tasks (Protected)
- `GET /api/tasks` - List all tasks
- `POST /api/tasks` - Create task
- `GET /api/tasks/:id` - Get task
- `PUT /api/tasks/:id` - Update task
- `DELETE /api/tasks/:id` - Delete task

### Health Checks
- `GET /health` - Backend health
- `GET /health/db` - Database health
- `GET /health/redis` - Redis health

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `JWT_SECRET` | JWT signing secret | (required) |
| `POSTGRES_PASSWORD` | Database password | changeme |
| `DOMAIN` | Application domain | complextest.spidmax.win |

## Development

### Backend
```bash
cd backend
npm install
npm run start:dev
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

### Worker
```bash
cd worker
npm install
npm run start:dev
```

## Docker Commands

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop all services
docker-compose down

# Rebuild services
docker-compose build --no-cache

# Restart specific service
docker-compose restart backend
```

## Features

- JWT Authentication
- Real-time WebSocket updates
- Rate limiting (100 req/min)
- Task CRUD operations
- Background job processing (Bull queue)
- SSL via Let's Encrypt
- Health checks for all services
