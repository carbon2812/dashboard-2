export interface ExpenseCategory {
  id: string;
  name: string;
  color: string; // e.g. '#6366f1' or custom hex
  icon: string;  // lucide icon identifier e.g. 'Laptop', 'Megaphone', 'Plane', etc.
  description?: string;
  budget?: number; // monthly budget in USD
  isDefault?: boolean;
  createdAt: string;
}

export interface ExpenseAttachment {
  id: string;
  name: string;
  mimeType: string;
  size: number;
  driveFileId?: string;
  driveViewLink?: string;
  driveDownloadLink?: string;
  thumbnailUrl?: string;
  localUrl?: string;
}

export type PaymentMethod = 'Corporate Card' | 'Wire Transfer' | 'ACH' | 'Reimbursement' | 'Petty Cash';
export type ExpenseStatus = 'Approved' | 'Pending Review' | 'Flagged';

export interface Expense {
  id: string;
  amount: number;
  currency: string;
  categoryId: string;
  category?: ExpenseCategory;
  date: string; // YYYY-MM-DD
  description: string;
  merchant?: string;
  paymentMethod: PaymentMethod;
  status: ExpenseStatus;
  attachment?: ExpenseAttachment | null;
  createdAt: string;
  updatedAt: string;
}

export interface CategoryBreakdownItem {
  categoryId: string;
  name: string;
  color: string;
  icon: string;
  total: number;
  count: number;
  percentage: number;
  budget?: number;
}

export interface MonthlyTrendItem {
  month: string;      // e.g. "May 2026" or "May"
  amount: number;
  previousYear?: number;
}

export interface WeeklyTrendItem {
  day: string;        // e.g. "Mon", "Tue", ...
  fullDate: string;   // "YYYY-MM-DD"
  amount: number;
}

export interface DashboardStats {
  totalExpenses: number;
  monthlyExpenses: number;
  monthlyGrowth: number;       // percentage compared to last month (e.g. +4.8 or -2.3)
  totalReceipts: number;
  averageExpense: number;
  budgetUtilization: number;   // overall percentage against total budgets
  categoryBreakdown: CategoryBreakdownItem[];
  monthlyTrends: MonthlyTrendItem[];
  weeklyTrends: WeeklyTrendItem[];
  recentExpenses: Expense[];
}

export interface DriveStatus {
  connected: boolean;
  mode: 'production' | 'simulated';
  email?: string;
  folderName: string;
  folderId?: string;
  quotaUsed?: string;
  quotaTotal?: string;
  message?: string;
}

export interface ExpenseFilterParams {
  search?: string;
  categoryId?: string;
  startDate?: string;
  endDate?: string;
  minAmount?: number;
  maxAmount?: number;
  paymentMethod?: string;
  hasAttachment?: boolean;
  sortBy?: 'date' | 'amount' | 'merchant';
  sortOrder?: 'asc' | 'desc';
}
