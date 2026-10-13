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
  url?: string;
  filename?: string;
  localUrl?: string;
  thumbnailUrl?: string;
}

export interface StorageStatus {
  provider: string;
  uploadDir: string;
  maxFileSize: string;
  allowedTypes: string[];
  totalFiles: number;
  message?: string;
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
  payrollStats?: PayrollStats;
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

export type UserRole =
  | 'Finance Director'
  | 'Senior Financial Analyst'
  | 'Executive Admin'
  | 'Risk & Compliance Auditor'
  | 'Team Member';

export interface User {
  id: string;
  name: string;
  email: string;
  role?: string;
  department?: string;
  avatar?: string;
  initials: string;
  createdAt: string;
  lastLogin?: string;
}

export interface StoredUser extends User {
  passwordHash: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
}

export interface AuthResponse {
  success: boolean;
  user?: User;
  token?: string;
  error?: string;
}

export type EmployeeStatus = 'Active' | 'On Leave' | 'Terminated';

export interface Employee {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  department: string;
  designation: string;
  baseSalary: number;
  status: EmployeeStatus;
  joinDate: string; // YYYY-MM-DD
  avatar?: string;
  createdAt: string;
  updatedAt?: string;
  salaryPayments?: SalaryPayment[];
}

export type SalaryStatus = 'Paid' | 'Pending';

export interface SalaryPayment {
  id: string;
  employeeId: string;
  employeeName?: string;
  department?: string;
  designation?: string;
  month: string; // YYYY-MM
  baseSalary: number;
  bonus: number;
  deductions: number;
  netSalary: number;
  paymentDate: string; // YYYY-MM-DD
  paymentMethod: string; // Bank Transfer, UPI, Cheque, Cash
  status: SalaryStatus;
  notes?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface PayrollStats {
  totalEmployees: number;
  activeEmployees: number;
  totalMonthlyPayroll: number;
  totalPaidThisMonth: number;
  pendingDisbursements: number;
  recentPayments: SalaryPayment[];
}
