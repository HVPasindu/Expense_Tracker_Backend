require('dotenv').config();

const express = require('express');
const cors = require('cors');

const app = express();
const port = process.env.PORT || 3000;

const userRoutes = require('./routes/user-routes');
const expenseRoutes = require('./routes/expense-routes');
const expenseSlipRoutes = require('./routes/expense-slip-routes');

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', req.headers.origin || '*');
  res.header('Vary', 'Origin');
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');

  if (req.method === 'OPTIONS') {
    return res.sendStatus(204);
  }

  next();
});

app.use(cors({
  origin: true,
  credentials: true,
}));

app.use(express.json());

app.get('/health', (req, res) => {
  res.json({
    ok: true,
    origin: req.headers.origin || null,
    message: 'backend live'
  });
});

app.use('/users', userRoutes);
app.use('/expenses', expenseRoutes);
app.use('/expense-slips', expenseSlipRoutes);
app.use('/uploads', express.static('uploads'));

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});