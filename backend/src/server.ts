import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import path from 'path';
import dotenv from 'dotenv';
import multer from 'multer';
import fs from 'fs';
import helmet from 'helmet';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  getExpenses,
  getExpenseById,
  createExpense,
  updateExpense,
  deleteExpense,
  getDashboardStats,
  resetExpenseData,
  findUserByEmail,
  findUserById,
  createUser,
  isPrismaAvailable,
  getEmployees,
  getEmployeeById,
  createEmployee,
  updateEmployee,
  deleteEmployee,
  getSalaryPayments,
  createSalaryPayment,
  deleteSalaryPayment,
  getPayrollStats,
  getProjects,
  getProjectById,
  createProject,
  updateProject,
  deleteProject,
  addProjectTask,
  updateProjectTask,
  deleteProjectTask,
  getProjectStats,
} from './db';
import { swaggerSpec } from './swagger';
import { upload, UPLOAD_DIR } from './upload';

dotenv.config({ path: '.env.local' });
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;
const JWT_SECRET = process.env.JWT_SECRET || 'expense_tracker_prod_jwt_secret_key_2026';
const NODE_ENV = process.env.NODE_ENV || 'production';

// -------------------------------------------------------------
// 1. Production Security & Optimization Middlewares
// -------------------------------------------------------------

// Security HTTP headers
app.use(
  helmet({
    contentSecurityPolicy: false, // Allows Swagger UI and embedded PDF previews
    crossOriginResourcePolicy: { policy: 'cross-origin' }, // Allows cross-origin receipt image loads
  })
);

// Compression for JSON payloads and static assets
app.use(compression());

// CORS Configuration
const allowedOrigins = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(',').map((s) => s.trim())
  : ['http://localhost:3000', 'http://127.0.0.1:3000'];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes('*') || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(null, true);
    },
    credentials: true,
  })
);

// Rate limiting on API routes
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, error: 'Too many requests from this IP. Please try again later.' },
});
app.use('/api', apiLimiter);

// Stricter rate limiting on authentication routes (prevent brute force)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 40,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, error: 'Too many authentication attempts. Please try again in 15 minutes.' },
});
app.use('/api/auth', authLimiter);

// Body parsing with safe limits
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Serve uploaded files publicly at /uploads/:filename
app.use('/uploads', express.static(UPLOAD_DIR));

// -------------------------------------------------------------
// 2. Health & Readiness Check Endpoint
// -------------------------------------------------------------
app.get(['/health', '/api/health'], async (req: Request, res: Response) => {
  let dbAvailable = false;
  try {
    dbAvailable = await isPrismaAvailable();
  } catch {
    dbAvailable = false;
  }

  res.status(200).json({
    status: 'healthy',
    service: 'Expense Tracker Express API',
    uptime: Math.floor(process.uptime()),
    timestamp: new Date().toISOString(),
    environment: NODE_ENV,
    database: dbAvailable ? 'postgresql' : 'local-storage',
  });
});

// -------------------------------------------------------------
// 3. Authentication Endpoints (Bcrypt Hashing + JWT)
// -------------------------------------------------------------

