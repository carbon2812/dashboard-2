# Expense Tracker - Cloud Spend Management Dashboard

A modern, high-performance Expense Tracker Dashboard cleanly organized into dedicated **frontend** and **backend** folders. Engineered with **Next.js 14**, **Node.js Express**, **Prisma ORM (PostgreSQL)**, **VPS Local Receipt Storage**, and **Swagger OpenAPI 3.0 Documentation**.

---

## Architecture Overview

```
expense-tracker/
├── frontend/                     # Next.js 14 Client Application (Port 3000)
│   ├── src/
│   │   ├── app/                  # App Router: Dashboard, Expenses, Categories, Settings, API Docs
│   │   ├── components/           # UI Components, Charts, Filters, Modals, Sidebar
│   │   ├── context/              # Toast & Global State Providers
│   │   ├── lib/                  # Icons, Utils, Swagger UI helpers
│   │   └── types/                # Shared TypeScript Interfaces
│   ├── next.config.mjs           # Next.js Rewrites (Proxies /api/* -> Express Backend)
│   ├── tailwind.config.ts        # Tailwind CSS Configuration
│   ├── package.json              # Frontend Dependencies & Scripts
│   └── .env.local                # Frontend Environment Variables
│
├── backend/                      # Standalone Express Server & Prisma ORM (Port 5001)
│   ├── src/
│   │   ├── server.ts             # Express Application & REST Endpoints
│   │   ├── prisma.ts             # Prisma Database Client
│   │   ├── db.ts                 # Database Service Layer with Seeding
│   │   ├── upload.ts             # Multer Disk Storage & 10MB Validation
│   │   └── swagger.ts            # OpenAPI 3.0 Specifications & Swagger Documentation
│   ├── prisma/
│   │   ├── schema.prisma         # Prisma Schema (PostgreSQL Category, Expense, Attachment)
│   │   └── seed.ts               # Database Seeding Script
│   ├── uploads/                  # VPS Persistent Receipt Storage (/uploads)
│   ├── package.json              # Backend Dependencies & Scripts
│   └── .env                      # Backend Database & Upload Configuration
│
├── docker-compose.yml            # Docker Orchestration (Postgres + Backend + Frontend)
├── package.json                  # Root Monorepo Runner
└── README.md
```

---

## Key Features

### 1. Distinct Frontend & Backend
- **Separation of Concerns**: Frontend and Backend have separate `package.json`, TypeScript configurations, dependencies, and environment files.
- **Proxy Configuration**: Frontend uses Next.js `rewrites` to seamlessly proxy `/api/*` requests to the Express backend on `http://localhost:5001`.

### 2. Prisma ORM & Database Layer
- **Prisma Schema (`backend/prisma/schema.prisma`)**: Strongly typed models for `Category`, `Expense`, and `Attachment`.
- **Database Resilience**: Connects to PostgreSQL via `DATABASE_URL` with automated fallback to `data/db.json` if PostgreSQL is offline, ensuring zero downtime during development.
- **Database Seeding**: Run `npm run prisma:seed` to seed default business categories.
- **Prisma Studio**: Inspect and manage database records visually via `npm run prisma:studio`.

### 3. VPS Local Storage (PDF & Images)
- **Local Disk Storage**: Bill receipts (JPG, PNG, WebP, PDF) uploaded directly to `backend/uploads/` via Multer.
- **Docker Volume Persistence**: Volume mapping `./backend/uploads:/app/uploads` guarantees zero file loss across restarts.
- **File Validation**: 10MB maximum file size limit with strict MIME type checking.
- **Public URL Access**: Files served directly at `/uploads/:filename`.

### 4. Interactive Swagger / OpenAPI Documentation
- **API Sandbox**: Full OpenAPI 3.0 specification available at `/api/docs` and interactive Swagger UI at [http://localhost:3000/api-docs](http://localhost:3000/api-docs).
- Complete request/response schemas for all 18 endpoints.

### 5. Financial Dashboard & Custom Categories
- **Analytics & Trends**: Recharts Donut category breakdown and spending velocity area curves.
- **Custom Categories**: Color tags, Lucide icons, and monthly budget ceilings with progress bars.
- **Advanced Ledger**: Multi-filter search, CSV export, and Table vs. Grid view toggling.

---

## Quick Start with Docker (Recommended)

Run PostgreSQL, the Express Backend API, and the Next.js Frontend with a single command:

```bash
# Build and start all 3 containers in background
docker compose up -d --build
# or: npm run docker:up
```

### Running Containers:
- **Frontend Dashboard**: [http://localhost:3000](http://localhost:3000)
- **Backend Express API**: [http://localhost:5001](http://localhost:5001)
- **Swagger Documentation**: [http://localhost:3000/api-docs](http://localhost:3000/api-docs)
- **PostgreSQL Database**: Port `5434` (mapped to container port `5432`)
  - Connection URL for GUI tools (DBeaver / pgAdmin / TablePlus):
    `postgresql://postgres:postgres@localhost:5434/expense_tracker?schema=public`

### Useful Docker Commands:
```bash
# View live logs of all containers
npm run docker:logs
# or: docker compose logs -f

# View logs for a specific service
docker logs -f expense_tracker_backend
docker logs -f expense_tracker_frontend
docker logs -f expense_tracker_postgres

# Stop all containers
npm run docker:down
# or: docker compose down
```

---

## Local Development (Without Docker)

If you prefer running services directly on your host machine:

### 1. Install All Dependencies
To install dependencies for root, frontend, and backend simultaneously:
```bash
npm run install:all
```

### 2. Run Both Services Concurrently
From the root directory:
```bash
npm run dev
```
This runs:
- **Backend (Express + Prisma)**: [http://localhost:5001](http://localhost:5001)
- **Frontend (Next.js Dashboard)**: [http://localhost:3000](http://localhost:3000)

### 3. Run Services Individually
- **Run Backend only**:
  ```bash
  npm run dev:backend
  # or: cd backend && npm run dev
  ```
- **Run Frontend only**:
  ```bash
  npm run dev:frontend
  # or: cd frontend && npm run dev
  ```

---

## Prisma Commands

Manage the database directly using root convenience scripts:
```bash
# Generate Prisma Client
npm run prisma:generate

# Push schema changes to PostgreSQL database
npm run prisma:push

# Seed database with sample categories and expenses
npm run prisma:seed

# Launch Prisma Studio GUI
npm run prisma:studio
```

---

## Environment Variables

### Backend (`backend/.env`)
```env
PORT=5001
DATABASE_URL="postgresql://postgres:postgres@localhost:5434/expense_tracker?schema=public"
UPLOAD_DIR=./uploads
```

### Frontend (`frontend/.env.local`)
```env
NEXT_PUBLIC_APP_URL=http://localhost:3000
BACKEND_API_URL=http://localhost:5001
```
