import fs from 'fs';
import path from 'path';
import { prisma } from './prisma';
import {
  Expense,
  ExpenseCategory,
  DashboardStats,
  ExpenseFilterParams,
  CategoryBreakdownItem,
  MonthlyTrendItem,
  WeeklyTrendItem,
  Employee,
  SalaryPayment,
  PayrollStats,
} from './types';

export { prisma };

// Initial Mock Seed Data
const DEFAULT_CATEGORIES: ExpenseCategory[] = [
  {
    id: 'cat_tech',
    name: 'Tech & SaaS',
    color: '#6366f1',
    icon: 'Laptop',
    description: 'Cloud infrastructure, software licenses, developer tooling',
    budget: 550000,
    isDefault: true,
    createdAt: '2026-01-15T09:00:00.000Z',
  },
  {
    id: 'cat_marketing',
    name: 'Marketing & Ads',
    color: '#f43f5e',
    icon: 'Megaphone',
    description: 'Paid acquisition, design assets, brand sponsorship',
    budget: 680000,
    isDefault: true,
    createdAt: '2026-01-15T09:00:00.000Z',
  },
  {
    id: 'cat_travel',
    name: 'Business Travel',
    color: '#0ea5e9',
    icon: 'Plane',
    description: 'Flights, hotel lodging, client on-site visits',
    budget: 380000,
    isDefault: true,
    createdAt: '2026-01-15T09:00:00.000Z',
  },
  {
    id: 'cat_office',
    name: 'Office & Facilities',
    color: '#10b981',
    icon: 'Building2',
    description: 'Workspace lease, high-speed fiber, office supplies',
    budget: 290000,
    isDefault: true,
    createdAt: '2026-01-15T09:00:00.000Z',
  },
  {
    id: 'cat_client',
    name: 'Client Entertainment',
    color: '#f59e0b',
    icon: 'Wine',
    description: 'Executive dinners, partnership networking events',
    budget: 180000,
    isDefault: true,
    createdAt: '2026-01-15T09:00:00.000Z',
  },
  {
    id: 'cat_legal',
    name: 'Legal & Compliance',
    color: '#8b5cf6',
    icon: 'FileText',
    description: 'Corporate filings, audit, patent attorneys',
    budget: 320000,
    isDefault: true,
    createdAt: '2026-01-15T09:00:00.000Z',
  },
  {
    id: 'cat_transport',
    name: 'Logistics & Transport',
    color: '#64748b',
    icon: 'Car',
    description: 'Courier services, ground transportation, fuel',
    budget: 95000,
    isDefault: true,
    createdAt: '2026-01-15T09:00:00.000Z',
  },
];

const DEFAULT_EXPENSES: Expense[] = [];

// Persistent File Store path
const DATA_DIR = path.join(__dirname, '..', 'data');
const LOCAL_DB_FILE = path.join(DATA_DIR, 'db.json');
const DB_FILE = process.env.VERCEL ? path.join('/tmp', 'db.json') : LOCAL_DB_FILE;

interface LocalDBData {
  categories: ExpenseCategory[];
  expenses: Expense[];
  employees?: Employee[];
  salaryPayments?: SalaryPayment[];
}

function ensureDataFile(): LocalDBData {
  try {
    if (process.env.VERCEL && !fs.existsSync(DB_FILE)) {
      if (fs.existsSync(LOCAL_DB_FILE)) {
        fs.copyFileSync(LOCAL_DB_FILE, DB_FILE);
      }
    }

    if (!process.env.VERCEL && !fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }

    if (!fs.existsSync(DB_FILE)) {
      const initial: LocalDBData = {
        categories: DEFAULT_CATEGORIES,
        expenses: DEFAULT_EXPENSES,
      };
      fs.writeFileSync(DB_FILE, JSON.stringify(initial, null, 2), 'utf-8');
      return initial;
    }

    const raw = fs.readFileSync(DB_FILE, 'utf-8');
    const parsed = JSON.parse(raw);
    if (!parsed.categories || !Array.isArray(parsed.categories)) parsed.categories = DEFAULT_CATEGORIES;
    if (!parsed.expenses || !Array.isArray(parsed.expenses)) parsed.expenses = DEFAULT_EXPENSES;
    if (!parsed.employees || !Array.isArray(parsed.employees)) parsed.employees = [];
    if (!parsed.salaryPayments || !Array.isArray(parsed.salaryPayments)) parsed.salaryPayments = [];
    return parsed;
  } catch (err) {
    console.error('Error loading local db file:', err);
    return { categories: DEFAULT_CATEGORIES, expenses: DEFAULT_EXPENSES };
  }
}