// Sign Up / Register Endpoint
app.post(['/api/auth/signup', '/api/auth/register'], async (req: Request, res: Response) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Name, email, and password are required',
      });
    }

    if (String(password).length < 4) {
      return res.status(400).json({
        success: false,
        error: 'Password must be at least 4 characters long',
      });
    }

    const normalizedEmail = String(email).trim().toLowerCase();

    // Check if user already exists
    const existing = await findUserByEmail(normalizedEmail);
    if (existing) {
      return res.status(400).json({
        success: false,
        error: 'An account with this email already exists. Please log in.',
      });
    }

    // Cryptographic Password Hashing with Salt
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(String(password), salt);

    const created = await createUser({
      name: String(name).trim(),
      email: normalizedEmail,
      password: hashedPassword,
    });

    res.status(201).json({
      success: true,
      message: 'Account created successfully! Please log in with your credentials.',
      user: {
        id: created.id,
        name: created.name,
        email: created.email,
        initials: created.initials,
        createdAt: created.createdAt,
      },
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Log In Endpoint (Verify Bcrypt + Issue JWT)
app.post('/api/auth/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Email and password are required',
      });
    }

    const normalizedEmail = String(email).trim().toLowerCase();

    // Check registered accounts in database
    const dbUser = await findUserByEmail(normalizedEmail);
    if (!dbUser) {
      return res.status(404).json({
        success: false,
        error: 'No account found with this email. Please sign up first.',
      });
    }

    // Compare with bcrypt (with backward-compatible support for any unhashed local records)
    let isPasswordValid = false;
    if (dbUser.password?.startsWith('$2a$') || dbUser.password?.startsWith('$2b$')) {
      isPasswordValid = await bcrypt.compare(String(password), dbUser.password);
    } else {
      isPasswordValid = dbUser.password === String(password);
    }

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        error: 'Invalid password. Please check your credentials and try again.',
      });
    }

    const user = {
      id: dbUser.id,
      name: dbUser.name,
      email: dbUser.email,
      initials: dbUser.initials,
      createdAt: dbUser.createdAt,
    };

    // Cryptographically signed JWT token with 7-day validity
    const token = jwt.sign(
      { id: user.id, email: user.email },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        initials: user.initials,
        createdAt: user.createdAt,
        lastLogin: new Date().toISOString(),
      },
      token,
      message: 'Login successful',
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Authenticated User Session Verification
app.get('/api/auth/me', async (req: Request, res: Response) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ success: false, error: 'Unauthorized: No token provided' });
    }

    const token = authHeader.startsWith('Bearer ')
      ? authHeader.slice(7).trim()
      : authHeader.trim();

    const decoded = jwt.verify(token, JWT_SECRET) as { id: string; email: string };
    const user = await findUserById(decoded.id);
    if (!user) {
      return res.status(404).json({ success: false, error: 'User account not found' });
    }

    res.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        initials: user.initials,
        createdAt: user.createdAt,
      },
    });
  } catch (err: any) {
    res.status(401).json({ success: false, error: 'Invalid or expired session token' });
  }
});

app.post('/api/auth/logout', (req: Request, res: Response) => {
  res.json({ success: true, message: 'Logged out successfully' });
});

// -------------------------------------------------------------
// Helper: Extract Authenticated User ID from Request
// -------------------------------------------------------------
function getRequestUserId(req: Request): string | undefined {
  try {
    const authHeader = req.headers.authorization;
    if (authHeader) {
      const token = authHeader.startsWith('Bearer ')
        ? authHeader.slice(7).trim()
        : authHeader.trim();
      if (token) {
        const decoded = jwt.verify(token, JWT_SECRET) as { id?: string; userId?: string };
        if (decoded?.id || decoded?.userId) {
          return decoded.id || decoded.userId;
        }
      }
    }
  } catch {
    // JWT verification failed or expired, check custom headers
  }

  const customHeader = req.headers['x-user-id'];
  if (typeof customHeader === 'string' && customHeader.trim()) {
    return customHeader.trim();
  }

  if (typeof req.query.userId === 'string' && req.query.userId.trim()) {
    return req.query.userId.trim();
  }

  return undefined;
}

