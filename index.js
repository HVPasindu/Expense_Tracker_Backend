require('dotenv').config();

const express = require('express');
const cors = require('cors');

const app = express();
const port = process.env.PORT || 3000;

const userRoutes = require('./routes/user-routes');
const expenseRoutes = require('./routes/expense-routes');
const expenseSlipRoutes = require('./routes/expense-slip-routes');

const allowedOrigins = [
  'http://localhost:5173',
  'https://expense-tracker-delta-one-62.vercel.app',
  process.env.CLIENT_URL
].filter(Boolean);

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    return callback(null, false);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.options('*', cors());

app.use(express.json());

app.use('/users', userRoutes);
app.use('/expenses', expenseRoutes);
app.use('/expense-slips', expenseSlipRoutes);
app.use('/uploads', express.static('uploads'));

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});