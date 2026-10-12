# Expense Tracker - Cloud Spend Management Dashboard

A modern, high-performance Expense Tracker Dashboard cleanly organized into dedicated **frontend** and **backend** folders. Engineered with **Next.js 14**, **Node.js Express**, **Prisma ORM (PostgreSQL)**, **Cloudinary Receipt Storage**, and **Swagger OpenAPI 3.0 Documentation**.

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
│   │   ├── cloudinary.ts         # Cloudinary Receipt Upload & Storage
│   │   └── swagger.ts            # OpenAPI 3.0 Specifications & Swagger Documentation
│   ├── prisma/
│   │   ├── schema.prisma         # Prisma Schema (PostgreSQL Category, Expense, Attachment)
│   │   └── seed.ts               # Database Seeding Script
│   ├── data/
│   │   └── db.json               # Resilient Local JSON Database Fallback
│   ├── public/uploads/           # Local Receipt Preview Fallback
│   ├── package.json              # Backend Dependencies & Scripts
│   └── .env                      # Backend Database & Cloudinary Configuration
│
├── package.json                  # Root Monorepo Runner (Concurrently)
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
- **Database Seeding**: Run `npm run prisma:seed` to seed default business categories and demo disbursements.
- **Prisma Studio**: Inspect and manage database records visually via `npm run prisma:studio`.

### 3. Cloudinary Media & Receipt Storage
- **Automatic Receipt Optimization**: Bill receipts (JPG, PNG, PDF, DOCX) uploaded directly to Cloudinary media cloud with auto-compression.
- **In-App Receipt Viewer**: Image viewer with zoom, embedded PDF document preview, and DOCX download support.
- **Preconfigured Credentials**: Cloud Name (`rgukte0l`) and API Key (`773645529246291`) configured in `backend/.env`.

### 4. Interactive Swagger / OpenAPI Documentation
- **API Sandbox**: Full OpenAPI 3.0 specification available at `/api/docs` and interactive Swagger UI at [http://localhost:3000/api-docs](http://localhost:3000/api-docs) (or directly on backend at [http://localhost:5001/api-docs](http://localhost:5001/api-docs)).
- Complete request/response schemas for all 18 endpoints.

### 5. Financial Dashboard & Custom Categories
- **Analytics & Trends**: Recharts Donut category breakdown and spending velocity area curves.
- **Custom Categories**: Color tags, Lucide icons, and monthly budget ceilings with progress bars.
- **Advanced Ledger**: Multi-filter search, CSV export, and Table vs. Grid view toggling.

---

## Getting Started

### 1. Install All Dependencies
To install dependencies for root, frontend, and backend simultaneously:
```bash
npm run install:all
```

Or install them individually:
```bash
cd backend && npm install
cd ../frontend && npm install
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
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/expense_tracker?schema=public"

CLOUDINARY_CLOUD_NAME=rgukte0l
CLOUDINARY_API_KEY=773645529246291
CLOUDINARY_API_SECRET=your_api_secret_here
```

### Frontend (`frontend/.env.local`)
```env
NEXT_PUBLIC_APP_URL=http://localhost:3000
BACKEND_API_URL=http://localhost:5001
```
