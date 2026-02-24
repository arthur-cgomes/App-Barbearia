# 💈 App Barbearia

![Node](https://img.shields.io/badge/Node.js-22%20LTS-339933?logo=node.js&logoColor=white)
![NestJS](https://img.shields.io/badge/NestJS-11-E0234E?logo=nestjs&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5.7-3178C6?logo=typescript&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-4169E1?logo=postgresql&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?logo=docker&logoColor=white)
![Coverage](https://img.shields.io/badge/Coverage-100%25-brightgreen)

REST API for a barbershop management system — built to practice modern back-end patterns with NestJS, TypeORM, JWT authentication, role-based access control, and production-ready infrastructure.

---

## Features

- JWT authentication via Passport.js (login, current user profile)
- Password reset using birthdate + CPF verification
- Role-based access control (ADMIN / BARBER / USER)
- Barbershop management (CRUD with location coordinates, CNPJ validation)
- Barber profile management linked to barbershops (CPF validation)
- Barber ↔ Barbershop association endpoints
- Service catalog per barbershop (hair, beard, eyebrow, skincare, other) with price and duration
- Appointment scheduling with time-based conflict detection and status tracking
- RBAC filtering on schedulings (USER sees only their own)
- Paginated, sortable, and searchable list endpoints
- Swagger UI with Bearer auth
- Rate limiting (global 60 req/min; 5 req/min on login)
- HTTP security headers via Helmet
- Structured audit logging for critical actions
- HTTP request logging with duration and user context
- Health check endpoint (database + memory)
- Soft delete on all entities (records preserved with `deletedAt` + `active = false`)
- Standardized error responses with timestamp and path
- CPF and CNPJ format validation on document fields
- 100% unit test coverage enforced on all services

---

## Tech Stack

| Technology | Version | Purpose |
|-----------|---------|---------|
| Node.js | 22 LTS | Runtime |
| NestJS | 11 | Framework |
| TypeScript | 5.7 | Language |
| PostgreSQL | 16 | Database |
| TypeORM | 0.3 | ORM |
| Passport.js | 0.7 | Authentication strategy |
| JWT (`@nestjs/jwt`) | 11 | Stateless token-based auth |
| bcrypt | 6 | Password hashing |
| class-validator | 0.14 | DTO validation (incl. CPF/CNPJ) |
| Helmet | 8 | HTTP security headers |
| @nestjs/throttler | 6 | Rate limiting |
| @nestjs/terminus | 11 | Health checks |
| @nestjs/swagger | 11 | API documentation (OpenAPI 3) |
| Jest + ts-jest | 29 | Unit testing (100% coverage) |
| Docker Compose | — | Container orchestration |

---

## Architecture

### Module Structure

Each domain module lives in `src/<domain>/` and follows this pattern:

```
src/<domain>/
├── entity/          # TypeORM entity (extends BaseCollection)
├── dto/             # Create / Update / Response DTOs
├── *.controller.ts  # Route handlers with Swagger decorators
├── *.service.ts     # Business logic (100% test coverage)
├── *.module.ts      # NestJS module wiring
└── __tests__/       # Unit tests + mock factories
```

### Domain Modules

| Module | Responsibility |
|--------|---------------|
| `auth` | JWT + Passport local/jwt strategy, login, password reset, current user |
| `user` | Customer/admin/barber accounts, bcrypt password hashing |
| `barber` | Barber profiles linked to barbershops (CPF validated) |
| `barber-shop` | Barbershop businesses (location, owner, staff, services) with CNPJ validation |
| `service` | Service offerings with price (decimal) and duration in minutes |
| `scheduling` | Appointments with status tracking and time-based conflict detection |
| `health` | Database and memory health check endpoint |
| `common` | Shared BaseCollection entity, enums, validators, filters, interceptors |
| `config` | TypeORM configuration (reads `TYPEORM_*` env vars) |
| `migrations` | Versioned TypeORM migration files |

### Authentication Flow

```
1. POST /auth          → { email, password }
2. Server validates    → returns { token, expiresIn, userId }
3. Client stores token
4. All protected requests → Authorization: Bearer <token>
5. JwtStrategy validates token → attaches { userId, email, userType } to request
6. GET /auth/me        → returns authenticated user profile
```

### Role-Based Access Control

| Role | Capabilities |
|------|-------------|
| `admin` | Full access — create/update/delete barbershops, barbers, services; all user and scheduling operations |
| `barber` | Authenticated access to schedulings and own profile |
| `user` | Create account, manage own profile, create and view **own** schedulings only |
| *(public)* | Read-only access to barbers, barbershops, and services |

### Soft Delete

All `DELETE` endpoints perform a **soft delete** — records are never physically removed:

- `active` field is set to `false`
- `deletedAt` is populated with the current timestamp
- TypeORM automatically excludes soft-deleted records from all `find*` queries via `@DeleteDateColumn`

### Scheduling Status Flow

```
PENDING → CONFIRMED → COMPLETED
                   → CANCELLED
                   → NO_SHOW
```

---

## Prerequisites

**Local development:**
- Node.js 22 LTS
- npm 10+
- PostgreSQL 16+

**Docker (full stack — no local PostgreSQL needed):**
- Docker 24+
- Docker Compose v2

---

## Getting Started

### Option A — Local development

```bash
# 1. Clone the repository
git clone https://github.com/arthur-cgomes/AppBarbearia.git
cd AppBarbearia

# 2. Copy and fill in environment variables
cp .env.example .env
# Edit .env with your PostgreSQL credentials and JWT secret

# 3. Install dependencies
npm install

# 4. Run database migrations
npm run migration:run

# 5. Start in development mode (hot-reload)
npm run start:dev
```

### Option B — Docker Compose (recommended for quick start)

```bash
# 1. Clone and configure
git clone https://github.com/arthur-cgomes/AppBarbearia.git
cd AppBarbearia
cp .env.example .env
# Edit .env — set TYPEORM_USERNAME, TYPEORM_PASSWORD, TYPEORM_DATABASE, AUTH_SECRET

# 2. Start the full stack (API + PostgreSQL)
docker compose up

# 3. To run only the database (and start the API locally)
docker compose up postgres
```

The API container automatically runs migrations on startup before serving traffic.

Swagger UI is available at: **http://localhost:3000/api**

---

## Environment Variables

Copy `.env.example` to `.env` and configure the following:

| Variable | Description | Example |
|----------|-------------|---------|
| `TYPEORM_HOST` | PostgreSQL host | `localhost` |
| `TYPEORM_PORT` | PostgreSQL port | `5432` |
| `TYPEORM_USERNAME` | PostgreSQL user | `postgres` |
| `TYPEORM_PASSWORD` | PostgreSQL password | `postgres` |
| `TYPEORM_DATABASE` | Database name | `app_barbearia` |
| `AUTH_SECRET` | JWT signing secret (keep strong!) | `my-super-secret-key` |
| `EXPIRE_IN` | JWT expiration in seconds | `7200` |
| `PORT` | HTTP server port | `3000` |
| `ALLOWED_ORIGINS` | Comma-separated CORS origins | `http://localhost:4200` |
| `NODE_ENV` | Runtime environment | `development` |

---

## Running the App

```bash
# Development (hot-reload)
npm run start:dev

# Debug mode (with inspector)
npm run start:debug

# Production build + start (runs migrations first)
npm run build
npm run start:prod
```

### Docker commands

```bash
# Build and start full stack
docker compose up --build

# Start in background
docker compose up -d

# View API logs
docker compose logs -f api

# Stop all services
docker compose down

# Stop and remove volumes (wipes database)
docker compose down -v
```

---

## Database Migrations

TypeORM sync is **disabled** — use migrations to evolve the schema:

```bash
# Generate a migration from entity changes
npm run migration:generate -- src/migrations/<MigrationName>

# Apply pending migrations
npm run migration:run

# Revert the last migration
npm run migration:revert
```

---

## Testing

Unit tests cover all service methods with **100% branch/function/line/statement coverage** enforced by Jest thresholds.

```bash
# Run all unit tests
npm run test

# Watch mode
npm run test:watch

# Coverage report
npm run test:cov

# End-to-end tests
npm run test:e2e

# Run a single test file
npm run test -- --testPathPattern=scheduling.service
```

---

## Security

| Mechanism | Configuration |
|-----------|--------------|
| Helmet | HTTP security headers (XSS, clickjacking, MIME sniffing) applied globally |
| Rate Limiting | 60 requests / 60 seconds globally; 5 requests / 60 seconds on `POST /auth` |
| JWT | Bearer token required on all protected routes; expires per `EXPIRE_IN` |
| Validation | Global `ValidationPipe` with `whitelist: true` and `forbidNonWhitelisted: true` |
| CORS | Configurable via `ALLOWED_ORIGINS` env var |

Brute-force protection on login: after 5 failed attempts within a minute, the endpoint returns `429 Too Many Requests`.

---

## API Documentation

Interactive Swagger UI: **http://localhost:3000/api**

A ready-to-import Postman collection and usage guide are available in the [`docs/`](docs/) folder.

### Endpoint Summary

| Method | Path | Auth | Role | Description |
|--------|------|------|------|-------------|
| `POST` | `/auth` | — | — | Login — returns JWT token |
| `GET` | `/auth/me` | JWT | — | Get authenticated user profile |
| `PATCH` | `/auth/reset-password` | JWT | — | Reset password via birthdate + CPF |
| `GET` | `/health` | — | — | Health check (database + memory) |
| `POST` | `/user` | — | — | Create user account |
| `PUT` | `/user/:userId` | JWT | — | Update user |
| `GET` | `/user/:userId` | JWT | — | Get user by ID |
| `GET` | `/user` | JWT | — | List users (paginated) |
| `DELETE` | `/user/:userId` | JWT | — | Soft-delete user |
| `POST` | `/barber` | JWT | ADMIN | Create barber |
| `PUT` | `/barber/:barberId` | JWT | ADMIN | Update barber |
| `GET` | `/barber/:barberId` | — | — | Get barber by ID |
| `GET` | `/barber` | — | — | List barbers (paginated) |
| `DELETE` | `/barber/:barberId` | JWT | ADMIN | Soft-delete barber |
| `POST` | `/barbershop` | JWT | ADMIN | Create barbershop |
| `PUT` | `/barbershop/:barbershopId` | JWT | ADMIN | Update barbershop |
| `GET` | `/barbershop/:barbershopId` | — | — | Get barbershop by ID |
| `GET` | `/barbershop` | — | — | List barbershops (paginated) |
| `DELETE` | `/barbershop/:barbershopId` | JWT | ADMIN | Soft-delete barbershop |
| `POST` | `/barbershop/:barbershopId/barbers/:barberId` | JWT | ADMIN | Associate barber to barbershop |
| `DELETE` | `/barbershop/:barbershopId/barbers/:barberId` | JWT | ADMIN | Remove barber from barbershop |
| `POST` | `/service` | JWT | ADMIN | Create service |
| `PUT` | `/service/:serviceId` | JWT | ADMIN | Update service |
| `GET` | `/service/:serviceId` | — | — | Get service by ID |
| `GET` | `/service` | — | — | List services (paginated) |
| `DELETE` | `/service/:serviceId` | JWT | ADMIN | Soft-delete service |
| `POST` | `/scheduling` | JWT | — | Create scheduling |
| `PUT` | `/scheduling/:schedulingId` | JWT | — | Update scheduling (incl. status) |
| `GET` | `/scheduling/:schedulingId` | JWT | — | Get scheduling by ID |
| `GET` | `/scheduling` | JWT | — | List schedulings (paginated, filtered by role) |
| `DELETE` | `/scheduling/:schedulingId` | JWT | — | Soft-delete scheduling (sets status = cancelled) |

### Pagination Query Parameters

All list endpoints (`GET /resource`) support:

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `take` | number | `10` | Records per page |
| `skip` | number | `0` | Records to skip |
| `sort` | string | `name` | Field to sort by |
| `order` | string | `ASC` | `ASC` or `DESC` |
| `search` | string | — | Filter by name (ILIKE) |

### Scheduling-specific filters

| Parameter | Type | Description |
|-----------|------|-------------|
| `userId` | string | Filter by user UUID (ADMIN only) |
| `barberId` | string | Filter by barber UUID |
| `barberShopId` | string | Filter by barbershop UUID |
| `status` | string | Filter by status: `pending`, `confirmed`, `completed`, `cancelled`, `no_show` |

### Service fields

| Field | Type | Description |
|-------|------|-------------|
| `name` | string | Service name |
| `type` | enum | `hair`, `beard`, `eyebrow`, `skincare`, `other` |
| `price` | number | Price in BRL (decimal, e.g. `35.00`) |
| `durationMinutes` | number | Duration in minutes (optional, default 60 for conflict detection) |
| `barberShopId` | string | Linked barbershop UUID |

---

## Code Quality

```bash
# ESLint with auto-fix
npm run lint

# Prettier formatting
npm run format
```

---

## Author

- **Arthur Gomes** — [Instagram](https://www.instagram.com/arthurcgomes_/) · [LinkedIn](https://www.linkedin.com/in/arthur-gomes-701549193/)
