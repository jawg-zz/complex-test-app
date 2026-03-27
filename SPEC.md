# Complex Test App - Specification

## Overview
Full-stack test application with Next.js 14 frontend, NestJS backend, PostgreSQL, Redis, and Bull queue worker.

## Domain
`complextest.spidmax.win`

## Services

### Frontend (Next.js 14 - App Router)
- Port: 3000
- Routes:
  - `/` - Home/Login page
  - `/dashboard` - Task list with real-time updates
  - `/tasks/[id]` - Task detail
- Features:
  - JWT authentication
  - Real-time task updates via WebSocket
  - Task CRUD operations

### Backend (NestJS)
- Port: 3001
- Modules:
  - AuthModule - JWT authentication
  - TasksModule - Task CRUD
  - WebSocketGateway - Real-time updates
  - HealthModule - Health checks
- Features:
  - Rate limiting with Redis (100 req/min per IP)
  - JWT guard for protected routes
  - WebSocket gateway for real-time updates

### Worker (Bull Queue)
- Processes:
  - Email notification jobs
  - Task cleanup jobs
- Queue: `email-notifications`

### Database
- PostgreSQL:15
- Port: 5432
- Database: `complextest`

### Cache/Session
- Redis:7
- Port: 6379

### Reverse Proxy
- Traefik:v2.9
- Ports: 80, 443
- SSL via Let's Encrypt

## Environment Variables

```
# App
NODE_ENV=production
DOMAIN=complextest.spidmax.win

# Database
POSTGRES_HOST=postgres
POSTGRES_PORT=5432
POSTGRES_USER=complextest
POSTGRES_PASSWORD=changeme
POSTGRES_DB=complextest

# Redis
REDIS_HOST=redis
REDIS_PORT=6379

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRES_IN=7d

# Backend
BACKEND_PORT=3001

# Frontend
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_WS_URL=ws://localhost:3001
```

## Health Checks

| Service | Endpoint | Expected |
|---------|----------|----------|
| Frontend | `/api/health` | 200 OK |
| Backend | `/health` | 200 OK |
| Worker | Bull health | OK |
| PostgreSQL | - | Ready |
| Redis | - | Ready |
| Traefik | - | OK |

## Traefik Routing

- `complextest.spidmax.win` → Frontend (Next.js)
- `api.complextest.spidmax.win` → Backend (NestJS)
- `ws.complextest.spidmax.win` → Backend WebSocket

## Database Schema

### users
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  name VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### tasks
```sql
CREATE TABLE tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  status VARCHAR(50) DEFAULT 'pending',
  user_id UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```
