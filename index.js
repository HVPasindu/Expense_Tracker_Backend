require('dotenv').config();

const express = require('express');
const app = express();
const cors = require('cors');
const port = process.env.PORT || 3000;
const userRoutes = require('./routes/user-routes');
const expenseRoutes = require('./routes/expense-routes');
const expenseSlipRoutes = require('./routes/expense-slip-routes');

const allowedOrigins = [
  'http://localhost:5173',
  process.env.CLIENT_URL
].filter(Boolean);

app.use(cors({
  origin: allowedOrigins,
  credentials: true
}));

app.use(express.json());


app.use('/users', userRoutes);
app.use('/expenses', expenseRoutes);
app.use('/expense-slips', expenseSlipRoutes);
app.use('/uploads', express.static('uploads'));

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})