function saveDataFile(data: LocalDBData) {
  try {
    if (!process.env.VERCEL && !fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error saving local db file:', err);
  }
}

// Check Prisma PostgreSQL connection availability
let prismaAvailable: boolean | null = null;
let lastPrismaCheck = 0;

export async function isPrismaAvailable(): Promise<boolean> {
  const now = Date.now();
  if (prismaAvailable !== null && now - lastPrismaCheck < 10000) {
    return prismaAvailable;
  }
  if (!process.env.DATABASE_URL) {
    prismaAvailable = false;
    lastPrismaCheck = now;
    return false;
  }
  try {
    await Promise.race([
      prisma.$queryRaw`SELECT 1`,
      new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 1500)),
    ]);
    prismaAvailable = true;
    lastPrismaCheck = now;
    return true;
  } catch {
    prismaAvailable = false;
    lastPrismaCheck = now;
    return false;
  }
}

// --- Category Operations ---
export async function getCategories(): Promise<ExpenseCategory[]> {
  if (await isPrismaAvailable()) {
    try {
      const records = await prisma.category.findMany({
        orderBy: { createdAt: 'desc' },
      });
      return records.map((c) => ({
        id: c.id,
        name: c.name,
        color: c.color,
        icon: c.icon,
        description: c.description || undefined,
        budget: c.budget || undefined,
        isDefault: c.isDefault,
        createdAt: c.createdAt.toISOString(),
      }));
    } catch (err) {
      console.warn('Prisma getCategories fallback:', err);
    }
  }
  const data = ensureDataFile();
  return data.categories;
}

export async function getCategoryById(id: string): Promise<ExpenseCategory | undefined> {
  if (await isPrismaAvailable()) {
    try {
      const c = await prisma.category.findUnique({ where: { id } });
      if (!c) return undefined;
      return {
        id: c.id,
        name: c.name,
        color: c.color,
        icon: c.icon,
        description: c.description || undefined,
        budget: c.budget || undefined,
        isDefault: c.isDefault,
        createdAt: c.createdAt.toISOString(),
      };
    } catch (err) {
      console.warn('Prisma getCategoryById fallback:', err);
    }
  }
  const data = ensureDataFile();
  return data.categories.find(c => c.id === id);
}

