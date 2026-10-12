import express, { Request, Response } from 'express';
import cors from 'cors';
import path from 'path';
import dotenv from 'dotenv';
import multer from 'multer';
import fs from 'fs';
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
  createUser,
} from './db';
import { swaggerSpec } from './swagger';

dotenv.config({ path: '.env.local' });
dotenv.config();

import { upload, UPLOAD_DIR } from './upload';

const app = express();
const PORT = process.env.PORT || 5001;

app.use(cors());
app.use(express.json());
// Serve uploaded files publicly at /uploads/:filename
app.use('/uploads', express.static(UPLOAD_DIR));

// Health check
app.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', service: 'Expense Tracker Express API', time: new Date().toISOString() });
});

// -------------------------------------------------------------
// Authentication Endpoints (Simple Sign Up & Log In)
// -------------------------------------------------------------

// 1. Sign Up Endpoint
app.post(['/api/auth/signup', '/api/auth/register'], async (req: Request, res: Response) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Name, email, and password are required',
      });
    }

    if (password.length < 4) {
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

    const created = await createUser({
      name: String(name).trim(),
      email: normalizedEmail,
      password: String(password),
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

// 2. Log In Endpoint
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

    if (dbUser.password && dbUser.password !== password) {
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

    const token = `tok_${Buffer.from(`${user.id}:${Date.now()}`).toString('base64')}`;

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

app.get('/api/auth/me', (req: Request, res: Response) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ success: false, error: 'Unauthorized' });
  }
  res.json({ success: true, message: 'Authenticated' });
});

app.post('/api/auth/logout', (req: Request, res: Response) => {
  res.json({ success: true, message: 'Logged out successfully' });
});

// Categories Endpoints
app.get('/api/categories', async (req: Request, res: Response) => {
  try {
    const categories = await getCategories();
    res.json({ success: true, data: categories });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/categories', async (req: Request, res: Response) => {
  try {
    const { name, color, icon, description, budget } = req.body;
    if (!name) return res.status(400).json({ success: false, error: 'Category name is required' });
    const created = await createCategory({
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

// Expenses Endpoints
app.get('/api/expenses', async (req: Request, res: Response) => {
  try {
    const filters: any = {
      search: req.query.search as string,
      categoryId: req.query.categoryId as string,
      startDate: req.query.startDate as string,
      endDate: req.query.endDate as string,
      minAmount: req.query.minAmount ? Number(req.query.minAmount) : undefined,
      maxAmount: req.query.maxAmount ? Number(req.query.maxAmount) : undefined,
      paymentMethod: req.query.paymentMethod as string,
      hasAttachment: req.query.hasAttachment ? req.query.hasAttachment === 'true' : undefined,
      sortBy: req.query.sortBy as any,
      sortOrder: req.query.sortOrder as any,
    };
    const expenses = await getExpenses(filters);
    res.json({ success: true, count: expenses.length, data: expenses });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.get('/api/expenses/:id', async (req: Request, res: Response) => {
  try {
    const expense = await getExpenseById(req.params.id);
    if (!expense) return res.status(404).json({ success: false, error: 'Expense not found' });
    res.json({ success: true, data: expense });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/expenses', async (req: Request, res: Response) => {
  try {
    const { amount, categoryId, date, description, merchant, paymentMethod, status, attachment } = req.body;
    if (!amount || !categoryId || !date) {
      return res.status(400).json({ success: false, error: 'Amount, category, and date are required' });
    }
    const created = await createExpense({
      amount: Number(amount),
      currency: 'INR',
      categoryId,
      date,
      description: description || 'Expense',
      merchant: merchant || 'Vendor',
      paymentMethod: paymentMethod || 'Corporate Card',
      status: status || 'Approved',
      attachment: attachment || null,
    });
    res.status(201).json({ success: true, data: created });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.put('/api/expenses/:id', async (req: Request, res: Response) => {
  try {
    const updated = await updateExpense(req.params.id, req.body);
    if (!updated) return res.status(404).json({ success: false, error: 'Expense not found' });
    res.json({ success: true, data: updated });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.delete('/api/expenses/:id', async (req: Request, res: Response) => {
  try {
    const deleted = await deleteExpense(req.params.id);
    if (!deleted) return res.status(404).json({ success: false, error: 'Expense not found' });
    res.json({ success: true, message: 'Expense deleted successfully' });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Stats & Aggregations
app.get('/api/stats', async (req: Request, res: Response) => {
  try {
    const stats = await getDashboardStats();
    res.json({ success: true, data: stats });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// VPS Local Storage Health & Diagnostics Status
app.get('/api/storage/status', (req: Request, res: Response) => {
  try {
    const files = fs.existsSync(UPLOAD_DIR)
      ? fs.readdirSync(UPLOAD_DIR).filter((f) => f !== '.gitkeep')
      : [];
    res.json({
      success: true,
      data: {
        provider: 'VPS Local Storage',
        uploadDir: UPLOAD_DIR,
        maxFileSize: '10MB',
        allowedTypes: ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'],
        totalFiles: files.length,
        message: 'VPS Local Disk Storage is active and persistent via Docker volume',
      },
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// File Upload Route (Local VPS Storage: PDF & Images up to 10MB)
app.post('/api/upload', (req: Request, res: Response) => {
  upload.single('file')(req, res, (err: any) => {
    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({
          success: false,
          error: 'File size exceeds 10MB limit. Maximum allowed size is 10MB.',
        });
      }
      return res.status(400).json({ success: false, error: err.message });
    } else if (err) {
      return res.status(400).json({ success: false, error: err.message });
    }

    if (!req.file) {
      return res.status(400).json({ success: false, error: 'No file provided in form data (field name: "file")' });
    }

    const host = req.get('host');
    const protocol = req.protocol;
    const fileUrl = `/uploads/${req.file.filename}`;
    const fullUrl = `${protocol}://${host}${fileUrl}`;

    res.status(201).json({
      success: true,
      message: 'File uploaded successfully',
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

// Clear/Reset Expenses
app.post('/api/reset', async (req: Request, res: Response) => {
  try {
    await resetExpenseData();
    res.json({ success: true, message: 'All expenses cleared from database.' });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Swagger / OpenAPI Specification
app.get(['/api/docs', '/api/swagger.json'], (req: Request, res: Response) => {
  res.json(swaggerSpec);
});

function startServer(port: number) {
  const server = app.listen(port, () => {
    console.log(`Expense Tracker Backend Express Server running on port ${port}`);
  });

  server.on('error', (err: any) => {
    if (err.code === 'EADDRINUSE') {
      console.warn(`Port ${port} in use, trying port ${port + 1}...`);
      startServer(port + 1);
    } else {
      console.error('Server error:', err);
    }
  });
}

startServer(Number(PORT) || 5001);
