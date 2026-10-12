import express, { Request, Response } from 'express';
import cors from 'cors';
import path from 'path';
import dotenv from 'dotenv';
import multer from 'multer';
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
  resetDemoData,
} from './db';
import { getCloudinaryStatus, uploadReceipt, isCloudinaryConfigured } from './cloudinary';
import { swaggerSpec } from './swagger';

dotenv.config({ path: '.env.local' });
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;

// Configure file upload with 15MB limit
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 15 * 1024 * 1024 },
});

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, '..', 'public', 'uploads')));

// Health check
app.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', service: 'Expense Tracker Express API', time: new Date().toISOString() });
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

// Cloudinary Storage Health Status
app.get('/api/cloudinary/status', (req: Request, res: Response) => {
  try {
    const status = getCloudinaryStatus();
    res.json({ success: true, data: status });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Bill Receipt File Upload
app.post('/api/upload', upload.single('file'), async (req: Request, res: Response) => {
  try {
    const file = req.file;
    if (!file) {
      return res.status(400).json({ success: false, error: 'No file provided in form data' });
    }

    const attachment = await uploadReceipt(file.buffer, file.originalname, file.mimetype);
    const storageProvider = isCloudinaryConfigured() ? 'Cloudinary CDN' : 'Local Storage';

    res.json({
      success: true,
      data: attachment,
      message: `Bill uploaded to ${storageProvider} successfully`,
    });
  } catch (err: any) {
    console.error('Backend upload error:', err);
    res.status(500).json({ success: false, error: err.message || 'Failed to upload bill attachment' });
  }
});

// Reset Demo Data
app.post('/api/reset', async (req: Request, res: Response) => {
  try {
    await resetDemoData();
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