export async function createCategory(input: Omit<ExpenseCategory, 'id' | 'createdAt'>): Promise<ExpenseCategory> {
  if (await isPrismaAvailable()) {
    try {
      const created = await prisma.category.create({
        data: {
          name: input.name,
          color: input.color || '#6366f1',
          icon: input.icon || 'Layers',
          description: input.description,
          budget: input.budget,
          isDefault: input.isDefault || false,
        },
      });
      return {
        id: created.id,
        name: created.name,
        color: created.color,
        icon: created.icon,
        description: created.description || undefined,
        budget: created.budget || undefined,
        isDefault: created.isDefault,
        createdAt: created.createdAt.toISOString(),
      };
    } catch (err) {
      console.warn('Prisma createCategory fallback:', err);
    }
  }
  const data = ensureDataFile();
  const newCat: ExpenseCategory = {
    ...input,
    id: `cat_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    createdAt: new Date().toISOString(),
  };
  data.categories.push(newCat);
  saveDataFile(data);
  return newCat;
}

export async function updateCategory(id: string, updates: Partial<ExpenseCategory>): Promise<ExpenseCategory | null> {
  if (await isPrismaAvailable()) {
    try {
      const updated = await prisma.category.update({
        where: { id },
        data: {
          name: updates.name,
          color: updates.color,
          icon: updates.icon,
          description: updates.description,
          budget: updates.budget,
          isDefault: updates.isDefault,
        },
      });
      return {
        id: updated.id,
        name: updated.name,
        color: updated.color,
        icon: updated.icon,
        description: updated.description || undefined,
        budget: updated.budget || undefined,
        isDefault: updated.isDefault,
        createdAt: updated.createdAt.toISOString(),
      };
    } catch (err) {
      console.warn('Prisma updateCategory fallback:', err);
    }
  }
  const data = ensureDataFile();
  const index = data.categories.findIndex(c => c.id === id);
  if (index === -1) return null;
  data.categories[index] = { ...data.categories[index], ...updates };
  saveDataFile(data);
  return data.categories[index];
}

export async function deleteCategory(id: string): Promise<boolean> {
  if (await isPrismaAvailable()) {
    try {
      await prisma.category.delete({ where: { id } });
      return true;
    } catch (err) {
      console.warn('Prisma deleteCategory fallback:', err);
    }
  }
  const data = ensureDataFile();
  const initialLength = data.categories.length;
  data.categories = data.categories.filter(c => c.id !== id);
  if (data.categories.length !== initialLength) {
    saveDataFile(data);
    return true;
  }
  return false;
}

// --- Expense Operations ---
export async function getExpenses(filters?: ExpenseFilterParams): Promise<Expense[]> {
  let list: Expense[] = [];

  if (await isPrismaAvailable()) {
    try {
      const records = await prisma.expense.findMany({
        include: {
          category: true,
          attachment: true,
        },
        orderBy: {
          date: 'desc',
        },
      });

      list = records.map((e) => ({
        id: e.id,
        amount: e.amount,
        currency: e.currency,
        categoryId: e.categoryId,
        category: e.category
          ? {
              id: e.category.id,
              name: e.category.name,
              color: e.category.color,
              icon: e.category.icon,
              description: e.category.description || undefined,
              budget: e.category.budget || undefined,
              isDefault: e.category.isDefault,
              createdAt: e.category.createdAt.toISOString(),
            }
          : undefined,
        date: e.date,
        description: e.description,
        merchant: e.merchant || undefined,
        paymentMethod: e.paymentMethod as any,
        status: e.status as any,
        attachment: (e as any).attachment
          ? {
              id: (e as any).attachment.id,
              name: (e as any).attachment.name,
              mimeType: (e as any).attachment.mimeType,
              size: (e as any).attachment.size,
              url: (e as any).attachment.url || (e as any).attachment.localUrl || undefined,
              filename: (e as any).attachment.filename || undefined,
              thumbnailUrl: (e as any).attachment.thumbnailUrl || undefined,
              localUrl: (e as any).attachment.localUrl || undefined,
            }
          : null,
        createdAt: e.createdAt.toISOString(),
        updatedAt: e.updatedAt.toISOString(),
      }));
    } catch (err) {
      console.warn('Prisma getExpenses fallback:', err);
    }
  }

  if (list.length === 0) {
    const data = ensureDataFile();
    list = [...data.expenses];
    const catMap = new Map(data.categories.map(c => [c.id, c]));

    // Populate category references
    list = list.map(exp => ({
      ...exp,
      category: catMap.get(exp.categoryId) || {
        id: exp.categoryId,
        name: 'Other',
        color: '#94a3b8',
        icon: 'Layers',
        createdAt: new Date().toISOString(),
      },
    }));
  }

  if (!filters) {
    return list.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }

  if (filters.search) {
    const q = filters.search.toLowerCase().trim();
    list = list.filter(exp =>
      (exp.description && exp.description.toLowerCase().includes(q)) ||
      (exp.merchant && exp.merchant.toLowerCase().includes(q)) ||
      (exp.category && exp.category.name.toLowerCase().includes(q)) ||
      (exp.amount.toString().includes(q))
    );
  }

  if (filters.categoryId && filters.categoryId !== 'all') {
    list = list.filter(exp => exp.categoryId === filters.categoryId);
  }

  if (filters.startDate) {
    list = list.filter(exp => exp.date >= filters.startDate!);
  }

  if (filters.endDate) {
    list = list.filter(exp => exp.date <= filters.endDate!);
  }

  if (filters.minAmount !== undefined) {
    list = list.filter(exp => exp.amount >= filters.minAmount!);
  }

  if (filters.maxAmount !== undefined) {
    list = list.filter(exp => exp.amount <= filters.maxAmount!);
  }

  if (filters.paymentMethod && filters.paymentMethod !== 'all') {
    list = list.filter(exp => exp.paymentMethod === filters.paymentMethod);
  }

  if (filters.hasAttachment !== undefined) {
    list = list.filter(exp => filters.hasAttachment ? Boolean(exp.attachment) : !exp.attachment);
  }

  const sortBy = filters.sortBy || 'date';
  const sortOrder = filters.sortOrder || 'desc';

  list.sort((a, b) => {
    let comp = 0;
    if (sortBy === 'date') {
      comp = new Date(b.date).getTime() - new Date(a.date).getTime();
    } else if (sortBy === 'amount') {
      comp = b.amount - a.amount;
    } else if (sortBy === 'merchant') {
      comp = (a.merchant || '').localeCompare(b.merchant || '');
    }
    return sortOrder === 'asc' ? -comp : comp;
  });

  return list;
}

export async function getExpenseById(id: string): Promise<Expense | undefined> {
  const expenses = await getExpenses();
  return expenses.find(e => e.id === id);
}

export async function createExpense(input: Omit<Expense, 'id' | 'createdAt' | 'updatedAt'>): Promise<Expense> {
  if (await isPrismaAvailable()) {
    try {
      const created = await prisma.expense.create({
        data: {
          amount: input.amount,
          currency: input.currency || 'INR',
          categoryId: input.categoryId,
          date: input.date,
          description: input.description,
          merchant: input.merchant,
          paymentMethod: input.paymentMethod || 'Corporate Card',
          status: input.status || 'Approved',
          attachment: input.attachment
            ? ({
                create: {
                  name: input.attachment.name,
                  mimeType: input.attachment.mimeType,
                  size: input.attachment.size,
                  url: input.attachment.url || input.attachment.localUrl,
                  filename: input.attachment.filename,
                  thumbnailUrl: input.attachment.thumbnailUrl,
                  localUrl: input.attachment.localUrl,
                },
              } as any)
            : undefined,
        },
        include: {
          category: true,
          attachment: true,
        },
      });

      return {
        id: created.id,
        amount: created.amount,
        currency: created.currency,
        categoryId: created.categoryId,
        category: (created as any).category
          ? {
              id: (created as any).category.id,
              name: (created as any).category.name,
              color: (created as any).category.color,
              icon: (created as any).category.icon,
              description: (created as any).category.description || undefined,
              budget: (created as any).category.budget || undefined,
              isDefault: (created as any).category.isDefault,
              createdAt: (created as any).category.createdAt.toISOString(),
            }
          : undefined,
        date: created.date,
        description: created.description,
        merchant: created.merchant || undefined,
        paymentMethod: created.paymentMethod as any,
        status: created.status as any,
        attachment: (created as any).attachment
          ? {
              id: (created as any).attachment.id,
              name: (created as any).attachment.name,
              mimeType: (created as any).attachment.mimeType,
              size: (created as any).attachment.size,
              url: (created as any).attachment.url || (created as any).attachment.localUrl || undefined,
              filename: (created as any).attachment.filename || undefined,
              thumbnailUrl: (created as any).attachment.thumbnailUrl || undefined,
              localUrl: (created as any).attachment.localUrl || undefined,
            }
          : null,
        createdAt: created.createdAt.toISOString(),
        updatedAt: created.updatedAt.toISOString(),
      };
    } catch (err) {
      console.warn('Prisma createExpense fallback:', err);
    }
  }

  const data = ensureDataFile();
  const id = `exp_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
  const now = new Date().toISOString();
  const newExp: Expense = {
    ...input,
    id,
    currency: input.currency || 'INR',
    paymentMethod: input.paymentMethod || 'Corporate Card',
    status: input.status || 'Approved',
    createdAt: now,
    updatedAt: now,
  };

  data.expenses.unshift(newExp);
  saveDataFile(data);

  const cat = data.categories.find(c => c.id === newExp.categoryId);
  return { ...newExp, category: cat };
}

export async function updateExpense(id: string, updates: Partial<Expense>): Promise<Expense | null> {
  if (await isPrismaAvailable()) {
    try {
      const updated = await prisma.expense.update({
        where: { id },
        data: {
          amount: updates.amount,
          categoryId: updates.categoryId,
          date: updates.date,
          description: updates.description,
          merchant: updates.merchant,
          paymentMethod: updates.paymentMethod,
          status: updates.status,
        },
        include: {
          category: true,
          attachment: true,
        },
      });

      return {
        id: updated.id,
        amount: updated.amount,
        currency: updated.currency,
        categoryId: updated.categoryId,
        category: updated.category
          ? {
              id: updated.category.id,
              name: updated.category.name,
              color: updated.category.color,
              icon: updated.category.icon,
              description: updated.category.description || undefined,
              budget: updated.category.budget || undefined,
              isDefault: updated.category.isDefault,
              createdAt: updated.category.createdAt.toISOString(),
            }
          : undefined,
        date: updated.date,
        description: updated.description,
        merchant: updated.merchant || undefined,
        paymentMethod: updated.paymentMethod as any,
        status: updated.status as any,
        attachment: (updated as any).attachment
          ? {
              id: (updated as any).attachment.id,
              name: (updated as any).attachment.name,
              mimeType: (updated as any).attachment.mimeType,
              size: (updated as any).attachment.size,
              url: (updated as any).attachment.url || (updated as any).attachment.localUrl || undefined,
              filename: (updated as any).attachment.filename || undefined,
              thumbnailUrl: (updated as any).attachment.thumbnailUrl || undefined,
              localUrl: (updated as any).attachment.localUrl || undefined,
            }
          : null,
        createdAt: updated.createdAt.toISOString(),
        updatedAt: updated.updatedAt.toISOString(),
      };
    } catch (err) {
      console.warn('Prisma updateExpense fallback:', err);
    }
  }

  const data = ensureDataFile();
  const index = data.expenses.findIndex(e => e.id === id);
  if (index === -1) return null;

  data.expenses[index] = {
    ...data.expenses[index],
    ...updates,
    updatedAt: new Date().toISOString(),
  };
  saveDataFile(data);

  const cat = data.categories.find(c => c.id === data.expenses[index].categoryId);
  return { ...data.expenses[index], category: cat };
}

export async function deleteExpense(id: string): Promise<boolean> {
  if (await isPrismaAvailable()) {
    try {
      await prisma.expense.delete({ where: { id } });
      return true;
    } catch (err) {
      console.warn('Prisma deleteExpense fallback:', err);
    }
  }

  const data = ensureDataFile();
  const initialLength = data.expenses.length;
  data.expenses = data.expenses.filter(e => e.id !== id);
  if (data.expenses.length !== initialLength) {
    saveDataFile(data);
    return true;
  }
  return false;
}

// --- Dashboard Aggregations & Analytics ---
export async function getDashboardStats(): Promise<DashboardStats> {
  const expenses = await getExpenses();
  const categories = await getCategories();

  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
  const totalReceipts = expenses.filter(e => Boolean(e.attachment)).length;
  const averageExpense = expenses.length > 0 ? totalExpenses / expenses.length : 0;

  // Monthly current vs last month
  const now = new Date();
  const currentMonthStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  const lastMonthDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const lastMonthStr = `${lastMonthDate.getFullYear()}-${String(lastMonthDate.getMonth() + 1).padStart(2, '0')}`;

  const currentMonthExpenses = expenses
    .filter(e => e.date.startsWith(currentMonthStr))
    .reduce((sum, e) => sum + e.amount, 0);

  const lastMonthExpenses = expenses
    .filter(e => e.date.startsWith(lastMonthStr))
    .reduce((sum, e) => sum + e.amount, 0);

  const monthlyGrowth = lastMonthExpenses > 0
    ? Number((((currentMonthExpenses - lastMonthExpenses) / lastMonthExpenses) * 100).toFixed(1))
    : 0;

  // Category breakdown
  const categoryTotals: Record<string, { total: number; count: number }> = {};
  categories.forEach(c => {
    categoryTotals[c.id] = { total: 0, count: 0 };
  });

  expenses.forEach(e => {
    if (!categoryTotals[e.categoryId]) {
      categoryTotals[e.categoryId] = { total: 0, count: 0 };
    }
    categoryTotals[e.categoryId].total += e.amount;
    categoryTotals[e.categoryId].count += 1;
  });

  const categoryBreakdown: CategoryBreakdownItem[] = categories
    .map(cat => {
      const stats = categoryTotals[cat.id] || { total: 0, count: 0 };
      const percentage = totalExpenses > 0 ? Number(((stats.total / totalExpenses) * 100).toFixed(1)) : 0;
      return {
        categoryId: cat.id,
        name: cat.name,
        color: cat.color,
        icon: cat.icon,
        total: Number(stats.total.toFixed(2)),
        count: stats.count,
        percentage,
        budget: cat.budget,
      };
    })
    .sort((a, b) => b.total - a.total);

  // Total budget utilization
  const totalBudget = categories.reduce((sum, c) => sum + (c.budget || 0), 0);
  const budgetUtilization = totalBudget > 0 ? Number(((currentMonthExpenses / totalBudget) * 100).toFixed(1)) : 0;

  // Monthly trends (Last 6 months)
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const monthlyTrends: MonthlyTrendItem[] = [];

  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const mStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    const mName = `${monthNames[d.getMonth()]}`;
    const monthSum = expenses
      .filter(e => e.date.startsWith(mStr))
      .reduce((s, e) => s + e.amount, 0);

    monthlyTrends.push({
      month: mName,
      amount: Number(monthSum.toFixed(2)),
      previousYear: 0,
    });
  }

  // Weekly trends (last 7 days)
  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const weeklyTrends: WeeklyTrendItem[] = [];

  for (let i = 6; i >= 0; i--) {
    const dayDate = new Date();
    dayDate.setDate(dayDate.getDate() - i);
    const dayDateStr = dayDate.toISOString().split('T')[0];
    const dayLabel = daysOfWeek[dayDate.getDay()];

    const daySum = expenses
      .filter(e => e.date === dayDateStr)
      .reduce((s, e) => s + e.amount, 0);

    weeklyTrends.push({
      day: dayLabel,
      fullDate: dayDateStr,
      amount: Number(daySum.toFixed(2)),
    });
  }

  // Recent 6 expenses with category details
  const allWithCat = await getExpenses();
  const recentExpenses = allWithCat.slice(0, 6);
  const payrollStats = await getPayrollStats();

  return {
    totalExpenses: Number(totalExpenses.toFixed(2)),
    monthlyExpenses: Number(currentMonthExpenses.toFixed(2)),
    monthlyGrowth,
    totalReceipts,
    averageExpense: Number(averageExpense.toFixed(2)),
    budgetUtilization,
    categoryBreakdown,
    monthlyTrends,
    weeklyTrends,
    recentExpenses,
    payrollStats,
  };
}

