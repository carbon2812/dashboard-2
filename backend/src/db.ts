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
        attachment: e.attachment
          ? {
              id: e.attachment.id,
              name: e.attachment.name,
              mimeType: e.attachment.mimeType,
              size: e.attachment.size,
              cloudinaryPublicId: e.attachment.cloudinaryPublicId || undefined,
              cloudinaryUrl: e.attachment.cloudinaryUrl || undefined,
              driveFileId: e.attachment.driveFileId || undefined,
              driveViewLink: e.attachment.driveViewLink || undefined,
              driveDownloadLink: e.attachment.driveDownloadLink || undefined,
              thumbnailUrl: e.attachment.thumbnailUrl || undefined,
              localUrl: e.attachment.localUrl || undefined,
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
            ? {
                create: {
                  name: input.attachment.name,
                  mimeType: input.attachment.mimeType,
                  size: input.attachment.size,
                  cloudinaryPublicId: input.attachment.cloudinaryPublicId,
                  cloudinaryUrl: input.attachment.cloudinaryUrl,
                  driveFileId: input.attachment.driveFileId,
                  driveViewLink: input.attachment.driveViewLink,
                  driveDownloadLink: input.attachment.driveDownloadLink,
                  thumbnailUrl: input.attachment.thumbnailUrl,
                  localUrl: input.attachment.localUrl,
                },
              }
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
        category: created.category
          ? {
              id: created.category.id,
              name: created.category.name,
              color: created.category.color,
              icon: created.category.icon,
              description: created.category.description || undefined,
              budget: created.category.budget || undefined,
              isDefault: created.category.isDefault,
              createdAt: created.category.createdAt.toISOString(),
            }
          : undefined,
        date: created.date,
        description: created.description,
        merchant: created.merchant || undefined,
        paymentMethod: created.paymentMethod as any,
        status: created.status as any,
        attachment: created.attachment
          ? {
              id: created.attachment.id,
              name: created.attachment.name,
              mimeType: created.attachment.mimeType,
              size: created.attachment.size,
              cloudinaryPublicId: created.attachment.cloudinaryPublicId || undefined,
              cloudinaryUrl: created.attachment.cloudinaryUrl || undefined,
              driveFileId: created.attachment.driveFileId || undefined,
              driveViewLink: created.attachment.driveViewLink || undefined,
              driveDownloadLink: created.attachment.driveDownloadLink || undefined,
              thumbnailUrl: created.attachment.thumbnailUrl || undefined,
              localUrl: created.attachment.localUrl || undefined,
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
        attachment: updated.attachment
          ? {
              id: updated.attachment.id,
              name: updated.attachment.name,
              mimeType: updated.attachment.mimeType,
              size: updated.attachment.size,
              cloudinaryPublicId: updated.attachment.cloudinaryPublicId || undefined,
              cloudinaryUrl: updated.attachment.cloudinaryUrl || undefined,
              driveFileId: updated.attachment.driveFileId || undefined,
              driveViewLink: updated.attachment.driveViewLink || undefined,
              driveDownloadLink: updated.attachment.driveDownloadLink || undefined,
              thumbnailUrl: updated.attachment.thumbnailUrl || undefined,
              localUrl: updated.attachment.localUrl || undefined,
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
  const data = ensureDataFile();
  const expenses = data.expenses;
  const categories = data.categories;

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
  };
}

export async function resetDemoData(): Promise<void> {
  if (await isPrismaAvailable()) {
    try {
      await prisma.attachment.deleteMany({});
      await prisma.expense.deleteMany({});
    } catch (err) {
      console.warn('Prisma resetDemoData error:', err);
    }
  }
  const initial: LocalDBData = {
    categories: DEFAULT_CATEGORIES,
    expenses: DEFAULT_EXPENSES,
  };
  saveDataFile(initial);
}
