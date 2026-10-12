# Expense Tracker - Cloud Spend Management Dashboard

A modern, high-performance Expense Tracker Dashboard engineered with **Next.js 14 (App Router)**, **TypeScript**, **Tailwind CSS**, and **Framer Motion**, featuring custom expense categories, Cloudinary receipt storage, rich analytics, and a standalone **Node.js + Express** server.

---

## Key Features

### 1. Custom Category Management
- **Full Custom Categories**: Create custom business categories (e.g. *Tech & SaaS*, *Marketing & Ads*, *Business Travel*, *Client Entertainment*, *Office & Facilities*, *Legal & Compliance*).
- **Visual Color & Icon Picker**: Customize each category with dedicated color tags and Lucide icon symbols.
- **Budget Tracking**: Assign monthly budget ceilings and track real-time utilization progress bars with over-budget alerts.

### 2. Comprehensive Expense Tracking
- **Expense Records**: Amount, category, date, payee/merchant, payment method (Corporate Card, Wire Transfer, ACH, Reimbursement, Petty Cash), and business justification notes.
- **Multi-Format Bill Attachment**: Support for **JPG**, **PNG**, **PDF**, and **DOCX** invoice documents.
- **Drag & Drop Uploads**: Interactive upload area with instant preview and progress indicator.
- **In-App Bill Previewer Modal**:
  - Image viewer with zoom and high resolution fit.
  - Interactive embedded PDF document viewer.
  - Microsoft Word (.docx) document inspector with direct cloud download links.

### 3. Cloudinary Media & Receipt Storage
- **Cloud Receipt Storage**: Automatically uploads receipts to Cloudinary media cloud with auto-optimization (WebP/AVIF format and responsive quality).
- **File Metadata & URLs**: Stores Cloudinary Public ID, secure CDN URL, and thumbnail previews in database.
- **Zero-Config Resilient Fallback**: Functions seamlessly out-of-the-box with local receipt storage if API secret is pending, with instant health status in Settings.
- **Live Cloudinary Setup**: Preconfigured with Cloud Name (`rgukte0l`) and API Key (`773645529246291`), with quick secret entry in `.env`.

### 4. Financial Analytics & Dashboards
- **Overview Metrics**: Total Expenses (YTD), Current Month Spent, Verified Bill Receipts, and Average Transaction Value with monthly growth percentages.
- **Category-Wise Breakdown**: Interactive Donut chart powered by Recharts with custom tooltips, legend, and expenditure percentages.
- **Spending Velocity Trends**: Area curve comparing current and prior period disbursements with a Monthly vs. Weekly view toggle.
- **Recent Disbursements**: Quick access table with in-line bill inspection, edit, and delete triggers.

### 5. Advanced Ledger & Search
- **Search & Multi-Filters**: Filter by text, category, date range, payment method, or bill attachment existence.
- **Dual View Modes**: Switch between high-density data Table view and modern responsive Grid cards.
- **Export to CSV**: Instant one-click CSV export of filtered transactions and receipt links.

### 6. Swagger & OpenAPI 3.0 Documentation
- **Interactive Swagger UI**: Explore and test all 18 endpoints directly in the browser at `/api-docs`.
- **OpenAPI 3.0 Specification**: Machine-readable JSON spec exposed at `/api/docs` and `/api/swagger.json`.
- **In-Browser Sandbox**: "Try it out" live query testing with parameters, request bodies, and curl generation.
- **Full Schema Definitions**: Complete type contracts for `User`, `Expense`, `ExpenseCategory`, `ExpenseAttachment`, `DashboardStats`, and `CloudinaryStatus`.

---

## Tech Stack

| Layer | Technologies |
|---|---|
| **Frontend** | Next.js 14 (App Router), React 18, TypeScript, Tailwind CSS, Framer Motion, Lucide Icons, Recharts, Canvas Confetti |
| **Backend** | Next.js Route Handlers + Standalone Node.js Express server (`server/index.ts`) |
| **Database** | Flexible Hybrid DB: Persistent local store + MongoDB / Mongoose support |
| **File Storage** | Cloudinary API with local preview fallback |

---

## Getting Started

### 1. Installation
Dependencies are already installed. If running fresh:
```bash
npm install
```

### 2. Run the Development Server
To launch the Next.js fullstack dashboard:
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 3. Run the Standalone Express Server (Optional)
If you prefer running the independent Node.js Express backend API:
```bash
npm run server
```
The Express server will start on port `5000` (or `PORT` specified in `.env`).

---

## Configuration (`.env`)

```env
# Cloudinary Media & Bill Storage Configuration
CLOUDINARY_CLOUD_NAME=rgukte0l
CLOUDINARY_API_KEY=773645529246291
CLOUDINARY_API_SECRET=your_api_secret_here

# Optional: MongoDB Connection (Leave empty to use automatic persistent store in data/db.json)
# MONGODB_URI=mongodb://localhost:27017/expense_tracker

# Server Port for Standalone Express API
PORT=5000
```

---

## Folder Structure

```
expense-tracker/
├── public/
│   └── uploads/                  # Local preview storage for bill receipts
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── categories/       # Category CRUD endpoints
│   │   │   ├── expenses/         # Expense CRUD & filtering endpoints
│   │   │   ├── upload/           # Bill upload handler (Cloudinary)
│   │   │   ├── stats/            # Financial analytics & aggregations
│   │   │   ├── cloudinary/status/# Cloudinary storage status check
│   │   │   └── reset/            # Reset demo transactions
│   │   ├── dashboard/            # Executive dashboard overview & charts
│   │   ├── expenses/             # Expense ledger with filters & CSV export
│   │   ├── categories/           # Custom category builder & budget tracker
│   │   ├── settings/             # Cloudinary storage connection & profile
│   │   ├── globals.css           # Clean light theme stylesheet
│   │   └── layout.tsx            # Root layout with ToastProvider
│   ├── components/
│   │   ├── charts/               # Recharts Donut & Area trends
│   │   ├── modals/               # Add/Edit Expense, BillViewer, CategoryModal
│   │   ├── ui/                   # CategoryPill, Badge, Skeleton, EmptyState, Toast
│   │   ├── Sidebar.tsx           # Collapsible light theme navigation
│   │   ├── Header.tsx            # Top header with quick action & Cloud pill
│   │   ├── ExpenseTable.tsx      # Clean ledger table
│   │   ├── ExpenseCard.tsx       # Responsive transaction cards
│   │   └── ExpenseFilters.tsx    # Filter bar
│   ├── context/
│   │   ├── AuthContext.tsx       # Authentication & user profile
│   │   └── ToastContext.tsx      # Toast notifications
│   ├── lib/
│   │   ├── db.ts                 # Database abstraction & analytics engine
│   │   ├── cloudinary.ts         # Cloudinary media storage integration
│   │   ├── icons.ts              # Category icons and color palette
│   │   └── utils.ts              # Currency, date, file formatting & CSV export
│   └── types/
│       └── index.ts              # TypeScript definitions
├── server/
│   └── index.ts                  # Standalone Express server
├── tailwind.config.ts            # Fintech design system & tokens
└── tsconfig.json
```