export async function resetExpenseData(): Promise<void> {
  if (await isPrismaAvailable()) {
    try {
      await prisma.attachment.deleteMany({});
      await prisma.expense.deleteMany({});
    } catch (err) {
      console.warn('Prisma resetExpenseData error:', err);
    }
  }
  const initial: LocalDBData = {
    categories: DEFAULT_CATEGORIES,
    expenses: DEFAULT_EXPENSES,
  };
  saveDataFile(initial);
}

// -------------------------------------------------------------
// User Authentication Database Persistence (PostgreSQL + Local File)
// -------------------------------------------------------------
const USERS_FILE = path.join(DATA_DIR, 'users.json');

function loadUsersFile(): any[] {
  try {
    if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
    if (!fs.existsSync(USERS_FILE)) {
      fs.writeFileSync(USERS_FILE, '[]', 'utf-8');
      return [];
    }
    const raw = fs.readFileSync(USERS_FILE, 'utf-8');
    return JSON.parse(raw) || [];
  } catch {
    return [];
  }
}

function saveUsersFile(users: any[]) {
  try {
    if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
    fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2), 'utf-8');
  } catch (e) {
    console.error('Error saving users file:', e);
  }
}

export async function findUserByEmail(email: string): Promise<any | null> {
  const normalized = email.trim().toLowerCase();
  if (await isPrismaAvailable()) {
    try {
      const u = await (prisma as any).user.findUnique({
        where: { email: normalized },
      });
      if (u) return u;
    } catch (err) {
      console.warn('Prisma findUserByEmail fallback:', err);
    }
  }

  const fileUsers = loadUsersFile();
  return fileUsers.find((u: any) => u.email.toLowerCase() === normalized) || null;
}

