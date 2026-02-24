# 💈 AppBarbearia — Usage Guide

This guide explains how to use the AppBarbearia REST API in practice. It covers authentication, role differences, a complete end-to-end flow, and the behavior of each major feature.

---

## Table of Contents

1. [Authentication](#1-authentication)
2. [Complete Usage Flow](#2-complete-usage-flow)
3. [Rate Limiting](#3-rate-limiting)
4. [Soft Delete](#4-soft-delete)
5. [Scheduling Status](#5-scheduling-status)
6. [Role-Based Access Control (RBAC)](#6-role-based-access-control-rbac)
7. [Validations](#7-validations)
8. [Standardized Error Responses](#8-standardized-error-responses)
9. [Health Check](#9-health-check)
10. [Importing the Postman Collection](#10-importing-the-postman-collection)

---

## 1. Authentication

### Login

Send a `POST /auth` request with your credentials:

```http
POST /auth
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "yourpassword"
}
```

**Response (200 OK):**

```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expiresIn": 7200,
  "userId": "uuid-here"
}
```

### Using the Token

Include the JWT token in the `Authorization` header of every protected request:

```http
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Getting the Authenticated User Profile

```http
GET /auth/me
Authorization: Bearer <token>
```

Returns the full profile of the currently logged-in user.

### Password Reset

To reset your password, provide your current **birthdate** and **CPF** for verification:

```http
PATCH /auth/reset-password
Authorization: Bearer <token>
Content-Type: application/json

{
  "birthDate": "1990-01-15",
  "document": "123.456.789-09",
  "newPassword": "newSecurePassword123"
}
```

### Role Differences

| Role | What they can do |
|------|-----------------|
| `admin` | Full access — manage barbershops, barbers, services, users, and all schedulings |
| `barber` | View and manage schedulings; view own profile |
| `user` | Create own account, manage own profile, create and view **only their own** schedulings |
| *(public)* | Read-only access to barbers, barbershops, and services |

> **Tip:** The token payload contains `userType` — the API uses it internally for RBAC.

---

## 2. Complete Usage Flow

Below is a step-by-step walkthrough for the most common scenario: an admin setting up a barbershop and a user booking an appointment.

### Step 1 — Create a User Account (public)

```http
POST /user
Content-Type: application/json

{
  "name": "João Silva",
  "email": "joao@example.com",
  "password": "securepass123",
  "document": "123.456.789-09",
  "birthDate": "1990-05-20",
  "phone": "11999999999",
  "userType": "user"
}
```

### Step 2 — Login

```http
POST /auth
Content-Type: application/json

{
  "email": "joao@example.com",
  "password": "securepass123"
}
```

Save the `token` from the response.

### Step 3 — Create a Barbershop (admin only)

```http
POST /barbershop
Authorization: Bearer <admin-token>
Content-Type: application/json

{
  "name": "Barbearia do Carlos",
  "document": "12.345.678/0001-99",
  "phone": "11988887777",
  "address": "Rua das Flores, 123",
  "latitude": -23.5505,
  "longitude": -46.6333
}
```

Save the `id` from the response (`barbershopId`).

### Step 4 — Create a Barber (admin only)

```http
POST /barber
Authorization: Bearer <admin-token>
Content-Type: application/json

{
  "name": "Carlos Barbeiro",
  "document": "987.654.321-00",
  "phone": "11977776666",
  "email": "carlos@barbearia.com"
}
```

Save the `id` from the response (`barberId`).

### Step 5 — Associate Barber to Barbershop (admin only)

```http
POST /barbershop/{barbershopId}/barbers/{barberId}
Authorization: Bearer <admin-token>
```

No body required. The barber is now linked to the barbershop.

### Step 6 — Create a Service (admin only)

```http
POST /service
Authorization: Bearer <admin-token>
Content-Type: application/json

{
  "name": "Corte de Cabelo",
  "type": "hair",
  "price": 35.00,
  "durationMinutes": 30,
  "barberShopId": "{barbershopId}"
}
```

Save the `id` from the response (`serviceId`).

### Step 7 — Book an Appointment (authenticated user)

```http
POST /scheduling
Authorization: Bearer <user-token>
Content-Type: application/json

{
  "date": "2026-03-15T10:00:00.000Z",
  "userId": "{userId}",
  "barberId": "{barberId}",
  "barberShopId": "{barbershopId}",
  "serviceId": "{serviceId}"
}
```

The API checks for **time conflicts** — if the barber is already booked within the service duration window, a `409 Conflict` is returned.

### Step 8 — View Your Schedulings

```http
GET /scheduling?take=10&skip=0
Authorization: Bearer <user-token>
```

A regular `user` will automatically see **only their own** schedulings. An `admin` sees all.

---

## 3. Rate Limiting

The API enforces two rate limits:

| Endpoint | Limit | Window |
|----------|-------|--------|
| All routes (global) | 60 requests | 60 seconds |
| `POST /auth` (login) | 5 requests | 60 seconds |

When the limit is exceeded, the API returns:

```http
HTTP/1.1 429 Too Many Requests

{
  "statusCode": 429,
  "message": "ThrottlerException: Too Many Requests",
  "error": "Too Many Requests",
  "timestamp": "2026-03-15T10:00:00.000Z",
  "path": "/auth"
}
```

**Brute-force protection:** After 5 failed login attempts within 60 seconds, subsequent attempts return `429` regardless of credentials.

---

## 4. Soft Delete

All `DELETE` endpoints in this API perform a **soft delete** — records are **never physically removed** from the database.

### What happens on DELETE:

1. `active` field is set to `false`
2. `deletedAt` is populated with the current timestamp
3. TypeORM automatically excludes the record from all `find*` queries via `@DeleteDateColumn`

### Example — Delete a user:

```http
DELETE /user/{userId}
Authorization: Bearer <token>
```

**Response:** `200 OK` (or `204 No Content`)

The user record still exists in the database but will no longer appear in `GET /user` or any other listing query.

> **Note:** Soft-deleting a scheduling also sets its `status` to `cancelled`.

---

## 5. Scheduling Status

Appointments follow a defined status lifecycle:

```
PENDING → CONFIRMED → COMPLETED
                    → CANCELLED
                    → NO_SHOW
```

| Status | Description |
|--------|-------------|
| `pending` | Default status when a scheduling is created |
| `confirmed` | Barber/admin confirmed the appointment |
| `completed` | Appointment was successfully completed |
| `cancelled` | Appointment was cancelled (also set on soft delete) |
| `no_show` | Customer did not show up |

### Updating Status

```http
PUT /scheduling/{schedulingId}
Authorization: Bearer <token>
Content-Type: application/json

{
  "status": "confirmed"
}
```

### Filtering by Status

```http
GET /scheduling?status=pending
GET /scheduling?status=confirmed
GET /scheduling?status=completed&barberId={barberId}
```

---

## 6. Role-Based Access Control (RBAC)

### Schedulings (RBAC-filtered)

When listing or retrieving schedulings, the API automatically filters based on the requester's role:

| Role | Sees |
|------|------|
| `admin` | All schedulings in the system |
| `barber` | All schedulings assigned to them |
| `user` | Only their own schedulings |

A `user` cannot pass a `userId` filter to see other users' schedulings — the filter is silently overridden by their own ID.

### Protected Endpoints Summary

| Action | Requires Role |
|--------|--------------|
| Create/Edit/Delete barbershops | `admin` |
| Create/Edit/Delete barbers | `admin` |
| Associate barber to barbershop | `admin` |
| Create/Edit/Delete services | `admin` |
| List/manage all schedulings | `admin` |
| Create scheduling | Any authenticated user |
| View own scheduling | `user`, `barber`, `admin` |
| Update own profile | Any authenticated user |

---

## 7. Validations

### Document Validation

| Field | Entity | Validation |
|-------|--------|------------|
| `document` | User | CPF (Cadastro de Pessoas Físicas) — full digit verifier algorithm |
| `document` | Barber | CPF — full digit verifier algorithm |
| `document` | Barbershop | CNPJ (Cadastro Nacional da Pessoa Jurídica) — full digit verifier algorithm |

**Valid CPF format examples:** `123.456.789-09` or `12345678909`
**Valid CNPJ format examples:** `12.345.678/0001-99` or `12345678000199`

Invalid documents return `400 Bad Request` with a descriptive message.

### Service Validation

| Field | Rule |
|-------|------|
| `price` | Number, minimum `0` |
| `durationMinutes` | Integer, minimum `1`, optional (defaults to `60` for conflict detection) |
| `type` | Enum: `hair`, `beard`, `eyebrow`, `skincare`, `other` |

### Scheduling Conflict Detection

When creating a scheduling, the API verifies:

1. Loads the selected service to get its `durationMinutes` (defaults to 60 if not set)
2. Calculates `endTime = date + durationMinutes`
3. Queries the database for existing schedulings of the same barber in the same barbershop where the time windows overlap
4. If a conflict is found, returns `409 Conflict`

---

## 8. Standardized Error Responses

All errors follow a consistent response format:

```json
{
  "statusCode": 400,
  "message": ["document must be a valid CPF"],
  "error": "Bad Request",
  "timestamp": "2026-03-15T10:00:00.000Z",
  "path": "/user"
}
```

| Field | Description |
|-------|-------------|
| `statusCode` | HTTP status code |
| `message` | Array of error messages (or single string for some errors) |
| `error` | HTTP error name |
| `timestamp` | ISO 8601 timestamp of when the error occurred |
| `path` | The endpoint that triggered the error |

### Common Error Codes

| Code | Meaning |
|------|---------|
| `400` | Validation failed — check `message` array for details |
| `401` | Missing or invalid JWT token |
| `403` | Authenticated but insufficient role |
| `404` | Resource not found |
| `409` | Conflict — e.g., scheduling time conflict or duplicate entry |
| `429` | Too Many Requests — rate limit exceeded |
| `500` | Internal server error |

---

## 9. Health Check

The `GET /health` endpoint is **public** (no authentication required) and checks two things:

```http
GET /health
```

**Response (200 OK — healthy):**

```json
{
  "status": "ok",
  "info": {
    "database": { "status": "up" },
    "memory_heap": { "status": "up" }
  },
  "error": {},
  "details": {
    "database": { "status": "up" },
    "memory_heap": { "status": "up" }
  }
}
```

**Response (503 Service Unavailable — unhealthy):**

```json
{
  "status": "error",
  "info": {
    "database": { "status": "up" }
  },
  "error": {
    "memory_heap": {
      "status": "down",
      "message": "Heap used (350 MB) exceeds threshold (300 MB)"
    }
  }
}
```

| Check | Threshold |
|-------|-----------|
| Database | PostgreSQL ping must succeed |
| Memory Heap | Must be under **300 MB** |

Use this endpoint for load balancer health checks or uptime monitoring.

---

## 10. Importing the Postman Collection

A ready-to-use Postman collection is located in this folder: `docs/AppBarbearia.postman_collection.json`.

### Steps to Import

1. Open **Postman**
2. Click **Import** (top-left)
3. Select **File** and choose `docs/AppBarbearia.postman_collection.json`
4. Click **Import**

### Setting Up Variables

After importing, configure the collection variables:

1. Click the collection name **AppBarbearia**
2. Go to the **Variables** tab
3. Fill in the current values:

| Variable | Description | Example |
|----------|-------------|---------|
| `baseUrl` | API base URL | `http://localhost:3000` |
| `bearerToken` | JWT token from login | *(paste after logging in)* |
| `userId` | UUID of a user | *(fill after creating user)* |
| `barberId` | UUID of a barber | *(fill after creating barber)* |
| `barberShopId` | UUID of a barbershop | *(fill after creating barbershop)* |
| `serviceId` | UUID of a service | *(fill after creating service)* |
| `schedulingId` | UUID of a scheduling | *(fill after creating scheduling)* |

### Recommended Workflow

1. Run **POST Login** → copy the `token` value → paste into `bearerToken` variable
2. Run **POST Create Barber Shop** → copy the `id` → paste into `barberShopId`
3. Run **POST Create Barber** → copy the `id` → paste into `barberId`
4. Run **POST Associate Barber to Barbershop** (uses both IDs above)
5. Run **POST Create Service** → copy the `id` → paste into `serviceId`
6. Run **POST Create Scheduling** → copy the `id` → paste into `schedulingId`
7. All other requests (GET, PUT, DELETE) will use the variables automatically

> **Tip:** All `DELETE` requests in the collection perform a **soft delete** — the record is preserved in the database but excluded from future queries.

---

## Additional Resources

- **Swagger UI:** [http://localhost:3000/api](http://localhost:3000/api) — interactive API docs with Bearer auth support
- **Root README:** [`../README.md`](../README.md) — full project documentation (architecture, tech stack, getting started)
- **Source code:** [`../src/`](../src/) — NestJS module structure