// -------------------------------------------------------------
// 4. Categories Endpoints
// -------------------------------------------------------------
app.get('/api/categories', async (req: Request, res: Response) => {
  try {
    const userId = getRequestUserId(req);
    const categories = await getCategories(userId);
    res.json({ success: true, data: categories });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/categories', async (req: Request, res: Response) => {
  try {
    const userId = getRequestUserId(req);
    const { name, color, icon, description, budget } = req.body;
    if (!name) return res.status(400).json({ success: false, error: 'Category name is required' });
    const created = await createCategory({
      userId,
      name,
      color: color || '#6366f1',
      icon: icon || 'Layers',
      description,
      budget: budget ? Number(budget) : undefined,
    });
    res.status(201).json({ success: true, data: created });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.put('/api/categories/:id', async (req: Request, res: Response) => {
  try {
    const updated = await updateCategory(req.params.id, req.body);
    if (!updated) return res.status(404).json({ success: false, error: 'Category not found' });
    res.json({ success: true, data: updated });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.delete('/api/categories/:id', async (req: Request, res: Response) => {
  try {
    const deleted = await deleteCategory(req.params.id);
    if (!deleted) return res.status(404).json({ success: false, error: 'Category not found' });
    res.json({ success: true, message: 'Category deleted successfully' });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// -------------------------------------------------------------
// 5. Expenses Endpoints
// -------------------------------------------------------------
app.get('/api/expenses', async (req: Request, res: Response) => {
  try {
    const userId = getRequestUserId(req);
    const filters: any = {
      userId,
      search: req.query.search as string,
      categoryId: req.query.categoryId as string,
      startDate: req.query.startDate as string,
      endDate: req.query.endDate as string,
      status: req.query.status as string,
      paymentMethod: req.query.paymentMethod as string,
      limit: req.query.limit ? Number(req.query.limit) : undefined,
      offset: req.query.offset ? Number(req.query.offset) : undefined,
    };
    if (req.query.minAmount) filters.minAmount = Number(req.query.minAmount);
    if (req.query.maxAmount) filters.maxAmount = Number(req.query.maxAmount);

    const result = await getExpenses(filters);
    res.json({ success: true, data: result });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.get('/api/expenses/:id', async (req: Request, res: Response) => {
  try {
    const userId = getRequestUserId(req);
    const expense = await getExpenseById(req.params.id, userId);
    if (!expense) return res.status(404).json({ success: false, error: 'Expense not found' });
    res.json({ success: true, data: expense });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/expenses', async (req: Request, res: Response) => {
  try {
    const userId = getRequestUserId(req);
    const { amount, currency, categoryId, date, description, merchant, paymentMethod, status, attachment } = req.body;
    if (!amount || !categoryId || !date || !description) {
      return res.status(400).json({
        success: false,
        error: 'amount, categoryId, date, and description are required',
      });
    }

    const created = await createExpense({
      userId,
      amount: Number(amount),
      currency: currency || 'INR',
      categoryId,
      date,
      description,
      merchant,
      paymentMethod,
      status,
      attachment,
    });
    res.status(201).json({ success: true, data: created });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.put('/api/expenses/:id', async (req: Request, res: Response) => {
  try {
    const userId = getRequestUserId(req);
    const updated = await updateExpense(req.params.id, req.body, userId);
    if (!updated) return res.status(404).json({ success: false, error: 'Expense not found' });
    res.json({ success: true, data: updated });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.delete('/api/expenses/:id', async (req: Request, res: Response) => {
  try {
    const userId = getRequestUserId(req);
    const deleted = await deleteExpense(req.params.id, userId);
    if (!deleted) return res.status(404).json({ success: false, error: 'Expense not found' });
    res.json({ success: true, message: 'Expense deleted successfully' });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// -------------------------------------------------------------
// 6. Analytics & Statistics Endpoint
// -------------------------------------------------------------
app.get('/api/stats', async (req: Request, res: Response) => {
  try {
    const userId = getRequestUserId(req);
    const stats = await getDashboardStats(userId);
    res.json({ success: true, data: stats });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// -------------------------------------------------------------
// 7. Employee Management & Salary Payroll Endpoints
// -------------------------------------------------------------
app.get('/api/employees', async (req: Request, res: Response) => {
  try {
    const userId = getRequestUserId(req);
    const list = await getEmployees(userId);
    res.json({ success: true, data: list });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.get('/api/employees/:id', async (req: Request, res: Response) => {
  try {
    const userId = getRequestUserId(req);
    const emp = await getEmployeeById(req.params.id, userId);
    if (!emp) return res.status(404).json({ success: false, error: 'Employee not found' });
    res.json({ success: true, data: emp });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/employees', async (req: Request, res: Response) => {
  try {
    const userId = getRequestUserId(req);
    const { name, email, phone, department, designation, baseSalary, status, joinDate, avatar } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, error: 'Employee name is required' });
    }
    const created = await createEmployee({
      userId,
      name,
      email,
      phone,
      department: department || 'Engineering',
      designation: designation || 'Staff',
      baseSalary: Number(baseSalary) || 0,
      status: status || 'Active',
      joinDate: joinDate || new Date().toISOString().split('T')[0],
      avatar,
    });
    res.status(201).json({ success: true, data: created });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.put('/api/employees/:id', async (req: Request, res: Response) => {
  try {
    const userId = getRequestUserId(req);
    const updated = await updateEmployee(req.params.id, req.body, userId);
    if (!updated) return res.status(404).json({ success: false, error: 'Employee not found' });
    res.json({ success: true, data: updated });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.delete('/api/employees/:id', async (req: Request, res: Response) => {
  try {
    const userId = getRequestUserId(req);
    const deleted = await deleteEmployee(req.params.id, userId);
    if (!deleted) return res.status(404).json({ success: false, error: 'Employee not found' });
    res.json({ success: true, message: 'Employee deleted successfully' });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Salary Payments (Payroll)
app.get('/api/salaries', async (req: Request, res: Response) => {
  try {
    const userId = getRequestUserId(req);
    const { employeeId, month } = req.query;
    const list = await getSalaryPayments({
      userId,
      employeeId: employeeId as string,
      month: month as string,
    });
    res.json({ success: true, data: list });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/salaries', async (req: Request, res: Response) => {
  try {
    const userId = getRequestUserId(req);
    const { employeeId, month, baseSalary, bonus, deductions, netSalary, paymentDate, paymentMethod, status, notes } = req.body;
    if (!employeeId) return res.status(400).json({ success: false, error: 'Employee is required' });
    if (!month) return res.status(400).json({ success: false, error: 'Salary month is required' });

    const created = await createSalaryPayment({
      userId,
      employeeId,
      month,
      baseSalary: Number(baseSalary) || 0,
      bonus: Number(bonus) || 0,
      deductions: Number(deductions) || 0,
      netSalary: Number(netSalary) || 0,
      paymentDate: paymentDate || new Date().toISOString().split('T')[0],
      paymentMethod: paymentMethod || 'Bank Transfer',
      status: status || 'Paid',
      notes,
    });
    res.status(201).json({ success: true, data: created });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.delete('/api/salaries/:id', async (req: Request, res: Response) => {
  try {
    const userId = getRequestUserId(req);
    const deleted = await deleteSalaryPayment(req.params.id, userId);
    if (!deleted) return res.status(404).json({ success: false, error: 'Salary record not found' });
    res.json({ success: true, message: 'Salary disbursement record deleted successfully' });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.get('/api/payroll/stats', async (req: Request, res: Response) => {
  try {
    const userId = getRequestUserId(req);
    const stats = await getPayrollStats(userId);
    res.json({ success: true, data: stats });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// -------------------------------------------------------------
// 8. Project Management Endpoints
// -------------------------------------------------------------
app.get('/api/projects', async (req: Request, res: Response) => {
  try {
    const userId = getRequestUserId(req);
    const { status, priority, search } = req.query;
    const list = await getProjects(userId, {
      status: status as string,
      priority: priority as string,
      search: search as string,
    });
    res.json({ success: true, data: list });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.get('/api/projects/stats/summary', async (req: Request, res: Response) => {
  try {
    const userId = getRequestUserId(req);
    const stats = await getProjectStats(userId);
    res.json({ success: true, data: stats });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.get('/api/projects/:id', async (req: Request, res: Response) => {
  try {
    const userId = getRequestUserId(req);
    const project = await getProjectById(req.params.id, userId);
    if (!project) return res.status(404).json({ success: false, error: 'Project not found' });
    res.json({ success: true, data: project });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/projects', async (req: Request, res: Response) => {
  try {
    const userId = getRequestUserId(req);
    const {
      title,
      description,
      client,
      category,
      status,
      priority,
      budget,
      spent,
      currency,
      startDate,
      deadline,
      progress,
      teamMembers,
      tasks,
    } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({ success: false, error: 'Project title is required' });
    }
    if (!deadline) {
      return res.status(400).json({ success: false, error: 'Project deadline is required' });
    }

    const created = await createProject({
      userId,
      title: title.trim(),
      description,
      client,
      category: category || 'General',
      status: status || 'In Progress',
      priority: priority || 'Medium',
      budget: Number(budget) || 0,
      spent: Number(spent) || 0,
      currency: currency || 'INR',
      startDate: startDate || new Date().toISOString().split('T')[0],
      deadline,
      progress: progress !== undefined ? Number(progress) : 0,
      teamMembers: Array.isArray(teamMembers) ? teamMembers : [],
      tasks: Array.isArray(tasks) ? tasks : [],
    });

    res.status(201).json({ success: true, data: created });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.put('/api/projects/:id', async (req: Request, res: Response) => {
  try {
    const userId = getRequestUserId(req);
    const updated = await updateProject(req.params.id, req.body, userId);
    if (!updated) return res.status(404).json({ success: false, error: 'Project not found' });
    res.json({ success: true, data: updated });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.delete('/api/projects/:id', async (req: Request, res: Response) => {
  try {
    const userId = getRequestUserId(req);
    const deleted = await deleteProject(req.params.id, userId);
    if (!deleted) return res.status(404).json({ success: false, error: 'Project not found' });
    res.json({ success: true, message: 'Project deleted successfully' });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Project Tasks Endpoints
app.post('/api/projects/:id/tasks', async (req: Request, res: Response) => {
  try {
    const userId = getRequestUserId(req);
    const { title, description, assignedEmployeeId, assignedEmployeeName, status, priority, dueDate } = req.body;
    if (!title || !title.trim()) {
      return res.status(400).json({ success: false, error: 'Task title is required' });
    }

    const task = await addProjectTask(
      req.params.id,
      {
        title: title.trim(),
        description,
        assignedEmployeeId,
        assignedEmployeeName,
        status: status || 'Todo',
        priority: priority || 'Medium',
        dueDate,
      },
      userId
    );

    if (!task) return res.status(404).json({ success: false, error: 'Project not found' });
    res.status(201).json({ success: true, data: task });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.put('/api/projects/:id/tasks/:taskId', async (req: Request, res: Response) => {
  try {
    const userId = getRequestUserId(req);
    const updatedTask = await updateProjectTask(req.params.id, req.params.taskId, req.body, userId);
    if (!updatedTask) return res.status(404).json({ success: false, error: 'Task or project not found' });
    res.json({ success: true, data: updatedTask });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.delete('/api/projects/:id/tasks/:taskId', async (req: Request, res: Response) => {
  try {
    const userId = getRequestUserId(req);
    const deleted = await deleteProjectTask(req.params.id, req.params.taskId, userId);
    if (!deleted) return res.status(404).json({ success: false, error: 'Task or project not found' });
    res.json({ success: true, message: 'Task deleted successfully' });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});


// -------------------------------------------------------------
// 7. VPS Local Storage Receipt Upload Route
// -------------------------------------------------------------
app.post('/api/upload', (req: Request, res: Response) => {
  upload.single('file')(req, res, (err: any) => {
    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({
          success: false,
          error: 'File size exceeds maximum allowed limit of 10MB',
        });
      }
      return res.status(400).json({ success: false, error: err.message });
    } else if (err) {
      return res.status(400).json({ success: false, error: err.message });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'No file uploaded. Please attach a JPG, PNG, WEBP, or PDF receipt.',
      });
    }

    const host = req.get('host') || `localhost:${PORT}`;
    const protocol = req.protocol;
    const fileUrl = `/uploads/${req.file.filename}`;
    const fullUrl = `${protocol}://${host}${fileUrl}`;

    res.status(201).json({
      success: true,
      message: 'File uploaded and stored on VPS successfully',
      file: {
        filename: req.file.filename,
        originalName: req.file.originalname,
        mimetype: req.file.mimetype,
        size: req.file.size,
        url: fileUrl,
        fullUrl,
      },
    });
  });
});

// -------------------------------------------------------------
// 8. Clear/Reset Expenses
// -------------------------------------------------------------
app.post('/api/reset', async (req: Request, res: Response) => {
  try {
    await resetExpenseData();
    res.json({ success: true, message: 'All expenses cleared from database.' });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// -------------------------------------------------------------
// 9. Swagger / OpenAPI Documentation
// -------------------------------------------------------------
app.get(['/api/docs', '/api/swagger.json'], (req: Request, res: Response) => {
  res.json(swaggerSpec);
});

// -------------------------------------------------------------
// 10. Centralized Error Handling Middleware
// -------------------------------------------------------------
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error('[API Unhandled Error]:', err);
  const status = err.status || err.statusCode || 500;
  res.status(status).json({
    success: false,
    error: NODE_ENV === 'production' && status === 500
      ? 'Internal server error. Please try again later.'
      : err.message || 'Unknown error occurred',
  });
});

// -------------------------------------------------------------
// 11. Server Initialization & Graceful Shutdown
// -------------------------------------------------------------
function startServer(port: number) {
  const server = app.listen(port, () => {
    console.log(`[Production] Expense Tracker API Server running on port ${port} (env: ${NODE_ENV})`);
  });

  server.on('error', (err: any) => {
    if (err.code === 'EADDRINUSE') {
      console.warn(`Port ${port} in use, trying port ${port + 1}...`);
      startServer(port + 1);
    } else {
      console.error('Server error:', err);
    }
  });

  const shutdown = (signal: string) => {
    console.log(`\nReceived ${signal}. Gracefully closing HTTP server...`);
    server.close(() => {
      console.log('HTTP server closed successfully. Process terminated.');
      process.exit(0);
    });
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
}

startServer(Number(PORT) || 5001);