export async function findUserById(id: string): Promise<any | null> {
  if (await isPrismaAvailable()) {
    try {
      const u = await (prisma as any).user.findUnique({
        where: { id },
      });
      if (u) return u;
    } catch (err) {
      console.warn('Prisma findUserById fallback:', err);
    }
  }

  const fileUsers = loadUsersFile();
  return fileUsers.find((u: any) => u.id === id) || null;
}

export async function createUser(input: {
  name: string;
  email: string;
  password: string;
  initials?: string;
}): Promise<any> {
  const normalized = input.email.trim().toLowerCase();
  const initials =
    input.initials ||
    input.name
      .trim()
      .split(/\s+/)
      .map((n) => n[0])
      .join('')
      .slice(0, 2)
      .toUpperCase() ||
    'U';

  if (await isPrismaAvailable()) {
    try {
      const created = await (prisma as any).user.create({
        data: {
          name: input.name.trim(),
          email: normalized,
          password: input.password,
          initials,
        },
      });
      return created;
    } catch (err) {
      console.warn('Prisma createUser fallback:', err);
    }
  }

  const fileUsers = loadUsersFile();
  const newUser = {
    id: `usr_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    name: input.name.trim(),
    email: normalized,
    password: input.password,
    initials,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  fileUsers.push(newUser);
  saveUsersFile(fileUsers);
  return newUser;
}

// -------------------------------------------------------------
// Employee Management Operations (PostgreSQL Prisma + Local JSON)
// -------------------------------------------------------------
export async function getEmployees(): Promise<Employee[]> {
  if (await isPrismaAvailable()) {
    try {
      const records = await (prisma as any).employee.findMany({
        include: {
          salaryPayments: {
            orderBy: { paymentDate: 'desc' },
          },
        },
        orderBy: { createdAt: 'desc' },
      });
      return records.map((emp: any) => ({
        id: emp.id,
        name: emp.name,
        email: emp.email || undefined,
        phone: emp.phone || undefined,
        department: emp.department,
        designation: emp.designation,
        baseSalary: emp.baseSalary,
        status: emp.status as any,
        joinDate: emp.joinDate,
        avatar: emp.avatar || undefined,
        createdAt: emp.createdAt.toISOString(),
        updatedAt: emp.updatedAt ? emp.updatedAt.toISOString() : undefined,
        salaryPayments: (emp.salaryPayments || []).map((sp: any) => ({
          id: sp.id,
          employeeId: sp.employeeId,
          month: sp.month,
          baseSalary: sp.baseSalary,
          bonus: sp.bonus,
          deductions: sp.deductions,
          netSalary: sp.netSalary,
          paymentDate: sp.paymentDate,
          paymentMethod: sp.paymentMethod,
          status: sp.status as any,
          notes: sp.notes || undefined,
          createdAt: sp.createdAt.toISOString(),
          updatedAt: sp.updatedAt ? sp.updatedAt.toISOString() : undefined,
        })),
      }));
    } catch (err) {
      console.warn('Prisma getEmployees fallback:', err);
    }
  }

  const data = ensureDataFile();
  const employees = data.employees || [];
  const payments = data.salaryPayments || [];
  return employees.map((emp) => ({
    ...emp,
    salaryPayments: payments
      .filter((sp) => sp.employeeId === emp.id)
      .sort((a, b) => new Date(b.paymentDate).getTime() - new Date(a.paymentDate).getTime()),
  }));
}

export async function getEmployeeById(id: string): Promise<Employee | null> {
  const all = await getEmployees();
  return all.find((e) => e.id === id) || null;
}

export async function createEmployee(
  input: Omit<Employee, 'id' | 'createdAt' | 'updatedAt' | 'salaryPayments'>
): Promise<Employee> {
  if (await isPrismaAvailable()) {
    try {
      const created = await (prisma as any).employee.create({
        data: {
          name: input.name.trim(),
          email: input.email ? input.email.trim().toLowerCase() : null,
          phone: input.phone ? input.phone.trim() : null,
          department: input.department || 'Engineering',
          designation: input.designation || 'Software Engineer',
          baseSalary: Number(input.baseSalary) || 0,
          status: input.status || 'Active',
          joinDate: input.joinDate || new Date().toISOString().split('T')[0],
          avatar: input.avatar || null,
        },
      });
      return {
        id: created.id,
        name: created.name,
        email: created.email || undefined,
        phone: created.phone || undefined,
        department: created.department,
        designation: created.designation,
        baseSalary: created.baseSalary,
        status: created.status as any,
        joinDate: created.joinDate,
        avatar: created.avatar || undefined,
        createdAt: created.createdAt.toISOString(),
        updatedAt: created.updatedAt ? created.updatedAt.toISOString() : undefined,
        salaryPayments: [],
      };
    } catch (err) {
      console.warn('Prisma createEmployee fallback:', err);
    }
  }

  const data = ensureDataFile();
  if (!data.employees) data.employees = [];
  const newEmp: Employee = {
    ...input,
    id: `emp_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    salaryPayments: [],
  };
  data.employees.unshift(newEmp);
  saveDataFile(data);
  return newEmp;
}

