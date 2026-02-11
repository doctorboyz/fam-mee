# Technical Architecture

**Project**: FamilyOS (FamMee)  
**Version**: 1.0  
**Last Updated**: 2026-02-05

---

## 📋 Table of Contents

1. [Technology Stack](#1-technology-stack)
2. [System Architecture](#2-system-architecture)
3. [Database Schema](#3-database-schema)
4. [API Design](#4-api-design)
5. [Authentication & Authorization](#5-authentication--authorization)
6. [Deployment](#6-deployment)

> **Related Documents**:
>
> - [REQUIREMENTS.md](file:///Users/mac/Desktop/fam-mee/documents/REQUIREMENTS.md) - Business requirements
> - [DESIGN.md](file:///Users/mac/Desktop/fam-mee/documents/DESIGN.md) - UI/UX design
> - [WORKFLOWS.md](file:///Users/mac/Desktop/fam-mee/documents/WORKFLOWS.md) - User workflows

---

## 1. Technology Stack

### 1.1 Frontend

- **Framework**: Next.js 14+ (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Components**: Shadcn UI
- **State Management**: React Context + Zustand
- **PWA**: next-pwa plugin
- **Forms**: React Hook Form + Zod validation

### 1.2 Backend

- **Language**: Go 1.21+
- **Framework**: Fiber (Express-like for Go)
- **ORM**: GORM
- **Authentication**: JWT tokens
- **Validation**: Go Validator

### 1.3 Database

- **Primary**: PostgreSQL 15+
- **Features Used**:
  - JSONB columns for flexible data
  - Partial indexes
  - Row-level security (future)

### 1.4 Infrastructure

- **Containerization**: Docker + Docker Compose
- **CI/CD**: GitHub Actions
- **Hosting**:
  - Frontend: Vercel
  - Backend: Railway / Fly.io
  - Database: Supabase / Neon

---

## 2. System Architecture

### 2.1 High-Level Overview

```
┌──────────────────────────────────────────┐
│          Client (PWA)                    │
│  Next.js + TypeScript + Tailwind         │
└─────────────────┬────────────────────────┘
                  │
                  │ HTTPS / WebSocket
                  │
┌─────────────────▼────────────────────────┐
│         API Gateway                      │
│      Go Fiber + JWT Auth                 │
└─────────────────┬────────────────────────┘
                  │
      ┌───────────┼───────────┐
      │           │           │
      ▼           ▼           ▼
┌──────────┐ ┌─────────┐ ┌─────────┐
│  Auth    │ │ Trans   │ │ Event   │
│  Service │ │ Service │ │ Service │
└────┬─────┘ └────┬────┘ └────┬────┘
     │            │           │
     └────────────┼───────────┘
                  │
┌─────────────────▼────────────────────────┐
│         PostgreSQL Database              │
│  Users, Transactions, Events, Assets     │
└──────────────────────────────────────────┘
```

### 2.2 Frontend Architecture

```
/app
├── (auth)
│   ├── login
│   ├── register
│   └── select-profile
├── (dashboard)
│   ├── dashboard
│   ├── wallet
│   ├── tasks
│   ├── calendar
│   └── settings
├── components/
│   ├── ui/ (shadcn)
│   ├── shared/
│   └── features/
├── lib/
│   ├── api/
│   ├── hooks/
│   └── utils/
└── types/
```

### 2.3 Backend Architecture

```
/backend
├── cmd/
│   └── api/
│       └── main.go
├── internal/
│   ├── handlers/      (HTTP controllers)
│   ├── services/      (Business logic)
│   ├── models/        (Database models)
│   ├── middlewares/   (Auth, logging)
│   └── utils/
├── migrations/
└── docker-compose.yml
```

---

## 3. Database Schema

### 3.1 Core Tables

#### users

```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  parent_user_id UUID REFERENCES users(id), -- for sub-profiles
  family_id UUID REFERENCES families(id),
  role VARCHAR(50) NOT NULL, -- ADMIN, MEMBER, CHILD_YOUNG, etc.
  name VARCHAR(255) NOT NULL,
  avatar_url TEXT,
  pin_hash VARCHAR(255), -- for profile PIN
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_users_family ON users(family_id);
CREATE INDEX idx_users_parent ON users(parent_user_id);
```

#### families

```sql
CREATE TABLE families (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  invite_code VARCHAR(20) UNIQUE,
  settings JSONB, -- family-level settings
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

#### accounts

```sql
CREATE TABLE accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  family_id UUID REFERENCES families(id) NOT NULL,
  owner_user_id UUID REFERENCES users(id) NOT NULL,
  name VARCHAR(255) NOT NULL,
  type VARCHAR(50) NOT NULL, -- CASH, BANK, CREDIT, INVESTMENT
  currency VARCHAR(10) DEFAULT 'THB',
  icon_emoji VARCHAR(10),
  balance DECIMAL(15, 2) DEFAULT 0,
  visibility VARCHAR(20) DEFAULT 'FAMILY', -- PRIVATE, FAMILY
  shared_with_users UUID[], -- array of user IDs
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_accounts_family ON accounts(family_id);
CREATE INDEX idx_accounts_owner ON accounts(owner_user_id);
```

#### transactions

```sql
CREATE TABLE transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  family_id UUID REFERENCES families(id) NOT NULL,
  type VARCHAR(50) NOT NULL, -- INCOME, EXPENSE, TRANSFER
  from_account_id UUID REFERENCES accounts(id),
  to_account_id UUID REFERENCES accounts(id),
  amount DECIMAL(15, 2) NOT NULL,
  planned_amount DECIMAL(15, 2),
  fee_amount DECIMAL(15, 2) DEFAULT 0,
  currency VARCHAR(10) DEFAULT 'THB',
  category_id UUID REFERENCES categories(id),
  event_id UUID REFERENCES events(id),
  project_id UUID REFERENCES projects(id),
  status VARCHAR(50) DEFAULT 'COMPLETED', -- PLANNED, PENDING, COMPLETED, CANCELLED, VOID
  description TEXT,
  transaction_date TIMESTAMP NOT NULL,
  created_by_user_id UUID REFERENCES users(id) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_transactions_family ON transactions(family_id);
CREATE INDEX idx_transactions_from_account ON transactions(from_account_id);
CREATE INDEX idx_transactions_to_account ON transactions(to_account_id);
CREATE INDEX idx_transactions_event ON transactions(event_id);
CREATE INDEX idx_transactions_date ON transactions(transaction_date);
```

#### transaction_edits

```sql
CREATE TABLE transaction_edits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_type VARCHAR(50) NOT NULL, -- 'transaction', 'event', 'account'
  entity_id UUID NOT NULL,
  edited_by_user_id UUID REFERENCES users(id) NOT NULL,
  changes JSONB NOT NULL, -- { field_name: { old_value, new_value } }
  reason TEXT,
  edited_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_edits_entity ON transaction_edits(entity_type, entity_id);
CREATE INDEX idx_edits_user ON transaction_edits(edited_by_user_id);
```

#### events

```sql
CREATE TABLE events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  family_id UUID REFERENCES families(id) NOT NULL,
  type VARCHAR(50) NOT NULL, -- GENERAL, TRIP, PROJECT, ROUTINE, TASK
  title VARCHAR(255) NOT NULL,
  description TEXT,
  start_date TIMESTAMP,
  end_date TIMESTAMP,
  location TEXT,
  budget DECIMAL(15, 2),
  actual_spent DECIMAL(15, 2) DEFAULT 0,
  status VARCHAR(50) DEFAULT 'PENDING', -- PENDING, SUBMITTED, APPROVED, REJECTED, COMPLETED
  assigned_to_user_id UUID REFERENCES users(id),
  created_by_user_id UUID REFERENCES users(id) NOT NULL,
  reward_points INTEGER DEFAULT 0,
  streak_count INTEGER DEFAULT 0,
  recurrence_rule JSONB, -- for routine events
  shared_with_users UUID[],
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_events_family ON events(family_id);
CREATE INDEX idx_events_assigned ON events(assigned_to_user_id);
CREATE INDEX idx_events_date ON events(start_date);
```

#### categories

```sql
CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  family_id UUID REFERENCES families(id) NOT NULL,
  name VARCHAR(255) NOT NULL,
  parent_category_id UUID REFERENCES categories(id),
  type VARCHAR(50) NOT NULL, -- INCOME, EXPENSE
  icon_emoji VARCHAR(10),
  jar_allocation VARCHAR(50), -- NEC, PLY, FFA, LTSS, EDU, GIV
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_categories_family ON categories(family_id);
CREATE INDEX idx_categories_parent ON categories(parent_category_id);
```

#### assets

```sql
CREATE TABLE assets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  family_id UUID REFERENCES families(id) NOT NULL,
  account_id UUID REFERENCES accounts(id) NOT NULL,
  asset_type VARCHAR(50) NOT NULL, -- FIAT, STOCK, CRYPTO, PROPERTY, FAMILY_POINT
  symbol VARCHAR(20), -- e.g., 'THB', 'BTC', 'AAPL'
  quantity DECIMAL(20, 8) NOT NULL,
  unit_cost DECIMAL(15, 2),
  current_value DECIMAL(15, 2),
  last_updated TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_assets_account ON assets(account_id);
```

#### media

```sql
CREATE TABLE media (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_type VARCHAR(50) NOT NULL, -- 'transaction', 'event', 'task'
  entity_id UUID NOT NULL,
  file_type VARCHAR(50) NOT NULL, -- IMAGE, VIDEO, DOCUMENT
  file_url TEXT NOT NULL,
  file_size INTEGER,
  uploaded_by_user_id UUID REFERENCES users(id) NOT NULL,
  uploaded_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_media_entity ON media(entity_type, entity_id);
```

---

## 4. API Design

### 4.1 Authentication Endpoints

```
POST /api/auth/register
POST /api/auth/login
POST /api/auth/logout
POST /api/auth/refresh
GET  /api/auth/profile
POST /api/auth/switch-profile
```

### 4.2 Transaction Endpoints

```
GET    /api/transactions
POST   /api/transactions
GET    /api/transactions/:id
PUT    /api/transactions/:id
DELETE /api/transactions/:id
GET    /api/transactions/:id/history   -- Edit logs
```

### 4.3 Account Endpoints

```
GET    /api/accounts
POST   /api/accounts
GET    /api/accounts/:id
PUT    /api/accounts/:id
DELETE /api/accounts/:id
POST   /api/accounts/:id/share        -- Share with users
DELETE /api/accounts/:id/share/:userId -- Unshare
```

### 4.4 Event Endpoints

```
GET    /api/events
POST   /api/events
GET    /api/events/:id
PUT    /api/events/:id
DELETE /api/events/:id
POST   /api/events/:id/share
GET    /api/events/:id/transactions   -- Transactions in event
```

### 4.5 Task Endpoints

```
GET    /api/tasks
POST   /api/tasks
PUT    /api/tasks/:id/complete
PUT    /api/tasks/:id/approve
PUT    /api/tasks/:id/reject
POST   /api/tasks/:id/media           -- Upload proof
```

---

## 5. Authentication & Authorization

### 5.1 JWT Token Structure

```json
{
  "user_id": "uuid",
  "family_id": "uuid",
  "role": "ADMIN",
  "profile_id": "uuid",
  "exp": 1234567890
}
```

### 5.2 Authorization Middleware

```go
func RequireRole(allowedRoles ...string) fiber.Handler {
  return func(c *fiber.Ctx) error {
    user := c.Locals("user").(*User)

    if !contains(allowedRoles, user.Role) {
      return c.Status(403).JSON(fiber.Map{
        "error": "Forbidden",
      })
    }

    return c.Next()
  }
}
```

### 5.3 Shared Resource Authorization

**Account Sharing Check**:

```go
func CanAccessAccount(user *User, account *Account) bool {
  // Owner can always access
  if account.OwnerUserID == user.ID {
    return true
  }

  // Check if shared
  if contains(account.SharedWithUsers, user.ID) {
    return true
  }

  // Admin can access family accounts
  if user.Role == "ADMIN" && account.FamilyID == user.FamilyID {
    return true
  }

  return false
}
```

**Transaction Editing Authorization**:

```go
func CanEditTransaction(user *User, transaction *Transaction, account *Account) bool {
  // Owner can edit their own
  if transaction.CreatedByUserID == user.ID {
    return true
  }

  // Shared account users can edit
  if contains(account.SharedWithUsers, user.ID) {
    return true
  }

  // Admin can edit family transactions
  if user.Role == "ADMIN" && transaction.FamilyID == user.FamilyID {
    return true
  }

  return false
}
```

### 5.4 Edit Logging Implementation

```go
func LogEdit(entityType string, entityID uuid.UUID, userID uuid.UUID, changes map[string]interface{}, reason string) error {
  edit := TransactionEdit{
    EntityType:      entityType,
    EntityID:        entityID,
    EditedByUserID:  userID,
    Changes:         changes,
    Reason:          reason,
    EditedAt:        time.Now(),
  }

  return db.Create(&edit).Error
}

// Usage
changes := map[string]interface{}{
  "amount": map[string]interface{}{
    "old_value": oldTransaction.Amount,
    "new_value": newTransaction.Amount,
  },
}

LogEdit("transaction", transaction.ID, user.ID, changes, "Corrected amount")
```

---

## 6. Deployment

### 6.1 Development Setup

#### Local Development with Hot Reload

The project uses **Air** for Go backend hot reload and Next.js dev server for frontend hot reload.

**Installation**:

```bash
# Install Air
make install-air

# Or manually
go install github.com/air-verse/air@latest
cd backend && air init
```

**Running the Development Environment**:

```bash
# Start both backend and frontend with hot reload
make dev

# Or individually
make backend   # Go backend with Air
make frontend  # Next.js dev server
```

**Air Configuration** (`.air.toml`):

- Watches `.go`, `.tpl`, `.tmpl`, `.html` files
- Auto-rebuilds on file changes
- Excludes test files and vendor directories
- Build artifacts in `backend/tmp/`

### 6.2 Monorepo Deployment Strategy

The project follows a **monorepo structure** with separate deployment targets for backend and frontend. This allows independent scaling and deployment while maintaining a single codebase.

#### Repository Structure

```
fam-mee/
├── backend/          ← Go Backend (Fiber + GORM)
│   ├── cmd/api/
│   ├── internal/
│   └── vercel.json
├── frontend/         ← Next.js Frontend
│   └── next.config.js
├── documents/
└── Makefile
```

#### Deployment Approach: Two Vercel Projects

Deploy both backend and frontend to Vercel as **separate projects** from the same repository:

**Step 1: Connect Repository**

- Import your Git repository into Vercel

**Step 2: Deploy Frontend Project**

- Create a new Vercel project
- **Root Directory**: `frontend`
- **Framework Preset**: Next.js (auto-detected)
- **Build Command**: `npm run build` (default)
- **Output Directory**: `.next` (default)

**Step 3: Deploy Backend Project**

- Create a second Vercel project using the same repository
- **Root Directory**: `backend`
- **Framework Preset**: Other
- Add `vercel.json` in the backend directory:

```json
{
  "version": 2,
  "builds": [
    {
      "src": "cmd/api/main.go",
      "use": "@vercel/go"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "cmd/api/main.go"
    }
  ]
}
```

**Step 4: Environment Variables**

Set environment variables for each project in Vercel dashboard:

**Frontend Project**:

```bash
NEXT_PUBLIC_API_URL=https://your-backend.vercel.app
```

**Backend Project**:

```bash
DATABASE_URL=postgresql://...
JWT_SECRET=your-secret-key
PORT=8080
ENVIRONMENT=production
```

#### Benefits of This Approach

✅ **Independent Deployment** - Deploy backend and frontend separately  
✅ **Independent Scaling** - Scale each service based on its needs  
✅ **Clear Separation** - Backend and frontend have distinct URLs  
✅ **Single Repository** - All code in one place for easier management  
✅ **Vercel Optimization** - Each project uses optimal Vercel features (Edge Functions for Next.js, Serverless Functions for Go)

#### Alternative: Railway/Fly.io for Backend

For more traditional backend deployment with persistent connections:

**Railway**:

```bash
# Install Railway CLI
npm install -g @railway/cli

# Deploy backend
cd backend
railway login
railway init
railway up
```

**Fly.io**:

```bash
# Install Fly CLI
curl -L https://fly.io/install.sh | sh

# Deploy backend
cd backend
fly launch
fly deploy
```

### 6.3 Docker Compose (Local Development)

```yaml
version: "3.8"

services:
  db:
    image: postgres:15-alpine
    environment:
      POSTGRES_DB: fammee
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

  backend:
    build: ./backend
    ports:
      - "8080:8080"
    environment:
      DATABASE_URL: postgres://postgres:postgres@db:5432/fammee
      JWT_SECRET: your-secret-key
    depends_on:
      - db

  frontend:
    build: ./frontend
    ports:
      - "3000:3000"
    environment:
      NEXT_PUBLIC_API_URL: http://localhost:8080
    depends_on:
      - backend

volumes:
  postgres_data:
```

### 6.4 Environment Variables

**Backend (.env)**:

```bash
DATABASE_URL=postgres://user:pass@host:5432/dbname
JWT_SECRET=your-jwt-secret-key
PORT=8080
ENVIRONMENT=production
```

**Frontend (.env.local)**:

```bash
NEXT_PUBLIC_API_URL=https://api.fammee.app
NEXT_PUBLIC_WS_URL=wss://api.fammee.app
```

### 6.5 Database Migrations

```bash
# Create migration
migrate create -ext sql -dir migrations -seq add_sharing_fields

# Run migrations
migrate -path migrations -database "postgres://..." up

# Rollback
migrate -path migrations -database "postgres://..." down 1
```

---

**Document Version**: 1.0  
**Last Updated**: 2026-02-05  
**Maintained By**: Engineering Team
