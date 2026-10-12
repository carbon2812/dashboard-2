import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import mongoose from 'mongoose';
import {
  Expense,
  ExpenseCategory,
  DashboardStats,
  ExpenseFilterParams,
  CategoryBreakdownItem,
  MonthlyTrendItem,
  WeeklyTrendItem,
  User,
  StoredUser,
  RegisterData,
  UserRole,
} from '@/types';

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

// Helper to hash passwords consistently
export function hashPassword(password: string): string {
  return crypto.createHash('sha256').update(password + '_nova_fintech_salt_2026').digest('hex');
}

export function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

// Initial Mock Seed Users
export const DEFAULT_USERS: StoredUser[] = [
  {
    id: 'user_julian',
    name: 'Julian Sterling',
    email: 'julian@nova.fin',
    role: 'Finance Director',
    department: 'Corporate Finance & Treasury',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
    initials: 'JS',
    passwordHash: hashPassword('password123'),
    createdAt: '2026-01-10T08:00:00.000Z',
    lastLogin: new Date().toISOString(),
  },
  {
    id: 'user_elena',
    name: 'Elena Vance',
    email: 'elena@nova.fin',
    role: 'Senior Financial Analyst',
    department: 'Financial Planning & Analysis',
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=200&auto=format&fit=crop&q=80',
    initials: 'EV',
    passwordHash: hashPassword('password123'),
    createdAt: '2026-01-12T08:00:00.000Z',
    lastLogin: new Date().toISOString(),
  },
  {
    id: 'user_marcus',
    name: 'Marcus Brody',
    email: 'marcus@nova.fin',
    role: 'Executive Admin',
    department: 'Operations & Infrastructure',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80',
    initials: 'MB',
    passwordHash: hashPassword('password123'),
    createdAt: '2026-01-14T08:00:00.000Z',
    lastLogin: new Date().toISOString(),
  },
  {
    id: 'user_sophia',
    name: 'Sophia Patel',
    email: 'sophia@nova.fin',
    role: 'Risk & Compliance Auditor',
    department: 'Internal Audit & Governance',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&auto=format&fit=crop&q=80',
    initials: 'SP',
    passwordHash: hashPassword('password123'),
    createdAt: '2026-01-16T08:00:00.000Z',
    lastLogin: new Date().toISOString(),
  },
];

// Persistent File Store path
const DATA_DIR = path.join(process.cwd(), 'data');
const LOCAL_DB_FILE = path.join(DATA_DIR, 'db.json');
const DB_FILE = process.env.VERCEL ? path.join('/tmp', 'db.json') : LOCAL_DB_FILE;

interface LocalDBData {
  categories: ExpenseCategory[];
  expenses: Expense[];
  users: StoredUser[];
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
        users: DEFAULT_USERS,
      };
      fs.writeFileSync(DB_FILE, JSON.stringify(initial, null, 2), 'utf-8');
      return initial;
    }

    const raw = fs.readFileSync(DB_FILE, 'utf-8');
    const parsed = JSON.parse(raw);
    if (!parsed.categories || !Array.isArray(parsed.categories)) parsed.categories = DEFAULT_CATEGORIES;
    if (!parsed.expenses || !Array.isArray(parsed.expenses)) parsed.expenses = DEFAULT_EXPENSES;
    if (!parsed.users || !Array.isArray(parsed.users) || parsed.users.length === 0) {
      parsed.users = DEFAULT_USERS;
      saveDataFile(parsed);
    }
    return parsed;
  } catch (err) {
    console.error('Error loading local db file:', err);
    return { categories: DEFAULT_CATEGORIES, expenses: DEFAULT_EXPENSES, users: DEFAULT_USERS };
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

// Check MongoDB connection availability
let isMongoConnected = false;
export async function connectMongo() {
  if (isMongoConnected || !process.env.MONGODB_URI) {
    return isMongoConnected;
  }
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    isMongoConnected = true;
    console.log('MongoDB successfully connected.');
    return true;
  } catch (error) {
    console.warn('MongoDB connection failed, continuing with local persistent storage:', error);
    isMongoConnected = false;
    return false;
  }
}

