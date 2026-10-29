const express = require('express');
require('dotenv').config();

// Environment check — runs immediately on startup
console.log('ENV CHECK:', {
  NODE_ENV: process.env.NODE_ENV || 'missing',
  DATABASE_URL: process.env.DATABASE_URL ? 'loaded' : 'missing',
  JWT_SECRET: process.env.JWT_SECRET_KEY ? 'loaded' : 'missing',
  FRONTEND_URL: process.env.FRONTEND_URL || 'missing',
  PORT: process.env.PORT || 'hostinger-managed',
});

const createTables = require('./models/blogModel');
const errorhandler = require('./middleware/errormessage');
const authRoutes = require('./routes/authRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const postRoutes = require('./routes/postRoutes');
const faqRoutes = require('./routes/faqRoutes');
const tagRoutes = require('./routes/tagRoutes');
const uploadRoutes = require('./routes/uploadRoutes');
const reviewRoutes = require('./routes/reviewRoutes');
const contactRoutes = require('./routes/contactRoutes');
const subscriberRoutes = require('./routes/subscriberRoutes');
const ogRoutes = require('./routes/ogRoutes');

const app = express();

// ── CORS — manual headers first, before anything else ──────────────────────
// This runs before every request including OPTIONS preflight
app.use((req, res, next) => {
  const origin = req.headers.origin;
  const allowed = [
    'https://faizalamfaizi.com',
    'https://www.faizalamfaizi.com',
    'https://api.faizalamfaizi.com',
    'http://localhost:5173',
    'http://localhost:5174',
  ];

  if (!origin || allowed.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin || '*');
  }

  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS,PATCH');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization,Accept');

  // Respond immediately to preflight OPTIONS requests
  if (req.method === 'OPTIONS') {
    return res.sendStatus(204);
  }

  next();
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static('uploads'));

// Health check
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Backend is running',
    time: new Date().toISOString(),
  });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/tags', tagRoutes);
app.use('/api/faqs', faqRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/review', reviewRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/subscribers', subscriberRoutes);

// OG meta proxy — serves pre-rendered HTML for social crawlers
app.use('/og', ogRoutes);

// Root
app.get('/', (_req, res) => {
  res.status(200).json({ success: true, message: 'Faiz Alam Faizi API is running' });
});

app.use(errorhandler);

// Start server — listen first, then create tables
const PORT = process.env.PORT || 5000;

app.listen(PORT, async () => {
  console.log(`Server is running on Port ${PORT}`);
  try {
    await createTables();
    console.log('Tables created successfully');
  } catch (error) {
    console.error('Table creation failed:', error.message);
  }
});
