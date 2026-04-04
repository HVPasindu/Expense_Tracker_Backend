require('dotenv').config();

const express = require('express');
const cors = require('cors');

const app = express();
const port = process.env.PORT || 3000;

const userRoutes = require('./routes/user-routes');
const expenseRoutes = require('./routes/expense-routes');
const expenseSlipRoutes = require('./routes/expense-slip-routes');

const allowedOrigins = [
  'https://expense-tracker-delta-one-62.vercel.app',
  'http://localhost:3000',
  'http://localhost:5173',
];

app.use(cors({
  origin: (origin, callback) => {
    // allow requests with no origin (mobile apps, curl, postman)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// handle preflight for all routes
app.options('*', cors());

app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ ok: true, message: 'backend live' });
});

app.use('/users', userRoutes);
app.use('/expenses', expenseRoutes);
app.use('/expense-slips', expenseSlipRoutes);
app.use('/uploads', express.static('uploads'));

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});