export async function updateEmployee(id: string, updates: Partial<Employee>): Promise<Employee | null> {
  if (await isPrismaAvailable()) {
    try {
      const dataToUpdate: any = {};
      if (updates.name !== undefined) dataToUpdate.name = updates.name.trim();
      if (updates.email !== undefined) dataToUpdate.email = updates.email ? updates.email.trim().toLowerCase() : null;
      if (updates.phone !== undefined) dataToUpdate.phone = updates.phone ? updates.phone.trim() : null;
      if (updates.department !== undefined) dataToUpdate.department = updates.department;
      if (updates.designation !== undefined) dataToUpdate.designation = updates.designation;
      if (updates.baseSalary !== undefined) dataToUpdate.baseSalary = Number(updates.baseSalary);
      if (updates.status !== undefined) dataToUpdate.status = updates.status;
      if (updates.joinDate !== undefined) dataToUpdate.joinDate = updates.joinDate;
      if (updates.avatar !== undefined) dataToUpdate.avatar = updates.avatar || null;

      const updated = await (prisma as any).employee.update({
        where: { id },
        data: dataToUpdate,
        include: { salaryPayments: true },
      });
      return {
        id: updated.id,
        name: updated.name,
        email: updated.email || undefined,
        phone: updated.phone || undefined,
        department: updated.department,
        designation: updated.designation,
        baseSalary: updated.baseSalary,
        status: updated.status as any,
        joinDate: updated.joinDate,
        avatar: updated.avatar || undefined,
        createdAt: updated.createdAt.toISOString(),
        updatedAt: updated.updatedAt ? updated.updatedAt.toISOString() : undefined,
        salaryPayments: (updated.salaryPayments || []).map((sp: any) => ({
          id: sp.id,
          employeeId: sp.employeeId,
          month: sp.month,
          baseSalary: sp.baseSalary,
          bonus: sp.bonus,
          deductions: sp.deductions,
          netSalary: sp.netSalary,
          paymentDate: sp.paymentDate,
          paymentMethod: sp.paymentMethod,
          status: sp.status as any,
          notes: sp.notes || undefined,
          createdAt: sp.createdAt.toISOString(),
          updatedAt: sp.updatedAt ? sp.updatedAt.toISOString() : undefined,
        })),
      };
    } catch (err) {
      console.warn('Prisma updateEmployee fallback:', err);
    }
  }

  const data = ensureDataFile();
  if (!data.employees) data.employees = [];
  const index = data.employees.findIndex((e) => e.id === id);
  if (index === -1) return null;

  data.employees[index] = {
    ...data.employees[index],
    ...updates,
    updatedAt: new Date().toISOString(),
  };
  saveDataFile(data);
  return data.employees[index];
}

