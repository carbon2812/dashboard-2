# Nova - Fintech Expense Management Dashboard

A modern, high-performance Fintech Expense Management Dashboard engineered with **Next.js 14 (App Router)**, **TypeScript**, **Tailwind CSS**, and **Framer Motion**, featuring custom expense categories, Google Drive cloud bill synchronization, rich analytics, and a standalone **Node.js + Express** server.

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
  - Microsoft Word (.docx) document inspector with direct Google Drive view & download links.

### 3. Google Drive API Integration
- **Cloud Bill Storage**: Automatically uploads receipts to Google Drive storage via Google Drive API v3 (`googleapis`).
- **File Metadata & Links**: Stores Google Drive File ID, webViewLink, webContentLink, and thumbnail previews in database.
- **Zero-Config Simulated Mode**: Functions seamlessly out-of-the-box without requiring API keys, with an instant toggle and status indicator in Settings.
- **Live Google Drive Setup**: Connect your real Google Cloud OAuth2 credentials or Service Account directly via `.env.local`.

### 4. Financial Analytics & Dashboards
- **Overview Metrics**: Total Expenses (YTD), Current Month Spent, Verified Bill Receipts, and Average Transaction Value with monthly growth percentages.
- **Category-Wise Breakdown**: Interactive Donut chart powered by Recharts with custom tooltips, legend, and expenditure percentages.
- **Spending Velocity Trends**: Area curve comparing current and prior period disbursements with a Monthly vs. Weekly view toggle.
- **Recent Disbursements**: Quick access table with in-line bill inspection, edit, and delete triggers.

### 5. Advanced Ledger & Search
- **Search & Multi-Filters**: Filter by text, category, date range, payment method, or bill attachment existence.
- **Dual View Modes**: Switch between high-density data Table view and modern responsive Grid cards.
- **Export to CSV**: Instant one-click CSV export of filtered transactions and receipt links.

---

## Tech Stack

| Layer | Technologies |
|---|---|
| **Frontend** | Next.js 14 (App Router), React 18, TypeScript, Tailwind CSS, Framer Motion, Lucide Icons, Recharts, Canvas Confetti |
| **Backend** | Next.js Route Handlers + Standalone Node.js Express server (`server/index.ts`) |
| **Database** | Flexible Hybrid DB: Persistent local store + MongoDB / Mongoose support |
| **File Storage** | Google Drive API (`googleapis`) with local preview fallback |

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
The Express server will start on port `5000` (or `PORT` specified in `.env.local`).

---

## Configuration (`.env.local`)

```env
# Optional: MongoDB Connection (Leave empty to use automatic persistent demo storage)
MONGODB_URI=mongodb://localhost:27017/fintech_expenses

# Optional: Google Drive API (Leave empty for instant simulated Drive mode)
GOOGLE_DRIVE_CLIENT_ID=your_client_id.apps.googleusercontent.com
GOOGLE_DRIVE_CLIENT_SECRET=your_client_secret
GOOGLE_DRIVE_REFRESH_TOKEN=your_refresh_token
GOOGLE_DRIVE_FOLDER_ID=your_target_folder_id

# Server Port for Standalone Express API
PORT=5000
```

---

## Folder Structure

```
custom dashboard/
├── public/
│   └── uploads/                  # Local preview storage for bill receipts
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── categories/       # Category CRUD endpoints
│   │   │   ├── expenses/         # Expense CRUD & filtering endpoints
│   │   │   ├── upload/           # Bill upload handler (Google Drive)
│   │   │   ├── stats/            # Financial analytics & aggregations
│   │   │   ├── drive/status/     # Google Drive status check
│   │   │   └── reset/            # Reset demo transactions
│   │   ├── dashboard/            # Executive dashboard overview & charts
│   │   ├── expenses/             # Expense ledger with filters & CSV export
│   │   ├── categories/           # Custom category builder & budget tracker
│   │   ├── settings/             # Google Drive connection & profile
│   │   ├── globals.css           # Clean light theme stylesheet
│   │   └── layout.tsx            # Root layout with ToastProvider
│   ├── components/
│   │   ├── charts/               # Recharts Donut & Area trends
│   │   ├── modals/               # Add/Edit Expense, BillViewer, CategoryModal
│   │   ├── ui/                   # CategoryPill, Badge, Skeleton, EmptyState, Toast
│   │   ├── Sidebar.tsx           # Collapsible light theme navigation
│   │   ├── Header.tsx            # Top header with quick action & Drive pill
│   │   ├── ExpenseTable.tsx      # Clean ledger table
│   │   ├── ExpenseCard.tsx       # Responsive transaction cards
│   │   └── ExpenseFilters.tsx    # Filter bar
│   ├── context/
│   │   └── ToastContext.tsx      # Toast notifications
│   ├── lib/
│   │   ├── db.ts                 # Database abstraction & analytics engine
│   │   ├── drive.ts              # Google Drive integration service
│   │   ├── icons.ts              # Category icons and color palette
│   │   └── utils.ts              # Currency, date, file formatting & CSV export
│   └── types/
│       └── index.ts              # TypeScript definitions
├── server/
│   └── index.ts                  # Standalone Express server
├── tailwind.config.ts            # Fintech design system & tokens
└── tsconfig.json
```