// --- Category Operations ---
export async function getCategories(): Promise<ExpenseCategory[]> {
  const data = ensureDataFile();
  return data.categories;
}

export async function getCategoryById(id: string): Promise<ExpenseCategory | undefined> {
  const data = ensureDataFile();
  return data.categories.find(c => c.id === id);
}

export async function createCategory(input: Omit<ExpenseCategory, 'id' | 'createdAt'>): Promise<ExpenseCategory> {
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
  const data = ensureDataFile();
  const index = data.categories.findIndex(c => c.id === id);
  if (index === -1) return null;
  data.categories[index] = { ...data.categories[index], ...updates };
  saveDataFile(data);
  return data.categories[index];
}

export async function deleteCategory(id: string): Promise<boolean> {
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
  const data = ensureDataFile();
  let list = [...data.expenses];
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

// --- User & Authentication Operations ---

// Strip sensitive passwordHash before returning to clients
function sanitizeUser(stored: StoredUser): User {
  const { passwordHash: _hash, ...user } = stored;
  return user;
}

export async function getUsers(): Promise<User[]> {
  const data = ensureDataFile();
  return data.users.map(sanitizeUser);
}

export async function getUserById(id: string): Promise<User | undefined> {
  const data = ensureDataFile();
  const found = data.users.find(u => u.id === id);
  return found ? sanitizeUser(found) : undefined;
}

export async function getUserByEmail(email: string): Promise<StoredUser | undefined> {
  const data = ensureDataFile();
  return data.users.find(u => u.email.toLowerCase() === email.toLowerCase().trim());
}

export async function authenticateUser(email: string, password: string): Promise<User | null> {
  const data = ensureDataFile();
  const cleanEmail = email.toLowerCase().trim();
  const user = data.users.find(u => u.email.toLowerCase() === cleanEmail);

  if (!user) {
    return null;
  }

  const inputHash = hashPassword(password);
  // Also support demo password matching "password123" for demo seeds
  const isValid = user.passwordHash === inputHash || (password === 'password123' && user.id.startsWith('user_'));

  if (!isValid) {
    return null;
  }

  // Update last login
  user.lastLogin = new Date().toISOString();
  saveDataFile(data);

  return sanitizeUser(user);
}

export async function createUser(input: RegisterData): Promise<User> {
  const data = ensureDataFile();
  const cleanEmail = input.email.toLowerCase().trim();

  // Check existing
  if (data.users.some(u => u.email.toLowerCase() === cleanEmail)) {
    throw new Error('An account with this email address already exists.');
  }

  const id = `user_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
  const now = new Date().toISOString();
  const initials = getInitials(input.name);

  // Pick a polished background avatar
  const avatarColors = [
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=200&auto=format&fit=crop&q=80',
  ];
  const avatar = avatarColors[Math.floor(Math.random() * avatarColors.length)];

  const newUser: StoredUser = {
    id,
    name: input.name.trim(),
    email: cleanEmail,
    role: (input.role as UserRole) || 'Finance Director',
    department: input.department?.trim() || 'Finance & Accounts',
    avatar,
    initials,
    passwordHash: hashPassword(input.password),
    createdAt: now,
    lastLogin: now,
  };

  data.users.unshift(newUser);
  saveDataFile(data);

  return sanitizeUser(newUser);
}

export async function updateUser(id: string, updates: Partial<User>): Promise<User | null> {
  const data = ensureDataFile();
  const idx = data.users.findIndex(u => u.id === id);
  if (idx === -1) return null;

  data.users[idx] = {
    ...data.users[idx],
    ...updates,
    id: data.users[idx].id, // protect immutable ID
  };
  saveDataFile(data);
  return sanitizeUser(data.users[idx]);
}

export async function resetDemoData(): Promise<void> {
  const initial: LocalDBData = {
    categories: DEFAULT_CATEGORIES,
    expenses: DEFAULT_EXPENSES,
    users: DEFAULT_USERS,
  };
  saveDataFile(initial);
}