export async function deleteEmployee(id: string): Promise<boolean> {
  if (await isPrismaAvailable()) {
    try {
      await (prisma as any).employee.delete({ where: { id } });
      return true;
    } catch (err) {
      console.warn('Prisma deleteEmployee fallback:', err);
    }
  }

  const data = ensureDataFile();
  if (!data.employees) return false;
  const initLen = data.employees.length;
  data.employees = data.employees.filter((e) => e.id !== id);
  if (data.salaryPayments) {
    data.salaryPayments = data.salaryPayments.filter((sp) => sp.employeeId !== id);
  }
  if (data.employees.length !== initLen) {
    saveDataFile(data);
    return true;
  }
  return false;
}

// -------------------------------------------------------------
// Salary Disbursement Operations (Payroll)
// -------------------------------------------------------------
export async function getSalaryPayments(filters?: {
  employeeId?: string;
  month?: string;
}): Promise<SalaryPayment[]> {
  if (await isPrismaAvailable()) {
    try {
      const where: any = {};
      if (filters?.employeeId) where.employeeId = filters.employeeId;
      if (filters?.month) where.month = filters.month;

      const records = await (prisma as any).salaryPayment.findMany({
        where,
        include: { employee: true },
        orderBy: { paymentDate: 'desc' },
      });

      return records.map((sp: any) => ({
        id: sp.id,
        employeeId: sp.employeeId,
        employeeName: sp.employee?.name || undefined,
        department: sp.employee?.department || undefined,
        designation: sp.employee?.designation || undefined,
        month: sp.month,
        baseSalary: sp.baseSalary,
        bonus: sp.bonus,
        deductions: sp.deductions,
        netSalary: sp.netSalary,
        paymentDate: sp.paymentDate,
        paymentMethod: sp.paymentMethod,
        status: sp.status as any,
        notes: sp.notes || undefined,
        createdAt: sp.createdAt.toISOString(),
        updatedAt: sp.updatedAt ? sp.updatedAt.toISOString() : undefined,
      }));
    } catch (err) {
      console.warn('Prisma getSalaryPayments fallback:', err);
    }
  }

  const data = ensureDataFile();
  let payments = data.salaryPayments || [];
  const empMap = new Map((data.employees || []).map((e) => [e.id, e]));

  if (filters?.employeeId) {
    payments = payments.filter((p) => p.employeeId === filters.employeeId);
  }
  if (filters?.month) {
    payments = payments.filter((p) => p.month === filters.month);
  }

  return payments
    .map((p) => {
      const emp = empMap.get(p.employeeId);
      return {
        ...p,
        employeeName: emp?.name || p.employeeName,
        department: emp?.department || p.department,
        designation: emp?.designation || p.designation,
      };
    })
    .sort((a, b) => new Date(b.paymentDate).getTime() - new Date(a.paymentDate).getTime());
}

