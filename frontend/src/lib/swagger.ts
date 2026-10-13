export const swaggerSpec = {
  openapi: '3.0.3',
  info: {
    title: 'Expense Tracker REST API',
    version: '1.0.0',
    description: `
**Expense Tracker API** provides complete financial management capabilities including:
- **Database & ORM**: PostgreSQL powered by Prisma ORM with type-safe schema modeling.
- **Expenses**: Multi-currency corporate transactions with receipt attachments, status flags, and advanced filtering.
- **Categories**: Dynamic category hierarchy with color codes, icons, and monthly budget limits.
- **Receipt & Media Uploads**: Fast multimedia asset management stored with high-speed persistence.
- **Analytics & Intelligence**: Real-time spending velocity, budget utilization, category breakdowns, and monthly/weekly trends.
    `,
    contact: {
      name: 'Expense Tracker API Support',
      url: 'https://www.samarth.tech',
    },
    license: {
      name: 'MIT',
      url: 'https://opensource.org/licenses/MIT',
    },
  },
  servers: [
    {
      url: 'https://api.samarth.tech',
      description: 'Production Dedicated API Gateway (api.samarth.tech)',
    },
    {
      url: 'https://www.samarth.tech',
      description: 'Production Web App & Gateway (www.samarth.tech)',
    },
    {
      url: 'http://localhost:28491',
      description: 'Local Docker Nginx Gateway (Port 28491)',
    },
    {
      url: 'http://localhost:3000',
      description: 'Local Next.js Frontend Development Server',
    },
    {
      url: 'http://localhost:25062',
      description: 'Direct Express Backend API (Port 25062)',
    },
  ],
  tags: [
    { name: 'Authentication', description: 'User registration, login authentication, and JWT session verification' },
    { name: 'Expenses', description: 'Record, list, filter, inspect, update, and delete corporate expenses' },
    { name: 'Categories', description: 'Manage budget categories with custom colors and Lucide icons' },
    { name: 'Media & Storage', description: 'Secure Local Storage bill uploads and storage health checks' },
    { name: 'Analytics', description: 'Executive metrics, spending trends, and budget tracking' },
    { name: 'System', description: 'Database management, health checks, and sample dataset reset' },
  ],
  paths: {
    '/health': {
      get: {
        tags: ['System'],
        summary: 'System Health and Database Readiness',
        description: 'Returns real-time health check, uptime, environment, and PostgreSQL database connection state.',
        responses: {
          200: {
            description: 'API and database are operational',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/HealthCheck' },
              },
            },
          },
        },
      },
    },
    '/api/auth/signup': {
      post: {
        tags: ['Authentication'],
        summary: 'Register New User Account',
        description: 'Creates a new user account with bcrypt password hashing and returns the created user profile.',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['name', 'email', 'password'],
                properties: {
                  name: { type: 'string', example: 'Samarth Patel' },
                  email: { type: 'string', format: 'email', example: 'samarth@samarth.tech' },
                  password: { type: 'string', format: 'password', minLength: 4, example: 'SecurePassword123' },
                },
              },
            },
          },
        },
        responses: {
          201: {
            description: 'Account created successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    message: { type: 'string', example: 'Account created successfully! Please log in with your credentials.' },
                    user: { $ref: '#/components/schemas/User' },
                  },
                },
              },
            },
          },
          400: { $ref: '#/components/responses/BadRequest' },
          500: { $ref: '#/components/responses/ServerError' },
        },
      },
    },
    '/api/auth/login': {
      post: {
        tags: ['Authentication'],
        summary: 'Log In User and Issue JWT Token',
        description: 'Authenticates user email and password against PostgreSQL and returns a signed 7-day JWT Bearer token.',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['email', 'password'],
                properties: {
                  email: { type: 'string', format: 'email', example: 'samarth@samarth.tech' },
                  password: { type: 'string', format: 'password', example: 'SecurePassword123' },
                  rememberMe: { type: 'boolean', example: true },
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: 'Authentication successful',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/AuthResponse' },
              },
            },
          },
          400: { $ref: '#/components/responses/BadRequest' },
          401: { $ref: '#/components/responses/Unauthorized' },
          404: { $ref: '#/components/responses/NotFound' },
          500: { $ref: '#/components/responses/ServerError' },
        },
      },
    },
    '/api/auth/me': {
      get: {
        tags: ['Authentication'],
        summary: 'Verify Current JWT Session',
        description: 'Validates the provided Bearer token and returns the authenticated user profile.',
        security: [
          {
            BearerAuth: [],
          },
        ],
        responses: {
          200: {
            description: 'Authenticated session profile',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    user: { $ref: '#/components/schemas/User' },
                  },
                },
              },
            },
          },
          401: { $ref: '#/components/responses/Unauthorized' },
          404: { $ref: '#/components/responses/NotFound' },
        },
      },
    },
    '/api/expenses': {
      get: {
        tags: ['Expenses'],
        summary: 'Filter and List Expenses',
        description: 'Retrieves corporate expenses with optional filtering by merchant, category, date range, amount bounds, payment method, or attachment presence.',
        parameters: [
          { name: 'search', in: 'query', schema: { type: 'string' }, description: 'Search term for merchant, description, or ID' },
          { name: 'categoryId', in: 'query', schema: { type: 'string' }, description: 'Filter by Category ID' },
          { name: 'startDate', in: 'query', schema: { type: 'string', format: 'date' }, description: 'Start date (YYYY-MM-DD)' },
          { name: 'endDate', in: 'query', schema: { type: 'string', format: 'date' }, description: 'End date (YYYY-MM-DD)' },
          { name: 'minAmount', in: 'query', schema: { type: 'number' }, description: 'Minimum amount filter' },
          { name: 'maxAmount', in: 'query', schema: { type: 'number' }, description: 'Maximum amount filter' },
          {
            name: 'paymentMethod',
            in: 'query',
            schema: {
              type: 'string',
              enum: ['Corporate Card', 'Wire Transfer', 'ACH', 'Reimbursement', 'Petty Cash'],
            },
            description: 'Filter by payment mechanism',
          },
          { name: 'hasAttachment', in: 'query', schema: { type: 'boolean' }, description: 'Filter by receipt attachment existence' },
          {
            name: 'sortBy',
            in: 'query',
            schema: { type: 'string', enum: ['date', 'amount', 'merchant'], default: 'date' },
            description: 'Sort field',
          },
          {
            name: 'sortOrder',
            in: 'query',
            schema: { type: 'string', enum: ['asc', 'desc'], default: 'desc' },
            description: 'Sort direction',
          },
        ],
        responses: {
          200: {
            description: 'List of matching expenses',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    count: { type: 'integer', example: 12 },
                    data: {
                      type: 'array',
                      items: { $ref: '#/components/schemas/Expense' },
                    },
                  },
                },
              },
            },
          },
          500: { $ref: '#/components/responses/ServerError' },
        },
      },
      post: {
        tags: ['Expenses'],
        summary: 'Record New Expense',
        description: 'Creates a new financial disbursement record with amount, category, merchant, and optional bill attachment.',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['amount', 'categoryId', 'date'],
                properties: {
                  amount: { type: 'number', minimum: 0.01, example: 4500.00 },
                  currency: { type: 'string', default: 'INR', example: 'INR' },
                  categoryId: { type: 'string', example: 'cat_01' },
                  date: { type: 'string', format: 'date', example: '2026-10-12' },
                  merchant: { type: 'string', example: 'Amazon Web Services' },
                  description: { type: 'string', example: 'Monthly Cloud Infrastructure compute charges' },
                  paymentMethod: {
                    type: 'string',
                    enum: ['Corporate Card', 'Wire Transfer', 'ACH', 'Reimbursement', 'Petty Cash'],
                    default: 'Corporate Card',
                    example: 'Corporate Card',
                  },
                  status: {
                    type: 'string',
                    enum: ['Approved', 'Pending Review', 'Flagged'],
                    default: 'Approved',
                    example: 'Approved',
                  },
                  attachment: { $ref: '#/components/schemas/ExpenseAttachment' },
                },
              },
            },
          },
        },
        responses: {
          201: {
            description: 'Expense created successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    data: { $ref: '#/components/schemas/Expense' },
                  },
                },
              },
            },
          },
          400: { $ref: '#/components/responses/BadRequest' },
          500: { $ref: '#/components/responses/ServerError' },
        },
      },
    },
    '/api/expenses/{id}': {
      get: {
        tags: ['Expenses'],
        summary: 'Get Expense by ID',
        description: 'Retrieves complete details of an expense record, including category resolution and receipt URLs.',
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string' }, description: 'Expense Unique ID' },
        ],
        responses: {
          200: {
            description: 'Expense record found',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    data: { $ref: '#/components/schemas/Expense' },
                  },
                },
              },
            },
          },
          404: { $ref: '#/components/responses/NotFound' },
          500: { $ref: '#/components/responses/ServerError' },
        },
      },
      put: {
        tags: ['Expenses'],
        summary: 'Update Expense',
        description: 'Updates specified fields of an existing expense transaction.',
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string' }, description: 'Expense Unique ID' },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  amount: { type: 'number', example: 5200.00 },
                  currency: { type: 'string', example: 'INR' },
                  categoryId: { type: 'string', example: 'cat_01' },
                  date: { type: 'string', format: 'date', example: '2026-10-12' },
                  merchant: { type: 'string', example: 'AWS Cloud Services' },
                  description: { type: 'string', example: 'Updated compute and storage charges' },
                  paymentMethod: { type: 'string', enum: ['Corporate Card', 'Wire Transfer', 'ACH', 'Reimbursement', 'Petty Cash'] },
                  status: { type: 'string', enum: ['Approved', 'Pending Review', 'Flagged'] },
                  attachment: { $ref: '#/components/schemas/ExpenseAttachment' },
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: 'Expense updated successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    data: { $ref: '#/components/schemas/Expense' },
                  },
                },
              },
            },
          },
          404: { $ref: '#/components/responses/NotFound' },
          500: { $ref: '#/components/responses/ServerError' },
        },
      },
      delete: {
        tags: ['Expenses'],
        summary: 'Delete Expense',
        description: 'Deletes an expense disbursement record permanently.',
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string' }, description: 'Expense Unique ID' },
        ],
        responses: {
          200: {
            description: 'Expense deleted successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    message: { type: 'string', example: 'Expense deleted successfully' },
                  },
                },
              },
            },
          },
          404: { $ref: '#/components/responses/NotFound' },
          500: { $ref: '#/components/responses/ServerError' },
        },
      },
    },
    '/api/categories': {
      get: {
        tags: ['Categories'],
        summary: 'List All Categories',
        description: 'Retrieves all available expense categories along with color badges, Lucide icon keys, and monthly budgets.',
        responses: {
          200: {
            description: 'List of categories',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    data: {
                      type: 'array',
                      items: { $ref: '#/components/schemas/ExpenseCategory' },
                    },
                  },
                },
              },
            },
          },
          500: { $ref: '#/components/responses/ServerError' },
        },
      },
      post: {
        tags: ['Categories'],
        summary: 'Create Custom Category',
        description: 'Creates a custom corporate expense category with unique color, Lucide icon, and optional monthly budget.',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['name'],
                properties: {
                  name: { type: 'string', example: 'Cloud Infrastructure' },
                  color: { type: 'string', example: '#6366f1' },
                  icon: { type: 'string', example: 'Server' },
                  description: { type: 'string', example: 'Cloud hosting, compute, and CDN expenditure' },
                  budget: { type: 'number', example: 50000 },
                },
              },
            },
          },
        },
        responses: {
          201: {
            description: 'Category created successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    data: { $ref: '#/components/schemas/ExpenseCategory' },
                  },
                },
              },
            },
          },
          400: { $ref: '#/components/responses/BadRequest' },
          500: { $ref: '#/components/responses/ServerError' },
        },
      },
    },
    '/api/categories/{id}': {
      get: {
        tags: ['Categories'],
        summary: 'Get Category by ID',
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string' }, description: 'Category Unique ID' },
        ],
        responses: {
          200: {
            description: 'Category found',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    data: { $ref: '#/components/schemas/ExpenseCategory' },
                  },
                },
              },
            },
          },
          404: { $ref: '#/components/responses/NotFound' },
          500: { $ref: '#/components/responses/ServerError' },
        },
      },
      put: {
        tags: ['Categories'],
        summary: 'Update Category',
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string' }, description: 'Category Unique ID' },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  name: { type: 'string', example: 'Cloud & DevOps' },
                  color: { type: 'string', example: '#0284c7' },
                  icon: { type: 'string', example: 'Cpu' },
                  description: { type: 'string', example: 'Hosting, SaaS tooling, and databases' },
                  budget: { type: 'number', example: 65000 },
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: 'Category updated successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    data: { $ref: '#/components/schemas/ExpenseCategory' },
                  },
                },
              },
            },
          },
          404: { $ref: '#/components/responses/NotFound' },
          500: { $ref: '#/components/responses/ServerError' },
        },
      },
      delete: {
        tags: ['Categories'],
        summary: 'Delete Category',
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string' }, description: 'Category Unique ID' },
        ],
        responses: {
          200: {
            description: 'Category deleted successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    message: { type: 'string', example: 'Category deleted successfully' },
                  },
                },
              },
            },
          },
          404: { $ref: '#/components/responses/NotFound' },
          500: { $ref: '#/components/responses/ServerError' },
        },
      },
    },
    '/api/upload': {
      post: {
        tags: ['Media & Storage'],
        summary: 'Upload Receipt / Bill Document',
        description: 'Uploads a receipt image (JPG, PNG, WebP) or document (PDF) to local disk storage (/uploads) backed by persistent storage.',
        requestBody: {
          required: true,
          content: {
            'multipart/form-data': {
              schema: {
                type: 'object',
                required: ['file'],
                properties: {
                  file: {
                    type: 'string',
                    format: 'binary',
                    description: 'Invoice receipt file (Max 10MB. Supported: JPG, PNG, WebP, PDF)',
                  },
                },
              },
            },
          },
        },
        responses: {
          201: {
            description: 'File uploaded and media link generated',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    file: { $ref: '#/components/schemas/ExpenseAttachment' },
                    message: { type: 'string', example: 'File uploaded successfully' },
                  },
                },
              },
            },
          },
          400: { $ref: '#/components/responses/BadRequest' },
          500: { $ref: '#/components/responses/ServerError' },
        },
      },
    },
    '/api/storage/status': {
      get: {
        tags: ['Media & Storage'],
        summary: 'Storage Health & Diagnostics Status',
        description: 'Returns real-time status of local disk storage, directory, max file size, and total file count.',
        responses: {
          200: {
            description: 'Storage status report',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    data: { $ref: '#/components/schemas/StorageStatus' },
                  },
                },
              },
            },
          },
          500: { $ref: '#/components/responses/ServerError' },
        },
      },
    },
    '/api/stats': {
      get: {
        tags: ['Analytics'],
        summary: 'Get Executive Financial Analytics',
        description: 'Computes real-time dashboard figures: total spending, monthly expenses, growth percentage, budget utilization, category breakdowns, and monthly/weekly trends.',
        responses: {
          200: {
            description: 'Executive financial metrics',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    data: { $ref: '#/components/schemas/DashboardStats' },
                  },
                },
              },
            },
          },
          500: { $ref: '#/components/responses/ServerError' },
        },
      },
    },
    '/api/reset': {
      post: {
        tags: ['System'],
        summary: 'Reset / Clear Expense Records',
        description: 'Clears all existing expense transactions and resets the database store to a fresh slate.',
        responses: {
          200: {
            description: 'Store reset successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    message: { type: 'string', example: 'Sample dataset reset successfully' },
                  },
                },
              },
            },
          },
          500: { $ref: '#/components/responses/ServerError' },
        },
      },
    },
  },
  components: {
    securitySchemes: {
      BearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Enter your JWT Bearer token obtained from /api/auth/login to authenticate endpoints',
      },
    },
    schemas: {
      User: {
        type: 'object',
        properties: {
          id: { type: 'string', example: 'usr_cm7abc123' },
          name: { type: 'string', example: 'Samarth Patel' },
          email: { type: 'string', format: 'email', example: 'samarth@samarth.tech' },
          initials: { type: 'string', example: 'SP' },
          createdAt: { type: 'string', format: 'date-time', example: '2026-10-13T12:00:00.000Z' },
        },
      },
      AuthResponse: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: true },
          token: { type: 'string', example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' },
          message: { type: 'string', example: 'Login successful' },
          user: { $ref: '#/components/schemas/User' },
        },
      },
      HealthCheck: {
        type: 'object',
        properties: {
          status: { type: 'string', example: 'healthy' },
          service: { type: 'string', example: 'Expense Tracker Express API' },
          uptime: { type: 'integer', example: 3420 },
          timestamp: { type: 'string', format: 'date-time', example: '2026-10-13T12:00:00.000Z' },
          environment: { type: 'string', example: 'production' },
          database: { type: 'string', example: 'postgresql' },
        },
      },
      ExpenseCategory: {
        type: 'object',
        properties: {
          id: { type: 'string', example: 'cat_01' },
          name: { type: 'string', example: 'Tech & SaaS' },
          color: { type: 'string', example: '#6366f1' },
          icon: { type: 'string', example: 'Laptop' },
          description: { type: 'string', example: 'Cloud hosting, SaaS subscriptions, engineering tools' },
          budget: { type: 'number', example: 75000 },
          isDefault: { type: 'boolean', example: true },
          createdAt: { type: 'string', format: 'date-time', example: '2026-10-12T00:00:00.000Z' },
        },
      },
      ExpenseAttachment: {
        type: 'object',
        properties: {
          id: { type: 'string', example: 'att_1791821844588_729v9' },
          name: { type: 'string', example: 'aws_invoice_october.pdf' },
          mimeType: { type: 'string', example: 'application/pdf' },
          size: { type: 'integer', example: 1048576, description: 'File size in bytes' },
          url: { type: 'string', example: '/uploads/aws_invoice_october-1791838631007-621403032.pdf' },
          filename: { type: 'string', example: 'aws_invoice_october-1791838631007-621403032.pdf' },
          thumbnailUrl: { type: 'string', example: '/uploads/aws_invoice_october-1791838631007-621403032.pdf' },
          localUrl: { type: 'string', example: '/uploads/aws_invoice_october-1791838631007-621403032.pdf' },
        },
      },
      Expense: {
        type: 'object',
        properties: {
          id: { type: 'string', example: 'exp_1791821844588_k82' },
          amount: { type: 'number', example: 1420.50 },
          currency: { type: 'string', example: 'INR' },
          categoryId: { type: 'string', example: 'cat_01' },
          category: { $ref: '#/components/schemas/ExpenseCategory' },
          date: { type: 'string', format: 'date', example: '2026-10-12' },
          description: { type: 'string', example: 'GitHub Enterprise annual subscription renewal' },
          merchant: { type: 'string', example: 'GitHub, Inc.' },
          paymentMethod: {
            type: 'string',
            enum: ['Corporate Card', 'Wire Transfer', 'ACH', 'Reimbursement', 'Petty Cash'],
            example: 'Corporate Card',
          },
          status: {
            type: 'string',
            enum: ['Approved', 'Pending Review', 'Flagged'],
            example: 'Approved',
          },
          attachment: {
            anyOf: [
              { $ref: '#/components/schemas/ExpenseAttachment' },
              { type: 'null' },
            ],
          },
          createdAt: { type: 'string', format: 'date-time', example: '2026-10-12T14:30:00.000Z' },
          updatedAt: { type: 'string', format: 'date-time', example: '2026-10-12T14:30:00.000Z' },
        },
      },
      CategoryBreakdownItem: {
        type: 'object',
        properties: {
          categoryId: { type: 'string', example: 'cat_01' },
          name: { type: 'string', example: 'Tech & SaaS' },
          color: { type: 'string', example: '#6366f1' },
          icon: { type: 'string', example: 'Laptop' },
          total: { type: 'number', example: 45000 },
          count: { type: 'integer', example: 4 },
          percentage: { type: 'number', example: 38.5 },
          budget: { type: 'number', example: 75000 },
        },
      },
      MonthlyTrendItem: {
        type: 'object',
        properties: {
          month: { type: 'string', example: 'Oct 2026' },
          amount: { type: 'number', example: 112500 },
          previousYear: { type: 'number', example: 98000 },
        },
      },
      WeeklyTrendItem: {
        type: 'object',
        properties: {
          day: { type: 'string', example: 'Mon' },
          fullDate: { type: 'string', example: '2026-10-12' },
          amount: { type: 'number', example: 18450 },
        },
      },
      DashboardStats: {
        type: 'object',
        properties: {
          totalExpenses: { type: 'number', example: 184250.00 },
          monthlyExpenses: { type: 'number', example: 62400.00 },
          monthlyGrowth: { type: 'number', example: 4.8 },
          totalReceipts: { type: 'integer', example: 18 },
          averageExpense: { type: 'number', example: 3850.00 },
          budgetUtilization: { type: 'number', example: 54.2 },
          categoryBreakdown: {
            type: 'array',
            items: { $ref: '#/components/schemas/CategoryBreakdownItem' },
          },
          monthlyTrends: {
            type: 'array',
            items: { $ref: '#/components/schemas/MonthlyTrendItem' },
          },
          weeklyTrends: {
            type: 'array',
            items: { $ref: '#/components/schemas/WeeklyTrendItem' },
          },
          recentExpenses: {
            type: 'array',
            items: { $ref: '#/components/schemas/Expense' },
          },
        },
      },
      StorageStatus: {
        type: 'object',
        properties: {
          provider: { type: 'string', example: 'Verified Local Storage' },
          uploadDir: { type: 'string', example: 'backend/uploads/' },
          maxFileSize: { type: 'string', example: '10MB' },
          allowedTypes: {
            type: 'array',
            items: { type: 'string' },
            example: ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'],
          },
          totalFiles: { type: 'integer', example: 12 },
          message: { type: 'string', example: 'Local Storage is active with persistent storage' },
        },
      },
      ErrorResponse: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: false },
          error: { type: 'string', example: 'Invalid request payload or resource not found' },
        },
      },
    },
    responses: {
      BadRequest: {
        description: 'Bad Request - Missing or invalid fields',
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/ErrorResponse' },
          },
        },
      },
      Unauthorized: {
        description: 'Unauthorized - Invalid credentials or missing session token',
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/ErrorResponse' },
          },
        },
      },
      NotFound: {
        description: 'Resource Not Found',
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/ErrorResponse' },
          },
        },
      },
      ServerError: {
        description: 'Internal Server Error',
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/ErrorResponse' },
          },
        },
      },
    },
  },
};