export async function createSalaryPayment(
  input: Omit<SalaryPayment, 'id' | 'createdAt' | 'updatedAt'>
): Promise<SalaryPayment> {
  const baseSalary = Number(input.baseSalary) || 0;
  const bonus = Number(input.bonus) || 0;
  const deductions = Number(input.deductions) || 0;
  const netSalary = Number(input.netSalary) || baseSalary + bonus - deductions;

  if (await isPrismaAvailable()) {
    try {
      const created = await (prisma as any).salaryPayment.create({
        data: {
          employeeId: input.employeeId,
          month: input.month,
          baseSalary,
          bonus,
          deductions,
          netSalary,
          paymentDate: input.paymentDate || new Date().toISOString().split('T')[0],
          paymentMethod: input.paymentMethod || 'Bank Transfer',
          status: input.status || 'Paid',
          notes: input.notes || null,
        },
        include: { employee: true },
      });

      return {
        id: created.id,
        employeeId: created.employeeId,
        employeeName: created.employee?.name,
        department: created.employee?.department,
        designation: created.employee?.designation,
        month: created.month,
        baseSalary: created.baseSalary,
        bonus: created.bonus,
        deductions: created.deductions,
        netSalary: created.netSalary,
        paymentDate: created.paymentDate,
        paymentMethod: created.paymentMethod,
        status: created.status as any,
        notes: created.notes || undefined,
        createdAt: created.createdAt.toISOString(),
        updatedAt: created.updatedAt ? created.updatedAt.toISOString() : undefined,
      };
    } catch (err) {
      console.warn('Prisma createSalaryPayment fallback:', err);
    }
  }

  const data = ensureDataFile();
  if (!data.salaryPayments) data.salaryPayments = [];
  const emp = (data.employees || []).find((e) => e.id === input.employeeId);

  const newPayment: SalaryPayment = {
    ...input,
    id: `sal_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    baseSalary,
    bonus,
    deductions,
    netSalary,
    employeeName: emp?.name,
    department: emp?.department,
    designation: emp?.designation,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  data.salaryPayments.unshift(newPayment);
  saveDataFile(data);
  return newPayment;
}

export async function deleteSalaryPayment(id: string): Promise<boolean> {
  if (await isPrismaAvailable()) {
    try {
      await (prisma as any).salaryPayment.delete({ where: { id } });
      return true;
    } catch (err) {
      console.warn('Prisma deleteSalaryPayment fallback:', err);
    }
  }

  const data = ensureDataFile();
  if (!data.salaryPayments) return false;
  const initLen = data.salaryPayments.length;
  data.salaryPayments = data.salaryPayments.filter((p) => p.id !== id);
  if (data.salaryPayments.length !== initLen) {
    saveDataFile(data);
    return true;
  }
  return false;
}

export async function getPayrollStats(): Promise<PayrollStats> {
  const employees = await getEmployees();
  const payments = await getSalaryPayments();

  const totalEmployees = employees.length;
  const activeEmployees = employees.filter((e) => e.status === 'Active').length;
  const totalMonthlyPayroll = employees
    .filter((e) => e.status === 'Active')
    .reduce((sum, e) => sum + (e.baseSalary || 0), 0);

  const now = new Date();
  const currentMonthStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

  const currentMonthPayments = payments.filter(
    (p) => p.month === currentMonthStr || p.paymentDate.startsWith(currentMonthStr)
  );

  const totalPaidThisMonth = currentMonthPayments
    .filter((p) => p.status === 'Paid')
    .reduce((sum, p) => sum + p.netSalary, 0);

  const pendingDisbursements = currentMonthPayments.filter((p) => p.status === 'Pending').length;
  const recentPayments = payments.slice(0, 5);

  return {
    totalEmployees,
    activeEmployees,
    totalMonthlyPayroll: Number(totalMonthlyPayroll.toFixed(2)),
    totalPaidThisMonth: Number(totalPaidThisMonth.toFixed(2)),
    pendingDisbursements,
    recentPayments,
  };
}
